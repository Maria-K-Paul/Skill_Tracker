"""
app/modules/hall_sheets/schemas.py
------------------------------------
Pydantic v2 schemas for the hall_sheets module (admin only).

CRITICAL SECURITY DESIGN:
  Two separate schemas — NOT one schema with an optional code field.
  This is intentional: an optional field can accidentally become non-null
  in a unified schema; two schemas prevent the plaintext from ever appearing
  in the non-print endpoint response shape.

  - HallSheetRow       — for GET /hall-sheets/{slot_id}         (NO code field)
  - HallSheetPrintRow  — for GET /hall-sheets/{slot_id}/{hall_id}/print  (code present)

This module has no own database table — it composes data from:
  allocations, secret_codes, slot_bookings, halls
"""

from pydantic import BaseModel


class HallSheetRow(BaseModel):
    """
    One student's row on the hall-wise view.

    SECURITY: The `secret_code` field is COMPLETELY ABSENT from this schema —
    not optional, not null, not hidden behind a flag.  It does not exist here.
    Any code review that adds a code-related field to this class should be blocked.
    """
    allocation_id: int
    hall_id: int
    seat_no: int
    student_id: int
    student_display_name: str
    attempt_number: int
    booking_status: str


class HallSheetPrintRow(BaseModel):
    """
    One student's row for the printable hall sheet.

    Contains the decrypted plaintext secret code.
    ONLY returned by the admin print endpoint.
    ONLY generated after a write_audit_log() call per row.
    MUST NOT be used as a response model for the non-print endpoint.
    """
    allocation_id: int
    hall_id: int
    seat_no: int
    student_id: int
    student_display_name: str
    attempt_number: int
    secret_code: str


class HallSheetSlotResponse(BaseModel):
    """Grouped hall-wise response for a slot (no codes)."""
    slot_id: int
    hall_id: int
    rows: list[HallSheetRow]


class HallSheetPrintResponse(BaseModel):
    """Printable hall sheet for a specific hall (codes included)."""
    slot_id: int
    hall_id: int
    rows: list[HallSheetPrintRow]
