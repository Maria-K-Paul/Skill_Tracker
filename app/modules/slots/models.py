"""
app/modules/slots/models.py
----------------------------
SQLAlchemy ORM models for slot management.

Tables: slots, slot_halls, slot_bookings

Design notes:
  - Slots are created by admins before halls are linked.
  - slot_halls is a composite-PK join table (no surrogate PK needed).
  - slot_bookings tracks each student's booking; students never see hall info.
  - attempt_number is assigned at booking time by querying prior bookings for
    the same (student_id, level_id) combination.
"""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SlotStatus(str, enum.Enum):
    DRAFT = "draft"
    OPEN = "open"
    CLOSED = "closed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class BookingStatus(str, enum.Enum):
    BOOKED = "booked"
    CANCELLED = "cancelled"


class Slot(Base):
    """
    An exam sitting window for a specific level (assessment), created by an admin.

    Table: slots
        id              UUID PK
        level_id        UUID FK → levels.id (opaque — levels module is out of scope)
        start_time      TIMESTAMP WITH TZ
        end_time        TIMESTAMP WITH TZ
        booking_cutoff  TIMESTAMP WITH TZ — no bookings/cancellations allowed after this
        status          ENUM (draft/open/closed/completed/cancelled)
        created_at      TIMESTAMP WITH TZ
    """

    __tablename__ = "slots"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    level_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    booking_cutoff: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    status: Mapped[SlotStatus] = mapped_column(
        Enum(SlotStatus, name="slotstatus"), nullable=False, default=SlotStatus.DRAFT
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships (for convenience — no lazy loading; use explicit joins in service)
    slot_halls: Mapped[list["SlotHall"]] = relationship(
        "SlotHall", back_populates="slot", cascade="all, delete-orphan"
    )
    bookings: Mapped[list["SlotBooking"]] = relationship(
        "SlotBooking", back_populates="slot", cascade="all, delete-orphan"
    )


class SlotHall(Base):
    """
    Links halls to a slot.  Admin adds halls after slot creation.
    Composite PK (slot_id, hall_id) — no surrogate key.

    Table: slot_halls
        slot_id     UUID FK → slots.id
        hall_id     UUID FK → halls.id (halls module owns the Hall model)
    """

    __tablename__ = "slot_halls"

    slot_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("slots.id", ondelete="CASCADE"),
        primary_key=True,
    )
    hall_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        # FK to halls.id — halls module is owned by another contributor.
        # TODO(integration): confirm halls table name with halls module owner.
        ForeignKey("halls.id", ondelete="CASCADE"),
        primary_key=True,
    )

    slot: Mapped["Slot"] = relationship("Slot", back_populates="slot_halls")


class SlotBooking(Base):
    """
    Records a student booking for a slot.
    Students never pick or see a hall — hall assignment happens in allocation/.

    Table: slot_bookings
        id               UUID PK
        slot_id          UUID FK → slots.id
        student_id       UUID FK (opaque — users/students module is out of scope)
        attempt_number   INT — auto-incremented per (student_id, level_id) across all slots
        status           ENUM (booked/cancelled)
        booked_at        TIMESTAMP WITH TZ
        cancelled_at     TIMESTAMP WITH TZ, nullable
    """

    __tablename__ = "slot_bookings"
    __table_args__ = (
        UniqueConstraint(
            "slot_id", "student_id", name="uq_slot_bookings_slot_student"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    slot_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("slots.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    attempt_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, name="bookingstatus"),
        nullable=False,
        default=BookingStatus.BOOKED,
    )
    booked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    cancelled_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    slot: Mapped["Slot"] = relationship("Slot", back_populates="bookings")
