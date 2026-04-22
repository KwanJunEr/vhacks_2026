from api.core.database import get_db_connection

def get_drone_telemetry():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # -----------------------------
    # STATUS DISTRIBUTION (FIXED)
    # -----------------------------
    cursor.execute("SELECT status, COUNT(*) as count FROM drones GROUP BY status")
    status_rows = cursor.fetchall()
    print("RAW STATUS ROWS:", status_rows)
    status_map = {
        "idle":      {"name": "Idle",      "color": "bg-slate-400",  "hoverColor": "text-slate-500"},
        "flying":    {"name": "Flying",    "color": "bg-blue-500",   "hoverColor": "text-blue-600"},
        "scanning":  {"name": "Scanning",  "color": "bg-violet-500", "hoverColor": "text-violet-600"},
        "returning": {"name": "Returning", "color": "bg-amber-500",  "hoverColor": "text-amber-600"},
        "rescuing":  {"name": "Rescuing",  "color": "bg-red-500",    "hoverColor": "text-red-600"},
        "supplying": {"name": "Supplying", "color": "bg-emerald-500","hoverColor": "text-emerald-600"},
    }

    # Initialize ALL statuses with 0
    status_counts = {key: 0 for key in status_map.keys()}
    total_drones = 0

    # Fill actual counts
    for row in status_rows:
        status_name = row["status"]
        count = row["count"]
        total_drones += count
        if status_name in status_counts:
            status_counts[status_name] = count

    # Build final status_data (ALWAYS SAME ORDER)
    status_data = []
    for status_name, config in status_map.items():
        item = config.copy()
        item["name"] = config["name"]
        item["value"] = status_counts[status_name]
        status_data.append(item)

    # Convert to %
    if total_drones > 0:
        for item in status_data:
            item["value"] = round((item["value"] / total_drones) * 100)
    else:
        # fallback (avoid empty chart issues)
        for item in status_data:
            item["value"] = 0

    # -----------------------------
    # BATTERY DISTRIBUTION
    # -----------------------------
    cursor.execute("SELECT battery_level FROM drones")
    battery_rows = cursor.fetchall()

    battery_ranges = {
        "High (>80%)": {"min": 81, "max": 100, "color": "bg-emerald-400", "hoverColor": "text-emerald-500"},
        "Mid (40-80%)": {"min": 41, "max": 80, "color": "bg-blue-400", "hoverColor": "text-blue-500"},
        "Low (20-40%)": {"min": 21, "max": 40, "color": "bg-amber-400", "hoverColor": "text-amber-500"},
        "Critical (<20%)": {"min": 0, "max": 20, "color": "bg-rose-400", "hoverColor": "text-rose-500"}
    }

    battery_counts = {name: 0 for name in battery_ranges}

    for row in battery_rows:
        level = row["battery_level"]
        for name, r in battery_ranges.items():
            if r["min"] <= level <= r["max"]:
                battery_counts[name] += 1
                break

    battery_data = []
    for name, count in battery_counts.items():
        item = battery_ranges[name].copy()
        item.pop("min")
        item.pop("max")
        item["name"] = name
        item["value"] = count
        battery_data.append(item)

    # Convert to %
    if total_drones > 0:
        for item in battery_data:
            item["value"] = round((item["value"] / total_drones) * 100)
    else:
        for item in battery_data:
            item["value"] = 0

    # -----------------------------
    # DRONE LIST
    # -----------------------------
    cursor.execute("SELECT id, status, battery_level FROM drones ORDER BY id")
    drone_rows = cursor.fetchall()

    drones = [
        {
            "id": row["id"],
            "status": row["status"],
            "battery_level": row["battery_level"]
        }
        for row in drone_rows
    ]

    conn.close()

    return {
        "status_data": status_data,
        "battery_data": battery_data,
        "drones": drones,
    }


def get_drone_fleet_battery_health():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, drone_name, status, battery_level
        FROM drones
    """)
    rows = cursor.fetchall()

    drones = []

    for r in rows: 
        drones.append({
            "id": str(r[0]),
            "name": r[1],
            "status": r[2],
            "battery": int(r[3]),
        })
    
    return {"drones": drones}



