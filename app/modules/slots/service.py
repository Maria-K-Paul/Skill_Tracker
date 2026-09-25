"""
app/modules/slots/service.py
-----------------------------
Business logic for slot creation, booking, and capacity management.

Cross-module calls:
- progress/service.check_eligibility() — before allowing a booking.
- No direct import of progress/models.py.

TODO: implement check_eligibility(student_id, level_id) — delegates to progress/service
TODO: implement check_capacity(slot_id) → bool — True if slot has remaining capacity
      (sum of linked halls' capacity vs current bookings count)
TODO: implement book_slot(student_id, slot_id) → SlotBooking
      - verify student not already booked for this slot
      - call check_eligibility via progress service
      - check capacity
      - assign attempt_number (next attempt for this level from progress)
      - insert slot_booking with status='confirmed'
TODO: implement cancel_booking(booking_id, student_id)
      - verify booking_cutoff has not passed (raise ValidationError if past)
      - set status='cancelled'
TODO: implement list_available_slots(assessment_id?) → list[Slot]
TODO: implement my_bookings(student_id) → list[SlotBooking]
TODO: implement create_slot(data) → Slot  (admin)
TODO: implement close_slot(slot_id) → Slot  (admin, before cutoff)
"""


async def check_eligibility(student_id: int, level_id: int) -> bool:
    """
    Delegate to progress/service to verify the student is eligible to book.
    Returns False if locked out or already passed the level.
    """
    # TODO: call progress.service.check_eligibility(student_id, level_id)
    return True


async def check_capacity(slot_id: int) -> bool:
    """Return True if the slot still has booking capacity across linked halls."""
    # TODO: compare sum(hall.capacity for hall in slot.halls) vs count(bookings)
    return True


async def book_slot(student_id: int, slot_id: int) -> dict:
    """Book a slot for a student. Returns SlotBooking data."""
    # TODO: implement full booking workflow
    pass


async def cancel_booking(booking_id: int, student_id: int) -> None:
    """Cancel a booking. Raises ValidationError if past booking_cutoff."""
    # TODO: check cutoff, set status='cancelled'
    pass
