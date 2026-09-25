"""
app/modules/users/router.py
---------------------------
Users module router — student profile and admin user management.

Placeholder returns {"module": "users", "status": "ok"}.

TODO: GET  /users/me             — current student's profile
TODO: GET  /users/{student_id}   — admin: get any student profile
TODO: GET  /users/               — admin: list students with filters
TODO: GET  /users/incharge/scope — domain incharge: get track scope
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/", summary="Users module health check")
async def users_root() -> dict:
    """Placeholder endpoint — confirms the users module is mounted."""
    return {"module": "users", "status": "ok"}
