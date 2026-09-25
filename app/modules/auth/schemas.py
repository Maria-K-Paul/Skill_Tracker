"""
app/modules/auth/schemas.py
---------------------------
Pydantic request/response schemas for the auth module.

TODO: Add field validators (e.g. email format, password strength).
TODO: Add LoginResponse schema with access_token + token_type.
TODO: Add RefreshRequest / RefreshResponse schemas.
"""

from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    """Request body for user registration."""
    email: EmailStr
    password: str
    # TODO: add role field (default 'student')


class LoginRequest(BaseModel):
    """Request body for user login."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Response returned after successful authentication."""
    access_token: str
    token_type: str = "bearer"
    # TODO: add refresh_token field
