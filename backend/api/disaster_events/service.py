from api.core.database import get_db_connection


def _row_to_event(row: dict) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "location": row["location"],
        "status": row["status"],
        "event_time": row["event_time"],
        "last_updated": row["last_updated"],
        "description": row.get("description"),
        "impact": row.get("impact"),
        "is_active": int(row["is_active"]),
    }


def get_all_events() -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM disaster_events ORDER BY is_active DESC, event_time DESC"
    )
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"events": [_row_to_event(r) for r in rows], "total": len(rows)}


def get_ongoing_events() -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM disaster_events WHERE is_active = 1 ORDER BY event_time DESC"
    )
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"events": [_row_to_event(r) for r in rows], "total": len(rows)}


def get_past_events() -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM disaster_events WHERE is_active = 0 ORDER BY event_time DESC"
    )
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"events": [_row_to_event(r) for r in rows], "total": len(rows)}


def get_event_by_id(event_id: str) -> dict | None:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM disaster_events WHERE id = ?", (event_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return _row_to_event(dict(row))
