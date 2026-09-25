"""
app/modules/slots/router_admin.py
----------------------------------
Slots module admin router — slot creation, hall linking, and slot management.

Placeholder returns {"module": "slots-admin", "status": "ok"}.

TODO: POST   /slots/admin/              — create a new slot for an assessment
TODO: POST   /slots/admin/{slot_id}/halls — link halls to a slot
TODO: PATCH  /slots/admin/{slot_id}/close — close a slot manually
TODO: GET    /slots/admin/              — list all slots with status
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/", summary="Slots admin module health check")
async def slots_admin_root() -> dict:
    """Placeholder endpoint — confirms the slots admin router is mounted."""
    return {"module": "slots-admin", "status": "ok"}
