import sqlite3

DB_PATH = "app.db"


def connect():
    return sqlite3.connect(DB_PATH)


def add_year_of_service_column():
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("PRAGMA table_info(drones)")
    columns = [col[1] for col in cursor.fetchall()]

    if "years_of_service" not in columns:
        cursor.execute("""
        ALTER TABLE drones
        ADD COLUMN years_of_service INTEGER DEFAULT 0
        """)
        print("✅ Added column: years_of_service")
    else:
        print("ℹ️ Column already exists")

    conn.commit()
    conn.close()


def assign_fixed_years():
    conn = connect()
    cursor = conn.cursor()

    # fixed values you requested
    fixed_years = [0, 0, 1, 3, 5]

    # get drones in stable order
    cursor.execute("SELECT id FROM drones ORDER BY id ASC")
    drone_ids = [row[0] for row in cursor.fetchall()]

    if len(drone_ids) != 5:
        print(f"⚠️ Expected 5 drones, found {len(drone_ids)}. Aborting.")
        conn.close()
        return

    for drone_id, years in zip(drone_ids, fixed_years):
        cursor.execute("""
        UPDATE drones
        SET years_of_service = ?
        WHERE id = ?
        """, (years, drone_id))

    conn.commit()
    conn.close()

    print("✅ Fixed years of service assigned: [0, 0, 1, 3, 5]")


if __name__ == "__main__":
    add_year_of_service_column()
    assign_fixed_years()