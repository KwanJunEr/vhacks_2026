from pydantic import BaseModel
from typing import List

class TelemetryItem(BaseModel):
    name: str
    value: int
    color: str
    hoverColor: str

class DroneFullFleetItem(BaseModel):
    id: str
    name: str
    status: str
    battery: int

class DroneTelemetryResponse(BaseModel):
    status_data: List[TelemetryItem]
    battery_data: List[TelemetryItem]
    drones: List[DroneFullFleetItem]

class DroneFullFleetResponse(BaseModel):
    drones: List[DroneFullFleetItem]

class DroneDetailedFleetItem(BaseModel):
    id: str
    name: str
    status: str
    battery: int
    model: str
    brand: str
    profile: str
    health: str
    color: str
    altitude: float
    airspeed: float
    current_x: float
    current_y: float

class DroneDetailedFleetResponse(BaseModel):
    drones: List[DroneDetailedFleetItem]


class DroneFleetStats(BaseModel):
    operational_assets:int
    total_swarm_power:float
    maintenance_required: int
    ai_sync_status: str
