"""
migrations/env.py
-----------------
Alembic environment configuration for async SQLAlchemy.

Imports Base from app.core.database and all module models so that
autogenerate can detect table definitions.
"""

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from app.core.config import settings
from app.core.database import Base

# ── Import all models so Alembic autogenerate can see them ───────────────────
# These imports must remain even if not explicitly referenced below.
from app.modules.slots.models import Slot, SlotHall, SlotBooking  # noqa: F401
from app.modules.allocation.models import Allocation  # noqa: F401
from app.modules.secret_code.models import SecretCode  # noqa: F401
# halls.models and other out-of-scope modules are imported by their owners.
# We intentionally do NOT import them here to avoid autogenerating their tables.

# ── Alembic Config ────────────────────────────────────────────────────────────
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Override the sqlalchemy.url with the value from app settings.
config.set_main_option("sqlalchemy.url", settings.database_url)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations in 'online' mode using an async engine."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
