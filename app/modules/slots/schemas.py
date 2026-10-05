"""
app/modules/slots/schemas.py
-----------------------------
Pydantic v2 schemas for the slots module.

Security rule enforced by schema design:
  - `SlotStudentResponse` and `BookingResponse` contain ZERO hall-related
    fields — not hall_id, not hall_count, nothing.  This is intentional and
    tested (test_slots.py asserts the key is absent, not null).
  - Admin schemas may include capacity info but never the specific hall_id
    per booking (that's allocation territory).
"""

import datetime as dt

from pydantic import BaseModel, ConfigDict


# ── Admin request schemas ──────────────────────────────────────────────────────

class SlotCreateRequest(BaseModel):
    """Payload for admin creating a new slot."""
    start_time: dt.datetime | None = None
    end_time: dt.datetime | None = None
    booking_cutoff: dt.datetime | None = None
    level_id: int | None = None
    assessment_id: int | None = None


class HallLinkRequest(BaseModel):
    """Payload for linking a hall to a slot."""
    hall_id: int


# ── Admin response schemas ─────────────────────────────────────────────────────

class SlotStatusUpdateRequest(BaseModel):
    """Payload for updating a slot's status."""
    status: str


class SlotAdminResponse(BaseModel):
    """Full slot details for admin views — includes status and timestamps."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    start_time: dt.time
    end_time: dt.time
    booking_cutoff: dt.datetime
    status: str
    date: dt.date | None = None


class CapacityResponse(BaseModel):
    """Capacity report for a slot."""
    slot_id: int
    current_active_bookings: int
    total_capacity: int
    seats_remaining: int


class BookingAdminResponse(BaseModel):
    """Admin view of a single booking — includes student_id and attempt_number."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    slot_id: int
    student_id: int
    attempt_number: int
    status: str
    booked_at: dt.datetime | None = None
    cancelled_at: dt.datetime | None = None


# ── Student request schemas ────────────────────────────────────────────────────

class BookSlotRequest(BaseModel):
    """Student booking request."""
    slot_id: int


# ── Student response schemas ───────────────────────────────────────────────────
# CRITICAL: NO hall fields may appear here.

class SlotStudentResponse(BaseModel):
    """
    Slot details safe for student consumption.

    SECURITY: Hall information is deliberately absent — not null, not hidden,
    simply not part of this schema.  Any attempt to add a hall-related field
    here should be rejected in code review.
    """
    model_config = ConfigDict(from_attributes=True)

    id: int
    start_time: dt.time
    end_time: dt.time
    booking_cutoff: dt.datetime
    status: str
    date: dt.date | None = None
    total_capacity: int = 0
    available_seats: int = 0


class BookingResponse(BaseModel):
    """
    Student's own booking confirmation.

    SECURITY: Does not include hall_id, seat_no, or any allocation data.
    """
    model_config = ConfigDict(from_attributes=True)

    id: int
    slot_id: int
    attempt_number: int
    status: str
    booked_at: dt.datetime | None = None
    cancelled_at: dt.datetime | None = None
