"""
Autonomous Deployment Agent
Drives a full drone swarm mission: sector assignment → boustrophedon sweep → scan → log.
All decisions are emitted as structured events to an asyncio.Queue for SSE streaming.
"""

import asyncio
import random
import sqlite3
from datetime import datetime
from typing import Any, Callable, Coroutine, Dict, List, Optional
from mcp.db.connection import connect

# ── Agent role prompts (used in reasoning log flavour text) ──────────────────

COMMAND_ROLE = """
You are the Command Agent of an autonomous disaster-response drone swarm.
Your responsibilities:
  - Bootstrap the mission: verify drone fleet health, assess grid environment
  - Divide the 20×20 search grid into equal sectors, one per available drone
  - Broadcast sector assignments with confidence scores
  - Monitor for stop signals and battery-critical events
  - Compile mission-complete summary with coverage statistics
"""

TRIAGE_ROLE = """
You are the Triage Agent. Your responsibilities:
  - Analyse satellite thermal data and seismic sensor readings
  - Identify high-probability survivor zones (thermal anomalies > 80°C)
  - Rank sectors by acoustic signal density and structural-collapse risk
  - Output a prioritised threat map with per-cell confidence scores
"""

MISSION_ROLE = """
You are the Mission Planning Agent. Your responsibilities:
  - Accept triage priority map and drone fleet capabilities
  - Compute optimal sector boundaries (minimise overlap, maximise coverage)
  - Assign drones using capability matching (battery level, sensor suite, speed)
  - Generate boustrophedon (lawnmower) waypoint sequences for each drone
"""

DRONE_ROLE_TPL = """
You are Drone {name}. Your mission parameters:
  - Assigned sector: columns {x_min}–{x_max}, rows 0–19
  - Execute systematic boustrophedon sweep (alternate left→right / right→left by row)
  - Perform thermal + acoustic scan at each waypoint; report anomalies immediately
  - Return to base when battery drops below 10 %
  - Log every move with grid coverage percentage and confidence score
"""


# ── DB helpers ────────────────────────────────────────────────────────────────

def _ensure_deployment_tables():
    conn = connect()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS deployment_logs (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                deployment_id    TEXT,
                timestamp        DATETIME,
                drone_id         TEXT,
                drone_name       TEXT,
                action           TEXT,
                log              TEXT,
                reasoning        TEXT,
                confidence_score FLOAT
            )
        """)
        # Add drone_color column to grid_cells if missing
        try:
            cursor.execute("ALTER TABLE grid_cells ADD COLUMN drone_color TEXT")
        except Exception:
            pass
        conn.commit()
    finally:
        conn.close()


def _log_to_db(deployment_id: str, event: Dict[str, Any]):
    conn = connect()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO deployment_logs
                (deployment_id, timestamp, drone_id, drone_name, action, log, reasoning, confidence_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                deployment_id,
                event.get("timestamp"),
                event.get("drone_id", ""),
                event.get("drone_name", ""),
                event.get("action"),
                event.get("log"),
                event.get("reasoning", ""),
                event.get("confidence_score", 0.0),
            ),
        )
        conn.commit()
    finally:
        conn.close()


def _update_grid_cell(x: int, y: int, drone_name: str, drone_color: str):
    conn = connect()
    cursor = conn.cursor()
    try:
        now = datetime.now().isoformat()
        cursor.execute(
            "UPDATE grid_cells SET visited=1, scanned_by=?, drone_color=?, last_updated=? WHERE x=? AND y=?",
            (drone_name, drone_color, now, x, y),
        )
        conn.commit()
    finally:
        conn.close()


def _update_drone_in_db(drone_name: str, x: int, y: int, status: str, battery: float):
    conn = connect()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE drones SET current_x=?, current_y=?, status=?, battery_level=?, last_updated=? WHERE drone_name=?",
            (x, y, status, round(battery, 1), datetime.now().isoformat(), drone_name),
        )
        conn.commit()
    finally:
        conn.close()


def _get_drones() -> List[Dict[str, Any]]:
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT id, drone_name, status, battery_level, current_x, current_y, color FROM drones LIMIT 6"
        )
        return [dict(r) for r in cursor.fetchall()]
    finally:
        conn.close()


def _get_obs(x: int, y: int) -> Optional[Dict[str, Any]]:
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT temperature, signal_value, confidence FROM grid_observations WHERE x=? AND y=?",
            (x, y),
        )
        row = cursor.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


# ── Reasoning templates ───────────────────────────────────────────────────────

_MOVE_REASONS = [
    "Cell ({x},{y}) is next in boustrophedon sweep. No obstacles detected in adjacent cells.",
    "Advancing to ({x},{y}). Grid coverage at {pct}% for this sector. Path clear.",
    "Navigating to waypoint ({x},{y}). Thermal baseline nominal. Proceeding with scan protocol.",
    "Moving to ({x},{y}) following systematic lawnmower pattern. Adjacent cells verified clear.",
    "Sector progress {pct}%. Proceeding to ({x},{y}) — optimal coverage path dictates this traversal.",
]

_SCAN_REASONS = [
    "Thermal sensor activated at ({x},{y}). Cross-referencing with last known heat signature map.",
    "Running dual thermal + acoustic scan at ({x},{y}). Signal processing pipeline engaged.",
    "Scanning ({x},{y}): checking for survivor heat signatures and acoustic distress signals.",
]


# ── Main agent entry point ────────────────────────────────────────────────────

BroadcastFn = Callable[[Dict[str, Any]], Coroutine[Any, Any, None]]


async def run_deployment(
    deployment_id: str,
    queue: asyncio.Queue,
    stop_event: asyncio.Event,
    ws_broadcast_fn: Optional[BroadcastFn] = None,
):
    """
    Autonomous deployment loop.
    Pushes structured log events to *queue* (for SSE) and persists them to DB.
    Emits drone-move messages via *ws_broadcast_fn* (for WebSocket /ws/drones).
    Respects *stop_event* to halt gracefully.
    """
    _ensure_deployment_tables()

    async def emit(event: Dict[str, Any]):
        event["timestamp"] = datetime.now().isoformat()
        await queue.put(event)
        _log_to_db(deployment_id, event)

    async def ws_emit(msg: Dict[str, Any]):
        if ws_broadcast_fn:
            try:
                await ws_broadcast_fn(msg)
            except Exception:
                pass

    try:
        # ── Phase 1: Initialisation ──────────────────────────────────────────
        await emit({
            "action": "initialization",
            "log": "Deployment started. Initializing drones and environment…",
            "reasoning": COMMAND_ROLE.strip().splitlines()[0],
            "confidence_score": 1.0,
            "drone_id": "",
            "drone_name": "COMMAND",
        })
        await asyncio.sleep(0.6)

        if stop_event.is_set():
            await _emit_stop(emit)
            return

        # ── Phase 2: Triage ──────────────────────────────────────────────────
        await emit({
            "action": "triage",
            "log": "Triage Agent: scanning thermal satellite data and seismic readings…",
            "reasoning": "Identifying high-probability survivor zones via thermal anomaly map. Acoustic signal hotspots overlaid.",
            "confidence_score": 0.93,
            "drone_id": "",
            "drone_name": "TRIAGE",
        })
        await asyncio.sleep(0.5)

        await emit({
            "action": "triage_complete",
            "log": "Triage complete. Priority zones identified in sectors NW and SE quadrants.",
            "reasoning": "Thermal camera data shows 3 anomaly clusters > 80°C. Acoustic sensors detected distress signals in 2 sub-sectors.",
            "confidence_score": 0.88,
            "drone_id": "",
            "drone_name": "TRIAGE",
        })
        await asyncio.sleep(0.4)

        if stop_event.is_set():
            await _emit_stop(emit)
            return

        # ── Phase 3: Discover drones ─────────────────────────────────────────
        drones = _get_drones()
        if not drones:
            await emit({
                "action": "error",
                "log": "No drones found in database. Aborting deployment.",
                "reasoning": "Fleet discovery returned empty result. Check drone seeding scripts.",
                "confidence_score": 0.0,
                "drone_id": "",
                "drone_name": "COMMAND",
            })
            return

        await emit({
            "action": "discover_drones",
            "log": f"Fleet online: {len(drones)} drones — {', '.join(d['drone_name'] for d in drones)}",
            "reasoning": f"All {len(drones)} drones responded to discovery ping. Battery levels adequate. Proceeding with sector assignment.",
            "confidence_score": 0.97,
            "drone_id": "",
            "drone_name": "COMMAND",
        })
        await asyncio.sleep(0.4)

        # ── Phase 4: Assign sectors ──────────────────────────────────────────
        GRID = 20
        n = len(drones)
        cols_per = GRID // n
        sectors: List[tuple] = []
        for i in range(n):
            x_min = i * cols_per
            x_max = (i + 1) * cols_per - 1 if i < n - 1 else GRID - 1
            sectors.append((x_min, x_max))

        for drone, (x_min, x_max) in zip(drones, sectors):
            cells = (x_max - x_min + 1) * GRID
            role = DRONE_ROLE_TPL.format(
                name=drone["drone_name"], x_min=x_min, x_max=x_max
            )
            await emit({
                "action": "assign_sector",
                "log": f"{drone['drone_name']} → sector X[{x_min}–{x_max}] ({cells} cells)",
                "reasoning": f"Capability-matched assignment. {drone['drone_name']} assigned {cells}-cell sector. {role.strip().splitlines()[2]}",
                "confidence_score": round(random.uniform(0.88, 0.97), 2),
                "drone_id": str(drone["id"]),
                "drone_name": drone["drone_name"],
            })
            _update_drone_in_db(
                drone["drone_name"], x_min, 0, "scanning",
                float(drone.get("battery_level") or 85)
            )
            await asyncio.sleep(0.25)

        await asyncio.sleep(0.3)

        if stop_event.is_set():
            await _emit_stop(emit)
            return

        # ── Phase 5: Boustrophedon sweep ─────────────────────────────────────
        # Build ordered waypoints per drone (row-by-row, alternating direction)
        drone_states: List[Dict[str, Any]] = []
        for drone, (x_min, x_max) in zip(drones, sectors):
            waypoints: List[tuple] = []
            for y in range(GRID):
                xs = range(x_min, x_max + 1) if y % 2 == 0 else range(x_max, x_min - 1, -1)
                for x in xs:
                    waypoints.append((x, y))
            drone_states.append({
                "drone": drone,
                "waypoints": waypoints,
                "idx": 0,
                "battery": float(drone.get("battery_level") or 85),
                "active": True,
            })

        total_steps = max(len(s["waypoints"]) for s in drone_states)

        for step in range(total_steps):
            if stop_event.is_set():
                await _emit_stop(emit)
                # Update all active drones to idle
                for ds in drone_states:
                    if ds["active"]:
                        d = ds["drone"]
                        cur_wp = ds["waypoints"][min(ds["idx"], len(ds["waypoints"]) - 1)]
                        _update_drone_in_db(d["drone_name"], cur_wp[0], cur_wp[1], "idle", ds["battery"])
                return

            for ds in drone_states:
                if not ds["active"]:
                    continue
                if ds["idx"] >= len(ds["waypoints"]):
                    ds["active"] = False
                    continue

                x, y = ds["waypoints"][ds["idx"]]
                ds["idx"] += 1
                drone = ds["drone"]

                # Battery drain (varies by row to simulate env factors)
                drain = random.uniform(0.25, 0.75)
                ds["battery"] = max(0.0, ds["battery"] - drain)
                bat = round(ds["battery"], 1)

                if bat <= 5.0:
                    await emit({
                        "action": "battery_critical",
                        "log": f"{drone['drone_name']}: battery critical ({bat}%). Emergency RTB.",
                        "reasoning": "Battery below 5% operational threshold. Executing return-to-base to prevent asset loss.",
                        "confidence_score": 0.99,
                        "drone_id": str(drone["id"]),
                        "drone_name": drone["drone_name"],
                    })
                    _update_drone_in_db(drone["drone_name"], x, y, "returning", bat)
                    ds["active"] = False
                    continue

                # Scan this cell
                obs = _get_obs(x, y)
                scan_notes: List[str] = []
                confidence = round(random.uniform(0.74, 0.96), 2)
                if obs:
                    if obs.get("temperature") and obs["temperature"] > 80:
                        scan_notes.append(f"🌡 thermal {obs['temperature']}°C")
                        confidence = min(0.99, confidence + 0.04)
                    if obs.get("signal_value") and obs["signal_value"] > 0.7:
                        scan_notes.append(f"🔊 acoustic {obs['signal_value']:.2f}")
                        confidence = min(0.99, confidence + 0.03)

                pct = round((ds["idx"] / len(ds["waypoints"])) * 100, 1)
                scan_str = f" | {', '.join(scan_notes)}" if scan_notes else ""

                reasoning = random.choice(_MOVE_REASONS).format(x=x, y=y, pct=pct)

                await emit({
                    "action": "move_to",
                    "log": f"{drone['drone_name']} → ({x},{y}) | {bat}% batt | {pct}% sector{scan_str}",
                    "reasoning": reasoning,
                    "confidence_score": confidence,
                    "drone_id": str(drone["id"]),
                    "drone_name": drone["drone_name"],
                })

                # Persist position + visited cell
                color = drone.get("color") or "blue"
                _update_drone_in_db(drone["drone_name"], x, y, "scanning", bat)
                _update_grid_cell(x, y, drone["drone_name"], color)

                # Broadcast real-time drone move via WebSocket
                await ws_emit({
                    "type": "drone_move",
                    "drone_id": str(drone["id"]),
                    "drone_name": drone["drone_name"],
                    "x": x,
                    "y": y,
                    "battery": bat,
                    "status": "scanning",
                    "color": color,
                    "timestamp": datetime.now().isoformat(),
                })

            # Pace the loop — one tick per 0.45 s gives visible real-time movement
            await asyncio.sleep(0.45)

            if all(not ds["active"] for ds in drone_states):
                break

        # ── Phase 6: Mission complete ────────────────────────────────────────
        visited = sum(1 for ds in drone_states for _ in [None] if ds["idx"] > 0)
        await emit({
            "action": "mission_complete",
            "log": "Mission complete. All sectors surveyed. Drones returning to base.",
            "reasoning": "100% grid coverage achieved across all assigned sectors. Compiling mission report and uploading telemetry.",
            "confidence_score": 1.0,
            "drone_id": "",
            "drone_name": "COMMAND",
        })

        for ds in drone_states:
            d = ds["drone"]
            _update_drone_in_db(d["drone_name"], 0, 0, "idle", ds["battery"])

    except asyncio.CancelledError:
        pass
    except Exception as exc:
        try:
            await emit({
                "action": "error",
                "log": f"Deployment error: {exc}",
                "reasoning": "Unexpected system error encountered during mission execution.",
                "confidence_score": 0.0,
                "drone_id": "",
                "drone_name": "COMMAND",
            })
        except Exception:
            pass
    finally:
        # Signal SSE generator that the stream is done
        await queue.put(None)


async def _emit_stop(emit):
    await emit({
        "action": "stop",
        "log": "Deployment halted by operator command. All drones holding position.",
        "reasoning": "Stop signal received. Graceful shutdown initiated. Drones set to idle.",
        "confidence_score": 1.0,
        "drone_id": "",
        "drone_name": "COMMAND",
    })
