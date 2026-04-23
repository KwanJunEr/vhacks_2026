import sqlite3

DB_PATH = "app.db"


def connect():
    return sqlite3.connect(DB_PATH)


def update_drone_positions():
    conn = connect()
    cursor = conn.cursor()

    # 🧠 Safe 20x20 grid positions (no conflict with entities)
    fixed_positions = [
        (0, 0),
        (3, 12),
        (6, 1),
        (12, 8),
        (19, 10)
    ]

    # Get all drones ordered by id (1–5 expected)
    cursor.execute("SELECT id FROM drones ORDER BY id ASC")
    drones = cursor.fetchall()

    for i, drone in enumerate(drones):
        drone_id = drone[0]
        x, y = fixed_positions[i]

        cursor.execute("""
            UPDATE drones
            SET current_x = ?,
                current_y = ?,
                last_updated = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (x, y, drone_id))

    conn.commit()
    conn.close()


if __name__ == "__main__":
    update_drone_positions()
    print("✅ Drone positions updated on 20x20 grid")