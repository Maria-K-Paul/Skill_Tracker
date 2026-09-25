"""
app/modules/allocation/schemas.py
----------------------------------
Pydantic schemas for the allocation module.

TODO: Add AllocationResponse with hall_id and seat_no.
TODO: Add AllocationSummary (per slot) for admin view.
"""

from pydantic import BaseModel
from datetime import datetime


class AllocationResponse(BaseModel):
    id: int
    slot_booking_id: int
    hall_id: int
    seat_no: int
    allocated_at: datetime
