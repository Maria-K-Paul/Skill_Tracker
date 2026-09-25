"""
app/modules/allocation/models.py
---------------------------------
ORM model placeholders for the allocation table.

Tables covered: allocations.
Column comments match docs/db_schema.md exactly.

TODO: Add SQLAlchemy Column definitions.
TODO: Add relationship to secret_codes (one allocation → one secret_code).
"""


class Allocation:
    """
    Maps a booked student to a hall and seat after the booking cutoff.
    Created by the allocation process; never chosen by the student.

    Table: allocations
        # id: INTEGER (PK)
        # slot_booking_id: INTEGER (FK → slot_bookings)
        # hall_id: INTEGER (FK → halls)
        # seat_no: INTEGER
        # allocated_at: TIMESTAMP
    """
    pass
