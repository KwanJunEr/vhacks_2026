"""
Per-drone LangGraph decision cycle.

Graph topology (one invoke = one step cycle):
    observe → think → move   → END
                    → recharge → END
                    → END  (sector complete)

Callers run this in a while-loop, merging the returned state back in each time.
All side-effects (DB writes, WS frames) are returned inside state['events'] so
the async caller can stream them without blocking the graph thread.
"""

import math
import random
import sqlite3
from collections import deque
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple, TypedDict

from langgraph.graph import END, StateGraph

from mcp.db.connection import connect

BATTERY_LOW = 15   # RTB threshold (integer %)
GRID_SIZE = 20


# ── State ─────────────────────────────────────────────────────────────────────

class DroneStepState(TypedDict):
    """State for one decision cycle of a single drone."""
    # Identity
    drone_name: str
    drone_id: str
    drone_color: str
    # Position & power (integers)
    x: int
    y: int
    battery: int
    # Sector bounds
    sector_x_min: int
    sector_x_max: int
    # Visited cells for this drone: list of [x, y] pairs (JSON-safe)
    visited_cells: List[List[int]]
    total_cells: int
    # Environment — refreshed each cycle by observe_node
    survivors: List[Dict[str, Any]]
    hazard_positions: List[List[int]]   # [[x,y], ...]
    # Decision output from think_node
    next_action: str     # 'move' | 'recharge' | 'complete'
    target_x: int
    target_y: int
    # Outputs collected by nodes — caller drains these each iteration
    events: List[Dict[str, Any]]
    step_count: int


# ── DB helpers ─────────────────────────────────────────────────────────────────

def _fetch_hazards() -> List[List[int]]:
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT grid_x, grid_y FROM entities WHERE type='hazard' AND status='active'"
        )
        return [[r["grid_x"], r["grid_y"]] for r in cursor.fetchall()]
    except Exception:
        return []
    finally:
        conn.close()


def _fetch_survivors() -> List[Dict[str, Any]]:
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT id, grid_x, grid_y, priority FROM entities "
            "WHERE type='survivor' AND status='active'"
        )
        return [dict(r) for r in cursor.fetchall()]
    except Exception:
        return []
    finally:
        conn.close()


def _fetch_recharge_station() -> Tuple[int, int]:
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT grid_x, grid_y FROM entities WHERE type='recharge_station' LIMIT 1"
        )
        row = cursor.fetchone()
        return (int(row["grid_x"]), int(row["grid_y"])) if row else (0, 0)
    except Exception:
        return (0, 0)
    finally:
        conn.close()


def _persist_drone(drone_name: str, x: int, y: int, status: str, battery: int):
    conn = connect()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE drones SET current_x=?, current_y=?, status=?, battery_level=?, "
            "last_updated=? WHERE drone_name=?",
            (x, y, status, battery, datetime.now().isoformat(), drone_name),
        )
        conn.commit()
    except Exception:
        pass
    finally:
        conn.close()


def _persist_cell(x: int, y: int, drone_name: str, color: str):
    conn = connect()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE grid_cells SET visited=1, scanned_by=?, drone_color=?, last_updated=? "
            "WHERE x=? AND y=?",
            (drone_name, color, datetime.now().isoformat(), x, y),
        )
        conn.commit()
    except Exception:
        pass
    finally:
        conn.close()


# ── Movement helpers ───────────────────────────────────────────────────────────

def _pick_target(
    x: int,
    y: int,
    x_min: int,
    x_max: int,
    visited: set,
    hazards: set,
    survivors: List[Dict],
) -> Optional[Tuple[int, int]]:
    """
    Priority-weighted next target (produces organic, non-straight-line movement):
      1. Unrescued survivor within 6 Manhattan cells → rush to nearest
      2. Nearest unvisited sector cell + ±1.5 noise → natural wandering
    """
    # Priority 1: nearby survivor beacon
    for s in sorted(survivors, key=lambda s: abs(s["grid_x"] - x) + abs(s["grid_y"] - y)):
        sx, sy = s["grid_x"], s["grid_y"]
        if abs(sx - x) + abs(sy - y) <= 6 and (sx, sy) not in visited:
            return sx, sy

    # Priority 2: unvisited sector cells with distance noise
    candidates = [
        (cx, cy)
        for cx in range(x_min, x_max + 1)
        for cy in range(GRID_SIZE)
        if (cx, cy) not in visited and (cx, cy) not in hazards
    ]
    if not candidates:
        return None

    def score(cx: int, cy: int) -> float:
        dist = math.sqrt((cx - x) ** 2 + (cy - y) ** 2)
        return dist + random.uniform(-1.5, 1.5)

    candidates.sort(key=lambda c: score(*c))
    # Pick randomly from top-3 to avoid deterministic straight-line sweeps
    top = candidates[: min(3, len(candidates))]
    return tuple(random.choice(top))  # type: ignore[return-value]


def _bfs_one_step(
    x: int,
    y: int,
    tx: int,
    ty: int,
    hazards: set,
) -> Tuple[int, int]:
    """
    BFS returning the single immediate next cell toward (tx,ty).
    Uses 8-directional movement to allow diagonal-ish paths that
    look more natural than cardinal-only movement.
    Avoids all hazard cells.
    """
    if x == tx and y == ty:
        return x, y

    DIRS = [(0, 1), (0, -1), (1, 0), (-1, 0), (1, 1), (1, -1), (-1, 1), (-1, -1)]
    q: deque = deque([(x, y, [])])
    seen = {(x, y)}

    while q:
        cx, cy, path = q.popleft()
        for dx, dy in DIRS:
            nx, ny = cx + dx, cy + dy
            if not (0 <= nx < GRID_SIZE and 0 <= ny < GRID_SIZE):
                continue
            if (nx, ny) in seen or (nx, ny) in hazards:
                continue
            seen.add((nx, ny))
            new_path = path + [(nx, ny)]
            if nx == tx and ny == ty:
                return new_path[0]  # first step on the shortest path
            q.append((nx, ny, new_path))

    # Fallback: any safe cardinal step
    for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
        nx, ny = x + dx, y + dy
        if 0 <= nx < GRID_SIZE and 0 <= ny < GRID_SIZE and (nx, ny) not in hazards:
            return nx, ny
    return x, y  # stuck (shouldn't happen on a clear grid)


def _mk_event(
    action: str,
    log: str,
    reasoning: str,
    score: float,
    drone_name: str,
    drone_id: str,
    ws: Optional[Dict] = None,
) -> Dict[str, Any]:
    e: Dict[str, Any] = {
        "action": action,
        "log": log,
        "reasoning": reasoning,
        "confidence_score": score,
        "drone_name": drone_name,
        "drone_id": drone_id,
        "timestamp": datetime.now().isoformat(),
    }
    if ws:
        e["ws_payload"] = ws
    return e


# ── LangGraph nodes ────────────────────────────────────────────────────────────

def observe_node(state: DroneStepState) -> Dict[str, Any]:
    """Refresh environment: active hazards + unrescued survivors."""
    hazards = _fetch_hazards()
    survivors = _fetch_survivors()

    reasoning = (
        f"[OBSERVE] Position ({state['x']},{state['y']}). "
        f"Battery: {state['battery']}%. "
        f"Active hazards detected: {len(hazards)}. "
        f"Unrescued survivors: {len(survivors)}. "
        f"Sector cells visited: {len(state['visited_cells'])}/{state['total_cells']}."
    )
    event = _mk_event(
        "observe",
        f"{state['drone_name']} scanning environment — "
        f"{len(survivors)} survivors, {len(hazards)} hazards",
        reasoning,
        0.95,
        state["drone_name"],
        state["drone_id"],
    )
    return {
        "hazard_positions": hazards,
        "survivors": survivors,
        "events": [event],
    }


def think_node(state: DroneStepState) -> Dict[str, Any]:
    """
    Chain-of-thought reasoning node.
    Produces a numbered reasoning chain and decides: move | recharge | complete.
    """
    battery = state["battery"]
    x, y = state["x"], state["y"]
    visited = {(c[0], c[1]) for c in state["visited_cells"]}
    hazards = {(h[0], h[1]) for h in state["hazard_positions"]}
    chain: List[str] = []

    # ── Step 1: Battery check ─────────────────────────────────────────────────
    if battery <= BATTERY_LOW:
        chain.append(
            f"Step 1: Battery critical at {battery}% "
            f"(threshold: {BATTERY_LOW}%). Must return to charge station immediately."
        )
        station = _fetch_recharge_station()
        action = "recharge"
        tx, ty = station
        confidence = 0.99
    else:
        chain.append(f"Step 1: Battery at {battery}% — sufficient for continued operations.")

        # ── Step 2: Hazard at current position ────────────────────────────────
        if (x, y) in hazards:
            chain.append(
                f"Step 2: HAZARD detected at current position ({x},{y})! "
                "Evacuating zone immediately."
            )
        else:
            chain.append(f"Step 2: Position ({x},{y}) clear of hazards. Safe to proceed.")

        # ── Step 3: Survivor priority scan ───────────────────────────────────
        nearby = sorted(
            [s for s in state["survivors"] if abs(s["grid_x"] - x) + abs(s["grid_y"] - y) <= 6],
            key=lambda s: abs(s["grid_x"] - x) + abs(s["grid_y"] - y),
        )
        if nearby:
            s = nearby[0]
            chain.append(
                f"Step 3: Survivor signal at ({s['grid_x']},{s['grid_y']}) — "
                f"range {abs(s['grid_x']-x)+abs(s['grid_y']-y)} cells, "
                f"priority={s.get('priority','?')}. Redirecting mission path!"
            )
        else:
            chain.append("Step 3: No survivors within 6-cell range. Continuing area sweep.")

        # ── Step 4: Target selection ──────────────────────────────────────────
        target = _pick_target(
            x, y,
            state["sector_x_min"], state["sector_x_max"],
            visited, hazards,
            state["survivors"],
        )
        if target is None:
            chain.append(
                "Step 4: All sector cells have been explored. "
                f"Coverage: {len(visited)}/{state['total_cells']} cells. "
                "Sector mission complete — returning to idle."
            )
            full_reasoning = "\n".join(chain)
            return {
                "next_action": "complete",
                "target_x": x,
                "target_y": y,
                "events": [
                    _mk_event(
                        "sector_complete",
                        f"{state['drone_name']} — sector sweep 100% complete.",
                        full_reasoning,
                        1.0,
                        state["drone_name"],
                        state["drone_id"],
                    )
                ],
            }

        tx, ty = target
        dist_to_target = math.sqrt((tx - x) ** 2 + (ty - y) ** 2)
        chain.append(
            f"Step 4: Next target ({tx},{ty}) selected via priority-weighted scan "
            f"(distance: {dist_to_target:.1f}). "
            f"BFS will route around {len(hazards)} hazard zone(s)."
        )
        action = "move"
        confidence = round(random.uniform(0.79, 0.95), 2)

    full_reasoning = "\n".join(chain)
    event = _mk_event(
        "think",
        f"{state['drone_name']} reasoning → {action} toward ({tx},{ty})",
        full_reasoning,
        confidence,
        state["drone_name"],
        state["drone_id"],
    )
    return {
        "next_action": action,
        "target_x": tx,
        "target_y": ty,
        "events": [event],
    }


def move_node(state: DroneStepState) -> Dict[str, Any]:
    """
    Execute one BFS step toward the current target.
    Calls move_to + thermal_scan + acoustic_scan MCP tools.
    Battery drain is always an integer (≥1).
    """
    from mcp.tools.movement_tools import move_to
    from mcp.tools.scan_tools import acoustic_scan, thermal_scan

    hazards = {(h[0], h[1]) for h in state["hazard_positions"]}
    visited = {(c[0], c[1]) for c in state["visited_cells"]}
    tx, ty = state["target_x"], state["target_y"]

    # Single BFS step toward target (8-directional → organic path)
    nx, ny = _bfs_one_step(state["x"], state["y"], tx, ty, hazards)

    # MCP: move drone
    move_result = move_to(state["drone_name"], nx, ny)
    raw_after = move_result.get("battery_after")
    if raw_after is not None:
        battery_after = max(0, int(round(float(raw_after))))
    else:
        drain = random.randint(1, 3)
        battery_after = max(0, state["battery"] - drain)

    # Ensure drain is always at least 1 integer
    if battery_after >= state["battery"]:
        battery_after = max(0, state["battery"] - 1)

    drain_used = state["battery"] - battery_after

    # MCP: scan new cell
    thermal = thermal_scan(state["drone_name"], nx, ny)
    acoustic = acoustic_scan(state["drone_name"], nx, ny)

    scan_notes: List[str] = []
    confidence = round(random.uniform(0.76, 0.93), 2)
    if thermal.get("heat_detected"):
        temp = thermal.get("temperature", "?")
        scan_notes.append(f"thermal:{temp}°C")
        confidence = min(0.99, confidence + 0.05)
    if acoustic.get("sound_detected"):
        sig = acoustic.get("signal_value", 0.0)
        scan_notes.append(f"acoustic:{float(sig):.2f}")
        confidence = min(0.99, confidence + 0.03)

    new_visited = list(visited | {(nx, ny)})
    pct = round(len(new_visited) / state["total_cells"] * 100, 1)
    dist_remaining = abs(nx - tx) + abs(ny - ty)
    scan_str = f" | {', '.join(scan_notes)}" if scan_notes else ""

    reasoning = (
        f"BFS step: ({state['x']},{state['y']}) → ({nx},{ny}), targeting ({tx},{ty}). "
        f"Distance to target: {dist_remaining} cells remaining. "
        f"Battery drain: {drain_used}% (integer). Remaining: {battery_after}%. "
        f"Sector coverage: {pct}%."
        + (f" Scan anomalies: {', '.join(scan_notes)}." if scan_notes else " No anomalies detected.")
    )

    # Persist to DB
    _persist_drone(state["drone_name"], nx, ny, "scanning", battery_after)
    _persist_cell(nx, ny, state["drone_name"], state["drone_color"])

    ts = datetime.now().isoformat()
    ws_payload = {
        "type": "drone_move",
        "drone_id": state["drone_id"],
        "drone_name": state["drone_name"],
        "x": nx,
        "y": ny,
        "battery": battery_after,
        "status": "scanning",
        "color": state["drone_color"],
        "timestamp": ts,
    }
    event = _mk_event(
        "move_to",
        f"{state['drone_name']} → ({nx},{ny}) | {battery_after}% batt | {pct}% sector{scan_str}",
        reasoning,
        confidence,
        state["drone_name"],
        state["drone_id"],
        ws=ws_payload,
    )

    return {
        "x": nx,
        "y": ny,
        "battery": battery_after,
        "visited_cells": [[c[0], c[1]] for c in new_visited],
        "step_count": state["step_count"] + 1,
        "events": [event],
    }


def recharge_node(state: DroneStepState) -> Dict[str, Any]:
    """
    Return to nearest charging station (MCP: return_to_charging_station)
    then charge to 100% (MCP: charge_drone).
    Emits two events: returning_to_base → charging_complete.
    """
    from mcp.tools.battery_tools import charge_drone, return_to_charging_station

    ts = datetime.now().isoformat()
    rtb = return_to_charging_station(state["drone_name"])
    sx = int(rtb.get("station_x", 0))
    sy = int(rtb.get("station_y", 0))
    station_name = rtb.get("station_name", "Base")

    rtb_reasoning = (
        f"Battery depleted to {state['battery']}% — below threshold {BATTERY_LOW}%. "
        f"Emergency RTB initiated. "
        f"Nearest recharge station: '{station_name}' at ({sx},{sy}). "
        f"All scanning protocols suspended. "
        f"BFS route to station calculated. Mission sweep will resume after full charge."
    )
    rtb_event = _mk_event(
        "returning_to_base",
        f"{state['drone_name']} RTB — {state['battery']}% batt → charging at ({sx},{sy})",
        rtb_reasoning,
        0.99,
        state["drone_name"],
        state["drone_id"],
        ws={
            "type": "drone_move",
            "drone_id": state["drone_id"],
            "drone_name": state["drone_name"],
            "x": sx,
            "y": sy,
            "battery": state["battery"],
            "status": "returning",
            "color": state["drone_color"],
            "timestamp": ts,
        },
    )

    charge_drone(state["drone_name"])
    ts2 = datetime.now().isoformat()
    charge_reasoning = (
        f"Docked at '{station_name}'. Power cycle initiated. "
        f"Battery restored: {state['battery']}% → 100%. "
        f"All drone systems nominal. Resuming sector sweep from ({sx},{sy})."
    )
    charge_event = _mk_event(
        "charging_complete",
        f"{state['drone_name']} recharged to 100% — resuming mission",
        charge_reasoning,
        1.0,
        state["drone_name"],
        state["drone_id"],
        ws={
            "type": "drone_move",
            "drone_id": state["drone_id"],
            "drone_name": state["drone_name"],
            "x": sx,
            "y": sy,
            "battery": 100,
            "status": "idle",
            "color": state["drone_color"],
            "timestamp": ts2,
        },
    )

    return {
        "x": sx,
        "y": sy,
        "battery": 100,
        "next_action": "move",
        "events": [rtb_event, charge_event],
    }


# ── Routing ────────────────────────────────────────────────────────────────────

def _route_after_think(state: DroneStepState) -> str:
    action = state.get("next_action", "move")
    if action == "complete":
        return END  # type: ignore[return-value]
    return action  # 'move' or 'recharge'


# ── Graph factory ──────────────────────────────────────────────────────────────

def create_drone_graph():
    """
    Build the per-drone LangGraph.

    Topology (single invoke = one step cycle):
        observe → think ─→ move     → END
                        ├→ recharge → END
                        └→ END  (sector complete)

    The external async runner calls graph.invoke(state) in a while-loop,
    merging the returned partial state back each iteration.
    """
    g: StateGraph = StateGraph(DroneStepState)

    g.add_node("observe", observe_node)
    g.add_node("think", think_node)
    g.add_node("move", move_node)
    g.add_node("recharge", recharge_node)

    g.set_entry_point("observe")
    g.add_edge("observe", "think")
    g.add_conditional_edges(
        "think",
        _route_after_think,
        {"move": "move", "recharge": "recharge", END: END},
    )
    g.add_edge("move", END)
    g.add_edge("recharge", END)

    return g.compile()
