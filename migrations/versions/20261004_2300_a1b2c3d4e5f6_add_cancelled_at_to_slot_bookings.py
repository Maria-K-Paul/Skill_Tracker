"""add_cancelled_at_to_slot_bookings

Revision ID: a1b2c3d4e5f6
Revises: 1f07b9f762a
Create Date: 2026-10-04 23:00:00.000000+00:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '1f07b9f762a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('slot_bookings', sa.Column('cancelled_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column('slot_bookings', 'cancelled_at')
