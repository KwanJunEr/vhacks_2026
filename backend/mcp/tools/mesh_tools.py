from mcp.db.connection import connect
from typing import List, Dict, Any
from datetime import datetime
import sqlite3

def broadcast_mesh_message(sender: str, message: str) -> Dict[str, Any]:
    """Broadcast a message across the drone mesh network."""
    conn = connect()
    cursor = conn.cursor()
    try:
        # Create table if not exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS mesh_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender TEXT,
                message TEXT,
                sent_at TEXT
            )
        """)
        
        now = datetime.now().isoformat()
        cursor.execute(
            "INSERT INTO mesh_messages (sender, message, sent_at) VALUES (?, ?, ?)",
            (sender, message, now)
        )
        conn.commit()
        
        return {
            "sender": sender,
            "message": message,
            "sent_at": now
        }
    finally:
        conn.close()

def attempt_drone_recovery(drone_name: str) -> Dict[str, Any]:
    """Attempt to recover a drone with critical health."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT health_status, status FROM drones WHERE drone_name = ?", (drone_name,))
        drone = cursor.fetchone()
        
        if not drone:
            return {"error": f"Drone {drone_name} not found"}
            
        recovery_attempted = False
        new_status = drone['status']
        new_health = drone['health_status']
        
        if drone['health_status'] == 'critical':
            now = datetime.now().isoformat()
            cursor.execute(
                "UPDATE drones SET status = 'idle', health_status = 'warning', last_updated = ? WHERE drone_name = ?",
                (now, drone_name)
            )
            conn.commit()
            recovery_attempted = True
            new_status = 'idle'
            new_health = 'warning'
            
        return {
            "drone_name": drone_name,
            "recovery_attempted": recovery_attempted,
            "new_status": new_status,
            "new_health_status": new_health
        }
    finally:
        conn.close()

def get_mesh_log() -> List[Dict[str, Any]]:
    """Return the recent mesh network messages."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        try:
            cursor.execute("SELECT sender, message, sent_at FROM mesh_messages ORDER BY sent_at DESC LIMIT 20")
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        except sqlite3.OperationalError:
            return []
    finally:
        conn.close()
