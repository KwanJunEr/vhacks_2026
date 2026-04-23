from pydantic import BaseModel
from typing import Optional, List, Any


class EntityItem(BaseModel):
    id: str
    type: str
    name: Optional[str] = None
    status: Optional[str] = None
    grid_x: int
    grid_y: int
    battery_level: Optional[int] = None
    quantity: Optional[int] = None
    capacity: Optional[int] = None
    severity: Optional[int] = None
    priority: Optional[int] = None
    metadata: Optional[Any] = None


class EntitiesResponse(BaseModel):
    entities: List[EntityItem]
    total: int
