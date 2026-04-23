"""
Deployment API
  POST /api/deployment/start  → start autonomous mission, returns SSE stream
  GET  /api/deployment/{id}/stream → re-attach SSE for a running deployment
  POST /api/deployment/stop   → stop current deployment
  POST /api/deployment/reset  → stop + wipe logs + reset grid + idle drones
"""

import asyncio
import json
import uuid
from typing import Dict, Optional

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from mcp.db.connection import connect
from api.deployment.broadcaster import drone_broadcaster

router = APIRouter(prefix="/deployment", tags=["Deployment"])

# ── In-process state ─────────────────────────────────────────────────────────
_queues: Dict[str, asyncio.Queue] = {}
_stop_events: Dict[str, asyncio.Event] = {}
_tasks: Dict[str, asyncio.Task] = {}
_current_id: Optional[str] = None


# ── SSE helper ────────────────────────────────────────────────────────────────

async def _sse_stream(deployment_id: str):
    """Drain a deployment's queue and yield SSE events."""
    q = _queues.get(deployment_id)
    if q is None:
        yield f"data: {json.dumps({'action': 'error', 'log': 'Unknown deployment ID'})}\n\n"
        return
    try:
        while True:
            try:
                event = await asyncio.wait_for(q.get(), timeout=25.0)
            except asyncio.TimeoutError:
                yield ": keepalive\n\n"
                continue

            if event is None:  # sentinel — agent finished
                yield f"data: {json.dumps({'action': 'end', 'log': 'Stream complete'})}\n\n"
                return

            yield f"data: {json.dumps(event)}\n\n"
    except asyncio.CancelledError:
        pass


# ── Endpoints ─────────────────────────────────────────────────────────────────

class StartRequest(BaseModel):
    scenario: str = "default"


@router.post("/start")
async def start_deployment(req: StartRequest):
    """
    Launch a new autonomous drone mission.
    Returns an SSE stream immediately — each event is a JSON log entry.
    The deployment ID is echoed in the X-Deployment-ID response header.
    """
    global _current_id

    # Stop any existing deployment first
    if _current_id and _current_id in _stop_events:
        _stop_events[_current_id].set()

    dep_id = str(uuid.uuid4())
    _current_id = dep_id

    q: asyncio.Queue = asyncio.Queue()
    stop = asyncio.Event()
    _queues[dep_id] = q
    _stop_events[dep_id] = stop

    from agents.deployment_agent import run_deployment

    async def _broadcast(msg: dict):
        await drone_broadcaster.broadcast(msg)

    task = asyncio.create_task(run_deployment(dep_id, q, stop, _broadcast))
    _tasks[dep_id] = task

    return StreamingResponse(
        _sse_stream(dep_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "X-Deployment-ID": dep_id,
            "Access-Control-Expose-Headers": "X-Deployment-ID",
        },
    )


@router.get("/{deployment_id}/stream")
async def stream_deployment(deployment_id: str):
    """Re-attach to an existing deployment's SSE stream."""
    return StreamingResponse(
        _sse_stream(deployment_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/stop")
async def stop_deployment():
    """Signal the running deployment to halt gracefully."""
    global _current_id
    if _current_id and _current_id in _stop_events:
        _stop_events[_current_id].set()
        return {"status": "stopped", "deployment_id": _current_id}
    return {"status": "no_active_deployment"}


@router.post("/reset")
async def reset_deployment():
    """Stop deployment + clear all logs + reset grid cells + idle all drones."""
    global _current_id

    if _current_id and _current_id in _stop_events:
        _stop_events[_current_id].set()

    conn = connect()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM deployment_logs")
        cursor.execute(
            "UPDATE grid_cells SET visited=0, scanned_by=NULL, drone_color=NULL, last_updated=NULL"
        )
        cursor.execute(
            "UPDATE drones SET status='idle', current_x=0, current_y=0"
        )
        conn.commit()
    finally:
        conn.close()

    _current_id = None
    return {"status": "reset"}
