"""
app/modules/hall_sheets/service.py
------------------------------------
Read-only service: composes hall-wise data from allocation + secret_code + slot_bookings.

This module has no own database table.

Cross-module calls:
  - secret_code.service.reveal_code_for_admin() — ONLY for the print endpoint.
    Each call writes one audit log entry — this is intentional and per spec.
    Do NOT batch or cache reveals to "optimize" away per-row auditing.

Security:
  - get_hall_sheet() returns HallSheetRow objects which have NO code field.
  - get_printable_hall_sheet() returns HallSheetPrintRow objects which include
    the plaintext code — one audit log write per row, always.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.allocation.models import Allocation
from app.modules.hall_sheets.schemas import HallSheetPrintRow, HallSheetRow
from app.modules.secret_code import service as secret_code_service
from app.modules.secret_code.models import SecretCode
from app.modules.slots.models import SlotBooking


async def get_hall_sheet(
    slot_id: uuid.UUID, db: AsyncSession
) -> list[HallSheetRow]:
    """
    Return hall-wise student + seat data for a slot.

    Secret codes are NOT included in any row — this is enforced by the
    HallSheetRow schema which has no code field whatsoever.

    Joins: allocations ← slot_bookings, allocations ← halls (for hall_id grouping).
    """
    # Join allocations with slot_bookings to filter by slot_id.
    result = await db.execute(
        select(
            Allocation.id.label("allocation_id"),
            Allocation.hall_id,
            Allocation.seat_no,
            SlotBooking.student_id,
            SlotBooking.attempt_number,
            SlotBooking.status.label("booking_status"),
        )
        .join(SlotBooking, SlotBooking.id == Allocation.slot_booking_id)
        .where(SlotBooking.slot_id == slot_id)
        .order_by(Allocation.hall_id, Allocation.seat_no)
    )
    rows = result.mappings().all()

    return [
        HallSheetRow(
            allocation_id=row["allocation_id"],
            hall_id=row["hall_id"],
            seat_no=row["seat_no"],
            student_id=row["student_id"],
            # student_display_name: pull from booking/user join in a future
            # integration when users module provides a lookup.
            # TODO(integration): replace with actual user name lookup — users module owner.
            student_display_name=f"Student:{str(row['student_id'])[:8]}",
            attempt_number=row["attempt_number"],
            booking_status=str(row["booking_status"]),
        )
        for row in rows
    ]


async def get_printable_hall_sheet(
    slot_id: uuid.UUID,
    hall_id: uuid.UUID,
    revealed_by_user_id: uuid.UUID,
    db: AsyncSession,
) -> list[HallSheetPrintRow]:
    """
    Return printable hall sheet rows for a specific hall, including decrypted codes.

    PER-ROW AUDIT CONTRACT (DO NOT BATCH OR SKIP):
      For every row, this function calls secret_code.service.reveal_code_for_admin(),
      which writes one audit log entry.  The spec intentionally requires one entry
      per row per call — do not "optimize" this into a single batch audit write.

    Args:
        slot_id:             UUID of the slot.
        hall_id:             UUID of the specific hall to print.
        revealed_by_user_id: UUID of the admin requesting the print.
        db:                  Async SQLAlchemy session.

    Returns:
        List of HallSheetPrintRow with plaintext codes attached.
    """
    from app.modules.secret_code import service as secret_code_service

    # Fetch allocations for this specific hall + slot combination.
    result = await db.execute(
        select(
            Allocation.id.label("allocation_id"),
            Allocation.hall_id,
            Allocation.seat_no,
            SlotBooking.student_id,
            SlotBooking.attempt_number,
            SecretCode.id.label("secret_code_id"),
        )
        .join(SlotBooking, SlotBooking.id == Allocation.slot_booking_id)
        .join(SecretCode, SecretCode.allocation_id == Allocation.id)
        .where(
            SlotBooking.slot_id == slot_id,
            Allocation.hall_id == hall_id,
        )
        .order_by(Allocation.seat_no)
    )
    rows = result.mappings().all()

    print_rows: list[HallSheetPrintRow] = []
    for row in rows:
        # Per-row reveal + audit — one audit log entry per student, per call.
        # This is INTENTIONAL per spec — do not batch.
        plaintext = await secret_code_service.reveal_code_for_admin(
            secret_code_id=row["secret_code_id"],
            revealed_by_user_id=revealed_by_user_id,
            db=db,
        )
        print_rows.append(
            HallSheetPrintRow(
                allocation_id=row["allocation_id"],
                hall_id=row["hall_id"],
                seat_no=row["seat_no"],
                student_id=row["student_id"],
                # TODO(integration): replace with actual user name lookup — users module owner.
                student_display_name=f"Student:{str(row['student_id'])[:8]}",
                attempt_number=row["attempt_number"],
                secret_code=plaintext,
            )
        )
    return print_rows
