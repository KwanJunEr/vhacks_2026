import sqlite3

DB_PATH = "app.db"

def create_connection():
    return sqlite3.connect(DB_PATH)

def create_table():
    conn = create_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS drone_evaluations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        drone_id TEXT,
        status TEXT,
        score INTEGER,
        title TEXT,
        summary TEXT,
        reasoning TEXT,
        items_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()
    print("✅ drone_evaluations table created successfully.")

if __name__ == "__main__":
    create_table()