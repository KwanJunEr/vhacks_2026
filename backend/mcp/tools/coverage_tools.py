from mcp.db.connection import connect
from typing import List, Dict, Any
from datetime import datetime
import sqlite3

def mark_cell_visited(x: int, y: int, drone_name: str, drone_color: str) -> Dict[str, Any]:
    """Mark a grid cell as visited by a drone."""
    conn = connect()
    cursor = conn.cursor()
    try:
        now = datetime.now().isoformat()
        cursor.execute("""
            UPDATE grid_cells 
            SET visited = 1, scanned_by = ?, drone_color = ?, last_updated = ?
            WHERE x = ? AND y = ?
        """, (drone_name, drone_color, now, x, y))
        conn.commit()
        
        return {
            "x": x,
            "y": y,
            "scanned_by": drone_name,
            "drone_color": drone_color,
            "last_updated": now
        }
    finally:
        conn.close()

def update_coverage_grid(cells: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Bulk update multiple grid cells."""
    conn = connect()
    cursor = conn.cursor()
    try:
        now = datetime.now().isoformat()
        updated_count = 0
        for cell in cells:
            cursor.execute("""
                UPDATE grid_cells 
                SET visited = 1, scanned_by = ?, drone_color = ?, last_updated = ?
                WHERE x = ? AND y = ?
            """, (cell['drone_name'], cell['drone_color'], now, cell['x'], cell['y']))
            updated_count += cursor.rowcount
            
        conn.commit()
        return {"updated_count": updated_count}
    finally:
        conn.close()

def get_coverage_grid() -> List[Dict[str, Any]]:
    """Return all grid cells and their coverage status."""
    conn = connect()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT x, y, visited, scanned_by, drone_color, last_updated FROM grid_cells")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()
