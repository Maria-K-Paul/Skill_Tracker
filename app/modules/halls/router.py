"""
app/modules/halls/router.py
----------------------------
Halls module router — admin-only hall CRUD.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.modules.halls import schemas, service

router = APIRouter()


@router.get("/", response_model=list[schemas.HallResponse], summary="List all halls")
async def list_halls(
    db: AsyncSession = Depends(get_db),
) -> list[schemas.HallResponse]:
    """Return all halls. Public endpoint (needed for student slot booking view)."""
    halls = await service.list_halls(db)
    return [schemas.HallResponse.model_validate(h.__dict__) for h in halls]


@router.post("/", response_model=schemas.HallResponse, status_code=status.HTTP_201_CREATED, summary="Create hall (admin)")
async def create_hall(
    data: schemas.HallCreateRequest,
    current_admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> schemas.HallResponse:
    """Create a new hall. Admin only."""
    hall = await service.create_hall(db, data.name, data.location, data.capacity)
    await db.commit()
    return schemas.HallResponse.model_validate(hall.__dict__)


@router.get("/{hall_id}", response_model=schemas.HallResponse, summary="Get hall by ID")
async def get_hall(
    hall_id: int,
    db: AsyncSession = Depends(get_db),
) -> schemas.HallResponse:
    """Return hall by ID."""
    hall = await service.get_hall(db, hall_id)
    return schemas.HallResponse.model_validate(hall.__dict__)


@router.delete("/{hall_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete hall (admin)")
async def delete_hall(
    hall_id: int,
    current_admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a hall. Admin only."""
    await service.delete_hall(db, hall_id)
    await db.commit()
