"""
app/core/audit.py
-----------------
Shared AuditLog model and helper for writing audit entries.

This module is intentionally NOT owned by auth/ or secret_code/.
It is a cross-cutting concern written to by both modules (and potentially others).

Table: audit_log
Columns:
    # id: INTEGER (PK)
    # action: VARCHAR
    # actor_user_id: INTEGER (FK → users)
    # target_user_id: INTEGER (FK → users)
    # details: JSONB
    # ip_address: VARCHAR
    # created_at: TIMESTAMP

Usage:
    from app.core.audit import write_audit_log
    await write_audit_log(db, action="SECRET_CODE_REVEALED", actor_user_id=..., ...)

TODO: Implement write_audit_log() with async DB session.
TODO: Add index on (actor_user_id, action, created_at) for fast filtering.
TODO: Hook into secret_code/ reveal endpoints automatically via FastAPI middleware.
"""

from datetime import datetime, timezone


class AuditLog:
    """
    Placeholder ORM model for the audit_log table.

    Columns (no SQLAlchemy definitions yet — added during implementation phase):
        # id: INTEGER (PK)
        # action: VARCHAR
        # actor_user_id: INTEGER (FK → users)
        # target_user_id: INTEGER (FK → users)
        # details: JSONB
        # ip_address: VARCHAR
        # created_at: TIMESTAMP
    """
    pass


async def write_audit_log(
    db,  # AsyncSession — typed loosely to avoid circular imports
    *,
    action: str,
    actor_user_id: int,
    target_user_id: int | None = None,
    details: dict | None = None,
    ip_address: str | None = None,
) -> None:
    """
    Persist a single audit log entry to the audit_log table.

    Called by:
    - secret_code/ service: every time a code is decrypted/printed (admin).
    - auth/ service: on failed logins and lockouts.

    TODO: Construct and insert an AuditLog ORM instance.
    TODO: Flush (not commit) so the log entry is part of the same transaction.
    """
    # TODO: implement
    pass
