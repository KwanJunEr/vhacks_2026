from mcp.db.connection import connect
from typing import List, Dict, Any
from datetime import datetime
import sqlite3

def list_supply_depots() -> List[Dict[str, Any]]:
    """List all supply depots and their status."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, name, status, grid_x, grid_y, quantity, metadata FROM entities WHERE type = 'supply'")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

def collect_supplies(drone_name: str, entity_id: str) -> Dict[str, Any]:
    """Collect supplies from a depot."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        # Check if entity exists and is available
        cursor.execute("SELECT name, status FROM entities WHERE id = ?", (entity_id,))
        entity = cursor.fetchone()
        
        if not entity:
            return {"error": f"Entity {entity_id} not found"}
        
        if entity['status'] != 'available':
            return {"error": f"Supplies at {entity['name']} are {entity['status']}"}
        
        # Update entity status
        now = datetime.now().isoformat()
        cursor.execute(
            "UPDATE entities SET status = 'collected', last_updated = ? WHERE id = ?",
            (now, entity_id)
        )
        conn.commit()
        
        return {
            "drone_name": drone_name,
            "entity_id": entity_id,
            "name": entity['name'],
            "result": "success",
            "last_updated": now
        }
    finally:
        conn.close()

def deliver_supplies(drone_name: str, survivor_id: str) -> Dict[str, Any]:
    """Deliver supplies to a survivor."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        # Check if survivor exists
        cursor.execute("SELECT name FROM entities WHERE id = ? AND type = 'survivor'", (survivor_id,))
        survivor = cursor.fetchone()
        
        if not survivor:
            return {"error": f"Survivor {survivor_id} not found"}
        
        # Update survivor status
        now = datetime.now().isoformat()
        cursor.execute(
            "UPDATE entities SET status = 'supplied', last_updated = ? WHERE id = ?",
            (now, survivor_id)
        )
        conn.commit()
        
        return {
            "drone_name": drone_name,
            "survivor_id": survivor_id,
            "name": survivor['name'],
            "result": "success",
            "last_updated": now
        }
    finally:
        conn.close()
