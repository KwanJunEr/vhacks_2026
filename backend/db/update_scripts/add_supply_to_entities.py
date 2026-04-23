import sqlite3
from datetime import datetime
import json

DB_PATH = "app.db"

def connect():
    return sqlite3.connect(DB_PATH)

def add_supply_requests():
    conn = connect()
    cursor = conn.cursor()

    now = datetime.now().isoformat()

    supply_requests = [
        ("REQ-001", "supply_request", "Medical Request A", "pending", 3, 14, None, 10, None, None, 90,
         json.dumps({"requested_item": "first_aid_kit", "urgency": "high"}), now, now),

        ("REQ-002", "supply_request", "Food Request B", "pending", 12, 6, None, 20, None, None, 70,
         json.dumps({"requested_item": "ready_meals", "urgency": "medium"}), now, now),

        ("REQ-003", "supply_request", "Water Request C", "pending", 8, 9, None, 15, None, None, 85,
         json.dumps({"requested_item": "bottled_water", "urgency": "high"}), now, now),

        ("REQ-004", "supply_request", "Medical Request D", "pending", 16, 11, None, 8, None, None, 95,
         json.dumps({"requested_item": "bandages", "urgency": "critical"}), now, now),
    ]

    cursor.executemany("""
    INSERT INTO entities (
        id, type, name, status,
        grid_x, grid_y,
        battery_level, quantity, capacity, severity, priority,
        metadata,
        created_at, last_updated
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, supply_requests)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    add_supply_requests()
    print("✅ 5 supply requests inserted successfully")