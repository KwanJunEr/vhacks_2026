from mcp.db.connection import connect
from typing import List, Dict, Any
from datetime import datetime
import sqlite3
import math

def get_battery_status(drone_name: str) -> Dict[str, Any]:
    """Return battery level and health status of a drone."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT drone_name, battery_level, health_status, status FROM drones WHERE drone_name = ?", (drone_name,))
        row = cursor.fetchone()
        return dict(row) if row else {"error": f"Drone {drone_name} not found"}
    finally:
        conn.close()

def return_to_charging_station(drone_name: str) -> Dict[str, Any]:
    """Find the nearest recharge station and move the drone there."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        # Get current drone position
        cursor.execute("SELECT current_x, current_y FROM drones WHERE drone_name = ?", (drone_name,))
        drone = cursor.fetchone()
        if not drone:
            return {"error": f"Drone {drone_name} not found"}
        
        curr_x, curr_y = drone['current_x'], drone['current_y']
        
        # Find all recharge stations
        cursor.execute("SELECT name, grid_x, grid_y FROM entities WHERE type = 'recharge_station'")
        stations = cursor.fetchall()
        
        if not stations:
            return {"error": "No recharge stations found"}
        
        # Find nearest station using Euclidean distance
        nearest_station = None
        min_dist = float('inf')
        
        for station in stations:
            dist = math.sqrt((station['grid_x'] - curr_x)**2 + (station['grid_y'] - curr_y)**2)
            if dist < min_dist:
                min_dist = dist
                nearest_station = station
        
        # Update drone position and status
        now = datetime.now().isoformat()
        cursor.execute(
            "UPDATE drones SET current_x = ?, current_y = ?, status = 'returning', last_updated = ? WHERE drone_name = ?",
            (nearest_station['grid_x'], nearest_station['grid_y'], now, drone_name)
        )
        conn.commit()
        
        return {
            "drone_name": drone_name,
            "station_name": nearest_station['name'],
            "station_x": nearest_station['grid_x'],
            "station_y": nearest_station['grid_y']
        }
    finally:
        conn.close()

def charge_drone(drone_name: str) -> Dict[str, Any]:
    """Charge the drone to 100% and set status to idle."""
    conn = connect()
    cursor = conn.cursor()
    try:
        now = datetime.now().isoformat()
        cursor.execute(
            "UPDATE drones SET battery_level = 100, status = 'idle', last_updated = ? WHERE drone_name = ?",
            (now, drone_name)
        )
        conn.commit()
        return {
            "drone_name": drone_name,
            "battery_level": 100,
            "status": "idle",
            "last_updated": now
        }
    finally:
        conn.close()
