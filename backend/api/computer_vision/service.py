import sqlite3

from api.core.database import get_db_connection


COMPUTER_VISION_MAPPINGS = [
    (
        "Earthquake 1.mp4",
        "collapsed_building_1776481134483.mp4",
        "/analyzed_videos/collapsed_building_1776481134483.mp4",
    ),
    (
        "Earthquake 2.mp4",
        "collapsed_building_1776481151096.mp4",
        "/analyzed_videos/collapsed_building_1776481151096.mp4",
    ),
    (
        "Earthquake 3.mp4",
        "collapsed_building_1776481166790.mp4",
        "/analyzed_videos/collapsed_building_1776481166790.mp4",
    ),
    (
        "Earthquake 4.mp4",
        "collapsed_building_1776481174535.mp4",
        "/analyzed_videos/collapsed_building_1776481174535.mp4",
    ),
    (
        "Earthquake 5.mp4",
        "collapsed_building_1776481181687.mp4",
        "/analyzed_videos/collapsed_building_1776481181687.mp4",
    ),
]


def _ensure_computer_vision_table() -> None:
    conn = get_db_connection()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS computer_vision_mappings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_filename TEXT UNIQUE NOT NULL,
            analyzed_filename TEXT NOT NULL,
            analyzed_path TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.commit()
    conn.close()


def _seed_computer_vision_table() -> None:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.executemany(
        """
        INSERT OR IGNORE INTO computer_vision_mappings (
            original_filename,
            analyzed_filename,
            analyzed_path
        ) VALUES (?, ?, ?)
        """,
        COMPUTER_VISION_MAPPINGS,
    )
    conn.commit()
    conn.close()


_ensure_computer_vision_table()
_seed_computer_vision_table()


def get_computer_vision_mapping(original_filename: str) -> dict | None:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT original_filename, analyzed_filename, analyzed_path
        FROM computer_vision_mappings
        WHERE original_filename = ?
        """,
        (original_filename,),
    )
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return dict(row)
