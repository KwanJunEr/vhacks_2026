import sqlite3
import hashlib

DB_PATH = "app.db"


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def seed_users():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    users = [
        ("admin01", "Admin User", "admin@gmail.com", hash_password("admin123"), "admin"),
        ("op01", "Operator One", "op1@example.com", hash_password("operator123"), "operator"),
        ("analyst01", "Data Analyst", "analyst@example.com", hash_password("analyst123"), "analyst"),
        ("viewer01", "Viewer User", "viewer@example.com", hash_password("viewer123"), "viewer"),
    ]

    cursor.executemany("""
        INSERT OR IGNORE INTO users (
            username, name, email, password_hash, role
        ) VALUES (?, ?, ?, ?, ?)
    """, users)

    conn.commit()
    conn.close()

    print("✅ Seed users inserted successfully")


if __name__ == "__main__":
    seed_users()