"""
app/modules/halls/models.py
----------------------------
ORM model placeholders for hall management.

Tables covered: halls.
Column comments match docs/db_schema.md exactly.

TODO: Add SQLAlchemy Column definitions.
TODO: Add relationship to slot_halls.
"""


class Hall:
    """
    A physical examination hall with name, location, and seating capacity.

    Table: halls
        # id: INTEGER (PK)
        # name: VARCHAR
        # location: VARCHAR
        # capacity: INTEGER
    """
    pass
