from typing import Dict, Any, List
from agents.mcp_client import MCPClient
from agents.state import AgentState

class MissionAgent:
    """Agent responsible for spatial and sector planning."""
    
    def __init__(self, mcp_client: MCPClient):
        self.mcp_client = mcp_client

    def process(self, state: AgentState) -> Dict[str, Any]:
        """Divide the grid and assign drones based on scenario."""
        self.mcp_client.log_reasoning(
            "Mission Agent",
            f"Planning mission strategy for scenario: {state['scenario']}",
            "planning"
        )
        
        # 1. Get current drone fleet
        fleet = self.mcp_client.call_tool("discover_drones")
        
        # 2. Get grid status
        grid_map = self.mcp_client.call_tool("get_grid_map")
        
        # 3. Allocation logic based on scenario
        mission_plan = []
        if state['scenario'] == 'default':
            # Default: cover the whole 20x20 grid
            # For 5 drones, divide into 5 vertical sectors (4 columns each)
            for i, drone in enumerate(fleet):
                x_min, x_max = i * 4, (i + 1) * 4 - 1
                y_min, y_max = 0, 19
                assignment = self.mcp_client.call_tool(
                    "assign_sector",
                    drone_name=drone['drone_name'],
                    x_min=x_min, x_max=x_max,
                    y_min=y_min, y_max=y_max
                )
                mission_plan.append(assignment)
                
        elif state['scenario'] == 'survivor_detection':
            # Survivor detection: prioritize areas with known survivors
            survivors = self.mcp_client.call_tool("get_rescue_priority_list")
            for i, drone in enumerate(fleet):
                if i < len(survivors):
                    s = survivors[i]
                    # Assign a 3x3 sector around the survivor
                    x_min, x_max = max(0, s['grid_x'] - 1), min(19, s['grid_x'] + 1)
                    y_min, y_max = max(0, s['grid_y'] - 1), min(19, s['grid_y'] + 1)
                    assignment = self.mcp_client.call_tool(
                        "assign_sector",
                        drone_name=drone['drone_name'],
                        x_min=x_min, x_max=x_max,
                        y_min=y_min, y_max=y_max
                    )
                    mission_plan.append(assignment)
        
        self.mcp_client.log_reasoning(
            "Mission Agent",
            f"Mission plan created with {len(mission_plan)} assignments.",
            "planning_complete"
        )
        
        return {
            "mission_plan": mission_plan,
            "next_agent": "Human-in-the-Loop"
        }
