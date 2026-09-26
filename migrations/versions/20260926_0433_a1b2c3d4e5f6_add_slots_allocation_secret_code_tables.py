"""add slots, allocation, secret_code tables

Revision ID: a1b2c3d4e5f6
Revises: 
Create Date: 2026-09-26 04:33:00.000000

Adds four tables owned by this PR (slots, slot_halls, slot_bookings, allocations,
secret_codes).

SCOPE: This migration ONLY creates tables for modules owned by this PR.
If it appears to touch any other tables (halls, users, progress, attempts, etc.)
stop, investigate, and report rather than accepting the migration.

Prerequisites / cross-module FK dependencies:
  - `halls` table must exist before this migration runs (owned by halls module).
  - If `halls` doesn't exist yet, run the halls migration first.
    TODO(integration): coordinate migration ordering with halls module owner.
"""

import uuid
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "a1b2c3d4e5f6"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── slots ──────────────────────────────────────────────────────────────────
    op.create_table(
        "slots",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("level_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("booking_cutoff", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "draft", "open", "closed", "completed", "cancelled",
                name="slotstatus",
            ),
            nullable=False,
            server_default="draft",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_slots_level_id", "slots", ["level_id"])

    # ── slot_halls ─────────────────────────────────────────────────────────────
    # Composite PK (slot_id, hall_id); depends on halls table being present.
    op.create_table(
        "slot_halls",
        sa.Column(
            "slot_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("slots.id", ondelete="CASCADE"),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "hall_id",
            postgresql.UUID(as_uuid=True),
            # TODO(integration): halls table must exist — owned by halls module owner.
            sa.ForeignKey("halls.id", ondelete="CASCADE"),
            primary_key=True,
            nullable=False,
        ),
    )

    # ── slot_bookings ─────────────────────────────────────────────────────────
    op.create_table(
        "slot_bookings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column(
            "slot_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("slots.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("attempt_number", sa.Integer, nullable=False, server_default="1"),
        sa.Column(
            "status",
            sa.Enum("booked", "cancelled", name="bookingstatus"),
            nullable=False,
            server_default="booked",
        ),
        sa.Column(
            "booked_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("slot_id", "student_id", name="uq_slot_bookings_slot_student"),
    )
    op.create_index("ix_slot_bookings_slot_id", "slot_bookings", ["slot_id"])
    op.create_index("ix_slot_bookings_student_id", "slot_bookings", ["student_id"])

    # ── allocations ───────────────────────────────────────────────────────────
    op.create_table(
        "allocations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column(
            "slot_booking_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("slot_bookings.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "hall_id",
            postgresql.UUID(as_uuid=True),
            # TODO(integration): halls table must exist — owned by halls module owner.
            sa.ForeignKey("halls.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("seat_no", sa.Integer, nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.UniqueConstraint("slot_booking_id", name="uq_allocations_slot_booking_id"),
    )
    op.create_index("ix_allocations_slot_booking_id", "allocations", ["slot_booking_id"])
    op.create_index("ix_allocations_hall_id", "allocations", ["hall_id"])

    # ── secret_codes ──────────────────────────────────────────────────────────
    op.create_table(
        "secret_codes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column(
            "allocation_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("allocations.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("encrypted_code", sa.String(512), nullable=False),
        sa.Column("is_used", sa.Boolean, nullable=False, server_default="false"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("allocation_id", name="uq_secret_codes_allocation_id"),
    )
    op.create_index("ix_secret_codes_allocation_id", "secret_codes", ["allocation_id"])


def downgrade() -> None:
    # Drop in reverse FK dependency order.
    op.drop_table("secret_codes")
    op.drop_table("allocations")
    op.drop_table("slot_bookings")
    op.drop_table("slot_halls")
    op.drop_table("slots")
    # Drop enum types explicitly (PostgreSQL requires this).
    op.execute("DROP TYPE IF EXISTS bookingstatus")
    op.execute("DROP TYPE IF EXISTS slotstatus")
