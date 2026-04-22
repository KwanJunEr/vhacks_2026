from api.core.database import get_db_connection

def get_drone_telemetry():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT status, COUNT(*) as count FROM drones GROUP BY status")
    status_rows = cursor.fetchall()

    status_map = {
        "Active": {"name": "Active", "color": "bg-blue-500", "hoverColor": "text-blue-600"},
        "Charging": {"name": "Charging", "color": "bg-emerald-500", "hoverColor": "text-emerald-600"},
        "Maintenance": {"name": "Maintenance", "color": "bg-amber-500", "hoverColor": "text-amber-600"},
        "Critical": {"name": "Critical", "color": "bg-red-500", "hoverColor": "text-red-600"},
        "Idle": {"name": "Idle", "color": "bg-slate-400", "hoverColor": "text-slate-500"},
        "idle": {"name": "Idle", "color": "bg-slate-400", "hoverColor": "text-slate-500"},
        "Flying": {"name": "Flying", "color": "bg-blue-500", "hoverColor": "text-blue-600"},
        "flying": {"name": "Flying", "color": "bg-blue-500", "hoverColor": "text-blue-600"},
        "scanning": {"name": "Scanning", "color": "bg-purple-500", "hoverColor": "text-purple-600"},
        "returning": {"name": "Returning", "color": "bg-amber-500", "hoverColor": "text-amber-600"},
        "rescuing": {"name": "Rescuing", "color": "bg-red-500", "hoverColor": "text-red-600"},
        "supplying": {"name": "Supplying", "color": "bg-emerald-500", "hoverColor": "text-emerald-600"},
    }

    status_data = []
    total_drones = 0
    for row in status_rows:
        row = dict(row)
        status_name = row["status"]
        count = row["count"]
        total_drones += count
        if status_name in status_map:
            item = status_map[status_name].copy()
            item["value"] = count
            status_data.append(item)

    if total_drones > 0:
        for item in status_data:
            item["value"] = round((item["value"] / total_drones) * 100)

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
        row = dict(row)
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

    if total_drones > 0:
        for item in battery_data:
            item["value"] = round((item["value"] / total_drones) * 100)

    cursor.execute("SELECT id, drone_name, status, battery_level FROM drones")
    drone_rows = cursor.fetchall()
    drones_list = []
    for d in drone_rows:
        d = dict(d)
        drones_list.append({
            "id": str(d["id"]),
            "name": d.get("drone_name") or f"Drone-{d['id']}",
            "status": d.get("status") or "idle",
            "battery": int(d["battery_level"])
        })

    conn.close()

    return {
        "status_data": status_data,
        "battery_data": battery_data,
        "drones": drones_list
    }

def get_full_fleet_info():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, drone_name, status, battery_level FROM drones")
    rows = cursor.fetchall()

    drones = []
    for row in rows:
        row = dict(row)
        drone = {
            "id": str(row["id"]),
            "name": row.get("drone_name") or f"Drone-{row['id']}",
            "status": row.get("status") or "idle",
            "battery": int(row.get("battery_level") or 0)
        }
        drones.append(drone)

    conn.close()
    return {"drones": drones}

def get_detailed_fleet_info():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM drones")
    rows = cursor.fetchall()

    drones = []
    for row in rows:
        row = dict(row)
        drone = {
            "id": str(row["id"]),
            "name": row.get("drone_name") or f"Drone-{row['id']}",
            "status": row.get("status") or "idle",
            "battery": int(row.get("battery_level") or 0),
            "model": row.get("weight_class") or "Medium",
            "brand": row.get("brand_name") or "AeroTech",
            "profile": row.get("description") or "Survey Pro",
            "health": row.get("health_status") or "optimal",
            "color": row.get("color") or "blue",
            "altitude": row.get("altitude") or 0.0,
            "airspeed": row.get("airspeed") or 0.0,
            "current_x": row.get("current_x") or 0.0,
            "current_y": row.get("current_y") or 0.0,
        }
        drones.append(drone)

    conn.close()
    return {"drones": drones}
