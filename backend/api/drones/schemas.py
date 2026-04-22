from pydantic import BaseModel
from typing import List

class TelemetryItem(BaseModel):
    name: str
    value: int
    color: str
    hoverColor: str

class DroneDetail(BaseModel):
    id: int
    status: str
    battery_level: float

class DroneTelemetryResponse(BaseModel):
    status_data: List[TelemetryItem]
    battery_data: List[TelemetryItem]
    drones: List[DroneDetail]

class DroneFleetItem(BaseModel):
    id: str
    name: str
    status: str
    battery: int

class DroneFleetResponse(BaseModel):
    drones: List[DroneFleetItem]
