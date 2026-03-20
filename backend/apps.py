from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import random
import time
import uuid

app = FastAPI(title="Disaster Command MCP Backend", version="1.0.0")

# --- Models ---

class DroneStatus(BaseModel):
    drone_id: str
    label: str
    battery: int
    status: str
    position: int

class MissionParams(BaseModel):
    mission_id: str
    target_sectors: List[int]
    priority: str

class MCPToolCall(BaseModel):
    drone_id: str
    tool_name: str
    arguments: Dict

# --- Simulated State ---

drone_fleet = {
    "Alpha-1": {"label": "Alpha-1", "battery": 88, "status": "STANDBY", "pos": -1},
    "Alpha-2": {"label": "Alpha-2", "battery": 92, "status": "STANDBY", "pos": -1},
    "Alpha-3": {"label": "Alpha-3", "battery": 74, "status": "STANDBY", "pos": -1},
    "Alpha-4": {"label": "Alpha-4", "battery": 65, "status": "STANDBY", "pos": -1},
}

# --- Endpoints ---

@app.get("/")
async def root():
    return {"status": "online", "message": "Disaster Command MCP API Simulator"}

@app.get("/api/mcp/drones", response_model=List[DroneStatus])
async def list_drones():
    """Simulates MCP list_available_drones()"""
    return [
        DroneStatus(
            drone_id=k, 
            label=v["label"], 
            battery=v["battery"], 
            status=v["status"], 
            position=v["pos"]
        ) for k, v in drone_fleet.items()
    ]

@app.post("/api/mcp/execute")
async def execute_tool(call: MCPToolCall):
    """Simulates MCP Tool Execution (move_to, scan_area, return_to_base)"""
    if call.drone_id not in drone_fleet:
        raise HTTPException(status_code=404, detail="Drone not found")
    
    drone = drone_fleet[call.drone_id]
    
    # Simulate processing delay
    time.sleep(0.5)
    
    if call.tool_name == "move_to":
        target_pos = call.arguments.get("position")
        drone["pos"] = target_pos
        drone["status"] = "MOVING"
        drone["battery"] = max(0, drone["battery"] - 5)
        return {
            "status": "success",
            "message": f"MCP: {call.drone_id} moved to sector {target_pos}",
            "telemetry": {"battery": drone["battery"], "pos": drone["pos"]}
        }
    
    elif call.tool_name == "scan_area":
        drone["status"] = "SCANNING"
        # Simulated AI detection results
        found_something = random.random() > 0.8
        result = {
            "status": "success",
            "drone_id": call.drone_id,
            "detections": []
        }
        if found_something:
            result["detections"].append({
                "type": random.choice(["PERSON", "STRUCTURAL_DAMAGE", "FIRE"]),
                "confidence": round(random.uniform(0.85, 0.99), 2),
                "timestamp": time.strftime("%H:%M:%S")
            })
        return result

    elif call.tool_name == "return_to_base":
        drone["pos"] = -1
        drone["status"] = "RECHARGING"
        return {"status": "success", "message": f"MCP: {call.drone_id} returning to base"}

    else:
        raise HTTPException(status_code=400, detail="Unknown MCP tool")

@app.post("/api/mission/deploy")
async def deploy_mission(params: MissionParams):
    """Simulates Command Agent mission deployment"""
    # Simulate Multi-Agent coordination
    return {
        "mission_id": params.mission_id,
        "status": "DEPLOYED",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "agent_consensus": {
            "command_agent": "AUTHORIZED",
            "map_agent": "GRID_INITIALIZED",
            "mcp": "SWARM_READY"
        },
        "assigned_assets": list(drone_fleet.keys())
    }

@app.get("/api/mission/reasoning/{step_id}")
async def get_reasoning(step_id: int):
    """Simulates AI Reasoning chain details"""
    reasoning_steps = {
        1: {
            "step": "Seismic Triangulation",
            "logic": "Analyzing waveform data from Station 14.",
            "conclusion": "Epicenter confirmed at Grid Sector 24."
        },
        2: {
            "step": "Asset Allocation",
            "logic": "Optimizing flight paths for 4 drones to cover 49 sectors.",
            "conclusion": "Alpha fleet assigned to quadrants A1, A7, G1, G7."
        }
    }
    return reasoning_steps.get(step_id, {"error": "Step not found"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
