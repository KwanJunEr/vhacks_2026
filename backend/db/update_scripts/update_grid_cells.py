import sqlite3

DB_PATH = "app.db"

def connect():
    return sqlite3.connect(DB_PATH)

def upgrade_grid_schema():
    conn = connect()
    cursor = conn.cursor()

    # ➕ Add risk_level
    try:
        cursor.execute("""
        ALTER TABLE grid_cells ADD COLUMN risk_level INTEGER DEFAULT 0
        """)
    except sqlite3.OperationalError:
        pass

    # ➕ Add priority_score
    try:
        cursor.execute("""
        ALTER TABLE grid_cells ADD COLUMN priority_score INTEGER DEFAULT 0
        """)
    except sqlite3.OperationalError:
        pass

    # ➕ Add confidence_score
    try:
        cursor.execute("""
        ALTER TABLE grid_cells ADD COLUMN confidence_score REAL DEFAULT 0
        """)
    except sqlite3.OperationalError:
        pass

    conn.commit()
    conn.close()

    print("✅ Schema upgraded with risk_level, priority_score, confidence_score")


if __name__ == "__main__":
    upgrade_grid_schema()