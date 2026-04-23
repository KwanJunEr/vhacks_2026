import sqlite3
from datetime import datetime
import json

DB_PATH = "app.db"

def connect():
    return sqlite3.connect(DB_PATH)

def setup_and_seed():
    conn = connect()
    cursor = conn.cursor()

    # 🔧 Create table (grid-based)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS entities (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,          -- survivor / hazard / supply / recharge_station
        
        name TEXT,
        status TEXT,

        grid_x INTEGER NOT NULL,
        grid_y INTEGER NOT NULL,

        battery_level INTEGER,
        quantity INTEGER,
        capacity INTEGER,
        severity INTEGER,
        priority INTEGER,

        metadata TEXT,

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_updated DATETIME
    )
    """)

    # 🧹 Clear existing data
    cursor.execute("DELETE FROM entities")

    now = datetime.now().isoformat()

    # 🌱 Seed data (20x20 grid, spaced out)
    entities = [

        # 🧍 Survivors (5)
        ("ENT-001", "survivor", "Survivor A", "critical", 2, 3, None, None, None, None, 95, json.dumps({"injury": "leg fracture"}), now, now),
        ("ENT-002", "survivor", "Survivor B", "injured", 15, 4, None, None, None, None, 80, json.dumps({"injury": "arm injury"}), now, now),
        ("ENT-003", "survivor", "Survivor C", "stable", 7, 16, None, None, None, None, 60, json.dumps({"condition": "dehydrated"}), now, now),
        ("ENT-004", "survivor", "Survivor D", "critical", 18, 18, None, None, None, None, 98, json.dumps({"injury": "trapped"}), now, now),
        ("ENT-005", "survivor", "Survivor E", "injured", 10, 10, None, None, None, None, 75, json.dumps({"injury": "minor cuts"}), now, now),

        # ⚠️ Hazards (2)
        ("ENT-006", "hazard", "Collapse Zone", "active", 5, 5, None, None, None, 9, None, json.dumps({"risk": "high"}), now, now),
        ("ENT-007", "hazard", "Fire Area", "active", 14, 14, None, None, None, 8, None, json.dumps({"risk": "spreading"}), now, now),

        # 📦 Supplies (2)
        ("ENT-008", "supply", "Medical Supply", "available", 1, 18, None, 50, None, None, None, json.dumps({"type": "medical"}), now, now),
        ("ENT-009", "supply", "Food Supply", "available", 17, 2, None, 30, None, None, None, json.dumps({"type": "food"}), now, now),

        # 🔋 Recharge Station (1)
        ("ENT-010", "recharge_station", "Charging Station", "active", 9, 2, None, None, 3, None, None, json.dumps({"power": "fast"}), now, now),
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
    """, entities)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    setup_and_seed()
    print("✅ Table created + data seeded successfully")