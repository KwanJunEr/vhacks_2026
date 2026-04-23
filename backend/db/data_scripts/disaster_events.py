import sqlite3

DB_PATH = "app.db"

def connect():
    return sqlite3.connect(DB_PATH)

def create_table():
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS disaster_events (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        status TEXT NOT NULL,

        event_time DATETIME NOT NULL,     -- when it actually happened
        last_updated DATETIME NOT NULL,   -- keeps updating for live events

        description TEXT,
        impact TEXT,

        is_active INTEGER DEFAULT 0,      -- 1 = ongoing, 0 = past
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    create_table()
    print("✅ Table created")