"""
app/modules/allocation/schemas.py
----------------------------------
Pydantic v2 schemas for the allocation module.

NOTE: Students must never be able to query their hall/seat via this module —
no student-facing response schemas exist here.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AllocationResponse(BaseModel):
    """Admin view of a single allocation row."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    slot_booking_id: int
    hall_id: int
    seat_no: int
    allocated_at: datetime | None = None


class AllocationRunResponse(BaseModel):
    """Summary returned after running allocation for a slot."""
    slot_id: int
    allocations_created: int
    message: str
