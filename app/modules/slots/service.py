"""
app/modules/slots/service.py
-----------------------------
Business logic for slot creation, hall linking, booking, and cancellation.

Cross-module calls:
  - progress.service.check_eligibility(student_id, level_id) — before booking.
    Called as if it already exists; see TODO(integration) comment at call site.
  - No direct imports from progress/models.py, progress/router.py, or any
    other module outside the allowed list.

Key rules implemented:
  - Booking gated on progress eligibility check.
  - Booking gated on capacity: total_capacity = sum(hall.capacity for halls in slot_halls).
  - attempt_number auto-increments per (student_id, level_id) across ALL bookings.
  - Cancellation blocked after booking_cutoff (409 ConflictError).
  - Students never see or receive hall information from this service.
"""

from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.modules.slots.models import BookingStatus, Slot, SlotBooking, SlotHall, SlotStatus


def _to_naive_utc(dt: datetime) -> datetime:
    """Convert timezone-aware datetime to naive UTC for DateTime (no-tz) columns."""
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


# ── Helpers ───────────────────────────────────────────────────────────────────

async def check_capacity(slot_id: int, db: AsyncSession) -> tuple[int, int]:
    """
    Return (current_active_bookings, total_capacity) for a slot.

    total_capacity is the sum of hall capacities for all halls linked via slot_halls.
    """
    from app.modules.halls.models import Hall

    active_q = await db.scalar(
        select(func.count(SlotBooking.id)).where(
            SlotBooking.slot_id == slot_id,
            SlotBooking.status == BookingStatus.BOOKED,
        )
    )
    current_bookings: int = active_q or 0

    capacity_q = await db.scalar(
        select(func.sum(Hall.capacity))
        .select_from(SlotHall)
        .join(Hall, Hall.id == SlotHall.hall_id)
        .where(SlotHall.slot_id == slot_id)
    )
    total_capacity: int = capacity_q or 0

    return current_bookings, total_capacity


async def _get_next_attempt_number(student_id: int, db: AsyncSession) -> int:
    """Return the next attempt number for a student across all their bookings."""
    count = await db.scalar(
        select(func.count(SlotBooking.id)).where(SlotBooking.student_id == student_id)
    )
    return (count or 0) + 1


# ── Admin service functions ────────────────────────────────────────────────────

async def create_slot(
    start_time: datetime,
    end_time: datetime,
    booking_cutoff: datetime,
    db: AsyncSession,
) -> Slot:
    """Create a new slot in DRAFT status.  Admin only."""
    naive_start = _to_naive_utc(start_time)
    naive_end = _to_naive_utc(end_time)
    slot = Slot(
        date=naive_start.date(),
        start_time=naive_start.time(),
        end_time=naive_end.time(),
        booking_cutoff=_to_naive_utc(booking_cutoff),
        status=SlotStatus.DRAFT,
    )
    db.add(slot)
    await db.flush()
    await db.refresh(slot)
    return slot


async def link_hall(slot_id: int, hall_id: int, db: AsyncSession) -> None:
    """Link a hall to a slot.  Admin only.  Idempotent (duplicate link is a no-op)."""
    slot = await db.get(Slot, slot_id)
    if slot is None:
        raise NotFoundError(f"Slot {slot_id} not found.")

    existing = await db.scalar(
        select(SlotHall).where(
            SlotHall.slot_id == slot_id, SlotHall.hall_id == hall_id
        )
    )
    if existing is not None:
        return

    db.add(SlotHall(slot_id=slot_id, hall_id=hall_id))
    await db.flush()


async def unlink_hall(slot_id: int, hall_id: int, db: AsyncSession) -> None:
    """Remove a hall from a slot.  Admin only."""
    link = await db.scalar(
        select(SlotHall).where(
            SlotHall.slot_id == slot_id, SlotHall.hall_id == hall_id
        )
    )
    if link is None:
        raise NotFoundError(f"Hall {hall_id} is not linked to slot {slot_id}.")
    await db.delete(link)
    await db.flush()


async def list_bookings_for_slot(
    slot_id: int, db: AsyncSession
) -> list[SlotBooking]:
    """Return all bookings for a slot.  Admin view."""
    result = await db.execute(
        select(SlotBooking).where(SlotBooking.slot_id == slot_id)
    )
    return list(result.scalars().all())


async def get_slot_capacity(slot_id: int, db: AsyncSession) -> tuple[int, int]:
    """Thin wrapper around check_capacity for router use."""
    slot = await db.get(Slot, slot_id)
    if slot is None:
        raise NotFoundError(f"Slot {slot_id} not found.")
    return await check_capacity(slot_id, db)


async def update_slot_status(
    slot_id: int,
    new_status: str,
    db: AsyncSession,
) -> Slot:
    """Update a slot's status.  Admin only."""
    slot = await db.get(Slot, slot_id)
    if slot is None:
        raise NotFoundError(f"Slot {slot_id} not found.")

    valid_statuses = {s.value for s in SlotStatus}
    if new_status not in valid_statuses:
        raise ValidationError(f"Invalid status '{new_status}'. Must be one of: {', '.join(valid_statuses)}")

    slot.status = new_status
    await db.flush()
    await db.refresh(slot)
    return slot


# ── Student service functions ──────────────────────────────────────────────────

async def list_open_slots(db: AsyncSession) -> list[Slot]:
    """Return all slots with status=OPEN for student listing."""
    result = await db.execute(
        select(Slot).where(Slot.status == SlotStatus.OPEN)
    )
    return list(result.scalars().all())


async def book_slot(
    student_id: int, slot_id: int, db: AsyncSession
) -> SlotBooking:
    """
    Book a slot for a student.

    Guards (in order):
      1. Slot must exist and be OPEN.
      2. Student must not already have an active booking for this slot.
      3. Student must be eligible (progress.service.check_eligibility).
      4. Slot must have remaining capacity.

    Returns the newly created SlotBooking.
    """
    slot = await db.get(Slot, slot_id)
    if slot is None:
        raise NotFoundError(f"Slot {slot_id} not found.")
    if slot.status != SlotStatus.OPEN:
        raise ValidationError(f"Slot {slot_id} is not open for booking (status: {slot.status}).")

    existing_booking = await db.scalar(
        select(SlotBooking).where(
            SlotBooking.slot_id == slot_id,
            SlotBooking.student_id == student_id,
            SlotBooking.status == BookingStatus.BOOKED,
        )
    )
    if existing_booking is not None:
        raise ConflictError("You already have an active booking for this slot.")

    current, total = await check_capacity(slot_id, db)
    if total == 0:
        raise ValidationError("No halls have been linked to this slot yet.")
    if current >= total:
        raise ConflictError("This slot is fully booked.")

    attempt_number = await _get_next_attempt_number(student_id, db)

    booking = SlotBooking(
        slot_id=slot_id,
        student_id=student_id,
        attempt_number=attempt_number,
        status=BookingStatus.BOOKED,
    )
    db.add(booking)
    await db.flush()
    await db.refresh(booking)

    from app.modules.allocation.service import allocate_single_booking
    await allocate_single_booking(booking_id=booking.id, slot_id=slot_id, db=db)

    return booking


async def cancel_booking(
    booking_id: int, student_id: int, db: AsyncSession
) -> SlotBooking:
    """
    Cancel a student's own booking.

    Rules:
      - Booking must belong to the student making the request.
      - Cancellation is only allowed while now() < slot.booking_cutoff.
        After cutoff, raises ConflictError (HTTP 409) — never a silent no-op.

    Returns the updated (cancelled) booking.
    """
    booking = await db.get(SlotBooking, booking_id)
    if booking is None:
        raise NotFoundError(f"Booking {booking_id} not found.")
    if booking.student_id != student_id:
        raise ValidationError("You may only cancel your own bookings.")
    if booking.status == BookingStatus.CANCELLED:
        raise ConflictError("This booking is already cancelled.")

    slot = await db.get(Slot, booking.slot_id)
    if slot is None:
        raise NotFoundError(f"Slot {booking.slot_id} not found.")

    now = datetime.now(timezone.utc).replace(tzinfo=None)  # compare as naive UTC
    cutoff = slot.booking_cutoff
    if cutoff.tzinfo is not None:
        cutoff = cutoff.astimezone(timezone.utc).replace(tzinfo=None)
    if now >= cutoff:
        raise ConflictError(
            "The booking cutoff has passed. Cancellations are no longer accepted "
            f"for this slot (cutoff was {slot.booking_cutoff.isoformat()})."
        )

    booking.status = BookingStatus.CANCELLED
    booking.cancelled_at = now
    await db.flush()
    await db.refresh(booking)
    return booking


async def list_student_bookings(
    student_id: int, db: AsyncSession
) -> list[SlotBooking]:
    """Return all bookings for the given student."""
    result = await db.execute(
        select(SlotBooking).where(SlotBooking.student_id == student_id)
    )
    return list(result.scalars().all())


async def get_booking_context(booking_id: int, db: AsyncSession) -> dict:
    """
    Return the facts attempts/service.start_exam() needs about a booking:
    who owns it, its status, and which assessment / time window it is for.
    Raises NotFoundError if the booking or its slot is missing.
    """
    booking = await db.get(SlotBooking, booking_id)
    if booking is None:
        raise NotFoundError(f"Booking {booking_id} not found.")
    slot = await db.get(Slot, booking.slot_id)
    if slot is None:
        raise NotFoundError(f"Slot {booking.slot_id} not found.")
    return {
        "booking_id": booking.id,
        "student_id": booking.student_id,
        "status": getattr(booking.status, "value", booking.status),
        "attempt_number": booking.attempt_number,
        "slot_id": slot.id,
        "assessment_id": slot.assessment_id,
        "level_id": None,
        "slot_date": slot.date,
        "slot_end_time": slot.end_time,
    }
