"""
app/modules/analytics/router.py
---------------------------------
Analytics module router — admin dashboard and summary data endpoints.

Provides endpoints for:
- Manual analytics refresh (admin only)
- Student performance summaries
- Domain performance summaries
- Topic gap analysis (skill gaps)
- Cached dashboard widgets
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.modules.analytics import service
from app.modules.analytics.models import (
    StudentPerformanceSummary,
    DomainPerformanceSummary,
    TopicGapSummary,
    AnalyticsRefreshJob
)
from app.modules.analytics.schemas import (
    StudentPerformanceSummaryResponse,
    DomainPerformanceSummaryResponse,
    TopicGapSummaryResponse,
    AnalyticsRefreshJobResponse,
    RefreshTriggerResponse
)

router = APIRouter()


# ── Health Check ──────────────────────────────────────────────────────────────

@router.get("/", summary="Analytics module health check")
async def analytics_root() -> dict:
    """Placeholder endpoint — confirms the analytics module is mounted."""
    return {"module": "analytics", "status": "ok"}


# ── Step 8: POST /analytics/refresh ───────────────────────────────────────────

@router.post(
    "/refresh",
    response_model=RefreshTriggerResponse,
    summary="Manually trigger analytics refresh",
    description="Triggers a full refresh of all analytics summary tables. Admin only."
)
async def trigger_analytics_refresh(
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
) -> RefreshTriggerResponse:
    """
    Manually trigger analytics refresh job.

    **Admin only endpoint.**

    Runs all refresh functions:
    - Student performance summary
    - Domain performance summary
    - Semester progress summary
    - Topic gap summary
    - Difficulty performance summary

    Returns the job ID for monitoring progress.
    """
    try:
        job_id = await service.refresh_all()

        return RefreshTriggerResponse(
            job_id=job_id,
            status="running",
            message=f"Analytics refresh job started with ID {job_id}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to trigger analytics refresh: {str(e)}"
        )


# ── Step 9: GET /analytics/student/{student_id} ───────────────────────────────

@router.get(
    "/student/{student_id}",
    response_model=List[StudentPerformanceSummaryResponse],
    summary="Get student performance summary",
    description="Returns performance summary for a student across all tracks."
)
async def get_student_performance(
    student_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[StudentPerformanceSummaryResponse]:
    """
    Get student performance summary across all tracks.

    Returns a list of performance summaries (one per track enrolled).

    **Authorization:**
    - Students can view their own data
    - Admins can view any student's data
    """
    # Authorization check: students can only view their own data
    if "admin" not in current_user.get("roles", []):
        # Get student record for current user
        from app.modules.users.models import Student
        user_id = current_user["id"]
        result = await db.execute(
            select(Student).where(Student.user_id == user_id)
        )
        student = result.scalar_one_or_none()

        if not student or student.id != student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own performance data"
            )

    # Query performance summaries
    result = await db.execute(
        select(StudentPerformanceSummary)
        .where(StudentPerformanceSummary.student_id == student_id)
    )
    summaries = result.scalars().all()

    if not summaries:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No performance data found for student {student_id}"
        )

    return [StudentPerformanceSummaryResponse.model_validate(s) for s in summaries]


# ── Step 10: GET /analytics/domain/{track_id} ─────────────────────────────────

@router.get(
    "/domain/{track_id}",
    response_model=DomainPerformanceSummaryResponse,
    summary="Get domain performance summary",
    description="Returns performance summary for a track (domain). Admin only."
)
async def get_domain_performance(
    track_id: int,
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
) -> DomainPerformanceSummaryResponse:
    """
    Get domain (track) performance summary.

    Returns aggregated performance metrics for all students in a track.

    **Admin only endpoint.**
    """
    result = await db.execute(
        select(DomainPerformanceSummary)
        .where(DomainPerformanceSummary.track_id == track_id)
    )
    summary = result.scalar_one_or_none()

    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No performance data found for track {track_id}"
        )

    return DomainPerformanceSummaryResponse.model_validate(summary)


# ── Step 11: GET /analytics/topic-gaps/{student_id} ───────────────────────────

@router.get(
    "/topic-gaps/{student_id}",
    response_model=List[TopicGapSummaryResponse],
    summary="Get topic gap analysis for student",
    description="Returns skill gap analysis showing weak topics for a student."
)
async def get_topic_gaps(
    student_id: int,
    min_accuracy: float = 0.0,
    max_accuracy: float = 1.0,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[TopicGapSummaryResponse]:
    """
    Get topic gap analysis for a student.

    Returns topics where the student has below-threshold accuracy,
    useful for identifying skill gaps and areas needing improvement.

    **Query Parameters:**
    - `min_accuracy`: Filter topics with accuracy >= this value (default: 0.0)
    - `max_accuracy`: Filter topics with accuracy <= this value (default: 1.0)

    **Authorization:**
    - Students can view their own data
    - Admins can view any student's data

    **Used by:** Frontend skill gap visualization, AI question generation
    """
    # Authorization check: students can only view their own data
    if "admin" not in current_user.get("roles", []):
        from app.modules.users.models import Student
        user_id = current_user["id"]
        result = await db.execute(
            select(Student).where(Student.user_id == user_id)
        )
        student = result.scalar_one_or_none()

        if not student or student.id != student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own topic gap data"
            )

    # Query topic gaps with optional filtering
    query = select(TopicGapSummary).where(
        TopicGapSummary.student_id == student_id,
        TopicGapSummary.avg_accuracy >= min_accuracy,
        TopicGapSummary.avg_accuracy <= max_accuracy
    ).order_by(TopicGapSummary.avg_accuracy.asc())  # Weakest topics first

    result = await db.execute(query)
    gaps = result.scalars().all()

    if not gaps:
        # Return empty list instead of 404 (student may have no gaps)
        return []

    return [TopicGapSummaryResponse.model_validate(g) for g in gaps]


# ── Step 12: GET /analytics/dashboard/{widget_key} ────────────────────────────

@router.get(
    "/dashboard/{widget_key}",
    response_model=dict,
    summary="Get cached dashboard widget",
    description="Returns pre-computed dashboard widget data from cache. Admin only."
)
async def get_dashboard_widget_endpoint(
    widget_key: str,
    current_user: dict = Depends(require_admin),
) -> dict:
    """
    Get cached dashboard widget data.

    Returns pre-computed widget payload if cached and not expired.

    **Admin only endpoint.**

    **Common widget keys:**
    - `top_performers`: List of top-performing students
    - `track_overview`: Track-level statistics
    - `recent_completions`: Recently completed levels

    **Returns:** Widget payload as JSON dict, or 404 if not found/expired
    """
    payload = await service.get_dashboard_widget(widget_key)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Widget '{widget_key}' not found or expired"
        )

    return payload


# ── Additional Utility Endpoints ──────────────────────────────────────────────

@router.get(
    "/jobs/recent",
    response_model=List[AnalyticsRefreshJobResponse],
    summary="Get recent refresh jobs",
    description="Returns list of recent analytics refresh jobs. Admin only."
)
async def get_recent_refresh_jobs(
    limit: int = 10,
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
) -> List[AnalyticsRefreshJobResponse]:
    """
    Get recent analytics refresh job history.

    **Admin only endpoint.**

    Useful for monitoring analytics refresh status and troubleshooting failures.
    """
    result = await db.execute(
        select(AnalyticsRefreshJob)
        .order_by(AnalyticsRefreshJob.started_at.desc())
        .limit(limit)
    )
    jobs = result.scalars().all()

    return [AnalyticsRefreshJobResponse.model_validate(j) for j in jobs]
