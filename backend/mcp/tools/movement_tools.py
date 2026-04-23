from mcp.db.connection import connect
from typing import List, Dict, Any, Tuple
from datetime import datetime
import sqlite3
import math

def move_to(drone_name: str, x: int, y: int) -> Dict[str, Any]:
    """Update drone position and status with dynamic battery drain."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        # 1. Fetch drone specs
        cursor.execute("""
            SELECT weight, motors, wind_resistance, max_speed, battery_level, current_x, current_y 
            FROM drones WHERE drone_name = ?
        """, (drone_name,))
        drone = cursor.fetchone()
        if not drone:
            return {"error": f"Drone {drone_name} not found"}
        
        # 2. Fetch grid_observations at target (x, y)
        cursor.execute("SELECT heat, humidity FROM grid_observations WHERE x = ? AND y = ?", (x, y))
        obs = cursor.fetchone()
        env_heat = obs['heat'] if obs else 0
        env_humidity = obs['humidity'] if obs else 0
        
        # 3. Calculate total_drain
        # Basic formula: distance * (weight_factor + motor_factor) * env_factor
        distance = math.sqrt((x - drone['current_x'])**2 + (y - drone['current_y'])**2)
        
        # Factors (simplified for logic)
        weight_factor = (drone['weight'] or 1.0) / 1000.0
        motor_factor = (drone['motors'] or 4) * 0.1
        env_factor = 1.0 + (env_heat / 100.0) + (env_humidity / 100.0)
        
        drain_amount = distance * (weight_factor + motor_factor) * env_factor
        
        battery_before = drone['battery_level']
        new_battery = max(0, battery_before - drain_amount)
        
        # 5. Update drones table
        now = datetime.now().isoformat()
        cursor.execute("""
            UPDATE drones 
            SET current_x = ?, current_y = ?, status = 'flying', 
                battery_level = ?, last_updated = ? 
            WHERE drone_name = ?
        """, (x, y, round(new_battery, 2), now, drone_name))
        conn.commit()
        
        return {
            "drone_name": drone_name,
            "new_x": x,
            "new_y": y,
            "battery_before": round(battery_before, 2),
            "battery_after": round(new_battery, 2),
            "drain_amount": round(drain_amount, 2),
            "env_factor": round(env_factor, 2),
            "distance": round(distance, 2),
            "last_updated": now
        }
    finally:
        conn.close()

def get_grid_map() -> List[Dict[str, Any]]:
    """Query all grid_cells and return their status."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT x, y, visited, scanned_by, drone_color FROM grid_cells")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

def pathfind_route(drone_name: str, target_x: int, target_y: int) -> Dict[str, Any]:
    """Calculate a simple route avoiding cells visited by other drones."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        # Get current position
        cursor.execute("SELECT current_x, current_y FROM drones WHERE drone_name = ?", (drone_name,))
        drone = cursor.fetchone()
        if not drone:
            return {"error": f"Drone {drone_name} not found"}
        
        start_x, start_y = drone['current_x'], drone['current_y']
        
        # Get obstacles: cells visited by other drones
        cursor.execute("SELECT x, y FROM grid_cells WHERE visited = 1 AND scanned_by != ?", (drone_name,))
        obstacles = {(row['x'], row['y']) for row in cursor.fetchall()}
        
        # Simple A* or Breadth-First Search for pathfinding
        queue = [(start_x, start_y, [])]
        visited = {(start_x, start_y)}
        
        route = []
        while queue:
            curr_x, curr_y, path = queue.pop(0)
            
            if curr_x == target_x and curr_y == target_y:
                route = path
                break
                
            # Possible moves: Up, Down, Left, Right (no diagonal)
            for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                next_x, next_y = curr_x + dx, curr_y + dy
                
                # Check grid boundaries (20x20 grid assumed)
                if 0 <= next_x < 20 and 0 <= next_y < 20:
                    if (next_x, next_y) not in visited and (next_x, next_y) not in obstacles:
                        visited.add((next_x, next_y))
                        queue.append((next_x, next_y, path + [(next_x, next_y)]))
        
        return {
            "drone_name": drone_name,
            "start": (start_x, start_y),
            "target": (target_x, target_y),
            "route": route
        }
    finally:
        conn.close()
