from mcp.db.connection import connect
from typing import List, Dict, Any
from datetime import datetime
import sqlite3

def assign_sector(drone_name: str, x_min: int, x_max: int, y_min: int, y_max: int) -> Dict[str, Any]:
    """Assign a geographical sector to a drone."""
    conn = connect()
    cursor = conn.cursor()
    try:
        # Create table if not exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS drone_sectors (
                drone_name TEXT PRIMARY KEY,
                x_min INTEGER,
                x_max INTEGER,
                y_min INTEGER,
                y_max INTEGER,
                assigned_at TEXT
            )
        """)
        
        now = datetime.now().isoformat()
        cursor.execute("""
            INSERT OR REPLACE INTO drone_sectors (drone_name, x_min, x_max, y_min, y_max, assigned_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (drone_name, x_min, x_max, y_min, y_max, now))
        
        conn.commit()
        
        return {
            "drone_name": drone_name,
            "sector": {
                "x_min": x_min,
                "x_max": x_max,
                "y_min": y_min,
                "y_max": y_max
            },
            "assigned_at": now
        }
    finally:
        conn.close()

def get_mission_log() -> List[Dict[str, Any]]:
    """Query the tool call log for recent mission activities."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        # We assume tool_call_log is created by observability tools
        # If it doesn't exist yet, we'll return an empty list or handle the error
        try:
            cursor.execute(
                "SELECT id, tool_name, drone_name, params, result_summary, called_at "
                "FROM tool_call_log ORDER BY called_at DESC LIMIT 50"
            )
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        except sqlite3.OperationalError:
            return []
    finally:
        conn.close()
