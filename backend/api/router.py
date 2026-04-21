from fastapi import APIRouter
from api.login.router import router as login_router
from api.dashboard_stats.router import router as dashboard_router

api_router = APIRouter(prefix="/api")

# Include individual module routers
api_router.include_router(login_router)
api_router.include_router(dashboard_router)
