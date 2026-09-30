"""
app/modules/analytics/tests/test_router.py
-------------------------------------------
Unit tests for analytics router endpoints.

Tests verify:
  1. Endpoint registration and routing
  2. Authorization logic (admin vs student access)
  3. Response schema validation
  4. Error handling (404, 403, 500)
  5. Query parameter handling
  6. Service layer integration
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException, status
from datetime import datetime, timezone

from app.modules.analytics.router import (
    trigger_analytics_refresh,
    get_student_performance,
    get_domain_performance,
    get_topic_gaps,
    get_dashboard_widget_endpoint,
    get_recent_refresh_jobs
)
from app.modules.analytics.schemas import (
    RefreshTriggerResponse,
    StudentPerformanceSummaryResponse,
    DomainPerformanceSummaryResponse,
    TopicGapSummaryResponse
)


# ── Test Step 8: POST /analytics/refresh ─────────────────────────────────────

@pytest.mark.asyncio
async def test_trigger_analytics_refresh_success():
    """Test successful refresh trigger returns job ID."""
    # Mock dependencies
    mock_admin_user = {"id": 1, "roles": ["admin"]}
    mock_db = MagicMock()

    # Mock service.refresh_all to return job_id
    with patch('app.modules.analytics.router.service.refresh_all', new_callable=AsyncMock) as mock_refresh:
        mock_refresh.return_value = 123

        # Call endpoint
        response = await trigger_analytics_refresh(
            current_user=mock_admin_user,
            db=mock_db
        )

        # Assertions
        assert isinstance(response, RefreshTriggerResponse)
        assert response.job_id == 123
        assert response.status == "running"
        assert "123" in response.message
        mock_refresh.assert_called_once()


@pytest.mark.asyncio
async def test_trigger_analytics_refresh_handles_errors():
    """Test refresh trigger handles service errors properly."""
    mock_admin_user = {"id": 1, "roles": ["admin"]}
    mock_db = MagicMock()

    with patch('app.modules.analytics.router.service.refresh_all', new_callable=AsyncMock) as mock_refresh:
        mock_refresh.side_effect = Exception("Database error")

        # Should raise HTTPException with 500 status
        with pytest.raises(HTTPException) as exc_info:
            await trigger_analytics_refresh(
                current_user=mock_admin_user,
                db=mock_db
            )

        assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "Failed to trigger analytics refresh" in exc_info.value.detail


# ── Test Step 9: GET /analytics/student/{student_id} ─────────────────────────

@pytest.mark.asyncio
async def test_get_student_performance_admin_access():
    """Test admin can access any student's performance data."""
    mock_admin_user = {"id": 1, "roles": ["admin"], "user": MagicMock()}
    mock_db = AsyncMock()

    # Mock database result
    mock_summary = MagicMock()
    mock_summary.student_id = 5
    mock_summary.track_id = 1
    mock_summary.total_attempts = 10
    mock_summary.passed_levels = 7
    mock_summary.avg_percentage = 85.5
    mock_summary.last_updated = datetime.now(timezone.utc)

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [mock_summary]
    mock_db.execute = AsyncMock(return_value=mock_result)

    # Call endpoint
    response = await get_student_performance(
        student_id=5,
        current_user=mock_admin_user,
        db=mock_db
    )

    # Assertions
    assert isinstance(response, list)
    assert len(response) == 1
    assert response[0].student_id == 5


@pytest.mark.asyncio
async def test_get_student_performance_student_own_data():
    """Test student can access their own performance data."""
    # Mock student user
    mock_student_user = {"id": 10, "roles": ["student"]}
    mock_db = AsyncMock()

    # Mock student record lookup
    mock_student = MagicMock()
    mock_student.id = 5
    mock_student.user_id = 10

    mock_student_result = MagicMock()
    mock_student_result.scalar_one_or_none.return_value = mock_student

    # Mock performance summary
    mock_summary = MagicMock()
    mock_summary.student_id = 5
    mock_summary.track_id = 1
    mock_summary.total_attempts = 8
    mock_summary.passed_levels = 5
    mock_summary.avg_percentage = 75.0
    mock_summary.last_updated = datetime.now(timezone.utc)

    mock_perf_result = MagicMock()
    mock_perf_result.scalars.return_value.all.return_value = [mock_summary]

    # Setup db.execute to return different results for different queries
    mock_db.execute = AsyncMock(side_effect=[mock_student_result, mock_perf_result])

    # Call endpoint
    response = await get_student_performance(
        student_id=5,
        current_user=mock_student_user,
        db=mock_db
    )

    # Assertions
    assert isinstance(response, list)
    assert len(response) == 1


@pytest.mark.asyncio
async def test_get_student_performance_student_forbidden():
    """Test student cannot access another student's data."""
    mock_student_user = {"id": 10, "roles": ["student"]}
    mock_db = AsyncMock()

    # Mock student record - different student
    mock_student = MagicMock()
    mock_student.id = 5
    mock_student.user_id = 10  # This user's student ID

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_student
    mock_db.execute = AsyncMock(return_value=mock_result)

    # Try to access different student's data (student_id=99)
    with pytest.raises(HTTPException) as exc_info:
        await get_student_performance(
            student_id=99,  # Different student
            current_user=mock_student_user,
            db=mock_db
        )

    assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN
    assert "own performance data" in exc_info.value.detail


@pytest.mark.asyncio
async def test_get_student_performance_not_found():
    """Test 404 when no performance data exists."""
    mock_admin_user = {"id": 1, "roles": ["admin"]}
    mock_db = AsyncMock()

    # Mock empty result
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    mock_db.execute = AsyncMock(return_value=mock_result)

    with pytest.raises(HTTPException) as exc_info:
        await get_student_performance(
            student_id=999,
            current_user=mock_admin_user,
            db=mock_db
        )

    assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
    assert "No performance data found" in exc_info.value.detail


# ── Test Step 10: GET /analytics/domain/{track_id} ───────────────────────────

@pytest.mark.asyncio
async def test_get_domain_performance_success():
    """Test successful domain performance retrieval."""
    mock_admin_user = {"id": 1, "roles": ["admin"]}
    mock_db = AsyncMock()

    # Mock domain summary
    mock_summary = MagicMock()
    mock_summary.track_id = 1
    mock_summary.total_students = 45
    mock_summary.avg_pass_rate = 0.78
    mock_summary.last_updated = datetime.now(timezone.utc)

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_summary
    mock_db.execute = AsyncMock(return_value=mock_result)

    # Call endpoint
    response = await get_domain_performance(
        track_id=1,
        current_user=mock_admin_user,
        db=mock_db
    )

    # Assertions
    assert isinstance(response, DomainPerformanceSummaryResponse)
    assert response.track_id == 1
    assert response.total_students == 45
    assert 0.0 <= response.avg_pass_rate <= 1.0


@pytest.mark.asyncio
async def test_get_domain_performance_not_found():
    """Test 404 when track has no performance data."""
    mock_admin_user = {"id": 1, "roles": ["admin"]}
    mock_db = AsyncMock()

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute = AsyncMock(return_value=mock_result)

    with pytest.raises(HTTPException) as exc_info:
        await get_domain_performance(
            track_id=999,
            current_user=mock_admin_user,
            db=mock_db
        )

    assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND


# ── Test Step 11: GET /analytics/topic-gaps/{student_id} ─────────────────────

@pytest.mark.asyncio
async def test_get_topic_gaps_with_filtering():
    """Test topic gap retrieval with accuracy filtering."""
    mock_admin_user = {"id": 1, "roles": ["admin"]}
    mock_db = AsyncMock()

    # Mock topic gaps
    mock_gap1 = MagicMock()
    mock_gap1.student_id = 1
    mock_gap1.topic_id = 10
    mock_gap1.avg_accuracy = 0.45
    mock_gap1.attempt_count = 3
    mock_gap1.last_updated = datetime.now(timezone.utc)

    mock_gap2 = MagicMock()
    mock_gap2.student_id = 1
    mock_gap2.topic_id = 15
    mock_gap2.avg_accuracy = 0.38
    mock_gap2.attempt_count = 2
    mock_gap2.last_updated = datetime.now(timezone.utc)

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [mock_gap1, mock_gap2]
    mock_db.execute = AsyncMock(return_value=mock_result)

    # Call endpoint with filtering
    response = await get_topic_gaps(
        student_id=1,
        min_accuracy=0.0,
        max_accuracy=0.5,
        current_user=mock_admin_user,
        db=mock_db
    )

    # Assertions
    assert isinstance(response, list)
    assert len(response) == 2
    assert all(isinstance(gap, TopicGapSummaryResponse) for gap in response)
    assert response[0].student_id == 1


@pytest.mark.asyncio
async def test_get_topic_gaps_empty_result():
    """Test topic gaps returns empty list when no gaps found."""
    mock_admin_user = {"id": 1, "roles": ["admin"]}
    mock_db = AsyncMock()

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    mock_db.execute = AsyncMock(return_value=mock_result)

    # Should return empty list, not 404
    response = await get_topic_gaps(
        student_id=1,
        current_user=mock_admin_user,
        db=mock_db
    )

    assert response == []


@pytest.mark.asyncio
async def test_get_topic_gaps_student_authorization():
    """Test student can only access their own topic gaps."""
    mock_student_user = {"id": 10, "roles": ["student"]}
    mock_db = AsyncMock()

    # Mock student record - different student
    mock_student = MagicMock()
    mock_student.id = 5
    mock_student.user_id = 10

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_student
    mock_db.execute = AsyncMock(return_value=mock_result)

    # Try to access different student's gaps
    with pytest.raises(HTTPException) as exc_info:
        await get_topic_gaps(
            student_id=99,
            current_user=mock_student_user,
            db=mock_db
        )

    assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN


# ── Test Step 12: GET /analytics/dashboard/{widget_key} ──────────────────────

@pytest.mark.asyncio
async def test_get_dashboard_widget_success():
    """Test successful widget retrieval."""
    mock_admin_user = {"id": 1, "roles": ["admin"]}

    mock_payload = {
        "top_performers": [
            {"name": "Student A", "score": 95},
            {"name": "Student B", "score": 90}
        ]
    }

    with patch('app.modules.analytics.router.service.get_dashboard_widget', new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_payload

        response = await get_dashboard_widget_endpoint(
            widget_key="top_performers",
            current_user=mock_admin_user
        )

        assert response == mock_payload
        mock_get.assert_called_once_with("top_performers")


@pytest.mark.asyncio
async def test_get_dashboard_widget_not_found():
    """Test 404 when widget not found or expired."""
    mock_admin_user = {"id": 1, "roles": ["admin"]}

    with patch('app.modules.analytics.router.service.get_dashboard_widget', new_callable=AsyncMock) as mock_get:
        mock_get.return_value = None

        with pytest.raises(HTTPException) as exc_info:
            await get_dashboard_widget_endpoint(
                widget_key="nonexistent",
                current_user=mock_admin_user
            )

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert "not found or expired" in exc_info.value.detail


# ── Test Bonus: GET /analytics/jobs/recent ───────────────────────────────────

@pytest.mark.asyncio
async def test_get_recent_refresh_jobs():
    """Test retrieval of recent refresh jobs."""
    mock_admin_user = {"id": 1, "roles": ["admin"]}
    mock_db = AsyncMock()

    # Mock job records
    mock_job1 = MagicMock()
    mock_job1.id = 1
    mock_job1.job_name = "nightly_refresh"
    mock_job1.started_at = datetime.now(timezone.utc)
    mock_job1.finished_at = datetime.now(timezone.utc)
    mock_job1.status = "success"

    mock_job2 = MagicMock()
    mock_job2.id = 2
    mock_job2.job_name = "nightly_refresh"
    mock_job2.started_at = datetime.now(timezone.utc)
    mock_job2.finished_at = None
    mock_job2.status = "running"

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [mock_job1, mock_job2]
    mock_db.execute = AsyncMock(return_value=mock_result)

    response = await get_recent_refresh_jobs(
        limit=10,
        current_user=mock_admin_user,
        db=mock_db
    )

    assert isinstance(response, list)
    assert len(response) == 2
    assert response[0].status in ["running", "success", "failed"]


# ── Schema Validation Tests ──────────────────────────────────────────────────

def test_student_performance_summary_response_schema():
    """Test StudentPerformanceSummaryResponse schema validation."""
    data = {
        "student_id": 1,
        "track_id": 5,
        "total_attempts": 10,
        "passed_levels": 7,
        "avg_percentage": 85.5,
        "last_updated": datetime.now(timezone.utc)
    }

    schema = StudentPerformanceSummaryResponse(**data)
    assert schema.student_id == 1
    assert schema.avg_percentage == 85.5


def test_student_performance_summary_validates_percentage_range():
    """Test schema validates percentage is within 0-100."""
    data = {
        "student_id": 1,
        "track_id": 5,
        "total_attempts": 10,
        "passed_levels": 7,
        "avg_percentage": 150.0,  # Invalid: > 100
        "last_updated": datetime.now(timezone.utc)
    }

    with pytest.raises(Exception):  # Pydantic ValidationError
        StudentPerformanceSummaryResponse(**data)


def test_topic_gap_summary_response_schema():
    """Test TopicGapSummaryResponse schema validation."""
    data = {
        "student_id": 1,
        "topic_id": 10,
        "avg_accuracy": 0.45,
        "attempt_count": 3,
        "last_updated": datetime.now(timezone.utc)
    }

    schema = TopicGapSummaryResponse(**data)
    assert schema.avg_accuracy == 0.45
    assert 0.0 <= schema.avg_accuracy <= 1.0


def test_domain_performance_summary_response_schema():
    """Test DomainPerformanceSummaryResponse schema validation."""
    data = {
        "track_id": 1,
        "total_students": 45,
        "avg_pass_rate": 0.78,
        "last_updated": datetime.now(timezone.utc)
    }

    schema = DomainPerformanceSummaryResponse(**data)
    assert schema.total_students == 45
    assert 0.0 <= schema.avg_pass_rate <= 1.0


# ── Integration Test Markers ─────────────────────────────────────────────────

@pytest.mark.integration
@pytest.mark.asyncio
async def test_full_student_performance_workflow():
    """
    Integration test: Verify complete workflow for student performance.

    This test would require a live database and is marked as integration.
    Run with: pytest -m integration
    """
    # This would test with real database
    pass


@pytest.mark.integration
@pytest.mark.asyncio
async def test_analytics_refresh_end_to_end():
    """
    Integration test: Verify complete refresh workflow.

    Would test:
    1. Trigger refresh via POST /analytics/refresh
    2. Wait for completion
    3. Query results via GET endpoints
    4. Verify data consistency
    """
    pass
