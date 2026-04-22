from fastapi import APIRouter, HTTPException
from .schemas import (
    DroneTelemetryResponse,
    DroneFullFleetResponse,
    DroneDetailedFleetResponse,
    DroneFleetStats,
    DroneDetailItem,
)
from .services import (
    get_drone_telemetry,
    get_full_fleet_info,
    get_detailed_fleet_info,
    fleet_status,
    get_drone_by_id,
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


@router.get("/fleet_stats", response_model=DroneFleetStats)
def get_fleet_stats():
    return fleet_status()

@router.get("/{drone_id}", response_model=DroneDetailItem)
def get_single_drone(drone_id: int):
    drone = get_drone_by_id(drone_id)
    if not drone:
        raise HTTPException(status_code=404, detail="Drone not found")
    return drone


