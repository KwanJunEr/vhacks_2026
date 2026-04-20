from fastapi import HTTPException
from api.core.database import get_db_connection
from api.core.security import hash_password
from .schemas import LoginRequest

def authenticate_user(request: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    password_hash = hash_password(request.password)
    
    cursor.execute(
        "SELECT id, username, name, email, role FROM users WHERE email = ? AND password_hash = ?",
        (request.email, password_hash)
    )
    
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    return {
        "status": "success",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }
