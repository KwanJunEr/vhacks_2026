import httpx
from typing import Dict, Any, List
from src.database.supabase_client import get_supabase

supabase = get_supabase()

class DroneAgent:
    """Drone Agent executes ordered MCP tool calls for a single drone."""
    
    def __init__(self, drone_id: str, mcp_url: str = "http://localhost:3002"):
        self.drone_id = drone_id
        self.mcp_url = mcp_url
        
    async def execute_action(self, tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single MCP tool call."""
        # Add drone_id to params
        params["drone_id"] = self.drone_id
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.mcp_url}/tool",
                json={"tool": tool_name, "params": params}
            )
            result = response.json()
            
            # Rule: Stop execution if any tool returns success: false
            if not result.get("success", False):
                # Return failure result to orchestrator
                return {"success": False, "reason": result.get("reason", "Unknown failure"), "tool": tool_name}
            
            return result
            
    async def execute_plan(self, plan: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Execute a sequence of actions for a drone."""
        results = []
        for action in plan:
            # action = { "droneId": "Drone_A", "sectorId": "A1", "actions": ["move_to", "scan_area"] }
            # actions = ["move_to", "scan_area"]
            
            for tool_name in action.get("actions", []):
                # Prepare params
                params = {"sector_id": action.get("sectorId")}
                
                result = await self.execute_action(tool_name, params)
                results.append({
                    "tool": tool_name,
                    "result": result
                })
                
                if not result.get("success", False):
                    # Stop execution and return failure
                    return {"success": False, "results": results}
                    
        return {"success": True, "results": results}
