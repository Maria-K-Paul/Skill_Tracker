"""
app/modules/halls/service.py
-----------------------------
Business logic for hall CRUD (admin only).

Cross-module calls: allocation/service reads hall capacity via this service.
Does NOT import other module models.py or router.py.

TODO: implement create_hall(name, location, capacity) → Hall
TODO: implement get_hall(hall_id) → Hall
TODO: implement list_halls() → list[Hall]
TODO: implement update_hall(hall_id, data) → Hall
TODO: implement get_hall_capacity(hall_id) → int
"""


async def create_hall(name: str, location: str, capacity: int) -> dict:
    """Create a new hall. Admin only."""
    # TODO: insert into halls table
    pass


async def get_hall(hall_id: int) -> dict:
    """Return hall by ID. Raises NotFoundError if missing."""
    # TODO: query halls by id
    pass


async def list_halls() -> list:
    """Return all halls."""
    # TODO: query halls table
    return []


async def get_hall_capacity(hall_id: int) -> int:
    """Return the capacity of a specific hall."""
    # TODO: query halls.capacity
    return 0
