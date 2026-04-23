import sqlite3

DB_PATH = "app.db"


def connect():
    return sqlite3.connect(DB_PATH)


def update_drone_positions():
    conn = connect()
    cursor = conn.cursor()

    GRID_SIZE = 20

    # 🌍 Strategic positions: North, South, West, East, Center
    fixed_positions = [
        (GRID_SIZE // 2, 0),                # North (top middle)
        (GRID_SIZE // 2, GRID_SIZE - 1),    # South (bottom middle)
        (0, GRID_SIZE // 2),                # West (left middle)
        (GRID_SIZE - 1, GRID_SIZE // 2),    # East (right middle)
        (GRID_SIZE // 2, GRID_SIZE // 2),   # Center
    ]

    # Get all drones ordered by id
    cursor.execute("SELECT id FROM drones ORDER BY id ASC")
    drones = cursor.fetchall()

    for i, drone in enumerate(drones):
        if i >= len(fixed_positions):
            break  # Safety check if more drones exist

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
    print("✅ Drone positions updated (North, South, East, West, Center)")