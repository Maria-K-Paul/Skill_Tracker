"""
app/modules/auth/router.py
--------------------------
Auth module router — public and protected auth endpoints.

Placeholder returns {"module": "auth", "status": "ok"}.

TODO: POST /register  — call service.register()
TODO: POST /login     — call service.login(), return TokenResponse
TODO: POST /refresh   — call service.rotate_refresh_token()
TODO: POST /logout    — revoke refresh token
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.modules.auth.schemas import RegisterRequest, LoginRequest, TokenResponse
from app.modules.auth.service import register, login, rotate_refresh_token
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Auth"])

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        user = await register(db, request.email, request.password)
        return {"message": "User registered successfully", "id": user.id}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/login", response_model=TokenResponse)
async def login_user(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        tokens = await login(db, request.email, request.password)
        return TokenResponse(
            access_token=tokens["access_token"],
            token_type="bearer"
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshRequest, db: AsyncSession = Depends(get_db)):
    try:
        tokens = await rotate_refresh_token(db, request.refresh_token)
        return TokenResponse(
            access_token=tokens["access_token"],
            token_type="bearer"
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
