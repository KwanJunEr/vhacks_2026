from fastapi import APIRouter
from .schemas import DroneTelemetryResponse, DroneFleetResponse
from .services import get_drone_telemetry, get_drone_fleet_battery_health

router = APIRouter(prefix="/drones", tags=["drones"])

@router.get("/telemetry", response_model=DroneTelemetryResponse)
def get_telemetry():
    return get_drone_telemetry()


@router.get("/detailed_fleet", response_model=DroneFleetResponse)
def get_battery_status():
    return get_drone_fleet_battery_health()
