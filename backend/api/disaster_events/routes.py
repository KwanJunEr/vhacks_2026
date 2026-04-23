from fastapi import APIRouter, HTTPException
from .schema import DisasterEventItem, DisasterEventsListResponse
from .service import get_all_events, get_ongoing_events, get_past_events, get_event_by_id

router = APIRouter(prefix="/disaster_events", tags=["disaster_events"])


@router.get("", response_model=DisasterEventsListResponse)
def list_all_events():
    """All disaster events ordered by active first, then newest."""
    return get_all_events()


@router.get("/ongoing", response_model=DisasterEventsListResponse)
def list_ongoing_events():
    """Active / ongoing disaster events (is_active = 1)."""
    return get_ongoing_events()


@router.get("/past", response_model=DisasterEventsListResponse)
def list_past_events():
    """Resolved / past disaster events (is_active = 0)."""
    return get_past_events()


@router.get("/{event_id}", response_model=DisasterEventItem)
def get_event(event_id: str):
    event = get_event_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
