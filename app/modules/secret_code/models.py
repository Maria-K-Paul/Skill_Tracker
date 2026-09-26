"""
app/modules/secret_code/models.py
-----------------------------------
SQLAlchemy ORM model for the secret_codes table.

SECURITY INVARIANT: `encrypted_code` holds Fernet ciphertext only.
The plaintext is NEVER stored, logged, or returned to student endpoints.

Tables covered: secret_codes
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SecretCode(Base):
    """
    One Fernet-encrypted secret code per allocation.

    Lifecycle:
      - Created by allocation/service.run_allocation() immediately after an
        Allocation row is inserted.
      - Revealed (decrypted) ONLY by admin via hall_sheets; every reveal writes
        an audit log entry.
      - Consumed (is_used=True) by attempts/service.start_exam() via
        secret_code.service.verify_and_consume_code().

    Security notes:
      - `encrypted_code` is Fernet ciphertext.  The decryption key lives only
        in settings.code_encryption_key (loaded from environment).
      - The column is typed String (base64 text) because Fernet output is
        URL-safe base64.
      - `is_used` + `expires_at` are the two guards that prevent replay attacks.
    """

    __tablename__ = "secret_codes"
    __table_args__ = (
        UniqueConstraint("allocation_id", name="uq_secret_codes_allocation_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    allocation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("allocations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    encrypted_code: Mapped[str] = mapped_column(String(512), nullable=False)
    is_used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    used_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
