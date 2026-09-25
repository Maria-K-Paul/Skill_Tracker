"""
app/modules/slots/schemas.py
-----------------------------
Pydantic schemas for the slots module.

TODO: Add SlotCreateRequest (admin), SlotResponse.
TODO: Add BookingRequest (student), BookingResponse.
TODO: Add AvailableSlotResponse (no hall info exposed to student).
"""

from pydantic import BaseModel
from datetime import date, time, datetime


class SlotCreateRequest(BaseModel):
    assessment_id: int
    date: date
    start_time: time
    end_time: time
    booking_cutoff: datetime


class SlotResponse(BaseModel):
    id: int
    assessment_id: int
    date: date
    start_time: time
    end_time: time
    booking_cutoff: datetime
    status: str


class BookingResponse(BaseModel):
    id: int
    slot_id: int
    attempt_number: int
    booked_at: datetime
    status: str
