"""
app/core/exceptions.py
-----------------------
Custom exception classes and global FastAPI exception handlers.

All domain-specific errors should subclass one of the base classes
defined here so that the global handlers produce consistent JSON responses.

TODO: Register handlers in main.py using app.add_exception_handler().
TODO: Add error_code field to responses for client-side error discrimination.
TODO: Add Sentry / observability integration in the handler callbacks.
"""

from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse


# ── Base Domain Exceptions ────────────────────────────────────────────────────

class SkillLevelingException(Exception):
    """Base exception for all application-specific errors."""

    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST) -> None:
        self.detail = detail
        self.status_code = status_code
        super().__init__(detail)


class NotFoundError(SkillLevelingException):
    """Raised when a requested resource does not exist."""

    def __init__(self, detail: str = "Resource not found.") -> None:
        super().__init__(detail, status_code=status.HTTP_404_NOT_FOUND)


class ForbiddenError(SkillLevelingException):
    """Raised when the current user lacks permission for an action."""

    def __init__(self, detail: str = "Forbidden.") -> None:
        super().__init__(detail, status_code=status.HTTP_403_FORBIDDEN)


class ConflictError(SkillLevelingException):
    """Raised on duplicate or conflicting state (e.g. double booking)."""

    def __init__(self, detail: str = "Conflict.") -> None:
        super().__init__(detail, status_code=status.HTTP_409_CONFLICT)


class ValidationError(SkillLevelingException):
    """Raised on business-rule validation failures."""

    def __init__(self, detail: str = "Validation error.") -> None:
        super().__init__(detail, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)


# ── Exception Handlers ────────────────────────────────────────────────────────

async def skill_leveling_exception_handler(
    request: Request, exc: SkillLevelingException
) -> JSONResponse:
    """Convert SkillLevelingException to a structured JSON error response."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status_code": exc.status_code},
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Wrap FastAPI's HTTPException in the standard error envelope."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status_code": exc.status_code},
    )
