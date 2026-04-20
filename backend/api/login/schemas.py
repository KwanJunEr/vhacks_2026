from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    name: str
    email: str
    role: str

class LoginResponse(BaseModel):
    status: str
    user: UserResponse
