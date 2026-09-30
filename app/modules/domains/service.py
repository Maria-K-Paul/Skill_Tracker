"""
app/modules/domains/service.py
-------------------------------
Business logic for domain/track/level/topic queries.

Cross-module calls: none — domains is a leaf dependency used by others.
Does NOT import other module models.py or router.py.

TODO: implement list_tracks(is_active?) → list[Track]
TODO: implement get_level_detail(level_id) → Level with topics
TODO: implement get_ordered_topics(level_id) → list[Topic] ordered by sequence_no
      — each topic includes its subtopics also ordered by sequence_no.
TODO: implement get_track(track_id) → Track
TODO: implement create_track(data) → Track  (admin only)
TODO: implement create_level(track_id, data) → Level  (admin only)
TODO: implement create_topic(level_id, data) → Topic  (admin only)
TODO: implement create_subtopic(topic_id, data) → Subtopic  (admin only)
"""


from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.modules.domains.models import Level


async def list_tracks(is_active: bool | None = None) -> list:
    """Return all tracks, optionally filtered by is_active."""
    # TODO: query tracks table
    return []


async def get_level_detail(level_id: int) -> dict:
    """
    Return a level with its ordered topics and subtopics.
    Only topics/subtopics required for the current level are exposed.
    """
    # TODO: query levels, topics ORDER BY sequence_no, subtopics ORDER BY sequence_no
    pass


async def get_ordered_topics(level_id: int) -> list:
    """
    Return topics for the given level, ordered by sequence_no.
    Each topic includes its subtopics also ordered by sequence_no.
    """
    # TODO: implement with subquery or eager load
    return []


# ── Level lookups used by progress/ and attempts/ ─────────────────────────────

def _level_to_dict(level: Level) -> dict:
    return {
        "id": level.id,
        "track_id": level.track_id,
        "level_no": level.level_no,
        "name": level.name,
        "description": level.description,
    }


async def get_level(level_id: int, db: AsyncSession) -> dict:
    """Return one level as a dict. Raises NotFoundError if it does not exist."""
    level = await db.get(Level, level_id)
    if level is None:
        raise NotFoundError(f"Level {level_id} not found.")
    return _level_to_dict(level)


async def get_next_level(level_id: int, db: AsyncSession) -> dict | None:
    """Return the level with level_no + 1 in the same track, or None if this is the last."""
    level = await db.get(Level, level_id)
    if level is None:
        raise NotFoundError(f"Level {level_id} not found.")
    nxt = await db.scalar(
        select(Level).where(
            Level.track_id == level.track_id,
            Level.level_no == level.level_no + 1,
        )
    )
    return _level_to_dict(nxt) if nxt is not None else None


async def list_levels_for_track(track_id: int, db: AsyncSession) -> list[dict]:
    """Return every level of a track ordered by level_no (empty list if none)."""
    result = await db.execute(
        select(Level).where(Level.track_id == track_id).order_by(Level.level_no)
    )
    return [_level_to_dict(lv) for lv in result.scalars().all()]
