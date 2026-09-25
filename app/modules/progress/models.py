"""
app/modules/progress/models.py
--------------------------------
ORM model placeholders for enrollment and progression tracking.

Tables covered: enrollments, level_progress, progression_decisions.
Column comments match docs/db_schema.md exactly.

TODO: Add SQLAlchemy Column definitions.
TODO: Add relationship from Enrollment to LevelProgress list.
"""


class Enrollment:
    """
    A student's enrollment in a track. is_blocked=True after 3 failed attempts.

    Table: enrollments
        # id: INTEGER (PK)
        # student_id: INTEGER (FK → students)
        # track_id: INTEGER (FK → tracks)
        # enrolled_at: TIMESTAMP
        # is_blocked: BOOLEAN
    """
    pass


class LevelProgress:
    """
    Tracks a student's progress on a specific level within an enrollment.

    Table: level_progress
        # id: INTEGER (PK)
        # enrollment_id: INTEGER (FK → enrollments)
        # level_id: INTEGER (FK → levels)
        # status: VARCHAR
        # unlocked_at: TIMESTAMP
        # completed_at: TIMESTAMP
    """
    pass


class ProgressionDecision:
    """
    Records the outcome decision after an attempt is scored.
    Decision values: 'advance', 'retry', 'blocked'.

    Table: progression_decisions
        # id: INTEGER (PK)
        # attempt_id: INTEGER (FK → attempts)
        # result_id: INTEGER (FK → results)
        # decision: VARCHAR
        # decided_at: TIMESTAMP
    """
    pass
