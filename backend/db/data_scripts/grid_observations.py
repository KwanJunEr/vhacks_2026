import sqlite3
import random
from datetime import datetime

DB_PATH = "app.db"


# =========================
# 🔌 DB CONNECTION
# =========================
def connect():
    return sqlite3.connect(DB_PATH)


# =========================
# 🧱 TABLE SETUP
# =========================
def setup_grid_observations():
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS grid_observations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        x INTEGER,
        y INTEGER,

        description TEXT,
        confidence REAL DEFAULT 1.0,

        temperature REAL DEFAULT 0,
        humidity REAL DEFAULT 0,
        moisture REAL DEFAULT 0,
        heat REAL DEFAULT 0,

        signal_value REAL DEFAULT 0,

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

    print("✅ grid_observations table ready")


# =========================
# 🌍 20x20 SEED GENERATOR
# =========================
def seed_observations():
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM grid_observations")

    now = datetime.now().isoformat()

    data = []

    for x in range(20):
        for y in range(20):

            # 📍 spatial influence (center hotspot simulation)
            dx = x - 10
            dy = y - 10
            dist = (dx*dx + dy*dy) ** 0.5

            # 🌡️ temperature (hot center, cooler edges)
            temperature = round(
                95 - dist * 3 + random.uniform(-4, 4),
                2
            )

            # 💧 humidity (higher at edges)
            humidity = round(
                40 + dist * 2 + random.uniform(-8, 8),
                2
            )

            # 🌱 moisture (terrain variation)
            moisture = round(
                random.uniform(0, 1) * (1 - dist / 25),
                2
            )

            # 🔥 heat (derived composite score)
            heat = round(
                (temperature * 0.6) +
                (moisture * 35) -
                (humidity * 0.25) +
                random.uniform(-8, 8),
                2
            )

            # 📡 signal strength (decays with distance)
            signal_value = round(
                max(0.1, 1 - (dist / 25) + random.uniform(-0.15, 0.15)),
                2
            )

            # 🧠 unique description per cell
            description = f"grid sensor scan at ({x},{y}) | variance pattern applied"

            confidence = round(random.uniform(0.6, 1.0), 2)

            data.append((
                x, y,
                description,
                confidence,
                temperature,
                humidity,
                moisture,
                heat,
                signal_value,
                now
            ))

    cursor.executemany("""
        INSERT INTO grid_observations (
            x, y,
            description,
            confidence,
            temperature,
            humidity,
            moisture,
            heat,
            signal_value,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, data)

    conn.commit()
    conn.close()

    print("✅ 20x20 grid_observations seeded successfully")


# =========================
# 🚀 RUN EVERYTHING
# =========================
if __name__ == "__main__":
    setup_grid_observations()
    seed_observations()