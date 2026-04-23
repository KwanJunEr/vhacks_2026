from mcp.db.connection import connect
from typing import List, Dict, Any, Optional
import sqlite3

def thermal_scan(drone_name: str, x: int, y: int) -> Dict[str, Any]:
    """Perform a thermal scan at the specified coordinates."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT temperature, heat FROM grid_observations WHERE x = ? AND y = ?", (x, y))
        obs = cursor.fetchone()
        if not obs:
            return {"error": "No observations found for these coordinates"}
        
        temperature = obs['temperature']
        heat = obs['heat']
        heat_detected = temperature > 80
        
        return {
            "x": x,
            "y": y,
            "temperature": temperature,
            "heat": heat,
            "heat_detected": heat_detected,
            "scanned_by": drone_name
        }
    finally:
        conn.close()

def acoustic_scan(drone_name: str, x: int, y: int) -> Dict[str, Any]:
    """Perform an acoustic scan at the specified coordinates."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT signal_value FROM grid_observations WHERE x = ? AND y = ?", (x, y))
        obs = cursor.fetchone()
        if not obs:
            return {"error": "No observations found for these coordinates"}
        
        signal_value = obs['signal_value']
        sound_detected = signal_value > 0.7
        
        return {
            "x": x,
            "y": y,
            "signal_value": signal_value,
            "sound_detected": sound_detected,
            "scanned_by": drone_name
        }
    finally:
        conn.close()

def computer_vision_scan(drone_name: str, x: int, y: int) -> Dict[str, Any]:
    """Perform a computer vision scan to detect survivors."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        # Check for survivors in entities table
        cursor.execute("SELECT * FROM entities WHERE type = 'survivor' AND grid_x = ? AND grid_y = ?", (x, y))
        survivor = cursor.fetchone()
        
        # Get confidence from grid_observations
        cursor.execute("SELECT confidence FROM grid_observations WHERE x = ? AND y = ?", (x, y))
        obs = cursor.fetchone()
        confidence = obs['confidence'] if obs else 0.0
        
        return {
            "x": x,
            "y": y,
            "survivor_found": survivor is not None,
            "survivor_details": dict(survivor) if survivor else None,
            "confidence": confidence,
            "scanned_by": drone_name
        }
    finally:
        conn.close()
