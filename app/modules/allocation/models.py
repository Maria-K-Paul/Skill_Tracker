"""
app/modules/allocation/models.py
---------------------------------
SQLAlchemy ORM model for the allocations table.

Table: allocations
  id               UUID PK
  slot_booking_id  UUID FK → slot_bookings.id (unique — one allocation per booking)
  hall_id          UUID FK → halls.id (opaque — halls module owned by another contributor)
  seat_no          INT — sequential per hall (1..N)
  created_at       TIMESTAMP WITH TZ

No student-facing router lives in this module.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import ForeignKey, Integer, UniqueConstraint, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Allocation(Base):
    """
    Maps a confirmed SlotBooking to a hall and seat number.

    Created exclusively by allocation/service.run_allocation() after booking_cutoff.
    Students must never be able to query their hall/seat through this module —
    no student-facing router exists here.

    One-to-one with SlotBooking (UniqueConstraint on slot_booking_id).
    One-to-one with SecretCode (enforced by unique constraint on secret_codes.allocation_id).
    """

    __tablename__ = "allocations"
    __table_args__ = (
        UniqueConstraint(
            "slot_booking_id", name="uq_allocations_slot_booking_id"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    slot_booking_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("slot_bookings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    hall_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        # FK to halls.id — halls module is owned by another contributor.
        # TODO(integration): confirm halls table name with halls module owner.
        ForeignKey("halls.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    seat_no: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
