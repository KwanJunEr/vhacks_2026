import sqlite3
import random

DB_PATH = "app.db"


def connect():
    return sqlite3.connect(DB_PATH)


def update_idle_and_class():
    conn = connect()
    cursor = conn.cursor()

    # Define your 3 drone classes
    classes = ["Light", "Medium", "Heavy"]

    # Get all drone IDs
    cursor.execute("SELECT id FROM drones")
    drone_ids = [row[0] for row in cursor.fetchall()]

    # Pick ONE random drone to have warning status
    warning_drone_id = random.choice(drone_ids) if drone_ids else None

    for drone_id in drone_ids:
        random_class = random.choice(classes)
        health_status = "warning" if drone_id == warning_drone_id else "healthy"

        cursor.execute("""
        UPDATE drones
        SET status = 'idle',
            weight_class = ?,
            health_status = ?,
            last_updated = CURRENT_TIMESTAMP
        WHERE id = ?
        """, (random_class, health_status, drone_id))

    conn.commit()
    conn.close()

    print("✅ All drones set to IDLE + random weight_class + health status updated")


if __name__ == "__main__":
    update_idle_and_class()