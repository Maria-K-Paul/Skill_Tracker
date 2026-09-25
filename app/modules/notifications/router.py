"""
app/modules/notifications/router.py
--------------------------------------
Notifications module router — booking confirmation, result, and reminder endpoints.

Placeholder returns {"module": "notifications", "status": "ok"}.

TODO: POST /notifications/booking-confirmation — send booking confirmation
TODO: POST /notifications/result               — send result published notification
TODO: POST /notifications/reminder/{booking_id} — send slot reminder
TODO: GET  /notifications/my                   — student: list own notifications
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/", summary="Notifications module health check")
async def notifications_root() -> dict:
    """Placeholder endpoint — confirms the notifications module is mounted."""
    return {"module": "notifications", "status": "ok"}
