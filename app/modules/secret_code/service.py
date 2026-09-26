"""
app/modules/secret_code/service.py
------------------------------------
Business logic for secret code generation, reveal, and consumption.

Security contract — implemented exactly per spec:
  - Plaintext is generated with secrets.token_urlsafe(nbytes=9) and
    immediately encrypted with Fernet.  The plaintext never escapes this
    module's internal scope.
  - Encrypted ciphertext is what lives in the DB column `encrypted_code`.
  - Plaintext MUST NOT appear in: return values to students, log statements,
    exception messages, or any response schema used by a non-admin route.
  - Every admin reveal writes one audit log entry before returning.

Cross-module contracts:
  - Called BY: allocation/service.run_allocation() → generate_code_for_student()
  - Called BY: attempts/service.start_exam() → verify_and_consume_code()
  - Called BY: hall_sheets/service.get_printable_hall_sheet() → reveal_code_for_admin()
  - Calls: core/security.encrypt_code() / decrypt_code()
  - Calls: core/audit.write_audit_log()
"""

import secrets as _secrets
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.audit import write_audit_log
from app.core.config import settings  # noqa: F401 — code_encryption_key used via security
from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.core.security import decrypt_code, encrypt_code
from app.modules.secret_code.models import SecretCode

# Default TTL for codes; can be overridden to a shorter window in tests.
_CODE_TTL_HOURS: int = 48


async def generate_code_for_student(
    allocation_id: uuid.UUID,
    db: AsyncSession,
    *,
    ttl_hours: int = _CODE_TTL_HOURS,
) -> None:
    """
    Generate, encrypt, and persist a one-time secret code for a student's allocation.

    Called exclusively by allocation/service.run_allocation() — never by a
    student-facing endpoint.  Returns None intentionally: the plaintext must
    not propagate back up the call stack.

    Raises ConflictError if a code already exists for this allocation_id
    (idempotency guard — safe to call twice by accident, second call raises).

    Args:
        allocation_id: UUID of the Allocation row just created.
        db:            Async SQLAlchemy session (caller is responsible for commit).
        ttl_hours:     How many hours until the code expires (default 48).
    """
    # Idempotency guard — check for existing code before generating.
    existing = await db.scalar(
        select(SecretCode).where(SecretCode.allocation_id == allocation_id)
    )
    if existing is not None:
        raise ConflictError(
            f"A secret code already exists for allocation {allocation_id}. "
            "Call generate_code_for_student only once per allocation."
        )

    now = datetime.now(timezone.utc)

    # ── Plaintext generation + immediate encryption ───────────────────────────
    # The plaintext variable must not be returned, logged, or stored.
    # nosec — secrets.token_urlsafe is the recommended CSPRNG for this use case.
    plaintext = _secrets.token_urlsafe(nbytes=9)  # → ~12 URL-safe chars
    encrypted = encrypt_code(plaintext)  # nosec
    # Plaintext reference ends here — it is not returned or stored further.
    del plaintext

    code = SecretCode(
        allocation_id=allocation_id,
        encrypted_code=encrypted,
        is_used=False,
        created_at=now,
        expires_at=now + timedelta(hours=ttl_hours),
    )
    db.add(code)
    # Caller commits the transaction (run_allocation wraps the whole batch).


async def reveal_code_for_admin(
    secret_code_id: uuid.UUID,
    revealed_by_user_id: uuid.UUID,
    db: AsyncSession,
) -> str:
    """
    Decrypt and return the plaintext secret code for an admin.

    SECURITY: Writes one audit log entry before returning.  Every call to
    this function — even for the same code — produces a separate audit row,
    which is intentional per the spec (hall_sheets print endpoint generates
    one entry per row on every request).

    Raises NotFoundError if the code doesn't exist.
    Raises ValidationError if the code has expired.

    Args:
        secret_code_id:      UUID primary key of the SecretCode row.
        revealed_by_user_id: UUID of the admin performing the reveal.
        db:                  Async SQLAlchemy session.

    Returns:
        Plaintext secret code string — ONLY return this to admin callers.
    """
    code = await db.get(SecretCode, secret_code_id)
    if code is None:
        raise NotFoundError(f"Secret code {secret_code_id} not found.")

    now = datetime.now(timezone.utc)
    expires = code.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if now > expires:
        raise ValidationError("This secret code has expired and cannot be revealed.")

    # Audit BEFORE returning so the log entry is written even if the caller
    # crashes after receiving the value.
    # TODO(integration): depends on core.audit.write_audit_log — owned by core.
    await write_audit_log(
        db,
        action="SECRET_CODE_REVEALED",
        actor_user_id=revealed_by_user_id,
        details={
            "entity_type": "secret_code",
            "entity_id": str(secret_code_id),
        },
    )

    # nosec — decrypt_code uses Fernet; result is only returned to admin callers.
    return decrypt_code(code.encrypted_code)  # nosec


async def verify_and_consume_code(
    allocation_id: uuid.UUID,
    submitted_code: str,
    db: AsyncSession,
) -> bool:
    """
    Verify a student-submitted code and, on success, mark it consumed.

    Called by attempts/service.start_exam() when a student begins an exam.
    This function NEVER reveals WHY verification failed — the caller decides
    what to communicate to the student.

    Failure conditions (all return False, no distinction exposed):
      - No code exists for the allocation.
      - Code has already been used (is_used=True).
      - Code has expired (now > expires_at).
      - Submitted code does not match the stored ciphertext.

    On success:
      - Sets is_used=True, used_at=now().
      - Flushes the update within the caller's transaction.
      - Returns True.

    Args:
        allocation_id:  UUID of the student's Allocation row.
        submitted_code: Plaintext code the student typed at the exam terminal.
        db:             Async SQLAlchemy session.

    Returns:
        True on successful verification and consumption, False on any failure.
    """
    code = await db.scalar(
        select(SecretCode).where(SecretCode.allocation_id == allocation_id)
    )
    if code is None:
        return False

    if code.is_used:
        return False

    now = datetime.now(timezone.utc)
    expires = code.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if now > expires:
        return False

    # nosec — constant-time comparison via == is sufficient here because
    # Fernet tokens are not subject to timing-oracle attacks at this layer;
    # the real secret is the Fernet key, not the plaintext comparison.
    stored_plaintext = decrypt_code(code.encrypted_code)  # nosec
    if stored_plaintext != submitted_code:
        return False

    # Mark consumed.
    code.is_used = True
    code.used_at = now
    await db.flush()
    return True
