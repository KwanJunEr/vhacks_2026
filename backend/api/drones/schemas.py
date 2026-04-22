from pydantic import BaseModel
from typing import Any, List, Optional

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

class DroneDetailItem(BaseModel):
    id: str
    drone_name: str
    status: str
    battery_level: int
    health_status: Optional[str]
    current_x: Optional[float]
    current_y: Optional[float]
    description: Optional[str]
    brand_name: Optional[str]
    weight_class: Optional[str]
    max_speed: Optional[float]
    weight: Optional[float]
    motors: Optional[int]
    range_km: Optional[float]
    flight_time_min: Optional[int]
    wind_resistance: Optional[str]
    payload: Optional[str]
    flight_controller: Optional[int]
    gps_module: Optional[int]
    imu_gyro: Optional[int]
    battery_mgmt: Optional[int]
    gimbal_control: Optional[int]
    comms_link: Optional[int]
    rotor_1_rpm: Optional[int]
    rotor_2_rpm: Optional[int]
    rotor_3_rpm: Optional[int]
    rotor_4_rpm: Optional[int]
    last_maintenance: Optional[str]
    last_updated: Optional[str]
    color: Optional[str]
    altitude: Optional[float]
    airspeed: Optional[float]
    years_of_service:int


class DroneEvaluationCreate(BaseModel):
    drone_id: Optional[str] = None
    status: str
    score: int
    title: str
    summary: str
    reasoning: str
    items: List[Any] = []


class DroneEvaluationSaved(BaseModel):
    id: int
    drone_id: Optional[str]
    status: str
    score: int
    title: str
    summary: str
    reasoning: str
    items_json: str
    created_at: Optional[str]
