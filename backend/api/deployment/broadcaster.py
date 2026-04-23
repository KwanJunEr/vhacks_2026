"""Shared WebSocket broadcaster for drone movement events."""

import asyncio
import json
from typing import List
from fastapi import WebSocket


class DroneWsBroadcaster:
    """Manages all /ws/drones WebSocket connections and broadcasts messages."""

    def __init__(self):
        self._connections: List[WebSocket] = []
        self._lock = asyncio.Lock()

    async def connect(self, ws: WebSocket):
        await ws.accept()
        async with self._lock:
            self._connections.append(ws)

    async def disconnect(self, ws: WebSocket):
        async with self._lock:
            self._connections = [c for c in self._connections if c is not ws]

    async def broadcast(self, message: dict):
        payload = json.dumps(message)
        dead: List[WebSocket] = []
        for ws in list(self._connections):
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        if dead:
            async with self._lock:
                self._connections = [c for c in self._connections if c not in dead]


# Singleton — imported by main.py and deployment router
drone_broadcaster = DroneWsBroadcaster()
