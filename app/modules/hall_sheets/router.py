"""
app/modules/hall_sheets/router.py
-----------------------------------
Hall sheets module router — admin-only hall-wise reporting and printable sheets.

No own table. Composes data from allocation, secret_code, slot_booking.
Placeholder returns {"module": "hall-sheets", "status": "ok"}.

SECURITY: The print endpoint calls secret_code/service which writes to audit_log.

TODO: GET /hall-sheets/{slot_id}               — hall-wise list, codes hidden (admin)
TODO: GET /hall-sheets/{slot_id}/{hall_id}/print — printable sheet with codes (admin, audited)
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/", summary="Hall sheets module health check")
async def hall_sheets_root() -> dict:
    """Placeholder endpoint — confirms the hall_sheets module is mounted."""
    return {"module": "hall-sheets", "status": "ok"}
