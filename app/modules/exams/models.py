"""
app/modules/exams/models.py
----------------------------
ORM model placeholders for assessment (exam definition) tables.

Tables covered: assessments.
Column comments match docs/db_schema.md exactly.

TODO: Add SQLAlchemy Column definitions.
TODO: Add relationship to slots via Slot.assessment_id.
"""


class Assessment:
    """
    An exam definition created by an admin for a specific level.
    Duration and status are set at creation time.

    Table: assessments
        # id: INTEGER (PK)
        # level_id: INTEGER (FK → levels)
        # title: VARCHAR
        # duration_minutes: INTEGER
        # status: VARCHAR
        # created_by: INTEGER (FK → users)
        # created_at: TIMESTAMP
    """
    pass
