from fastapi import APIRouter
from .schemas import (
    DroneTelemetryResponse, 
    DroneFullFleetResponse, 
    DroneDetailedFleetResponse
)
from .services import (
    get_drone_telemetry, 
    get_full_fleet_info, 
    get_detailed_fleet_info
)

router = APIRouter(prefix="/drones", tags=["drones"])

@router.get("/telemetry", response_model=DroneTelemetryResponse)
def get_telemetry():
    """Returns status and battery distribution for donut charts"""
    return get_drone_telemetry()

@router.get("/full_fleet", response_model=DroneFullFleetResponse)
def get_fleet_info():
    """Returns basic fleet info for dashboard list view"""
    return get_full_fleet_info()

@router.get("/detailed_fleet", response_model=DroneDetailedFleetResponse)
def get_detailed_fleet():
    """Returns comprehensive drone data for 3D grid and detail pages"""
    return get_detailed_fleet_info()
