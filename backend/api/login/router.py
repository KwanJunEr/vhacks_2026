from fastapi import APIRouter
from .schemas import LoginRequest, LoginResponse
from .service import authenticate_user

router = APIRouter(tags=["login"])

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
    return authenticate_user(request)
