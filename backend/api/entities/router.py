from fastapi import APIRouter
from .schemas import EntitiesResponse
from .service import get_all_entities

router = APIRouter(prefix="/entities", tags=["entities"])


@router.get("", response_model=EntitiesResponse)
def list_entities():
    """Returns all entities (survivors, hazards, supplies, recharge stations) with grid positions."""
    return get_all_entities()
