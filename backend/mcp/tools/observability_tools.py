from mcp.db.connection import connect
from typing import List, Dict, Any
from datetime import datetime
import sqlite3

def track_tool_call(tool_name: str, drone_name: str, params: str, result_summary: str) -> Dict[str, Any]:
    """Log a tool call for observability."""
    conn = connect()
    cursor = conn.cursor()
    try:
        # Create table if not exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tool_call_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tool_name TEXT,
                drone_name TEXT,
                params TEXT,
                result_summary TEXT,
                called_at TEXT
            )
        """)
        
        now = datetime.now().isoformat()
        cursor.execute(
            "INSERT INTO tool_call_log (tool_name, drone_name, params, result_summary, called_at) VALUES (?, ?, ?, ?, ?)",
            (tool_name, drone_name, params, result_summary, now)
        )
        conn.commit()
        last_id = cursor.lastrowid
        
        return {
            "id": last_id,
            "tool_name": tool_name,
            "called_at": now
        }
    finally:
        conn.close()

def get_tool_call_log() -> List[Dict[str, Any]]:
    """Return the recent tool call log."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        try:
            cursor.execute("SELECT * FROM tool_call_log ORDER BY called_at DESC LIMIT 100")
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        except sqlite3.OperationalError:
            return []
    finally:
        conn.close()

def get_tool_usage_analytics() -> List[Dict[str, Any]]:
    """Return tool usage statistics."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        try:
            cursor.execute("""
                SELECT tool_name, COUNT(*) as call_count, MAX(called_at) as last_called 
                FROM tool_call_log GROUP BY tool_name
            """)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        except sqlite3.OperationalError:
            return []
    finally:
        conn.close()

def replay_tool_sequence(drone_name: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Return the tool call sequence for a specific drone."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        try:
            cursor.execute(
                "SELECT * FROM tool_call_log WHERE drone_name = ? ORDER BY called_at ASC LIMIT ?",
                (drone_name, limit)
            )
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        except sqlite3.OperationalError:
            return []
    finally:
        conn.close()
