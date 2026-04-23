import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "db", "app.db")

def connect():
    return sqlite3.connect(DB_PATH)
