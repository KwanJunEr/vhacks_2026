from mcp.db.connection import connect
from typing import List, Dict, Any
from datetime import datetime
import sqlite3

def get_rescue_priority_list() -> List[Dict[str, Any]]:
    """Return a list of survivors ordered by priority and severity."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT id, name, status, grid_x, grid_y, priority, severity, metadata FROM entities "
            "WHERE type = 'survivor' ORDER BY priority DESC, severity DESC"
        )
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

def mark_survivor_rescued(survivor_id: str, rescued_by: str) -> Dict[str, Any]:
    """Mark a survivor as rescued."""
    conn = connect()
    cursor = conn.cursor()
    try:
        now = datetime.now().isoformat()
        cursor.execute(
            "UPDATE entities SET status = 'rescued', last_updated = ? WHERE id = ? AND type = 'survivor'",
            (now, survivor_id)
        )
        conn.commit()
        
        return {
            "survivor_id": survivor_id,
            "rescued_by": rescued_by,
            "status": "rescued",
            "timestamp": now
        }
    finally:
        conn.close()
