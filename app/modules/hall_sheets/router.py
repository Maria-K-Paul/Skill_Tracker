"""
app/modules/hall_sheets/router.py
-----------------------------------
Hall sheets module router — admin-only hall-wise reporting and printable sheets.

No own table. Composes data from allocation, secret_code, slot_bookings.

SECURITY:
  - Both endpoints require admin role.
  - The non-print endpoint uses HallSheetSlotResponse (no code field anywhere).
  - The print endpoint uses HallSheetPrintResponse (code present, audited per row).
  - The two response models are structurally different — not the same model with
    an optional field — to prevent accidental code leakage via JSON serialization.

Routes:
  GET /hall-sheets/{slot_id}                     — hall-wise list, codes absent
  GET /hall-sheets/{slot_id}/{hall_id}/print     — printable sheet with codes, audited
"""

import uuid
from typing import Any

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.modules.hall_sheets import schemas, service

router = APIRouter()


@router.get(
    "/{slot_id}",
    response_model=list[schemas.HallSheetSlotResponse],
    summary="Get hall-wise sheet for a slot (admin, no codes)",
)
async def get_hall_sheet(
    slot_id: uuid.UUID,
    current_admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> list[schemas.HallSheetSlotResponse]:
    """
    Return hall-wise student + seat data for all halls in a slot.

    SECURITY: The response schema (HallSheetSlotResponse → HallSheetRow) has
    NO secret_code field — not null, not present, not serialised.
    """
    rows = await service.get_hall_sheet(slot_id=slot_id, db=db)

    # Group rows by hall_id.
    halls: dict[uuid.UUID, list[schemas.HallSheetRow]] = {}
    for row in rows:
        halls.setdefault(row.hall_id, []).append(row)

    return [
        schemas.HallSheetSlotResponse(slot_id=slot_id, hall_id=hall_id, rows=hall_rows)
        for hall_id, hall_rows in halls.items()
    ]


@router.get(
    "/{slot_id}/{hall_id}/print",
    response_model=schemas.HallSheetPrintResponse,
    summary="Get printable hall sheet with codes (admin, audited per row)",
)
async def get_printable_hall_sheet(
    slot_id: uuid.UUID,
    hall_id: uuid.UUID,
    current_admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> schemas.HallSheetPrintResponse:
    """
    Return a printable hall sheet for a specific hall, including decrypted secret codes.

    AUDIT: One audit log entry is written per student row on every call.
    This is intentional and per spec — do not try to cache or deduplicate reveals.
    """
    admin_id = (
        current_admin["id"]
        if isinstance(current_admin["id"], uuid.UUID)
        else uuid.UUID(str(current_admin["id"]))
    )
    rows = await service.get_printable_hall_sheet(
        slot_id=slot_id,
        hall_id=hall_id,
        revealed_by_user_id=admin_id,
        db=db,
    )
    await db.commit()

    return schemas.HallSheetPrintResponse(
        slot_id=slot_id, hall_id=hall_id, rows=rows
    )


@router.get(
    "/{slot_id}/{hall_id}/download-pdf",
    summary="Download hall sheet PDF with secret codes (admin, audited)",
)
async def download_hall_sheet_pdf(
    slot_id: uuid.UUID,
    hall_id: uuid.UUID,
    current_admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Download a PDF hall sheet for a specific hall, including secret codes.

    AUDIT: One audit log entry is written per student row.
    """
    admin_id = (
        current_admin["id"]
        if isinstance(current_admin["id"], uuid.UUID)
        else uuid.UUID(str(current_admin["id"]))
    )

    pdf_buffer = await service.generate_hall_sheet_pdf(
        slot_id=slot_id,
        hall_id=hall_id,
        revealed_by_user_id=admin_id,
        db=db,
    )
    await db.commit()

    # Return PDF as downloadable file
    headers = {
        'Content-Disposition': f'attachment; filename="hall_sheet_{hall_id}_{slot_id}.pdf"'
    }

    return StreamingResponse(
        pdf_buffer,
        media_type='application/pdf',
        headers=headers
    )
