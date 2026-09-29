"""
app/core/dependencies.py
------------------------
Shared FastAPI dependency functions used across all module routers.

Provides:
- `get_current_user()`  — validates the Bearer token and returns the active user.
- `require_admin()`     — asserts the current user holds the "admin" role.
- `require_student()`   — asserts the current user holds the "student" role.

TODO: Implement require_domain_incharge(track_id) scoped admin check.
TODO: Cache decoded tokens in request state to avoid re-decoding per dependency.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings  # noqa: F401 — used by sub-dependencies
from app.core.security import decode_access_token
from app.core.database import get_db
from app.modules.users.models import User
from app.modules.auth.models import Role, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except Exception:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive user")

    roles = payload.get("roles", [])
    return {"id": user.id, "user": user, "roles": roles}

async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if "admin" not in current_user.get("roles", []):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    return current_user

async def require_student(current_user: dict = Depends(get_current_user)) -> dict:
    if "student" not in current_user.get("roles", []):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student access required.")
    return current_user
