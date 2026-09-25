"""
app/core/database.py
--------------------
Async SQLAlchemy engine and session factory.

Provides:
- `engine`        — async engine instance.
- `AsyncSessionLocal` — async session factory.
- `Base`          — declarative base for all ORM models.
- `get_db()`      — FastAPI dependency that yields a database session.

TODO: Configure connection pool size from settings.
TODO: Add health-check query on startup.
TODO: Wire engine creation into FastAPI lifespan context manager.
"""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# ── Engine ────────────────────────────────────────────────────────────────────
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    future=True,
)

# ── Session Factory ───────────────────────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ── Declarative Base ──────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    """Shared declarative base for all ORM models across modules."""
    pass


# ── Dependency ────────────────────────────────────────────────────────────────
async def get_db() -> AsyncSession:
    """
    FastAPI dependency that yields an async DB session and ensures
    it is closed after the request completes.
    """
    # TODO: handle exceptions and rollback on error
    async with AsyncSessionLocal() as session:
        yield session
