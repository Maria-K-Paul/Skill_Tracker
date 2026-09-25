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

from app.core.config import settings  # noqa: F401 — used by sub-dependencies
from app.core.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Decode the Bearer JWT and return the token payload as the current user context.

    TODO: Look up the user in the DB and return a proper User object.
    TODO: Check `is_active` flag and raise 401 if account is deactivated.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception

    # TODO: return actual User ORM object from DB
    return {"id": user_id, "roles": payload.get("roles", [])}


async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Raise 403 if the current user does not hold the 'admin' role."""
    # TODO: replace dict check with proper role lookup from DB
    if "admin" not in current_user.get("roles", []):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    return current_user


async def require_student(current_user: dict = Depends(get_current_user)) -> dict:
    """Raise 403 if the current user does not hold the 'student' role."""
    # TODO: replace dict check with proper role lookup from DB
    if "student" not in current_user.get("roles", []):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student access required.")
    return current_user
