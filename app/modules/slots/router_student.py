"""
app/modules/slots/router_student.py
------------------------------------
Student router for slot browsing and self-service booking.

SECURITY: Hall information MUST NOT appear in any response from this router.
The SlotStudentResponse and BookingResponse schemas enforce this structurally.

Routes:
  GET    /slots/student/available           — list open slots (no hall info)
  POST   /slots/student/book               — book a slot
  DELETE /slots/student/cancel/{booking_id} — cancel own booking (pre-cutoff only)
  GET    /slots/student/my-bookings        — list student's own bookings
"""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_student
from app.modules.slots import schemas, service

router = APIRouter()


@router.get(
    "/available",
    response_model=list[schemas.SlotStudentResponse],
    summary="List open slots (student, hall-free view)",
)
async def list_available_slots(
    current_student: dict = Depends(require_student),
    db: AsyncSession = Depends(get_db),
) -> list[schemas.SlotStudentResponse]:
    """
    Return all slots currently open for booking.

    SECURITY: Response schema contains NO hall information whatsoever.
    """
    slots = await service.list_open_slots(db=db)
    return [schemas.SlotStudentResponse.model_validate(s) for s in slots]


@router.post(
    "/book",
    response_model=schemas.BookingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Book a slot (student)",
)
async def book_slot(
    payload: schemas.BookSlotRequest,
    current_student: dict = Depends(require_student),
    db: AsyncSession = Depends(get_db),
) -> schemas.BookingResponse:
    """
    Book an open slot for the authenticated student.

    Guards enforced in service:
      - Slot must be OPEN.
      - No duplicate booking.
      - Student must be eligible (progress.service.check_eligibility).
      - Slot must have remaining capacity.
    """
    student_id = uuid.UUID(str(current_student["id"]))
    booking = await service.book_slot(
        student_id=student_id,
        slot_id=payload.slot_id,
        db=db,
    )
    await db.commit()
    await db.refresh(booking)
    return schemas.BookingResponse.model_validate(booking)


@router.delete(
    "/cancel/{booking_id}",
    response_model=schemas.BookingResponse,
    summary="Cancel own booking (student, pre-cutoff only)",
)
async def cancel_booking(
    booking_id: uuid.UUID,
    current_student: dict = Depends(require_student),
    db: AsyncSession = Depends(get_db),
) -> schemas.BookingResponse:
    """
    Cancel a booking before the slot's booking_cutoff.
    Returns HTTP 409 if the cutoff has already passed — never a silent no-op.
    """
    student_id = uuid.UUID(str(current_student["id"]))
    booking = await service.cancel_booking(
        booking_id=booking_id,
        student_id=student_id,
        db=db,
    )
    await db.commit()
    await db.refresh(booking)
    return schemas.BookingResponse.model_validate(booking)


@router.get(
    "/my-bookings",
    response_model=list[schemas.BookingResponse],
    summary="List student's own bookings",
)
async def list_my_bookings(
    current_student: dict = Depends(require_student),
    db: AsyncSession = Depends(get_db),
) -> list[schemas.BookingResponse]:
    """Return all bookings (any status) for the authenticated student."""
    student_id = uuid.UUID(str(current_student["id"]))
    bookings = await service.list_student_bookings(student_id=student_id, db=db)
    return [schemas.BookingResponse.model_validate(b) for b in bookings]
