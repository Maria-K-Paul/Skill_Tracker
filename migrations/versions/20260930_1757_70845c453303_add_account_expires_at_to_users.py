"""add_account_expires_at_to_users

Revision ID: 70845c453303
Revises: c7a91e2f4b30
Create Date: 2026-09-30 17:57:37.095170+00:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '70845c453303'
down_revision = 'c7a91e2f4b30'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('account_expires_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'account_expires_at')
