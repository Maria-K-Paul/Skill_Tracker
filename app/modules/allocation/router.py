"""
app/modules/allocation/router.py
---------------------------------
Allocation module router — admin-only trigger and status endpoints.

Placeholder returns {"module": "allocation", "status": "ok"}.

TODO: POST /allocation/{slot_id}/run   — manually trigger allocation (admin)
TODO: GET  /allocation/{slot_id}       — view allocation summary for a slot
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/", summary="Allocation module health check")
async def allocation_root() -> dict:
    """Placeholder endpoint — confirms the allocation module is mounted."""
    return {"module": "allocation", "status": "ok"}
