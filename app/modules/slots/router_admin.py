"""
app/modules/slots/router_admin.py
----------------------------------
Admin router for slot management.

Routes:
  POST   /slots/admin/                      — create a new slot
  POST   /slots/admin/{slot_id}/halls       — link a hall to a slot
  DELETE /slots/admin/{slot_id}/halls/{hall_id} — unlink a hall from a slot
  GET    /slots/admin/{slot_id}/bookings    — list bookings for a slot
  GET    /slots/admin/{slot_id}/capacity    — view capacity report
  GET    /slots/admin/                      — list all slots (admin)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.modules.slots import schemas, service

router = APIRouter()


@router.post(
    "/",
    response_model=schemas.SlotAdminResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new slot (admin)",
)
async def create_slot(
    payload: schemas.SlotCreateRequest,
    current_admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> schemas.SlotAdminResponse:
    """Create a new exam slot in DRAFT status."""
    if payload.start_time is None:
        raise HTTPException(status_code=422, detail="start_time is required")
    if payload.end_time is None:
        raise HTTPException(status_code=422, detail="end_time is required")
    if payload.booking_cutoff is None:
        raise HTTPException(status_code=422, detail="booking_cutoff is required")

    slot = await service.create_slot(
        start_time=payload.start_time,
        end_time=payload.end_time,
        booking_cutoff=payload.booking_cutoff,
        db=db,
    )
    await db.commit()
    await db.refresh(slot)
    return schemas.SlotAdminResponse.model_validate(slot)


@router.get(
    "/",
    response_model=list[schemas.SlotAdminResponse],
    summary="List all slots (admin)",
)
async def list_slots(
    current_admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> list[schemas.SlotAdminResponse]:
    """Return all slots regardless of status."""
    from sqlalchemy import select
    from app.modules.slots.models import Slot

    result = await db.execute(select(Slot))
    slots = result.scalars().all()
    return [schemas.SlotAdminResponse.model_validate(s) for s in slots]


@router.patch(
    "/{slot_id}/status",
    response_model=schemas.SlotAdminResponse,
    summary="Update a slot's status (admin)",
)
async def update_slot_status(
    slot_id: int,
    payload: schemas.SlotStatusUpdateRequest,
    current_admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> schemas.SlotAdminResponse:
    """Change a slot's status (e.g. draft -> open)."""
    slot = await service.update_slot_status(slot_id=slot_id, new_status=payload.status, db=db)
    await db.commit()
    await db.refresh(slot)
    return schemas.SlotAdminResponse.model_validate(slot)


@router.post(
    "/{slot_id}/halls",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Link a hall to a slot (admin)",
)
async def link_hall(
    slot_id: int,
    payload: schemas.HallLinkRequest,
    current_admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Link a hall to an existing slot. Idempotent."""
    await service.link_hall(slot_id=slot_id, hall_id=payload.hall_id, db=db)
    await db.commit()


@router.delete(
    "/{slot_id}/halls/{hall_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Unlink a hall from a slot (admin)",
)
async def unlink_hall(
    slot_id: int,
    hall_id: int,
    current_admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Remove a hall link from a slot."""
    await service.unlink_hall(slot_id=slot_id, hall_id=hall_id, db=db)
    await db.commit()


@router.get(
    "/{slot_id}/bookings",
    response_model=list[schemas.BookingAdminResponse],
    summary="List all bookings for a slot (admin)",
)
async def list_slot_bookings(
    slot_id: int,
    current_admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> list[schemas.BookingAdminResponse]:
    """Return all bookings (any status) for a given slot."""
    bookings = await service.list_bookings_for_slot(slot_id=slot_id, db=db)
    return [schemas.BookingAdminResponse.model_validate(b) for b in bookings]


@router.get(
    "/{slot_id}/capacity",
    response_model=schemas.CapacityResponse,
    summary="View capacity for a slot (admin)",
)
async def get_slot_capacity(
    slot_id: int,
    current_admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> schemas.CapacityResponse:
    """Return current bookings and total capacity for a slot."""
    current, total = await service.get_slot_capacity(slot_id=slot_id, db=db)
    return schemas.CapacityResponse(
        slot_id=slot_id,
        current_active_bookings=current,
        total_capacity=total,
        seats_remaining=max(0, total - current),
    )
