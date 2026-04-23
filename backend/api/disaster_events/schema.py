from pydantic import BaseModel
from typing import List, Optional


class DisasterEventItem(BaseModel):
    id: str
    name: str
    location: str
    status: str
    event_time: str
    last_updated: str
    description: Optional[str] = None
    impact: Optional[str] = None
    is_active: int


class DisasterEventsListResponse(BaseModel):
    events: List[DisasterEventItem]
    total: int
