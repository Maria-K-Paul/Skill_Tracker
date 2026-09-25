"""
app/modules/slots/router_student.py
------------------------------------
Slots module student router — viewing available slots and self-service booking.

Placeholder returns {"module": "slots-student", "status": "ok"}.
Students NEVER see hall information.

TODO: GET    /slots/student/available         — list bookable slots for a level
TODO: POST   /slots/student/book              — book a slot (calls service.book_slot)
TODO: DELETE /slots/student/cancel/{booking_id} — cancel booking (pre-cutoff only)
TODO: GET    /slots/student/my-bookings       — list student's own bookings
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/", summary="Slots student module health check")
async def slots_student_root() -> dict:
    """Placeholder endpoint — confirms the slots student router is mounted."""
    return {"module": "slots-student", "status": "ok"}
