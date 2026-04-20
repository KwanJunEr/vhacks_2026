import sqlite3
import os 

DB_PATH = "app.db"


def setup_sqlite():
    os.makedirs("db", exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'operator',   -- admin / operator / analyst / viewer
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);
    """)

    conn.commit()
    conn.close()

    print("✅ SQLite ready at db/app.db")


if __name__ == "__main__":
    setup_sqlite()