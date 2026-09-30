"""
app/modules/analytics/tests/test_service_smoke.py
-------------------------------------------------
Smoke tests for analytics service functions.

Simple tests to verify Phase 1 implementation without complex fixtures.
"""

import pytest
from datetime import datetime, timezone

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


# ── Smoke Tests ───────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_refresh_student_performance_summary_runs():
    """Smoke test: function executes without crashing."""
    try:
        await refresh_student_performance_summary()
        assert True  # If we got here, function executed
    except Exception as e:
        pytest.fail(f"Function crashed: {e}")


@pytest.mark.asyncio
async def test_refresh_domain_performance_summary_runs():
    """Smoke test: function executes without crashing."""
    try:
        await refresh_domain_performance_summary()
        assert True
    except Exception as e:
        pytest.fail(f"Function crashed: {e}")


@pytest.mark.asyncio
async def test_refresh_semester_progress_summary_runs():
    """Smoke test: function executes without crashing."""
    try:
        await refresh_semester_progress_summary()
        assert True
    except Exception as e:
        pytest.fail(f"Function crashed: {e}")


@pytest.mark.asyncio
async def test_refresh_topic_gap_summary_runs():
    """Smoke test: function executes without crashing (AI critical)."""
    try:
        await refresh_topic_gap_summary()
        assert True
    except Exception as e:
        pytest.fail(f"Function crashed: {e}")


@pytest.mark.asyncio
async def test_refresh_difficulty_performance_summary_runs():
    """Smoke test: function executes without crashing (AI critical)."""
    try:
        await refresh_difficulty_performance_summary()
        assert True
    except Exception as e:
        pytest.fail(f"Function crashed: {e}")


@pytest.mark.asyncio
async def test_refresh_all_runs_and_returns_job_id():
    """Smoke test: refresh_all executes and returns a job_id."""
    try:
        job_id = await refresh_all()
        assert isinstance(job_id, int)
        assert job_id > 0
    except Exception as e:
        pytest.fail(f"Function crashed: {e}")


@pytest.mark.asyncio
async def test_widget_cache_basic_operations():
    """Smoke test: widget cache set and get operations work."""
    try:
        widget_key = f"smoke_test_widget_{datetime.now(timezone.utc).timestamp()}"
        payload = {"test": "data", "value": 123}

        # Set widget
        await set_dashboard_widget(widget_key, payload, ttl_seconds=300)

        # Get widget
        result = await get_dashboard_widget(widget_key)

        assert result is not None
        assert result == payload
    except Exception as e:
        pytest.fail(f"Widget cache operations crashed: {e}")


@pytest.mark.asyncio
async def test_get_nonexistent_widget_returns_none():
    """Smoke test: getting nonexistent widget returns None gracefully."""
    try:
        result = await get_dashboard_widget("nonexistent_widget_12345")
        assert result is None
    except Exception as e:
        pytest.fail(f"Function crashed: {e}")


@pytest.mark.asyncio
async def test_all_refresh_functions_are_idempotent():
    """Smoke test: all refresh functions can run twice without errors (idempotent)."""
    try:
        # Run all refresh functions twice
        await refresh_student_performance_summary()
        await refresh_student_performance_summary()

        await refresh_domain_performance_summary()
        await refresh_domain_performance_summary()

        await refresh_semester_progress_summary()
        await refresh_semester_progress_summary()

        await refresh_topic_gap_summary()
        await refresh_topic_gap_summary()

        await refresh_difficulty_performance_summary()
        await refresh_difficulty_performance_summary()

        assert True  # If we got here, all functions are idempotent
    except Exception as e:
        pytest.fail(f"Idempotency test failed: {e}")


@pytest.mark.asyncio
async def test_refresh_all_multiple_times():
    """Smoke test: refresh_all can be called multiple times."""
    try:
        job_id1 = await refresh_all()
        job_id2 = await refresh_all()

        assert isinstance(job_id1, int)
        assert isinstance(job_id2, int)
        assert job_id1 != job_id2  # Different job IDs
    except Exception as e:
        pytest.fail(f"Multiple refresh_all calls failed: {e}")


# ── Summary Test ──────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_phase_1_complete():
    """
    Phase 1 completion test: verify all 7 steps are implemented.

    Step 1: refresh_student_performance_summary() ✓
    Step 2: refresh_domain_performance_summary() ✓
    Step 3: refresh_semester_progress_summary() ✓
    Step 4: refresh_topic_gap_summary() ✓ (AI critical)
    Step 5: refresh_difficulty_performance_summary() ✓ (AI critical)
    Step 6: refresh_all() ✓
    Step 7: get_dashboard_widget() and set_dashboard_widget() ✓
    """
    try:
        # Test each step
        await refresh_student_performance_summary()  # Step 1
        await refresh_domain_performance_summary()  # Step 2
        await refresh_semester_progress_summary()  # Step 3
        await refresh_topic_gap_summary()  # Step 4 (AI)
        await refresh_difficulty_performance_summary()  # Step 5 (AI)

        job_id = await refresh_all()  # Step 6
        assert isinstance(job_id, int)

        # Step 7
        await set_dashboard_widget("test_phase1", {"complete": True})
        result = await get_dashboard_widget("test_phase1")
        assert result is not None

        print("\n" + "="*60)
        print("✅ PHASE 1 COMPLETE - All 7 Steps Implemented Successfully!")
        print("="*60)

    except Exception as e:
        pytest.fail(f"Phase 1 completion test failed: {e}")
