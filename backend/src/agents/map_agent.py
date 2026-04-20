from typing import List, Dict, Any
from src.database.supabase_client import get_supabase

supabase = get_supabase()

class MapAgent:
    """Map Agent manages the 7x7 grid stigmergy (shared environment memory)."""
    
    def __init__(self):
        pass
        
    async def get_unscanned_sectors(self) -> List[str]:
        """Return sectors where scan_status = 'unscanned'."""
        result = supabase.table("grid_sectors") \
            .select("id") \
            .eq("scan_status", "unscanned") \
            .execute()
        return [row["id"] for row in result.data]
        
    async def update_grid_sector(self, sector_id: str, drone_id: str, scan_status: str = 'scanned', survivor_detected: bool = False, survivor_confidence: float = 0.0, structural_damage_detected: bool = False, structural_damage_score: float = 0.0):
        """Update a grid sector after a scan."""
        data = {
            "scan_status": scan_status,
            "survivor_detected": survivor_detected,
            "survivor_confidence": survivor_confidence,
            "structural_damage_detected": structural_damage_detected,
            "structural_damage_score": structural_damage_score,
            "last_scanned_at": "now()",
            "scanned_by": drone_id
        }
        supabase.table("grid_sectors").update(data).eq("id", sector_id).execute()
        
        if survivor_detected:
            # Trigger immediate replan (handled by orchestrator)
            # Log confirmed detection
            supabase.table("survivor_detections").insert({
                "sector_id": sector_id,
                "drone_id": drone_id,
                "confidence": survivor_confidence
            }).execute()
            
    async def get_scanned_sectors(self) -> List[str]:
        """Return sectors where scan_status = 'scanned'."""
        result = supabase.table("grid_sectors") \
            .select("id") \
            .eq("scan_status", "scanned") \
            .execute()
        return [row["id"] for row in result.data]

    async def get_survivor_sectors(self) -> List[str]:
        """Return sectors where survivor_detected = True."""
        result = supabase.table("grid_sectors") \
            .select("id") \
            .eq("survivor_detected", True) \
            .execute()
        return [row["id"] for row in result.data]
