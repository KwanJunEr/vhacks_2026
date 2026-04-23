import sqlite3

DB_PATH = "app.db"

def connect():
    return sqlite3.connect(DB_PATH)

def setup_tool_call_log():
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tool_call_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tool_name TEXT,
        drone_name TEXT,
        params TEXT,
        result_summary TEXT,
        called_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

    print("✅ tool_call_log table ready")

if __name__ == "__main__":
    setup_tool_call_log()