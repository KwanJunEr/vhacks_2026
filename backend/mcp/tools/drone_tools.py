from mcp.db.connection import connect
from typing import List, Dict, Any
from datetime import datetime

def discover_drones() -> List[Dict[str, Any]]:
    """Query all rows from drones table and return essential information."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, drone_name, status, battery_level, current_x, current_y, color FROM drones")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

def get_all_drone_statuses() -> List[Dict[str, Any]]:
    """Return full fleet snapshot with health and update timestamps."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, drone_name, status, battery_level, current_x, current_y, color, health_status, last_updated FROM drones")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

def get_drone_status(drone_name: str) -> Dict[str, Any]:
    """Return single drone full detail row as dict."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM drones WHERE drone_name = ?", (drone_name,))
        row = cursor.fetchone()
        return dict(row) if row else {}
    finally:
        conn.close()

def get_swarm_summary() -> Dict[str, Any]:
    """Return aggregate stats for the drone swarm."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) as total_drones, AVG(battery_level) as avg_battery FROM drones")
        summary = dict(cursor.fetchone())
        
        cursor.execute("SELECT status, COUNT(*) as count FROM drones GROUP BY status")
        status_counts = {row['status']: row['count'] for row in cursor.fetchall()}
        
        cursor.execute("SELECT COUNT(*) as critical_count FROM drones WHERE health_status = 'critical'")
        critical_health = cursor.fetchone()['critical_count']
        
        return {
            "total_drones": summary['total_drones'],
            "idle_count": status_counts.get('idle', 0),
            "flying_count": status_counts.get('flying', 0),
            "scanning_count": status_counts.get('scanning', 0),
            "returning_count": status_counts.get('returning', 0),
            "average_battery": round(summary['avg_battery'] or 0, 2),
            "critical_health_count": critical_health
        }
    finally:
        conn.close()

import sqlite3 # Imported here to avoid issues with connection.py import
