import sqlite3

DB_PATH = "app.db"

def connect():
    return sqlite3.connect(DB_PATH)

def update_add_color_column():
    conn = connect()
    cursor = conn.cursor()

    # 🧩 Add new column (no default, no table creation)
    cursor.execute("""
    ALTER TABLE grid_cells
    ADD COLUMN color TEXT
    """)

    conn.commit()
    conn.close()

    print("✅ color column added to grid_cells")

if __name__ == "__main__":
    update_add_color_column()