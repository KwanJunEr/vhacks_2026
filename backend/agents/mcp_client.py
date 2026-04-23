import json
import sqlite3
from datetime import datetime
from mcp.db.connection import connect
from typing import Dict, Any, List

class MCPClient:
    """Wrapper to call MCP tools and log reasoning."""
    
    def __init__(self, mission_id: str):
        self.mission_id = mission_id
        self.db_path = "c:/hackathons_github/vhacks_2026/backend/db/app.db"

    def log_reasoning(self, agent_name: str, reasoning: str, step_type: str = "execution"):
        """Save chain of thought reasoning to the database."""
        conn = connect()
        cursor = conn.cursor()
        try:
            now = datetime.now().isoformat()
            cursor.execute(
                "INSERT INTO agent_reasoning (mission_id, agent_name, reasoning, step_type, timestamp) VALUES (?, ?, ?, ?, ?)",
                (self.mission_id, agent_name, reasoning, step_type, now)
            )
            conn.commit()
        finally:
            conn.close()

    def call_tool(self, tool_name: str, **kwargs) -> Dict[str, Any]:
        """Dynamically call MCP tools from the tool layer."""
        # We can dynamically import the tools or use the MCP instance
        # For simplicity in this project, we'll import them from their modules
        
        # Mapping tool names to their functions
        from mcp.tools.drone_tools import discover_drones, get_all_drone_statuses, get_drone_status, get_swarm_summary
        from mcp.tools.movement_tools import move_to, get_grid_map, pathfind_route
        from mcp.tools.scan_tools import thermal_scan, acoustic_scan, computer_vision_scan
        from mcp.tools.battery_tools import get_battery_status, return_to_charging_station, charge_drone
        from mcp.tools.supply_tools import list_supply_depots, collect_supplies, deliver_supplies
        from mcp.tools.rescue_tools import get_rescue_priority_list, mark_survivor_rescued
        from mcp.tools.mission_tools import assign_sector, get_mission_log
        from mcp.tools.mesh_tools import broadcast_mesh_message, attempt_drone_recovery, get_mesh_log
        from mcp.tools.hazard_tools import get_hazard_map, update_hazard_map, is_safe_to_enter, get_hazard_nearby
        from mcp.tools.observability_tools import track_tool_call, get_tool_call_log, get_tool_usage_analytics, replay_tool_sequence
        from mcp.tools.coverage_tools import mark_cell_visited, update_coverage_grid, get_coverage_grid

        tools = {
            "discover_drones": discover_drones,
            "get_all_drone_statuses": get_all_drone_statuses,
            "get_drone_status": get_drone_status,
            "get_swarm_summary": get_swarm_summary,
            "move_to": move_to,
            "get_grid_map": get_grid_map,
            "pathfind_route": pathfind_route,
            "thermal_scan": thermal_scan,
            "acoustic_scan": acoustic_scan,
            "computer_vision_scan": computer_vision_scan,
            "get_battery_status": get_battery_status,
            "return_to_charging_station": return_to_charging_station,
            "charge_drone": charge_drone,
            "list_supply_depots": list_supply_depots,
            "collect_supplies": collect_supplies,
            "deliver_supplies": deliver_supplies,
            "get_rescue_priority_list": get_rescue_priority_list,
            "mark_survivor_rescued": mark_survivor_rescued,
            "assign_sector": assign_sector,
            "get_mission_log": get_mission_log,
            "broadcast_mesh_message": broadcast_mesh_message,
            "attempt_drone_recovery": attempt_drone_recovery,
            "get_mesh_log": get_mesh_log,
            "get_hazard_map": get_hazard_map,
            "update_hazard_map": update_hazard_map,
            "is_safe_to_enter": is_safe_to_enter,
            "get_hazard_nearby": get_hazard_nearby,
            "track_tool_call": track_tool_call,
            "get_tool_call_log": get_tool_call_log,
            "get_tool_usage_analytics": get_tool_usage_analytics,
            "replay_tool_sequence": replay_tool_sequence,
            "mark_cell_visited": mark_cell_visited,
            "update_coverage_grid": update_coverage_grid,
            "get_coverage_grid": get_coverage_grid,
        }

        if tool_name not in tools:
            return {"error": f"Tool {tool_name} not found"}
        
        # Call the tool
        result = tools[tool_name](**kwargs)
        
        # Track the call in observability tools
        track_tool_call(
            tool_name=tool_name,
            drone_name=kwargs.get("drone_name", "system"),
            params=json.dumps(kwargs),
            result_summary=str(result)[:100] + "..."
        )
        
        return result
