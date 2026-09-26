"""
app/modules/allocation/router.py
---------------------------------
Allocation module router — admin-only trigger and status endpoints.

No student-facing routes. Students must never be able to query their
hall/seat through this module.

Routes:
  POST /allocation/{slot_id}/run  — manually trigger allocation (admin)
  GET  /allocation/{slot_id}      — view allocation summary for a slot
"""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.modules.allocation import schemas, service
from app.modules.allocation.models import Allocation
from app.modules.slots.models import SlotBooking

router = APIRouter()


@router.post(
    "/{slot_id}/run",
    response_model=schemas.AllocationRunResponse,
    status_code=status.HTTP_200_OK,
    summary="Run allocation for a slot (admin)",
)
async def run_allocation(
    slot_id: uuid.UUID,
    current_admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> schemas.AllocationRunResponse:
    """
    Execute the allocation process for a slot.
    Idempotency-guarded — returns 409 if allocation already ran.
    """
    await service.run_allocation(slot_id=slot_id, db=db)
    await db.commit()

    # Count allocations created.
    count = await db.scalar(
        select(func.count(Allocation.id))
        .join(SlotBooking, SlotBooking.id == Allocation.slot_booking_id)
        .where(SlotBooking.slot_id == slot_id)
    )
    return schemas.AllocationRunResponse(
        slot_id=slot_id,
        allocations_created=count or 0,
        message=f"Allocation completed: {count} students assigned to halls.",
    )


@router.get(
    "/{slot_id}",
    response_model=list[schemas.AllocationResponse],
    summary="View allocations for a slot (admin)",
)
async def get_slot_allocations(
    slot_id: uuid.UUID,
    current_admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> list[schemas.AllocationResponse]:
    """Return all allocation rows for a given slot. Admin only."""
    result = await db.execute(
        select(Allocation)
        .join(SlotBooking, SlotBooking.id == Allocation.slot_booking_id)
        .where(SlotBooking.slot_id == slot_id)
    )
    allocations = result.scalars().all()
    return [schemas.AllocationResponse.model_validate(a) for a in allocations]
