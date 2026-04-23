from mcp.db.connection import connect
from typing import List, Dict, Any
from datetime import datetime
import sqlite3
import math

def get_hazard_map() -> List[Dict[str, Any]]:
    """Query all hazards from the entities table."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, name, status, grid_x, grid_y, severity, metadata FROM entities WHERE type = 'hazard'")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

def update_hazard_map(entity_id: str, new_severity: int, new_status: str) -> Dict[str, Any]:
    """Update severity and status for a hazard."""
    conn = connect()
    cursor = conn.cursor()
    try:
        now = datetime.now().isoformat()
        cursor.execute(
            "UPDATE entities SET severity = ?, status = ?, last_updated = ? WHERE id = ? AND type = 'hazard'",
            (new_severity, new_status, now, entity_id)
        )
        conn.commit()
        return {
            "entity_id": entity_id,
            "new_severity": new_severity,
            "new_status": new_status,
            "last_updated": now
        }
    finally:
        conn.close()

def is_safe_to_enter(x: int, y: int) -> Dict[str, Any]:
    """Check if a grid cell is safe to enter."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        # Check for hazards
        cursor.execute("SELECT name FROM entities WHERE type = 'hazard' AND grid_x = ? AND grid_y = ? AND status = 'active'", (x, y))
        hazard = cursor.fetchone()
        
        # Check temperature from grid_observations
        cursor.execute("SELECT heat FROM grid_observations WHERE x = ? AND y = ?", (x, y))
        obs = cursor.fetchone()
        heat = obs['heat'] if obs else 0
        
        safe = True
        reason = "Area clear"
        
        if hazard:
            safe = False
            reason = f"Active hazard detected: {hazard['name']}"
        elif heat > 85:
            safe = False
            reason = f"Extreme heat detected: {heat}"
            
        return {
            "x": x,
            "y": y,
            "safe": safe,
            "reason": reason
        }
    finally:
        conn.close()

def get_hazard_nearby(x: int, y: int, radius: int = 3) -> List[Dict[str, Any]]:
    """Find all hazards within a certain radius of a location."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, name, grid_x, grid_y, severity FROM entities WHERE type = 'hazard'")
        hazards = cursor.fetchall()
        
        nearby_hazards = []
        for h in hazards:
            # Manhattan distance for grid movement
            dist = abs(h['grid_x'] - x) + abs(h['grid_y'] - y)
            if dist <= radius:
                hazard_dict = dict(h)
                hazard_dict['distance'] = dist
                nearby_hazards.append(hazard_dict)
                
        return nearby_hazards
    finally:
        conn.close()
