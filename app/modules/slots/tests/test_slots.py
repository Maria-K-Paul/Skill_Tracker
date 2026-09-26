"""
app/modules/slots/tests/test_slots.py
--------------------------------------
Tests for slots/service.py and slots/schemas.py.

Spec requirements verified here:
  1. Booking after cutoff is rejected (cancel_booking raises ConflictError).
  2. Booking above capacity is rejected.
  3. Student-facing slot schema has NO hall fields (key absent, not null).
"""

import uuid
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.core.exceptions import ConflictError, ValidationError
from app.modules.slots import service as svc
from app.modules.slots.models import BookingStatus, SlotStatus
from app.modules.slots.schemas import SlotStudentResponse, BookingResponse


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_slot(
    *,
    status: SlotStatus = SlotStatus.OPEN,
    cutoff_offset_seconds: int = 3600,
) -> SimpleNamespace:
    now = datetime.now(timezone.utc)
    return SimpleNamespace(
        id=uuid.uuid4(),
        level_id=uuid.uuid4(),
        start_time=now + timedelta(hours=2),
        end_time=now + timedelta(hours=3),
        booking_cutoff=now + timedelta(seconds=cutoff_offset_seconds),
        status=status,
        created_at=now,
        slot_halls=[],
        bookings=[],
    )


def _make_booking(
    slot_id: uuid.UUID | None = None,
    student_id: uuid.UUID | None = None,
    *,
    status: BookingStatus = BookingStatus.BOOKED,
) -> SimpleNamespace:
    now = datetime.now(timezone.utc)
    return SimpleNamespace(
        id=uuid.uuid4(),
        slot_id=slot_id or uuid.uuid4(),
        student_id=student_id or uuid.uuid4(),
        attempt_number=1,
        status=status,
        booked_at=now,
        cancelled_at=None,
    )


# ── Test 1: cancellation after cutoff raises ConflictError ────────────────────

@pytest.mark.asyncio
async def test_cancel_booking_after_cutoff_raises_conflict():
    """
    Cancellation must raise ConflictError (HTTP 409) when now() >= booking_cutoff.
    Never a silent no-op.
    """
    student_id = uuid.uuid4()
    slot = _make_slot(cutoff_offset_seconds=-1)  # cutoff 1 second in the past
    booking = _make_booking(slot_id=slot.id, student_id=student_id)

    db = MagicMock()

    async def _get(model, pk):
        from app.modules.slots.models import SlotBooking, Slot as SlotModel
        if model.__name__ == "SlotBooking":
            return booking if pk == booking.id else None
        if model.__name__ == "Slot":
            return slot if pk == booking.slot_id else None
        return None

    db.get = _get
    db.flush = AsyncMock()
    db.refresh = AsyncMock()

    with pytest.raises(ConflictError, match="cutoff"):
        await svc.cancel_booking(
            booking_id=booking.id,
            student_id=student_id,
            db=db,
        )


@pytest.mark.asyncio
async def test_cancel_booking_before_cutoff_succeeds():
    """Valid cancellation before cutoff should set status=CANCELLED."""
    student_id = uuid.uuid4()
    slot = _make_slot(cutoff_offset_seconds=3600)
    booking = _make_booking(slot_id=slot.id, student_id=student_id)

    db = MagicMock()

    async def _get(model, pk):
        if model.__name__ == "SlotBooking":
            return booking if pk == booking.id else None
        if model.__name__ == "Slot":
            return slot if pk == booking.slot_id else None
        return None

    db.get = _get
    db.flush = AsyncMock()
    db.refresh = AsyncMock()

    result = await svc.cancel_booking(
        booking_id=booking.id,
        student_id=student_id,
        db=db,
    )
    assert booking.status == BookingStatus.CANCELLED
    assert booking.cancelled_at is not None


# ── Test 2: booking above capacity raises ConflictError ───────────────────────

@pytest.mark.asyncio
async def test_book_slot_above_capacity_raises_conflict():
    """book_slot must raise ConflictError when current_bookings >= total_capacity."""
    student_id = uuid.uuid4()
    slot = _make_slot()

    db = MagicMock()

    async def _get(model, pk):
        if model.__name__ == "Slot":
            return slot
        return None

    db.get = _get
    db.scalar = AsyncMock(return_value=None)  # no existing booking
    db.flush = AsyncMock()
    db.refresh = AsyncMock()

    with patch("app.modules.slots.service.check_capacity", new_callable=AsyncMock, return_value=(5, 5)):
        with patch("app.modules.progress.service.check_eligibility", new_callable=AsyncMock, return_value=True):
            with pytest.raises(ConflictError, match="fully booked"):
                await svc.book_slot(
                    student_id=student_id,
                    slot_id=slot.id,
                    db=db,
                )


# ── Test 3: student-facing schema has NO hall fields ─────────────────────────

def test_student_slot_schema_has_no_hall_fields():
    """
    SlotStudentResponse must NOT include hall_id, hall_count, or any hall key.
    Assert the key is ABSENT — not null, not present with any value.
    """
    now = datetime.now(timezone.utc)
    schema = SlotStudentResponse(
        id=uuid.uuid4(),
        level_id=uuid.uuid4(),
        start_time=now,
        end_time=now + timedelta(hours=1),
        booking_cutoff=now + timedelta(minutes=30),
        status=SlotStatus.OPEN,
    )
    serialised = schema.model_dump()
    for forbidden_key in ("hall_id", "hall_count", "hall", "halls", "hall_ids"):
        assert forbidden_key not in serialised, (
            f"SECURITY: '{forbidden_key}' must not appear in student-facing slot schema. "
            f"Keys present: {list(serialised.keys())}"
        )


def test_booking_response_schema_has_no_hall_fields():
    """BookingResponse (student view) must not contain hall or seat fields."""
    now = datetime.now(timezone.utc)
    schema = BookingResponse(
        id=uuid.uuid4(),
        slot_id=uuid.uuid4(),
        attempt_number=1,
        status=BookingStatus.BOOKED,
        booked_at=now,
        cancelled_at=None,
    )
    serialised = schema.model_dump()
    for forbidden_key in ("hall_id", "hall_count", "hall", "halls", "seat_no"):
        assert forbidden_key not in serialised, (
            f"SECURITY: '{forbidden_key}' must not appear in student booking schema. "
            f"Keys present: {list(serialised.keys())}"
        )


# ── Test 4: booking on a non-open slot is rejected ───────────────────────────

@pytest.mark.asyncio
async def test_book_slot_rejects_closed_slot():
    """Students cannot book a slot that is not OPEN."""
    student_id = uuid.uuid4()
    slot = _make_slot(status=SlotStatus.CLOSED)

    db = MagicMock()

    async def _get(model, pk):
        if model.__name__ == "Slot":
            return slot
        return None

    db.get = _get

    with pytest.raises(ValidationError, match="not open"):
        await svc.book_slot(
            student_id=student_id,
            slot_id=slot.id,
            db=db,
        )
