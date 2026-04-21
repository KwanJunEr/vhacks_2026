import sqlite3
from datetime import datetime
import random

DB_PATH = "app.db"


def connect():
    return sqlite3.connect(DB_PATH)


def create_table():
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS drones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        drone_name TEXT UNIQUE,

        status TEXT,
        battery_level INTEGER,
        health_status TEXT,

        current_x REAL,
        current_y REAL,

        last_maintenance TIMESTAMP, 
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        description TEXT,
        brand_name TEXT,
        weight_class TEXT,

        max_speed REAL,
        weight REAL,
        motors INTEGER,
        range_km REAL,
        flight_time_min INTEGER,
        wind_resistance TEXT,
        payload TEXT,

        flight_controller INTEGER,
        gps_module INTEGER,
        imu_gyro INTEGER,
        battery_mgmt INTEGER,
        gimbal_control INTEGER,
        comms_link INTEGER,

        rotor_1_rpm INTEGER,
        rotor_2_rpm INTEGER,
        rotor_3_rpm INTEGER,
        rotor_4_rpm INTEGER,

        visual_status TEXT,
        visual_quality TEXT,
        thermal_status TEXT,
        thermal_type TEXT,

        pitch REAL,
        roll REAL,
        yaw REAL,
        altitude REAL,
        airspeed REAL,

        color TEXT
    )
    """)

    conn.commit()
    conn.close()


def seed_data():
    conn = connect()
    cursor = conn.cursor()

    statuses = ["idle", "flying", "scanning", "returning", "rescuing", "supplying"]
    health_states = ["optimal", "warning", "critical"]

    # Good distinct colors for 3D visualization
    colors = ["red", "blue", "green", "yellow", "purple"]

    drones = []

    for i in range(1, 6):
        drone = (
            f"ALPHA-{i:03}",  # 👈 naming convention
            random.choice(statuses),
            random.randint(30, 100),
            random.choice(health_states),

            round(random.uniform(0, 100), 2),
            round(random.uniform(0, 100), 2),

            datetime.now().isoformat(),

            f"Autonomous rescue drone #{i}",
            "AeroTech",
            "Medium",

            14.0,
            2.1,
            4,
            18.0,
            52,
            "Level 6",
            "LiDAR + RGB Array",

            random.randint(80, 100),
            random.randint(80, 100),
            random.randint(80, 100),
            random.randint(70, 100),
            random.randint(80, 100),
            random.randint(80, 100),

            random.randint(1000, 5000),
            random.randint(1000, 5000),
            random.randint(1000, 5000),
            random.randint(1000, 5000),

            "ACTIVE",
            "4K/60fps",
            "ACTIVE",
            "FLIR Boson",

            round(random.uniform(-10, 10), 2),
            round(random.uniform(-10, 10), 2),
            round(random.uniform(0, 360), 2),
            round(random.uniform(0, 100), 2),
            round(random.uniform(0, 60), 2),

            colors[i - 1]  # assign distinct color
        )

        drones.append(drone)

    cursor.executemany("""
    INSERT OR IGNORE INTO drones (
        drone_name, status, battery_level, health_status,
        current_x, current_y, last_maintenance,

        description, brand_name, weight_class,

        max_speed, weight, motors, range_km, flight_time_min,
        wind_resistance, payload,

        flight_controller, gps_module, imu_gyro,
        battery_mgmt, gimbal_control, comms_link,

        rotor_1_rpm, rotor_2_rpm, rotor_3_rpm, rotor_4_rpm,

        visual_status, visual_quality,
        thermal_status, thermal_type,

        pitch, roll, yaw, altitude, airspeed,

        color
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, drones)

    conn.commit()
    conn.close()


if __name__ == "__main__":
    create_table()
    seed_data()
    print("✅ Drones with ALPHA naming + color seeded successfully.")