"""
app/modules/allocation/schemas.py
----------------------------------
Pydantic v2 schemas for the allocation module.

NOTE: Students must never be able to query their hall/seat via this module —
no student-facing response schemas exist here.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AllocationResponse(BaseModel):
    """Admin view of a single allocation row."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slot_booking_id: uuid.UUID
    hall_id: uuid.UUID
    seat_no: int
    created_at: datetime


class AllocationRunResponse(BaseModel):
    """Summary returned after running allocation for a slot."""
    slot_id: uuid.UUID
    allocations_created: int
    message: str
