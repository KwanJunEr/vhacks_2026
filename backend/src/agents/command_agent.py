import os
import re
import json
import logging
from typing import Dict, Any, List
import google.generativeai as genai
from src.database.supabase_client import get_supabase

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-pro')

class CommandAgent:
    """Command Agent acts as the central brain, producing mission plans."""
    
    def __init__(self):
        self.supabase = get_supabase()
        
    async def generate_mission_plan(self, disaster_event: str, available_drones: List[Dict[str, Any]], unscanned_sectors: List[str]) -> Dict[str, Any]:
        """Generate a mission plan as structured JSON using Gemini."""
        
        prompt = f"""
        🧩 MISSION PLANNING REQUEST 🧩
        
        Disaster Event: {disaster_event}
        
        Available Drones: {json.dumps(available_drones, indent=2)}
        
        Unscanned Sectors: {json.dumps(unscanned_sectors, indent=2)}
        
        👉 Reason step by step before producing the final JSON output.
        
        Output format: 
        {{ 
          "reasoning": "full chain of thought here", 
          "plan": [ 
            {{ "droneId": "Drone_A", "sectorId": "A1", "actions": ["move_to", "scan_area"] }} 
          ] 
        }}
        """
        
        response = model.generate_content(prompt)
        text = response.text
        
        # Extract first {...} block using regex
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if not match:
            logger.critical("Failed to extract JSON from Gemini output")
            raise Exception("Gemini output parsing failed (no JSON found)")
            
        json_str = match.group()
        try:
            plan_data = json.loads(json_str)
            return plan_data
        except json.JSONDecodeError as e:
            logger.critical(f"Failed to parse JSON from Gemini output: {e}")
            raise Exception(f"Gemini output parsing failed (invalid JSON): {e}")

    async def replan_on_trigger(self, trigger_reason: str, drone_id: str, sector_id: str, confidence_score: float = 0.0) -> Dict[str, Any]:
        """Triggered when a replan is needed (survivor detected, battery low)."""
        
        # Log replan event
        self.supabase.table("mission_logs").insert({
            "event_type": "replan_trigger",
            "drone_id": drone_id,
            "sector_id": sector_id,
            "message": f"Replanning triggered: {trigger_reason}",
            "details": json.dumps({
                "trigger_reason": trigger_reason,
                "confidence_score": confidence_score
            })
        }).execute()
        
        # Get current mission context
        available_drones = self.supabase.table("drones").select("*").execute().data
        unscanned_sectors = self.supabase.table("grid_sectors").select("id").eq("scan_status", "unscanned").execute().data
        unscanned_ids = [row["id"] for row in unscanned_sectors]
        
        # Generate new plan
        return await self.generate_mission_plan(
            disaster_event=f"REPLAN: {trigger_reason}",
            available_drones=available_drones,
            unscanned_sectors=unscanned_ids
        )
