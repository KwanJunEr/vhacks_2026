import asyncio
import logging
from typing import List, Dict, Any
from src.agents.command_agent import CommandAgent
from src.agents.drone_agent import DroneAgent
from src.agents.map_agent import MapAgent
from src.agents.victim_detection_agent import VictimDetectionAgent
from src.agents.structural_damage_agent import StructuralDamageAgent
from src.database.supabase_client import get_supabase

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Orchestrator:
    """Orchestrator manages the multi-agent mission loop."""
    
    def __init__(self, disaster_event: str):
        self.disaster_event = disaster_event
        self.command_agent = CommandAgent()
        self.map_agent = MapAgent()
        self.victim_agent = VictimDetectionAgent()
        self.structural_agent = StructuralDamageAgent()
        self.supabase = get_supabase()
        
    async def run_mission(self):
        """Run the multi-agent mission loop."""
        logger.info(f"Starting mission: {self.disaster_event}")
        
        while True:
            # 1. Get current status
            unscanned_sectors = await self.map_agent.get_unscanned_sectors()
            if not unscanned_sectors:
                logger.info("Mission complete: All sectors scanned.")
                break
                
            available_drones = self.supabase.table("drones").select("*").execute().data
            
            # 2. Generate mission plan
            logger.info("Generating mission plan with Command Agent...")
            plan_data = await self.command_agent.generate_mission_plan(
                self.disaster_event,
                available_drones,
                unscanned_sectors
            )
            
            logger.info(f"Reasoning: {plan_data['reasoning']}")
            mission_plan = plan_data['plan']
            
            # 3. Execute actions for each drone
            drone_tasks = []
            for action in mission_plan:
                drone_id = action.get("droneId")
                drone_agent = DroneAgent(drone_id)
                drone_tasks.append(self.execute_drone_plan(drone_agent, action))
                
            # Run all drone actions concurrently
            results = await asyncio.gather(*drone_tasks)
            
            # 4. Check results for replan triggers
            replan_needed = False
            for result in results:
                if result.get("trigger_replan"):
                    replan_needed = True
                    break
            
            if replan_needed:
                logger.info("Replan triggered by detection or failure.")
                continue
                
            # If no replan needed, continue loop (will naturally check for unscanned sectors)
            # For demo purposes, we might want a small delay
            await asyncio.sleep(2)

    async def execute_drone_plan(self, drone_agent: DroneAgent, action: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a plan for a single drone and process results."""
        drone_id = drone_agent.drone_id
        sector_id = action.get("sectorId")
        
        logger.info(f"Drone {drone_id} executing actions in {sector_id}...")
        
        # Rule: Execute move_to first
        move_result = await drone_agent.execute_action("move_to", {"sector_id": sector_id})
        if not move_result.get("success"):
            logger.warning(f"Drone {drone_id} failed move_to: {move_result.get('reason')}")
            return {"trigger_replan": True}
            
        # Rule: Execute scans
        scan_result = await drone_agent.execute_action("scan_area", {"sector_id": sector_id})
        thermal_result = await drone_agent.execute_action("thermal_scan", {"sector_id": sector_id})
        image_result = await drone_agent.execute_action("capture_image", {"sector_id": sector_id})
        
        if not scan_result.get("success") or not thermal_result.get("success") or not image_result.get("success"):
            logger.warning(f"Drone {drone_id} failed scanning.")
            return {"trigger_replan": True}
            
        # 5. Specialized Agent Analysis
        
        # Victim Detection Analysis
        victim_result = await self.victim_agent.analyze_sector(
            drone_id, 
            sector_id, 
            scan_result.get("scan_data", {}), 
            thermal_result
        )
        
        # Structural Damage Analysis
        damage_result = await self.structural_agent.analyze_sector(
            drone_id,
            sector_id,
            scan_result.get("scan_data", {}),
            image_result
        )
        
        # 6. Update Map Agent (Stigmergy)
        await self.map_agent.update_grid_sector(
            sector_id=sector_id,
            drone_id=drone_id,
            scan_status='scanned',
            survivor_detected=victim_result.get("victim_found", False),
            survivor_confidence=victim_result.get("confidence", 0.0),
            structural_damage_detected=damage_result.get("damage_detected", False),
            structural_damage_score=damage_result.get("damage_score", 0.0)
        )
        
        if victim_result.get("victim_found"):
            logger.info(f"VICTIM DETECTED in {sector_id} with confidence {victim_result.get('confidence')}!")
            return {"trigger_replan": True}
            
        if damage_result.get("trigger_replan"):
            logger.info(f"SEVERE DAMAGE in {sector_id} triggered replan.")
            return {"trigger_replan": True}
            
        return {"trigger_replan": False}

if __name__ == "__main__":
    orchestrator = Orchestrator("Earthquake in Sabah - Ranau District")
    asyncio.run(orchestrator.run_mission())
