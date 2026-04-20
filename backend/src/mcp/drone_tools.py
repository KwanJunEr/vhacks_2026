from typing import Dict, Any, List
from src.database.supabase_client import get_supabase

supabase = get_supabase()

# Battery Costs
BATTERY_COSTS = {
    "list_available_drones": 0,
    "move_to": 5,
    "scan_area": 3,
    "thermal_scan": 4,
    "capture_image": 2,
    "get_battery_status": 0,
    "return_to_base": 0
}

async def deplete_battery(drone_id: str, cost: int) -> bool:
    """Check and deplete battery for a drone."""
    if cost == 0:
        return True
        
    result = supabase.table("drones").select("battery").eq("id", drone_id).execute()
    if not result.data:
        return False
        
    current_battery = result.data[0]["battery"]
    if current_battery < cost:
        return False
        
    new_battery = current_battery - cost
    supabase.table("drones").update({"battery": new_battery}).eq("id", drone_id).execute()
    return True

async def list_available_drones() -> List[Dict[str, Any]]:
    result = supabase.table("drones").select("*").execute()
    return result.data

async def move_to(drone_id: str, sector_id: str) -> Dict[str, Any]:
    if await deplete_battery(drone_id, BATTERY_COSTS["move_to"]):
        result = supabase.table("drones").update({"current_sector": sector_id}).eq("id", drone_id).execute()
        return {"success": True, "data": result.data[0]}
    return {"success": False, "reason": "Battery too low"}

async def scan_area(drone_id: str, sector_id: str) -> Dict[str, Any]:
    if await deplete_battery(drone_id, BATTERY_COSTS["scan_area"]):
        # Simulate scan data
        return {"success": True, "scan_data": {"confidence": 0.8, "sector": sector_id}}
    return {"success": False, "reason": "Battery too low"}

async def thermal_scan(drone_id: str, sector_id: str) -> Dict[str, Any]:
    if await deplete_battery(drone_id, BATTERY_COSTS["thermal_scan"]):
        # Simulate thermal data
        return {"success": True, "thermal_data": {"temp_anomaly": True, "confidence": 0.75}}
    return {"success": False, "reason": "Battery too low"}

async def capture_image(drone_id: str, sector_id: str) -> Dict[str, Any]:
    if await deplete_battery(drone_id, BATTERY_COSTS["capture_image"]):
        return {"success": True, "image_url": f"https://storage.com/drone/{drone_id}/{sector_id}.jpg"}
    return {"success": False, "reason": "Battery too low"}

async def get_battery_status(drone_id: str) -> Dict[str, Any]:
    result = supabase.table("drones").select("battery").eq("id", drone_id).execute()
    if result.data:
        return {"success": True, "battery": result.data[0]["battery"]}
    return {"success": False, "reason": "Drone not found"}

async def return_to_base(drone_id: str) -> Dict[str, Any]:
    supabase.table("drones").update({"current_sector": "BASE", "status": "returning"}).eq("id", drone_id).execute()
    return {"success": True, "message": "Drone recalled to base"}
