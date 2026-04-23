import sqlite3
from datetime import datetime

DB_PATH = "app.db"


def connect():
    return sqlite3.connect(DB_PATH)


def setup_grid_cells():
    conn = connect()
    cursor = conn.cursor()

    # 🧱 Create grid tracking table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS grid_cells (
        x INTEGER,
        y INTEGER,
        visited INTEGER DEFAULT 0,
        scanned_by TEXT,
        last_updated DATETIME,
        PRIMARY KEY (x, y)
    )
    """)

    # 🧹 Reset grid (clean slate for demo)
    cursor.execute("DELETE FROM grid_cells")

    now = datetime.now().isoformat()

    # 🟦 Initialize full 20x20 grid (0–19)
    grid_data = []

    for x in range(20):
        for y in range(20):
            grid_data.append((
                x,
                y,
                0,          # not visited
                None,       # no drone yet
                now
            ))

    cursor.executemany("""
    INSERT INTO grid_cells (
        x, y, visited, scanned_by, last_updated
    )
    VALUES (?, ?, ?, ?, ?)
    """, grid_data)

    conn.commit()
    conn.close()

    print("✅ 20x20 grid_cells initialized successfully")


if __name__ == "__main__":
    setup_grid_cells()