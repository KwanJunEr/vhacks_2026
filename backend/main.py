from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
import json
import datetime
import sqlite3
from api.router import api_router
from api.deployment.broadcaster import drone_broadcaster

app = FastAPI(title="MCP Multi-Agent Backend for Disaster Swarm")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def root():
    return {"status": "ok", "message": "Backend running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


# ── /ws/grid — entity + drone snapshot every 2 s ─────────────────────────────

@app.websocket("/ws/grid")
async def grid_websocket(websocket: WebSocket):
    """Broadcasts entity + drone positions + visited grid cells every 2 seconds."""
    await websocket.accept()
    try:
        while True:
            from api.entities.service import get_all_entities
            from api.drones.services import get_detailed_fleet_info
            from mcp.db.connection import connect

            entities_data = get_all_entities()
            drones_data = get_detailed_fleet_info()

            # Fetch visited cells
            visited_cells = []
            try:
                conn = connect()
                conn.row_factory = sqlite3.Row
                cur = conn.cursor()
                cur.execute(
                    "SELECT x, y, scanned_by, drone_color FROM grid_cells WHERE visited = 1"
                )
                visited_cells = [dict(r) for r in cur.fetchall()]
                conn.close()
            except Exception:
                pass

            payload = {
                "type": "grid_update",
                "entities": entities_data["entities"],
                "drones": drones_data["drones"],
                "visited_cells": visited_cells,
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            }

            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        pass
    except Exception:
        pass


# ── /ws/drones — real-time drone movement pushed by deployment agent ──────────

@app.websocket("/ws/drones")
async def drones_websocket(websocket: WebSocket):
    """
    Real-time drone movement feed.
    Messages are pushed here immediately when the deployment agent moves a drone.
    Format: {"type":"drone_move","drone_id":"...","drone_name":"...","x":5,"y":7,
             "battery":82.3,"status":"scanning","color":"blue","timestamp":"..."}
    """
    await drone_broadcaster.connect(websocket)
    try:
        while True:
            # Keep connection alive; messages arrive via broadcaster.broadcast()
            await websocket.receive_text()
    except WebSocketDisconnect:
        await drone_broadcaster.disconnect(websocket)
    except Exception:
        await drone_broadcaster.disconnect(websocket)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
