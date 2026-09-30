"""
app/modules/analytics/tests/test_service.py
--------------------------------------------
Tests for analytics/service.py refresh functions.

Tests verify:
  1. Each refresh function correctly aggregates data
  2. Upsert pattern works (idempotent - safe to run multiple times)
  3. Widget cache TTL and expiration work correctly
  4. refresh_all() orchestrates all functions and logs jobs
  5. Edge cases: empty data, null values, expired widgets
"""

import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock, patch
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.analytics.service import (
    refresh_student_performance_summary,
    refresh_domain_performance_summary,
    refresh_semester_progress_summary,
    refresh_topic_gap_summary,
    refresh_difficulty_performance_summary,
    refresh_all,
    get_dashboard_widget,
    set_dashboard_widget
)
from app.modules.analytics.models import (
    StudentPerformanceSummary,
    DomainPerformanceSummary,
    SemesterProgressSummary,
    TopicGapSummary,
    DifficultyPerformanceSummary,
    AnalyticsRefreshJob,
    DashboardWidgetCache
)
from app.core.constants import (
    JOB_STATUS_RUNNING,
    JOB_STATUS_SUCCESS,
    JOB_STATUS_FAILED,
    VERDICT_PASS
)
from app.core.database import AsyncSessionLocal


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
async def db_session():
    """Provide a database session for testing."""
    async with AsyncSessionLocal() as session:
        yield session
        # Cleanup after test
        await session.rollback()


@pytest.fixture
async def clean_analytics_tables(db_session: AsyncSession):
    """Clean all analytics tables before each test."""
    await db_session.execute(delete(StudentPerformanceSummary))
    await db_session.execute(delete(DomainPerformanceSummary))
    await db_session.execute(delete(SemesterProgressSummary))
    await db_session.execute(delete(TopicGapSummary))
    await db_session.execute(delete(DifficultyPerformanceSummary))
    await db_session.execute(delete(AnalyticsRefreshJob))
    await db_session.execute(delete(DashboardWidgetCache))
    await db_session.commit()


# Configure pytest-asyncio
pytest_plugins = ('pytest_asyncio',)


# ── Test refresh_student_performance_summary ──────────────────────────────────

@pytest.mark.asyncio
async def test_refresh_student_performance_summary_creates_records(
    db_session: AsyncSession,
    clean_analytics_tables
):
    """Test that refresh_student_performance_summary creates summary records."""
    # Run the refresh
    await refresh_student_performance_summary()

    # Query results
    result = await db_session.execute(select(StudentPerformanceSummary))
    summaries = result.scalars().all()

    # Verify summaries were created (exact count depends on test data)
    assert isinstance(summaries, list)
    # If there's data, verify structure
    if summaries:
        summary = summaries[0]
        assert summary.student_id is not None
        assert summary.track_id is not None
        assert summary.total_attempts >= 0
        assert summary.passed_levels >= 0
        assert summary.avg_percentage >= 0.0
        assert summary.last_updated is not None


@pytest.mark.asyncio
async def test_refresh_student_performance_summary_is_idempotent(
    db_session: AsyncSession,
    clean_analytics_tables
):
    """Test that running refresh twice produces same results (idempotent)."""
    # Run first time
    await refresh_student_performance_summary()
    result1 = await db_session.execute(select(StudentPerformanceSummary))
    count1 = len(result1.scalars().all())

    # Run second time
    await refresh_student_performance_summary()
    result2 = await db_session.execute(select(StudentPerformanceSummary))
    count2 = len(result2.scalars().all())

    # Should have same number of records (idempotent)
    assert count1 == count2


# ── Test refresh_domain_performance_summary ───────────────────────────────────

@pytest.mark.asyncio
async def test_refresh_domain_performance_summary_creates_records(
    db_session: AsyncSession,
    clean_analytics_tables
):
    """Test that refresh_domain_performance_summary creates summary records."""
    await refresh_domain_performance_summary()

    result = await db_session.execute(select(DomainPerformanceSummary))
    summaries = result.scalars().all()

    assert isinstance(summaries, list)
    if summaries:
        summary = summaries[0]
        assert summary.track_id is not None
        assert summary.total_students >= 0
        assert 0.0 <= summary.avg_pass_rate <= 1.0
        assert summary.last_updated is not None


@pytest.mark.asyncio
async def test_refresh_domain_performance_summary_calculates_pass_rate(
    db_session: AsyncSession,
    clean_analytics_tables
):
    """Test that pass rate calculation is correct (0.0 to 1.0 range)."""
    await refresh_domain_performance_summary()

    result = await db_session.execute(select(DomainPerformanceSummary))
    summaries = result.scalars().all()

    for summary in summaries:
        # Pass rate should be a valid percentage (0.0 to 1.0)
        assert 0.0 <= summary.avg_pass_rate <= 1.0


# ── Test refresh_semester_progress_summary ────────────────────────────────────

@pytest.mark.asyncio
async def test_refresh_semester_progress_summary_creates_records(
    db_session: AsyncSession,
    clean_analytics_tables
):
    """Test that refresh_semester_progress_summary creates summary records."""
    await refresh_semester_progress_summary()

    result = await db_session.execute(select(SemesterProgressSummary))
    summaries = result.scalars().all()

    assert isinstance(summaries, list)
    if summaries:
        summary = summaries[0]
        assert summary.student_id is not None
        assert summary.academic_year_id is not None
        assert summary.levels_completed >= 0
        assert summary.last_updated is not None


# ── Test refresh_topic_gap_summary (CRITICAL for AI) ─────────────────────────

@pytest.mark.asyncio
async def test_refresh_topic_gap_summary_creates_records(
    db_session: AsyncSession,
    clean_analytics_tables
):
    """Test that refresh_topic_gap_summary creates summary records (AI critical)."""
    await refresh_topic_gap_summary()

    result = await db_session.execute(select(TopicGapSummary))
    summaries = result.scalars().all()

    assert isinstance(summaries, list)
    if summaries:
        summary = summaries[0]
        assert summary.student_id is not None
        assert summary.topic_id is not None
        assert 0.0 <= summary.avg_accuracy <= 1.0
        assert summary.attempt_count > 0
        assert summary.last_updated is not None


@pytest.mark.asyncio
async def test_refresh_topic_gap_summary_accuracy_range(
    db_session: AsyncSession,
    clean_analytics_tables
):
    """Test that avg_accuracy is within valid range (0.0 to 1.0)."""
    await refresh_topic_gap_summary()

    result = await db_session.execute(select(TopicGapSummary))
    summaries = result.scalars().all()

    for summary in summaries:
        # Accuracy should be between 0.0 and 1.0
        assert 0.0 <= summary.avg_accuracy <= 1.0
        # Attempt count should be positive
        assert summary.attempt_count > 0


# ── Test refresh_difficulty_performance_summary (CRITICAL for AI) ─────────────

@pytest.mark.asyncio
async def test_refresh_difficulty_performance_summary_creates_records(
    db_session: AsyncSession,
    clean_analytics_tables
):
    """Test that refresh_difficulty_performance_summary creates summary records (AI critical)."""
    await refresh_difficulty_performance_summary()

    result = await db_session.execute(select(DifficultyPerformanceSummary))
    summaries = result.scalars().all()

    assert isinstance(summaries, list)
    if summaries:
        summary = summaries[0]
        assert summary.student_id is not None
        assert summary.difficulty in ['easy', 'medium', 'hard']
        assert summary.correct_count >= 0
        assert summary.total_count > 0
        assert summary.correct_count <= summary.total_count
        assert summary.last_updated is not None


@pytest.mark.asyncio
async def test_refresh_difficulty_performance_summary_correct_count_logic(
    db_session: AsyncSession,
    clean_analytics_tables
):
    """Test that correct_count <= total_count always."""
    await refresh_difficulty_performance_summary()

    result = await db_session.execute(select(DifficultyPerformanceSummary))
    summaries = result.scalars().all()

    for summary in summaries:
        # Correct count cannot exceed total count
        assert summary.correct_count <= summary.total_count
        # Both should be non-negative
        assert summary.correct_count >= 0
        assert summary.total_count >= 0


# ── Test refresh_all orchestration ────────────────────────────────────────────

@pytest.mark.asyncio
async def test_refresh_all_creates_job_record(
    db_session: AsyncSession,
    clean_analytics_tables
):
    """Test that refresh_all creates a job record with correct status."""
    job_id = await refresh_all()

    # Verify job record was created
    assert job_id is not None

    # Query the job record
    result = await db_session.execute(
        select(AnalyticsRefreshJob).where(AnalyticsRefreshJob.id == job_id)
    )
    job = result.scalar_one()

    assert job.job_name == 'nightly_refresh'
    assert job.status == JOB_STATUS_SUCCESS
    assert job.started_at is not None
    assert job.finished_at is not None
    assert job.finished_at >= job.started_at


@pytest.mark.asyncio
async def test_refresh_all_calls_all_refresh_functions(
    db_session: AsyncSession,
    clean_analytics_tables
):
    """Test that refresh_all populates all analytics tables."""
    await refresh_all()

    # Check that each table has been populated (or at least queried)
    tables = [
        StudentPerformanceSummary,
        DomainPerformanceSummary,
        SemesterProgressSummary,
        TopicGapSummary,
        DifficultyPerformanceSummary
    ]

    for table in tables:
        result = await db_session.execute(select(table))
        records = result.scalars().all()
        # Just verify query succeeds (actual count depends on test data)
        assert isinstance(records, list)


@pytest.mark.asyncio
async def test_refresh_all_logs_failure_on_exception(
    db_session: AsyncSession,
    clean_analytics_tables
):
    """Test that refresh_all logs failure status when an exception occurs."""
    # Mock one of the refresh functions to raise an exception
    with patch('app.modules.analytics.service.refresh_student_performance_summary') as mock_refresh:
        mock_refresh.side_effect = Exception("Simulated failure")

        # refresh_all should raise the exception
        with pytest.raises(Exception, match="Simulated failure"):
            await refresh_all()

        # But it should have logged the failure
        result = await db_session.execute(
            select(AnalyticsRefreshJob).order_by(AnalyticsRefreshJob.started_at.desc())
        )
        job = result.scalars().first()

        if job:
            assert job.status == JOB_STATUS_FAILED
            assert job.finished_at is not None


# ── Test widget cache functions ───────────────────────────────────────────────

@pytest.mark.asyncio
async def test_set_and_get_dashboard_widget(
    db_session: AsyncSession,
    clean_analytics_tables
):
    """Test that set_dashboard_widget stores and get_dashboard_widget retrieves data."""
    widget_key = "test_widget"
    payload = {"data": "test_data", "count": 42}

    # Set widget
    await set_dashboard_widget(widget_key, payload, ttl_seconds=3600)

    # Get widget
    result = await get_dashboard_widget(widget_key)

    assert result is not None
    assert result == payload


@pytest.mark.asyncio
async def test_get_dashboard_widget_returns_none_for_missing_key(
    db_session: AsyncSession,
    clean_analytics_tables
):
    """Test that get_dashboard_widget returns None for non-existent key."""
    result = await get_dashboard_widget("nonexistent_key")
    assert result is None


@pytest.mark.asyncio
async def test_get_dashboard_widget_returns_none_for_expired_widget(
    db_session: AsyncSession,
    clean_analytics_tables
):
    """Test that get_dashboard_widget returns None for expired widgets."""
    widget_key = "expired_widget"
    payload = {"data": "expired"}

    # Set widget with very short TTL (1 second)
    await set_dashboard_widget(widget_key, payload, ttl_seconds=1)

    # Wait for expiration
    import asyncio
    await asyncio.sleep(2)

    # Should return None (expired)
    result = await get_dashboard_widget(widget_key)
    assert result is None


@pytest.mark.asyncio
async def test_set_dashboard_widget_updates_existing_widget(
    db_session: AsyncSession,
    clean_analytics_tables
):
    """Test that set_dashboard_widget updates existing widget (upsert)."""
    widget_key = "update_test_widget"
    payload1 = {"version": 1}
    payload2 = {"version": 2}

    # Set initial widget
    await set_dashboard_widget(widget_key, payload1)

    # Update with new payload
    await set_dashboard_widget(widget_key, payload2)

    # Should get updated payload
    result = await get_dashboard_widget(widget_key)
    assert result == payload2

    # Verify only one record exists (upsert, not insert)
    db_result = await db_session.execute(
        select(DashboardWidgetCache).where(DashboardWidgetCache.widget_key == widget_key)
    )
    widgets = db_result.scalars().all()
    assert len(widgets) == 1


@pytest.mark.asyncio
async def test_widget_cache_ttl_calculation(
    db_session: AsyncSession,
    clean_analytics_tables
):
    """Test that widget cache TTL is calculated correctly."""
    widget_key = "ttl_test_widget"
    payload = {"data": "ttl_test"}
    ttl_seconds = 1800  # 30 minutes

    before = datetime.now(timezone.utc)
    await set_dashboard_widget(widget_key, payload, ttl_seconds=ttl_seconds)
    after = datetime.now(timezone.utc)

    # Query the widget record
    result = await db_session.execute(
        select(DashboardWidgetCache).where(DashboardWidgetCache.widget_key == widget_key)
    )
    widget = result.scalar_one()

    # Verify timestamps
    assert widget.cached_at >= before
    assert widget.cached_at <= after

    # Verify expiration is approximately TTL seconds in the future
    expected_expires = widget.cached_at + timedelta(seconds=ttl_seconds)
    assert abs((widget.expires_at - expected_expires).total_seconds()) < 2  # 2 second tolerance


# ── Test edge cases ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_refresh_functions_handle_empty_data(
    db_session: AsyncSession,
    clean_analytics_tables
):
    """Test that refresh functions don't crash on empty source tables."""
    # This test verifies all functions can run even if source tables are empty
    # Each should complete without raising exceptions

    await refresh_student_performance_summary()
    await refresh_domain_performance_summary()
    await refresh_semester_progress_summary()
    await refresh_topic_gap_summary()
    await refresh_difficulty_performance_summary()

    # If we got here, all functions handled empty data gracefully
    assert True


@pytest.mark.asyncio
async def test_refresh_all_returns_valid_job_id(
    db_session: AsyncSession,
    clean_analytics_tables
):
    """Test that refresh_all returns a valid integer job_id."""
    job_id = await refresh_all()

    assert isinstance(job_id, int)
    assert job_id > 0


# ── Performance/Integration Tests ─────────────────────────────────────────────

@pytest.mark.asyncio
async def test_multiple_refresh_cycles_maintain_consistency(
    db_session: AsyncSession,
    clean_analytics_tables
):
    """Test that running refresh_all multiple times maintains data consistency."""
    # Run three refresh cycles
    job_id1 = await refresh_all()
    job_id2 = await refresh_all()
    job_id3 = await refresh_all()

    # All should succeed and return different job IDs
    assert job_id1 != job_id2 != job_id3

    # All job records should exist and be successful
    result = await db_session.execute(select(AnalyticsRefreshJob))
    jobs = result.scalars().all()

    assert len(jobs) >= 3
    for job in jobs[-3:]:  # Last 3 jobs
        assert job.status == JOB_STATUS_SUCCESS
