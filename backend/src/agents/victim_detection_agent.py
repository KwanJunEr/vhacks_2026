import json
from typing import Dict, Any
from src.database.supabase_client import get_supabase

supabase = get_supabase()

class VictimDetectionAgent:
    """Specialized Agent for detecting human life signs (thermal, visual, audio)."""
    
    def __init__(self):
        pass
        
    async def analyze_sector(self, drone_id: str, sector_id: str, scan_data: Dict[str, Any], thermal_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze a sector specifically for human victim detection."""
        scan_confidence = scan_data.get("confidence", 0.0)
        thermal_confidence = thermal_data.get("thermal_data", {}).get("confidence", 0.0)
        temp_anomaly = thermal_data.get("thermal_data", {}).get("temp_anomaly", False)
        
        # Human detection logic: heavily weights thermal anomalies
        confidence = (scan_confidence * 0.4) + (thermal_confidence * 0.6)
        if temp_anomaly:
            confidence = min(1.0, confidence + 0.15)
        
        # Log to mission_logs
        supabase.table("mission_logs").insert({
            "event_type": "victim_detection_attempt",
            "drone_id": drone_id,
            "sector_id": sector_id,
            "message": f"Victim detection analysis in {sector_id}. Confidence: {confidence}",
            "details": json.dumps({
                "thermal_anomaly": temp_anomaly,
                "confidence": confidence
            })
        }).execute()
        
        if confidence > 0.8:
            return {
                "victim_found": True,
                "confidence": confidence,
                "trigger_replan": True
            }
        return {
            "victim_found": False,
            "confidence": confidence,
            "trigger_replan": False
        }
