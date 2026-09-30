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
from app.modules.users.models import User, Department, AcademicYear, Student, DomainIncharge
from app.modules.auth.models import Role, UserRole, RefreshToken
from app.modules.domains.models import Track, Level, Topic, Subtopic
from app.modules.progress.models import Enrollment, LevelProgress, ProgressionDecision
from app.modules.exams.models import Assessment
from app.modules.slots.models import Slot, SlotHall, SlotBooking
from app.modules.halls.models import Hall
from app.modules.allocation.models import Allocation
from app.modules.secret_code.models import SecretCode
from app.modules.attempts.models import Attempt, ExamSession, ProctoringEvent, AttemptAnswer, Result, TopicResult
from app.modules.ai_engine.models import Question, QuestionOption
from app.modules.analytics.models import AnalyticsRefreshJob, StudentPerformanceSummary, DomainPerformanceSummary, SemesterProgressSummary, TopicGapSummary, DifficultyPerformanceSummary, DashboardWidgetCache
from app.core.audit import AuditLog

# ── Alembic Config ────────────────────────────────────────────────────────────
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Override the sqlalchemy.url with the value from app settings.
# Alembic must use the direct/unpooled Neon connection string — PgBouncer transaction pooling breaks Alembic's session-level locking.
config.set_main_option("sqlalchemy.url", settings.database_url_direct)

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
        connect_args={"ssl": "require"},
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
