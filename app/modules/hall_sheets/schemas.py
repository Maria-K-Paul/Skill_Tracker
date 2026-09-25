"""
app/modules/hall_sheets/schemas.py
------------------------------------
Pydantic schemas for the hall_sheets module (admin only).

This module has no own database table — it composes data from:
allocation, secret_code, slot_booking.

TODO: Add HallSheetRow (student name, seat_no, code HIDDEN by default).
TODO: Add PrintableHallSheetRow (same but code included — admin print only).
TODO: Add HallSheetResponse grouping rows by hall.
"""

from pydantic import BaseModel


class HallSheetRow(BaseModel):
    """One student's row on the hall-wise view. Code is NOT included."""
    student_id: int
    seat_no: int
    hall_id: int
    # NOTE: secret code is intentionally excluded


class PrintableHallSheetRow(BaseModel):
    """One student's row for the printable sheet. Code IS included."""
    student_id: int
    seat_no: int
    hall_id: int
    secret_code: str  # plaintext — ONLY for physical print; audited on access
