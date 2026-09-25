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
