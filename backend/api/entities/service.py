import json
from api.core.database import get_db_connection


def get_all_entities():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM entities ORDER BY type, id")
    rows = cursor.fetchall()
    conn.close()

    entities = []
    for row in rows:
        row = dict(row)
        metadata = row.get("metadata")
        if metadata and isinstance(metadata, str):
            try:
                metadata = json.loads(metadata)
            except Exception:
                pass
        entities.append({
            "id": row["id"],
            "type": row["type"],
            "name": row.get("name"),
            "status": row.get("status"),
            "grid_x": row["grid_x"],
            "grid_y": row["grid_y"],
            "battery_level": row.get("battery_level"),
            "quantity": row.get("quantity"),
            "capacity": row.get("capacity"),
            "severity": row.get("severity"),
            "priority": row.get("priority"),
            "metadata": metadata,
        })

    return {"entities": entities, "total": len(entities)}
