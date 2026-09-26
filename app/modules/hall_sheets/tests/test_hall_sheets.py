"""
app/modules/hall_sheets/tests/test_hall_sheets.py
--------------------------------------------------
Tests for hall_sheets/service.py and hall_sheets/schemas.py.

Spec requirements verified here:
  1. Non-print endpoint response never contains a code field (key absent, not null).
  2. Print endpoint triggers exactly one audit log write per row
     (mock reveal_code_for_admin and assert call_count == row_count).
"""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.modules.hall_sheets import service as svc
from app.modules.hall_sheets.schemas import HallSheetRow, HallSheetPrintRow


# ── Helpers ───────────────────────────────────────────────────────────────────

def _mock_row(
    allocation_id: uuid.UUID | None = None,
    hall_id: uuid.UUID | None = None,
    student_id: uuid.UUID | None = None,
    seat_no: int = 1,
    attempt_number: int = 1,
    secret_code_id: uuid.UUID | None = None,
    booking_status: str = "booked",
) -> dict:
    return {
        "allocation_id": allocation_id or uuid.uuid4(),
        "hall_id": hall_id or uuid.uuid4(),
        "seat_no": seat_no,
        "student_id": student_id or uuid.uuid4(),
        "attempt_number": attempt_number,
        "booking_status": booking_status,
        "secret_code_id": secret_code_id or uuid.uuid4(),
    }


class FakeMappingResult:
    """Mimics sqlalchemy execute().mappings().all() chain."""
    def __init__(self, rows: list[dict]):
        self._rows = rows

    def mappings(self):
        return self

    def all(self):
        return self._rows


# ── Test 1: non-print endpoint rows have NO code field ───────────────────────

@pytest.mark.asyncio
async def test_get_hall_sheet_rows_have_no_code_field():
    """
    Rows returned by get_hall_sheet() must be HallSheetRow objects.
    HallSheetRow must contain no secret_code field — not null, absent entirely.
    """
    slot_id = uuid.uuid4()
    hall_id = uuid.uuid4()
    raw_rows = [
        _mock_row(hall_id=hall_id, seat_no=1),
        _mock_row(hall_id=hall_id, seat_no=2),
    ]

    db = MagicMock()
    db.execute = AsyncMock(return_value=FakeMappingResult(raw_rows))

    rows = await svc.get_hall_sheet(slot_id=slot_id, db=db)

    assert len(rows) == 2
    for row in rows:
        assert isinstance(row, HallSheetRow)
        serialised = row.model_dump()
        for forbidden in ("secret_code", "code", "encrypted_code", "plaintext"):
            assert forbidden not in serialised, (
                f"SECURITY: '{forbidden}' must not appear in HallSheetRow. "
                f"Keys present: {list(serialised.keys())}"
            )


def test_hall_sheet_row_schema_has_no_code_fields():
    """Direct schema field inspection — HallSheetRow must have no code fields."""
    schema_fields = set(HallSheetRow.model_fields.keys())
    for forbidden in ("secret_code", "code", "encrypted_code", "plaintext"):
        assert forbidden not in schema_fields, (
            f"SECURITY: HallSheetRow schema must not contain '{forbidden}'. "
            f"Current fields: {schema_fields}"
        )


# ── Test 2: print endpoint triggers one audit per row ─────────────────────────

@pytest.mark.asyncio
async def test_get_printable_hall_sheet_triggers_one_audit_per_row():
    """
    get_printable_hall_sheet() must call reveal_code_for_admin exactly once
    per student row.  Each reveal call internally writes one audit log entry.
    Assert call_count == row_count.
    """
    slot_id = uuid.uuid4()
    hall_id = uuid.uuid4()
    admin_id = uuid.uuid4()

    num_rows = 4
    raw_rows = [_mock_row(hall_id=hall_id, seat_no=i + 1) for i in range(num_rows)]

    db = MagicMock()
    db.execute = AsyncMock(return_value=FakeMappingResult(raw_rows))

    reveal_counter = [0]

    async def fake_reveal(*, secret_code_id, revealed_by_user_id, db):
        reveal_counter[0] += 1
        return f"CODE-{reveal_counter[0]:03d}"

    # The import is at module level: `from app.modules.secret_code import service as secret_code_service`
    # So we patch the name as bound in hall_sheets.service
    with patch(
        "app.modules.hall_sheets.service.secret_code_service.reveal_code_for_admin",
        side_effect=fake_reveal,
    ):
        rows = await svc.get_printable_hall_sheet(
            slot_id=slot_id,
            hall_id=hall_id,
            revealed_by_user_id=admin_id,
            db=db,
        )

    assert len(rows) == num_rows
    assert reveal_counter[0] == num_rows, (
        f"Expected reveal_code_for_admin called {num_rows} times, "
        f"actual: {reveal_counter[0]}"
    )


@pytest.mark.asyncio
async def test_printable_sheet_audit_count_equals_row_count():
    """
    Alternative: patch at the local import level to count reveal_code_for_admin calls.
    Verifies the per-row audit contract holds for any number of rows.
    """
    slot_id = uuid.uuid4()
    hall_id = uuid.uuid4()
    admin_id = uuid.uuid4()

    num_rows = 3
    raw_rows = [_mock_row(hall_id=hall_id, seat_no=i + 1) for i in range(num_rows)]

    db = MagicMock()
    db.execute = AsyncMock(return_value=FakeMappingResult(raw_rows))

    mock_reveal = AsyncMock(return_value="TEST-CODE")

    # Patch at the hall_sheets.service module level (where secret_code_service is bound)
    with patch(
        "app.modules.hall_sheets.service.secret_code_service.reveal_code_for_admin",
        mock_reveal,
    ):
        rows = await svc.get_printable_hall_sheet(
            slot_id=slot_id,
            hall_id=hall_id,
            revealed_by_user_id=admin_id,
            db=db,
        )

    assert mock_reveal.call_count == num_rows, (
        f"Audit log writes (reveal_code_for_admin calls) expected: {num_rows}, "
        f"actual: {mock_reveal.call_count}"
    )
    assert len(rows) == num_rows


# ── Test 3: print rows contain the code field ─────────────────────────────────

def test_print_row_schema_has_code_field():
    """HallSheetPrintRow must include secret_code field."""
    schema_fields = set(HallSheetPrintRow.model_fields.keys())
    assert "secret_code" in schema_fields, (
        f"HallSheetPrintRow must have 'secret_code'. Fields: {schema_fields}"
    )


def test_print_row_and_regular_row_are_separate_schemas():
    """HallSheetPrintRow and HallSheetRow must be distinct, unrelated classes."""
    assert HallSheetRow is not HallSheetPrintRow
    assert not issubclass(HallSheetRow, HallSheetPrintRow)
    assert not issubclass(HallSheetPrintRow, HallSheetRow)
