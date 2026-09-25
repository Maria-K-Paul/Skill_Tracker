"""
app/modules/slots/models.py
----------------------------
ORM model placeholders for slot and booking tables.

Tables covered: slots, slot_halls, slot_bookings.
Column comments match docs/db_schema.md exactly.

TODO: Add SQLAlchemy Column definitions.
TODO: Add relationship from Slot to SlotHall (after allocation links hall).
"""


class Slot:
    """
    An exam sitting window created by an admin for an assessment.
    A slot is NOT tied to a hall at creation time.

    Table: slots
        # id: INTEGER (PK)
        # assessment_id: INTEGER (FK → assessments)
        # date: DATE
        # start_time: TIME
        # end_time: TIME
        # booking_cutoff: TIMESTAMP
        # status: VARCHAR
    """
    pass


class SlotHall:
    """
    Links halls to a slot (added by admin after slot creation).

    Table: slot_halls
        # id: INTEGER (PK)
        # slot_id: INTEGER (FK → slots)
        # hall_id: INTEGER (FK → halls)
    """
    pass


class SlotBooking:
    """
    A student's booking for a slot. Students never pick or see a hall.
    attempt_number is assigned at booking time.

    Table: slot_bookings
        # id: INTEGER (PK)
        # slot_id: INTEGER (FK → slots)
        # student_id: INTEGER (FK → students)
        # attempt_number: INTEGER
        # booked_at: TIMESTAMP
        # status: VARCHAR
    """
    pass
