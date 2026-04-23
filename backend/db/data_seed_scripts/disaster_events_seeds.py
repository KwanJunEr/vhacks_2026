import sqlite3
from datetime import datetime, timedelta

DB_PATH = "app.db"

def connect():
    return sqlite3.connect(DB_PATH)

def seed_data():
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM disaster_events")

    now = datetime.now()

    events = [

        # 🔴 ONGOING EVENT
        (
            "EV-001",
            "Sabah - Earthquake Response",
            "Kota Kinabalu, Malaysia",
            "Critical",
            (now - timedelta(minutes=10)).isoformat(),  # event_time
            now.isoformat(),                            # last_updated
            "Seismic activity detected near Kota Kinabalu. Rescue drones deployed. Structural damage assessment ongoing.",
            "Emergency Response Active",
            1
        ),

        # 🟡 PAST EVENT
        (
            "EV-002",
            "Manila - Typhoon Warning",
            "Manila, Philippines",
            "Warning",
            "2026-04-20 08:30:00",
            "2026-04-20 12:00:00",
            "High wind speeds and heavy rainfall impacted Luzon. Coastal flooding recorded.",
            "Red Alert Issued",
            0
        ),

        # 🟢 PAST EVENT
        (
            "EV-003",
            "Jakarta - Flood Incident",
            "Jakarta, Indonesia",
            "Resolved",
            "2026-04-18 03:15:00",
            "2026-04-18 10:45:00",
            "Heavy rainfall caused urban flooding. Evacuations completed successfully.",
            "Situation Stabilized",
            0
        ),

        # 🟠 PAST EVENT
        (
            "EV-004",
            "Bangkok - Industrial Fire",
            "Bangkok, Thailand",
            "Resolved",
            "2026-04-15 14:20:00",
            "2026-04-15 18:00:00",
            "Factory fire contained after 4 hours. Air quality temporarily affected.",
            "Contained",
            0
        )
    ]

    cursor.executemany("""
    INSERT INTO disaster_events
    (id, name, location, status, event_time, last_updated, description, impact, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, events)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    seed_data()
    print("🌱 Seed data inserted")