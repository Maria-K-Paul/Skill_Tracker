"""
app/modules/domains/models.py
------------------------------
ORM model placeholders for track/level/topic/subtopic hierarchy.

Tables covered: tracks, levels, topics, subtopics.
Column comments match docs/db_schema.md exactly.

TODO: Add SQLAlchemy Column definitions and ordering by sequence_no.
"""


class Track:
    """
    A learning domain (e.g. "Web Development", "Data Science").

    Table: tracks
        # id: INTEGER (PK)
        # name: VARCHAR
        # description: TEXT
        # is_active: BOOLEAN
    """
    pass


class Level:
    """
    A progression level within a track.

    Table: levels
        # id: INTEGER (PK)
        # track_id: INTEGER (FK → tracks)
        # level_no: INTEGER
        # name: VARCHAR
        # description: TEXT
    """
    pass


class Topic:
    """
    A topic within a level. Ordered by sequence_no.

    Table: topics
        # id: INTEGER (PK)
        # level_id: INTEGER (FK → levels)
        # name: VARCHAR
        # description: TEXT
        # sequence_no: INTEGER
    """
    pass


class Subtopic:
    """
    A subtopic within a topic. Ordered by sequence_no.

    Table: subtopics
        # id: INTEGER (PK)
        # topic_id: INTEGER (FK → topics)
        # name: VARCHAR
        # description: TEXT
        # sequence_no: INTEGER
    """
    pass
