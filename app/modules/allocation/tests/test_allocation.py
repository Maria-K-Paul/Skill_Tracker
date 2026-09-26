"""
app/modules/allocation/tests/test_allocation.py
-------------------------------------------------
Tests for allocation/service.py.

Spec requirements verified here:
  1. Running allocation twice on the same slot raises ConflictError.
  2. Shuffling uses secrets.SystemRandom (assert it's called, not random.shuffle).
  3. Capacity overflow raises ConflictError instead of overfilling a hall.
"""

import uuid
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.core.exceptions import ConflictError, ValidationError
from app.modules.allocation import service as svc
from app.modules.slots.models import BookingStatus, SlotStatus


# ── Helpers ───────────────────────────────────────────────────────────────────

def _past_cutoff_slot(status: SlotStatus = SlotStatus.OPEN) -> SimpleNamespace:
    now = datetime.now(timezone.utc)
    return SimpleNamespace(
        id=uuid.uuid4(),
        level_id=uuid.uuid4(),
        start_time=now + timedelta(hours=2),
        end_time=now + timedelta(hours=3),
        booking_cutoff=now - timedelta(hours=1),  # past
        status=status,
        created_at=now,
    )


def _make_booking(slot_id: uuid.UUID) -> SimpleNamespace:
    return SimpleNamespace(
        id=uuid.uuid4(),
        slot_id=slot_id,
        student_id=uuid.uuid4(),
        attempt_number=1,
        status=BookingStatus.BOOKED,
        booked_at=datetime.now(timezone.utc),
        cancelled_at=None,
    )


class FakeScalarsResult:
    def __init__(self, data):
        self._data = data

    def scalars(self):
        class _S:
            def __init__(self, d): self._d = d
            def all(self): return self._d
        return _S(self._data)

    def mappings(self):
        return self

    def fetchall(self):
        return self._data

    def all(self):
        return self._data


# ── Test 1: double allocation raises ConflictError ────────────────────────────

@pytest.mark.asyncio
async def test_run_allocation_twice_raises_conflict():
    """
    Running allocation on a slot that already has allocations must raise
    ConflictError — the idempotency guard must fire.
    """
    slot = _past_cutoff_slot()
    db = MagicMock()
    db.get = AsyncMock(return_value=slot)
    # existing_count > 0 → idempotency guard fires
    db.scalar = AsyncMock(return_value=2)

    with pytest.raises(ConflictError, match="already been allocated"):
        await svc.run_allocation(slot_id=slot.id, db=db)


# ── Test 2: SystemRandom.shuffle is called (not random.shuffle) ───────────────

@pytest.mark.asyncio
async def test_run_allocation_uses_system_random_shuffle():
    """
    The shuffle step must use secrets.SystemRandom().shuffle().
    Patch _secrets.SystemRandom to capture the call.
    """
    slot = _past_cutoff_slot()
    booking = _make_booking(slot.id)
    hall_id = uuid.uuid4()

    db = MagicMock()
    db.get = AsyncMock(return_value=slot)
    db.add = MagicMock()
    db.flush = AsyncMock()

    added_ids: list[uuid.UUID] = []

    def capture_add(obj):
        obj.id = uuid.uuid4()
        added_ids.append(obj.id)

    db.add = capture_add

    async def fake_refresh(obj):
        if not hasattr(obj, "id") or obj.id is None:
            obj.id = uuid.uuid4()

    db.refresh = fake_refresh

    # scalar: first call is existing_count check → 0
    db.scalar = AsyncMock(return_value=0)

    execute_call_count = 0

    async def fake_execute(query):
        nonlocal execute_call_count
        execute_call_count += 1
        if execute_call_count == 1:
            # Bookings query
            return FakeScalarsResult([booking])
        else:
            # Halls query: (hall_id, capacity)
            return FakeScalarsResult([(hall_id, 10)])

    db.execute = fake_execute

    with patch("app.modules.allocation.service._secrets.SystemRandom") as mock_sr_class:
        mock_sr_instance = MagicMock()
        mock_sr_class.return_value = mock_sr_instance
        # shuffle does nothing (no-op) — but we verify it was called
        mock_sr_instance.shuffle = MagicMock()

        # Also mock the secret_code module call to avoid DB round-trips
        with patch(
            "app.modules.allocation.service.secret_code_service"
        ) as mock_sc:
            mock_sc.generate_code_for_student = AsyncMock()
            await svc.run_allocation(slot_id=slot.id, db=db)

        # Verify SystemRandom was instantiated and .shuffle() was called
        mock_sr_class.assert_called_once()
        mock_sr_instance.shuffle.assert_called_once()


# ── Test 3: capacity overflow raises ConflictError ────────────────────────────

@pytest.mark.asyncio
async def test_run_allocation_raises_on_capacity_overflow():
    """
    If total bookings > total hall capacity, run_allocation must raise
    ConflictError rather than overfilling any hall.
    """
    slot = _past_cutoff_slot()
    bookings = [_make_booking(slot.id) for _ in range(5)]  # 5 bookings
    hall_id = uuid.uuid4()

    db = MagicMock()
    db.get = AsyncMock(return_value=slot)
    db.add = MagicMock()
    db.flush = AsyncMock()

    db.scalar = AsyncMock(return_value=0)  # no prior allocations

    execute_count = 0

    async def fake_execute(query):
        nonlocal execute_count
        execute_count += 1
        if execute_count == 1:
            return FakeScalarsResult(bookings)
        else:
            # Hall with capacity 3 only — 5 bookings → overflow
            return FakeScalarsResult([(hall_id, 3)])

    db.execute = fake_execute

    with pytest.raises(ConflictError, match="exceed total hall capacity"):
        await svc.run_allocation(slot_id=slot.id, db=db)


# ── Test 4: allocation before cutoff raises ValidationError ───────────────────

@pytest.mark.asyncio
async def test_run_allocation_before_cutoff_raises():
    """Allocation must be blocked if now() < booking_cutoff."""
    now = datetime.now(timezone.utc)
    slot = SimpleNamespace(
        id=uuid.uuid4(),
        level_id=uuid.uuid4(),
        start_time=now + timedelta(hours=2),
        end_time=now + timedelta(hours=3),
        booking_cutoff=now + timedelta(hours=1),  # future
        status=SlotStatus.OPEN,
        created_at=now,
    )
    db = MagicMock()
    db.get = AsyncMock(return_value=slot)

    with pytest.raises(ValidationError, match="cutoff"):
        await svc.run_allocation(slot_id=slot.id, db=db)


# ── Test 5: wrong slot status raises ValidationError ─────────────────────────

@pytest.mark.asyncio
async def test_run_allocation_wrong_status_raises():
    """Allocation on a DRAFT, COMPLETED, or CANCELLED slot must raise ValidationError."""
    for bad_status in (SlotStatus.DRAFT, SlotStatus.COMPLETED, SlotStatus.CANCELLED):
        slot = _past_cutoff_slot(status=bad_status)
        db = MagicMock()
        db.get = AsyncMock(return_value=slot)

        with pytest.raises(ValidationError, match="status"):
            await svc.run_allocation(slot_id=slot.id, db=db)
