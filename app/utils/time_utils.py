"""
app/utils/time_utils.py
-----------------------
Timezone-aware datetime helpers used across the application.

All timestamps stored in the database are in UTC.
Use these helpers instead of calling datetime.now() directly.

TODO: Add helper to convert UTC datetime to a given timezone for display.
TODO: Add helper to parse ISO 8601 strings into aware datetimes.
TODO: Add slot window overlap checker for booking validation.
"""

from datetime import datetime, timedelta, timezone


def utcnow() -> datetime:
    """Return the current UTC datetime (timezone-aware)."""
    return datetime.now(timezone.utc)


def add_minutes(dt: datetime, minutes: int) -> datetime:
    """Return `dt` plus the given number of minutes."""
    return dt + timedelta(minutes=minutes)


def add_days(dt: datetime, days: int) -> datetime:
    """Return `dt` plus the given number of days."""
    return dt + timedelta(days=days)


def is_past(dt: datetime) -> bool:
    """Return True if `dt` is before the current UTC time."""
    return dt < utcnow()


def is_future(dt: datetime) -> bool:
    """Return True if `dt` is after the current UTC time."""
    return dt > utcnow()


def format_iso(dt: datetime) -> str:
    """Format a datetime as an ISO 8601 string with UTC offset."""
    return dt.isoformat()
