from fastapi import APIRouter
from api.computer_vision.router import router as computer_vision_router
from api.login.router import router as login_router
from api.dashboard_stats.router import router as dashboard_router
from api.drones.router import router as drones_router
from api.rag.routes import router as rag_router
from api.disaster_events.routes import router as disaster_events_router

api_router = APIRouter(prefix="/api")

# Include individual module routers
api_router.include_router(login_router)
api_router.include_router(dashboard_router)
api_router.include_router(drones_router)
api_router.include_router(computer_vision_router)
api_router.include_router(rag_router)
api_router.include_router(disaster_events_router)
