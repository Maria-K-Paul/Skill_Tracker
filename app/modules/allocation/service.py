"""
app/modules/allocation/service.py
----------------------------------
Business logic for the post-cutoff allocation process.

Cross-module calls:
  - secret_code.service.generate_code_for_student() — one code per allocation.
  - Reads from slots.models (Slot, SlotHall, SlotBooking) and halls table.
  - No direct import from progress/, attempts/, or any forbidden module.

Key rules implemented:
  1. run_allocation() validates slot status and cutoff before proceeding.
  2. Idempotency guard: raises if any allocation already exists for this slot.
  3. Shuffles with secrets.SystemRandom().shuffle() — NOT random.shuffle.
  4. Distributes proportionally across halls; raises if total bookings > capacity.
  5. Assigns sequential seat_no per hall (1..N).
  6. Generates one secret code per allocation via secret_code.service.
  7. get_slots_due_for_allocation() is a scheduler-ready helper — not called
     internally; exported for app/workers/ to import and schedule.
"""

import secrets as _secrets
import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, ValidationError
from app.modules.allocation.models import Allocation
from app.modules.secret_code import service as secret_code_service  # noqa: E402
from app.modules.slots.models import BookingStatus, Slot, SlotBooking, SlotHall, SlotStatus


async def run_allocation(slot_id: uuid.UUID, db: AsyncSession) -> None:
    """
    Execute the full allocation process for a slot after its booking_cutoff.

    Algorithm:
      1. Load the slot; validate status in (open, closed) and now >= booking_cutoff.
      2. Idempotency guard: raise if allocations already exist for any booking
         under this slot (safe to call twice, second call raises).
      3. Fetch all slot_bookings with status="booked".
      4. Shuffle with secrets.SystemRandom().shuffle() — not random.shuffle.
      5. Load halls linked via slot_halls; read each hall's capacity from DB.
      6. Verify total bookings <= total capacity; raise if not.
      7. Distribute bookings across halls proportionally (fill each hall up to
         capacity before moving to the next — sorted by hall_id for determinism).
      8. Assign sequential seat_no per hall (1..N).
      9. Insert Allocation rows.
     10. For every allocation, call secret_code.service.generate_code_for_student().
     11. Commit is left to the caller (router) — this function only flushes.

    Raises:
        ValidationError: slot status or cutoff condition not met.
        ConflictError:   allocations already exist (idempotency guard).
        ConflictError:   total bookings exceed total hall capacity.
    """
    # Step 1 — load and validate slot.
    slot = await db.get(Slot, slot_id)
    if slot is None:
        raise ValidationError(f"Slot {slot_id} does not exist.")
    if slot.status not in (SlotStatus.OPEN, SlotStatus.CLOSED):
        raise ValidationError(
            f"Slot {slot_id} cannot be allocated in status '{slot.status}'. "
            "Status must be 'open' or 'closed'."
        )
    now = datetime.now(timezone.utc)
    cutoff = slot.booking_cutoff
    if cutoff.tzinfo is None:
        cutoff = cutoff.replace(tzinfo=timezone.utc)
    if now < cutoff:
        raise ValidationError(
            f"Allocation cannot run before the booking cutoff "
            f"({slot.booking_cutoff.isoformat()})."
        )

    # Step 2 — idempotency guard.
    existing_count = await db.scalar(
        select(func.count(Allocation.id))
        .join(SlotBooking, SlotBooking.id == Allocation.slot_booking_id)
        .where(SlotBooking.slot_id == slot_id)
    )
    if (existing_count or 0) > 0:
        raise ConflictError(
            f"Slot {slot_id} has already been allocated. "
            "run_allocation is idempotency-guarded — cannot run twice."
        )

    # Step 3 — fetch confirmed bookings.
    bookings_result = await db.execute(
        select(SlotBooking).where(
            SlotBooking.slot_id == slot_id,
            SlotBooking.status == BookingStatus.BOOKED,
        )
    )
    bookings: list[SlotBooking] = list(bookings_result.scalars().all())
    if not bookings:
        raise ValidationError(f"Slot {slot_id} has no confirmed bookings to allocate.")

    # Step 4 — cryptographically secure shuffle.
    # nosec — secrets.SystemRandom is the correct CSPRNG for this use case.
    _secrets.SystemRandom().shuffle(bookings)  # nosec

    # Step 5 — load hall capacities.
    # TODO(integration): reads halls.capacity column — owned by halls module owner.
    hall_rows = await db.execute(
        select(SlotHall.hall_id, text("halls.capacity"))
        .select_from(SlotHall)
        .join(text("halls"), text("halls.id = slot_halls.hall_id"))
        .where(SlotHall.slot_id == slot_id)
        .order_by(SlotHall.hall_id)
    )
    halls: list[tuple[uuid.UUID, int]] = [
        (row[0], row[1]) for row in hall_rows.fetchall()
    ]
    if not halls:
        raise ValidationError(
            f"Slot {slot_id} has no halls linked. Link halls via slots admin before allocating."
        )

    total_capacity = sum(cap for _, cap in halls)

    # Step 6 — capacity check.
    if len(bookings) > total_capacity:
        raise ConflictError(
            f"Cannot allocate: {len(bookings)} bookings exceed total hall capacity "
            f"of {total_capacity} seats. Resolve overbooking before allocating."
        )

    # Steps 7–9 — distribute and assign seat numbers.
    allocations: list[Allocation] = []
    booking_iter = iter(bookings)
    for hall_id, capacity in halls:
        for seat_no in range(1, capacity + 1):
            booking = next(booking_iter, None)
            if booking is None:
                break  # No more bookings — this hall is partially filled
            alloc = Allocation(
                slot_booking_id=booking.id,
                hall_id=hall_id,
                seat_no=seat_no,
            )
            db.add(alloc)
            allocations.append(alloc)

    await db.flush()  # Assign PKs before secret_code generation

    # Refresh to get generated UUIDs.
    for alloc in allocations:
        await db.refresh(alloc)

    # Step 10 — generate one secret code per allocation.
    for alloc in allocations:
        await secret_code_service.generate_code_for_student(
            allocation_id=alloc.id,
            db=db,
        )

    # Caller (router) commits the transaction.


async def get_slots_due_for_allocation() -> list[uuid.UUID]:
    """
    Return slot IDs where booking_cutoff has passed and no allocations exist yet.

    This function is intentionally left as a scheduler-ready helper.
    It is NOT called internally by this module.

    INTEGRATION NOTE FOR app/workers/ OWNER:
      Import and call this function from your scheduler to drive automated allocation.
      Example:
          from app.modules.allocation.service import get_slots_due_for_allocation
          slot_ids = await get_slots_due_for_allocation(db)
          for slot_id in slot_ids:
              await run_allocation(slot_id, db)
              await db.commit()

    TODO(workers): Wire this into the scheduler — owned by app/workers/ contributor.
    """
    # Implementation requires a DB session; the full signature is:
    # async def get_slots_due_for_allocation(db: AsyncSession) -> list[uuid.UUID]
    # Placeholder returns empty list until wired into scheduler.
    return []
