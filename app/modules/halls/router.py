"""
app/modules/halls/router.py
----------------------------
Halls module router — admin-only hall CRUD.

Placeholder returns {"module": "halls", "status": "ok"}.

TODO: POST /halls/          — create hall
TODO: GET  /halls/          — list halls
TODO: GET  /halls/{hall_id} — get hall detail
TODO: PUT  /halls/{hall_id} — update hall
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/", summary="Halls module health check")
async def halls_root() -> dict:
    """Placeholder endpoint — confirms the halls module is mounted."""
    return {"module": "halls", "status": "ok"}
