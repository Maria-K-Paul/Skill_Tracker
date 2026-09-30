"""
app/modules/halls/service.py
-----------------------------
Business logic for hall CRUD (admin only).

Cross-module calls: allocation/service reads hall capacity via this service.
Does NOT import other module models.py or router.py.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFound
from app.modules.halls.models import Hall


async def create_hall(db: AsyncSession, name: str, location: str, capacity: int) -> Hall:
    """Create a new hall. Admin only."""
    hall = Hall(name=name, location=location, capacity=capacity)
    db.add(hall)
    await db.flush()
    await db.refresh(hall)
    return hall


async def get_hall(db: AsyncSession, hall_id: int) -> Hall:
    """Return hall by ID. Raises NotFoundError if missing."""
    hall = await db.get(Hall, hall_id)
    if hall is None:
        raise NotFound("HALL_NOT_FOUND", f"Hall {hall_id} not found.")
    return hall


async def list_halls(db: AsyncSession) -> list[Hall]:
    """Return all halls."""
    result = await db.execute(select(Hall).order_by(Hall.id))
    return list(result.scalars().all())


async def update_hall(db: AsyncSession, hall_id: int, name: str | None = None, location: str | None = None, capacity: int | None = None) -> Hall:
    """Update hall details."""
    hall = await get_hall(db, hall_id)
    if name is not None:
        hall.name = name
    if location is not None:
        hall.location = location
    if capacity is not None:
        hall.capacity = capacity
    await db.flush()
    await db.refresh(hall)
    return hall


async def delete_hall(db: AsyncSession, hall_id: int) -> None:
    """Delete a hall."""
    hall = await get_hall(db, hall_id)
    await db.delete(hall)
    await db.flush()


async def get_hall_capacity(db: AsyncSession, hall_id: int) -> int:
    """Return the capacity of a specific hall."""
    hall = await get_hall(db, hall_id)
    return hall.capacity
