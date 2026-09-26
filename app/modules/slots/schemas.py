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

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.modules.slots.models import BookingStatus, SlotStatus


# ── Admin request schemas ──────────────────────────────────────────────────────

class SlotCreateRequest(BaseModel):
    """Payload for admin creating a new slot."""
    level_id: uuid.UUID
    start_time: datetime
    end_time: datetime
    booking_cutoff: datetime


class HallLinkRequest(BaseModel):
    """Payload for linking a hall to a slot."""
    hall_id: uuid.UUID


# ── Admin response schemas ─────────────────────────────────────────────────────

class SlotAdminResponse(BaseModel):
    """Full slot details for admin views — includes status and timestamps."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    level_id: uuid.UUID
    start_time: datetime
    end_time: datetime
    booking_cutoff: datetime
    status: SlotStatus
    created_at: datetime


class CapacityResponse(BaseModel):
    """Capacity report for a slot."""
    slot_id: uuid.UUID
    current_active_bookings: int
    total_capacity: int
    seats_remaining: int


class BookingAdminResponse(BaseModel):
    """Admin view of a single booking — includes student_id and attempt_number."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slot_id: uuid.UUID
    student_id: uuid.UUID
    attempt_number: int
    status: BookingStatus
    booked_at: datetime
    cancelled_at: datetime | None


# ── Student request schemas ────────────────────────────────────────────────────

class BookSlotRequest(BaseModel):
    """Student booking request."""
    slot_id: uuid.UUID


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

    id: uuid.UUID
    level_id: uuid.UUID
    start_time: datetime
    end_time: datetime
    booking_cutoff: datetime
    status: SlotStatus


class BookingResponse(BaseModel):
    """
    Student's own booking confirmation.

    SECURITY: Does not include hall_id, seat_no, or any allocation data.
    """
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slot_id: uuid.UUID
    attempt_number: int
    status: BookingStatus
    booked_at: datetime
    cancelled_at: datetime | None
