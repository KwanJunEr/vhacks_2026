from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
import json
import datetime
from api.router import api_router

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

@app.websocket("/ws/grid")
async def grid_websocket(websocket: WebSocket):
    """Broadcasts entity + drone positions to the frontend every 2 seconds."""
    await websocket.accept()
    try:
        while True:
            from api.entities.service import get_all_entities
            from api.drones.services import get_detailed_fleet_info

            entities_data = get_all_entities()
            drones_data = get_detailed_fleet_info()

            payload = {
                "type": "grid_update",
                "entities": entities_data["entities"],
                "drones": drones_data["drones"],
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            }

            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        pass
    except Exception:
        pass

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
