from fastmcp import FastMCP
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

mcp = FastMCP("disaster-drone-server")

# Drone Tools
mcp.tool()(discover_drones)
mcp.tool()(get_all_drone_statuses)
mcp.tool()(get_drone_status)
mcp.tool()(get_swarm_summary)

# Movement Tools
mcp.tool()(move_to)
mcp.tool()(get_grid_map)
mcp.tool()(pathfind_route)

# Scan Tools
mcp.tool()(thermal_scan)
mcp.tool()(acoustic_scan)
mcp.tool()(computer_vision_scan)

# Battery Tools
mcp.tool()(get_battery_status)
mcp.tool()(return_to_charging_station)
mcp.tool()(charge_drone)

# Supply Tools
mcp.tool()(list_supply_depots)
mcp.tool()(collect_supplies)
mcp.tool()(deliver_supplies)

# Rescue Tools
mcp.tool()(get_rescue_priority_list)
mcp.tool()(mark_survivor_rescued)

# Mission Tools
mcp.tool()(assign_sector)
mcp.tool()(get_mission_log)

# Mesh Tools
mcp.tool()(broadcast_mesh_message)
mcp.tool()(attempt_drone_recovery)
mcp.tool()(get_mesh_log)

# Hazard Tools
mcp.tool()(get_hazard_map)
mcp.tool()(update_hazard_map)
mcp.tool()(is_safe_to_enter)
mcp.tool()(get_hazard_nearby)

# Observability Tools
mcp.tool()(track_tool_call)
mcp.tool()(get_tool_call_log)
mcp.tool()(get_tool_usage_analytics)
mcp.tool()(replay_tool_sequence)

# Coverage Tools
mcp.tool()(mark_cell_visited)
mcp.tool()(update_coverage_grid)
mcp.tool()(get_coverage_grid)
