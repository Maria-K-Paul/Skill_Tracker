"""
app/modules/secret_code/tests/test_secret_code.py
--------------------------------------------------
Tests for secret_code/service.py.

Spec requirements verified here:
  1. Generating a code never leaves the plaintext recoverable from the DB row
     directly (stored value != any plaintext generated in the test).
  2. verify_and_consume_code returns False on reuse (is_used=True).
  3. Expired codes fail verification.
  4. Duplicate generate for same allocation_id raises ConflictError.
"""

import uuid
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.core.exceptions import ConflictError, ValidationError
from app.core.security import decrypt_code, encrypt_code
from app.modules.secret_code import service as svc


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_code(
    allocation_id: uuid.UUID | None = None,
    *,
    is_used: bool = False,
    expired: bool = False,
    plaintext: str = "TestCode12",
) -> SimpleNamespace:
    """Build a plain namespace that mimics a SecretCode ORM row for testing."""
    now = datetime.now(timezone.utc)
    return SimpleNamespace(
        id=uuid.uuid4(),
        allocation_id=allocation_id or uuid.uuid4(),
        encrypted_code=encrypt_code(plaintext),
        is_used=is_used,
        created_at=now,
        expires_at=(now - timedelta(hours=1)) if expired else (now + timedelta(hours=48)),
        used_at=None,
    )


def _make_db(scalar_return=None, get_return=None) -> MagicMock:
    """Return a minimal async-compatible mock DB session."""
    db = MagicMock()
    db.scalar = AsyncMock(return_value=scalar_return)
    db.get = AsyncMock(return_value=get_return)
    db.add = MagicMock()
    db.flush = AsyncMock()
    return db


# ── Test 1: plaintext never recoverable directly from stored value ─────────────

@pytest.mark.asyncio
async def test_generate_stores_ciphertext_not_plaintext():
    """
    The value stored in encrypted_code must differ from the plaintext.
    Proves: (a) encryption happened, (b) Fernet round-trip works.
    """
    allocation_id = uuid.uuid4()
    db = _make_db(scalar_return=None)  # No existing code → proceed

    added_objects: list = []

    def capture_add(obj):
        added_objects.append(obj)

    db.add = capture_add

    await svc.generate_code_for_student(allocation_id=allocation_id, db=db)

    assert len(added_objects) == 1
    stored = added_objects[0]

    stored_encrypted = stored.encrypted_code
    # Decrypt to recover the original token.
    recovered_plaintext = decrypt_code(stored_encrypted)
    assert isinstance(recovered_plaintext, str)
    assert len(recovered_plaintext) > 0

    # The stored column value must NOT be the plaintext.
    assert stored_encrypted != recovered_plaintext, (
        "SECURITY VIOLATION: plaintext was stored directly in encrypted_code column."
    )
    # Fernet ciphertext is longer than the plaintext (adds header + HMAC).
    assert len(stored_encrypted) > len(recovered_plaintext)


# ── Test 2: idempotency guard raises on duplicate ─────────────────────────────

@pytest.mark.asyncio
async def test_generate_raises_if_code_already_exists():
    """Second call for the same allocation_id must raise ConflictError."""
    allocation_id = uuid.uuid4()
    existing_code = _make_code(allocation_id=allocation_id)
    db = _make_db(scalar_return=existing_code)

    with pytest.raises(ConflictError, match="already exists"):
        await svc.generate_code_for_student(allocation_id=allocation_id, db=db)


# ── Test 3: verify_and_consume_code returns False on reuse ────────────────────

@pytest.mark.asyncio
async def test_verify_returns_false_on_reuse():
    """After is_used=True, verify must return False even with correct code."""
    allocation_id = uuid.uuid4()
    plaintext = "ValidCode1"
    code = _make_code(allocation_id=allocation_id, is_used=True, plaintext=plaintext)

    db = _make_db()
    db.scalar = AsyncMock(return_value=code)

    result = await svc.verify_and_consume_code(
        allocation_id=allocation_id,
        submitted_code=plaintext,
        db=db,
    )
    assert result is False


# ── Test 4: verify_and_consume_code returns False for expired code ────────────

@pytest.mark.asyncio
async def test_verify_returns_false_for_expired_code():
    """Expired codes must fail verification regardless of submitted code."""
    allocation_id = uuid.uuid4()
    plaintext = "ValidCode1"
    code = _make_code(allocation_id=allocation_id, expired=True, plaintext=plaintext)

    db = _make_db()
    db.scalar = AsyncMock(return_value=code)

    result = await svc.verify_and_consume_code(
        allocation_id=allocation_id,
        submitted_code=plaintext,
        db=db,
    )
    assert result is False


# ── Test 5: verify_and_consume_code returns True and marks used on success ────

@pytest.mark.asyncio
async def test_verify_consumes_on_success():
    """Valid, unexpired, unused code with correct submitted value → True."""
    allocation_id = uuid.uuid4()
    plaintext = "GoodCode1"
    code = _make_code(allocation_id=allocation_id, plaintext=plaintext)

    db = _make_db()
    db.scalar = AsyncMock(return_value=code)
    db.flush = AsyncMock()

    result = await svc.verify_and_consume_code(
        allocation_id=allocation_id,
        submitted_code=plaintext,
        db=db,
    )
    assert result is True
    assert code.is_used is True
    assert code.used_at is not None


# ── Test 6: reveal_code_for_admin raises on expired, writes audit on success ──

@pytest.mark.asyncio
async def test_reveal_raises_for_expired_code():
    """reveal_code_for_admin must raise ValidationError if code is expired."""
    secret_code_id = uuid.uuid4()
    admin_id = uuid.uuid4()
    code = _make_code(expired=True)
    code.id = secret_code_id

    db = _make_db(get_return=code)

    with pytest.raises(ValidationError, match="expired"):
        await svc.reveal_code_for_admin(
            secret_code_id=secret_code_id,
            revealed_by_user_id=admin_id,
            db=db,
        )


@pytest.mark.asyncio
async def test_reveal_writes_audit_and_returns_plaintext():
    """reveal_code_for_admin must write an audit log entry and return plaintext."""
    secret_code_id = uuid.uuid4()
    admin_id = uuid.uuid4()
    plaintext = "AuditCode1"
    code = _make_code(plaintext=plaintext)
    code.id = secret_code_id

    db = _make_db(get_return=code)

    with patch(
        "app.modules.secret_code.service.write_audit_log",
        new_callable=AsyncMock,
    ) as mock_audit:
        result = await svc.reveal_code_for_admin(
            secret_code_id=secret_code_id,
            revealed_by_user_id=admin_id,
            db=db,
        )

    assert result == plaintext
    mock_audit.assert_awaited_once()
    call_kwargs = mock_audit.call_args
    assert call_kwargs.kwargs.get("action") == "SECRET_CODE_REVEALED"


# ── Test 7: verify_and_consume_code returns False for wrong code ──────────────

@pytest.mark.asyncio
async def test_verify_returns_false_for_wrong_code():
    """Wrong submitted code → False, is_used remains False."""
    allocation_id = uuid.uuid4()
    plaintext = "CorrectCode"
    code = _make_code(allocation_id=allocation_id, plaintext=plaintext)

    db = _make_db()
    db.scalar = AsyncMock(return_value=code)

    result = await svc.verify_and_consume_code(
        allocation_id=allocation_id,
        submitted_code="WrongCode!",
        db=db,
    )
    assert result is False
    assert code.is_used is False
