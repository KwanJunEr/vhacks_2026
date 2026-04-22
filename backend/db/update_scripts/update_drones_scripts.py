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
    drone_ids = cursor.fetchall()

    for (drone_id,) in drone_ids:
        random_class = random.choice(classes)

        cursor.execute("""
        UPDATE drones
        SET status = 'idle',
            weight_class = ?,
            last_updated = CURRENT_TIMESTAMP
        WHERE id = ?
        """, (random_class, drone_id))

    conn.commit()
    conn.close()

    print("✅ All drones set to IDLE + random weight_class assigned")


if __name__ == "__main__":
    update_idle_and_class()