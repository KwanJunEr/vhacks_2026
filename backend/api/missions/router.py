from fastapi import APIRouter, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uuid
import json
import asyncio
import sqlite3
from datetime import datetime
from agents.orchestrator import create_orchestrator
from mcp.db.connection import connect

router = APIRouter(prefix="/missions", tags=["Missions"])

class MissionRequest(BaseModel):
    scenario: str = "default"  # 'default' or 'survivor_detection'

@router.post("/start")
async def start_mission(request: MissionRequest, background_tasks: BackgroundTasks):
    """Start a new multi-agent mission."""
    mission_id = str(uuid.uuid4())
    
    initial_state = {
        "mission_id": mission_id,
        "scenario": request.scenario,
        "messages": [],
        "next_agent": "",
        "drone_fleet": [],
        "grid_map": [],
        "survivors": [],
        "hazards": [],
        "mission_plan": [],
        "reasoning_log": [],
        "voice_output": None,
        "hitl_approved": False,
        "mission_complete": False
    }
    
    # Run in background
    orchestrator = create_orchestrator()
    background_tasks.add_task(orchestrator.invoke, initial_state)
    
    return {"mission_id": mission_id, "status": "started", "scenario": request.scenario}

@router.get("/{mission_id}/reasoning")
async def get_mission_reasoning(mission_id: str):
    """Stream reasoning logs for a mission using SSE."""
    async def event_generator():
        last_id = 0
        while True:
            conn = connect()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            try:
                cursor.execute(
                    "SELECT * FROM agent_reasoning WHERE mission_id = ? AND id > ? ORDER BY id ASC",
                    (mission_id, last_id)
                )
                rows = cursor.fetchall()
                for row in rows:
                    last_id = row['id']
                    yield f"data: {json.dumps(dict(row))}\n\n"
                
                # Check if mission is complete (optional check)
                # For now, just keep polling
                await asyncio.sleep(1)
            finally:
                conn.close()

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.websocket("/ws/{mission_id}/events")
async def mission_events_websocket(websocket: WebSocket, mission_id: str):
    """Websocket for real-time mission events and reasoning."""
    await websocket.accept()
    last_id = 0
    try:
        while True:
            conn = connect()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            try:
                cursor.execute(
                    "SELECT * FROM agent_reasoning WHERE mission_id = ? AND id > ? ORDER BY id ASC",
                    (mission_id, last_id)
                )
                rows = cursor.fetchall()
                for row in rows:
                    last_id = row['id']
                    await websocket.send_text(json.dumps({
                        "type": "reasoning",
                        "data": dict(row)
                    }))
                
                await asyncio.sleep(1)
            finally:
                conn.close()
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
