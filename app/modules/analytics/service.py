"""
app/modules/analytics/service.py
----------------------------------
Business logic for analytics refresh jobs and dashboard widget cache.

Nightly/periodic jobs recompute all summary tables and update widget cache.
All refresh functions are idempotent (upsert pattern).

Cross-module calls: reads raw data from attempt, result, topic_result tables
via service layer only (no direct model imports from other modules).

TODO: implement refresh_domain_performance_summary()  — upsert per track
TODO: implement refresh_semester_progress_summary()   — upsert per student+year
TODO: implement refresh_topic_gap_summary()            — upsert per student+topic
TODO: implement refresh_difficulty_performance_summary() — upsert per student+difficulty
TODO: implement refresh_all() — runs all refresh functions, logs job status
TODO: implement get_dashboard_widget(widget_key) → dict | None
      — return cached payload if not expired
TODO: implement set_dashboard_widget(widget_key, payload, ttl_seconds)
      — upsert widget cache entry with expires_at
"""

from datetime import datetime, timezone, timedelta
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import (
    JOB_STATUS_RUNNING,
    JOB_STATUS_SUCCESS,
    JOB_STATUS_FAILED,
    VERDICT_PASS
)
from app.core.database import AsyncSessionLocal
from app.modules.analytics.models import (
    StudentPerformanceSummary,
    DomainPerformanceSummary,
    SemesterProgressSummary,
    TopicGapSummary,
    DifficultyPerformanceSummary,
    AnalyticsRefreshJob,
    DashboardWidgetCache
)
from app.modules.attempts.models import Attempt, Result, TopicResult, AttemptAnswer
from app.modules.progress.models import LevelProgress, Enrollment
from app.modules.domains.models import Level
from app.modules.exams.models import Assessment
from app.modules.users.models import Student
from app.modules.ai_engine.models import Question, QuestionOption


async def refresh_student_performance_summary() -> None:
    """
    Recompute and upsert student_performance_summary for all students.

    Aggregates data from:
    - attempts: count total attempts per student+track
    - results: calculate average percentage per student+track
    - level_progress: count passed levels per student+track

    Uses delete + insert pattern for idempotency.
    """
    async with AsyncSessionLocal() as db:
        # Build aggregated query
        # Join: Attempt -> Assessment -> Level to get track_id
        # Join: Attempt -> Result to get percentage
        # Join: Enrollment -> LevelProgress to count passed levels

        query = select(
            Attempt.student_id,
            Level.track_id,
            func.count(Attempt.id).label('total_attempts'),
            func.avg(Result.percentage).label('avg_percentage')
        ).select_from(Attempt)\
         .join(Result, Result.attempt_id == Attempt.id)\
         .join(Assessment, Assessment.id == Attempt.assessment_id)\
         .join(Level, Level.id == Assessment.level_id)\
         .group_by(Attempt.student_id, Level.track_id)

        result = await db.execute(query)
        aggregated_data = result.all()

        # For each student+track, count passed levels
        summary_records = []
        for row in aggregated_data:
            student_id = row.student_id
            track_id = row.track_id
            total_attempts = row.total_attempts
            avg_percentage = row.avg_percentage or 0.0

            # Count passed levels for this student+track
            passed_query = select(func.count(LevelProgress.id))\
                .select_from(LevelProgress)\
                .join(Enrollment, Enrollment.id == LevelProgress.enrollment_id)\
                .join(Level, Level.id == LevelProgress.level_id)\
                .where(
                    Enrollment.student_id == student_id,
                    Level.track_id == track_id,
                    LevelProgress.status == 'passed'
                )

            passed_result = await db.execute(passed_query)
            passed_levels = passed_result.scalar() or 0

            # Create summary record
            summary = StudentPerformanceSummary(
                student_id=student_id,
                track_id=track_id,
                total_attempts=total_attempts,
                passed_levels=passed_levels,
                avg_percentage=avg_percentage,
                last_updated=datetime.now(timezone.utc)
            )
            summary_records.append(summary)

        # Delete existing records (upsert pattern)
        await db.execute(delete(StudentPerformanceSummary))

        # Insert new records
        if summary_records:
            db.add_all(summary_records)

        await db.commit()


async def refresh_domain_performance_summary() -> None:
    """
    Recompute and upsert domain_performance_summary for all tracks.

    Aggregates data from:
    - enrollments: count distinct students per track
    - results: calculate pass rate per track
    - attempts: link results to tracks via assessments

    Uses delete + insert pattern for idempotency.
    """
    async with AsyncSessionLocal() as db:
        # Build aggregated query
        # Join: Enrollment -> Track to get all tracks
        # Count distinct students per track from enrollments
        # Calculate pass rate from Results via Attempt -> Assessment -> Level -> Track

        # First, get all tracks with student counts
        enrollment_query = select(
            Enrollment.track_id,
            func.count(func.distinct(Enrollment.student_id)).label('total_students')
        ).select_from(Enrollment)\
         .group_by(Enrollment.track_id)

        enrollment_result = await db.execute(enrollment_query)
        track_student_counts = {row.track_id: row.total_students for row in enrollment_result.all()}

        # Calculate pass rates per track
        # Join: Result -> Attempt -> Assessment -> Level to get track_id
        pass_rate_query = select(
            Level.track_id,
            func.count(Result.id).label('total_results'),
            func.sum(func.case((Result.verdict == VERDICT_PASS, 1), else_=0)).label('passed_results')
        ).select_from(Result)\
         .join(Attempt, Attempt.id == Result.attempt_id)\
         .join(Assessment, Assessment.id == Attempt.assessment_id)\
         .join(Level, Level.id == Assessment.level_id)\
         .group_by(Level.track_id)

        pass_rate_result = await db.execute(pass_rate_query)
        pass_rate_data = pass_rate_result.all()

        # Create summary records
        summary_records = []
        for row in pass_rate_data:
            track_id = row.track_id
            total_results = row.total_results or 0
            passed_results = row.passed_results or 0

            # Calculate average pass rate
            avg_pass_rate = (passed_results / total_results) if total_results > 0 else 0.0

            # Get student count for this track
            total_students = track_student_counts.get(track_id, 0)

            # Create summary record
            summary = DomainPerformanceSummary(
                track_id=track_id,
                total_students=total_students,
                avg_pass_rate=avg_pass_rate,
                last_updated=datetime.now(timezone.utc)
            )
            summary_records.append(summary)

        # Delete existing records (upsert pattern)
        await db.execute(delete(DomainPerformanceSummary))

        # Insert new records
        if summary_records:
            db.add_all(summary_records)

        await db.commit()


async def refresh_semester_progress_summary() -> None:
    """
    Recompute and upsert semester_progress_summary per student per year.

    Aggregates data from:
    - level_progress: count completed levels per student
    - students: get academic_year_id for each student
    - enrollments: link students to their progress

    Uses delete + insert pattern for idempotency.
    """
    async with AsyncSessionLocal() as db:
        # Build aggregated query
        # Join: LevelProgress -> Enrollment -> Student to get academic_year_id
        # Count levels where status = 'passed'
        # Group by student_id + academic_year_id

        query = select(
            Student.id.label('student_id'),
            Student.academic_year_id,
            func.count(LevelProgress.id).label('levels_completed')
        ).select_from(LevelProgress)\
         .join(Enrollment, Enrollment.id == LevelProgress.enrollment_id)\
         .join(Student, Student.id == Enrollment.student_id)\
         .where(LevelProgress.status == 'passed')\
         .group_by(Student.id, Student.academic_year_id)

        result = await db.execute(query)
        aggregated_data = result.all()

        # Create summary records
        summary_records = []
        for row in aggregated_data:
            summary = SemesterProgressSummary(
                student_id=row.student_id,
                academic_year_id=row.academic_year_id,
                levels_completed=row.levels_completed,
                last_updated=datetime.now(timezone.utc)
            )
            summary_records.append(summary)

        # Delete existing records (upsert pattern)
        await db.execute(delete(SemesterProgressSummary))

        # Insert new records
        if summary_records:
            db.add_all(summary_records)

        await db.commit()


async def refresh_topic_gap_summary() -> None:
    """
    Recompute and upsert topic_gap_summary from topic_results.

    Aggregates data from:
    - topic_results: calculate average accuracy per student+topic
    - topic_results: count attempts per student+topic

    This table is CRITICAL for ai_engine/skill_gap.py to identify weak topics.

    Uses delete + insert pattern for idempotency.
    """
    async with AsyncSessionLocal() as db:
        # Build aggregated query
        # Join: TopicResult -> Result -> Attempt to get student_id
        # Group by student_id + topic_id
        # Calculate average accuracy and count attempts

        query = select(
            Attempt.student_id,
            TopicResult.topic_id,
            func.avg(TopicResult.accuracy).label('avg_accuracy'),
            func.count(TopicResult.id).label('attempt_count')
        ).select_from(TopicResult)\
         .join(Result, Result.id == TopicResult.result_id)\
         .join(Attempt, Attempt.id == Result.attempt_id)\
         .group_by(Attempt.student_id, TopicResult.topic_id)

        result = await db.execute(query)
        aggregated_data = result.all()

        # Create summary records
        summary_records = []
        for row in aggregated_data:
            summary = TopicGapSummary(
                student_id=row.student_id,
                topic_id=row.topic_id,
                avg_accuracy=row.avg_accuracy or 0.0,
                attempt_count=row.attempt_count,
                last_updated=datetime.now(timezone.utc)
            )
            summary_records.append(summary)

        # Delete existing records (upsert pattern)
        await db.execute(delete(TopicGapSummary))

        # Insert new records
        if summary_records:
            db.add_all(summary_records)

        await db.commit()


async def refresh_difficulty_performance_summary() -> None:
    """
    Recompute difficulty_performance_summary from attempt_answers + question difficulty.

    Aggregates data from:
    - attempt_answers: all student answers
    - questions: get difficulty level for each question
    - question_options: check if selected answer was correct
    - attempts: link to student_id

    This table is CRITICAL for ai_engine/difficulty.py to select adaptive difficulty.

    Uses delete + insert pattern for idempotency.
    """
    async with AsyncSessionLocal() as db:
        # Build aggregated query
        # Join: AttemptAnswer -> Attempt to get student_id
        # Join: AttemptAnswer -> Question to get difficulty
        # Join: AttemptAnswer -> QuestionOption to check is_correct
        # Group by student_id + difficulty
        # Count correct answers and total answers

        query = select(
            Attempt.student_id,
            Question.difficulty,
            func.count(AttemptAnswer.id).label('total_count'),
            func.sum(func.case((QuestionOption.is_correct == True, 1), else_=0)).label('correct_count')
        ).select_from(AttemptAnswer)\
         .join(Attempt, Attempt.id == AttemptAnswer.attempt_id)\
         .join(Question, Question.id == AttemptAnswer.question_id)\
         .join(QuestionOption, QuestionOption.id == AttemptAnswer.selected_option_id)\
         .group_by(Attempt.student_id, Question.difficulty)

        result = await db.execute(query)
        aggregated_data = result.all()

        # Create summary records
        summary_records = []
        for row in aggregated_data:
            summary = DifficultyPerformanceSummary(
                student_id=row.student_id,
                difficulty=row.difficulty,
                correct_count=row.correct_count or 0,
                total_count=row.total_count,
                last_updated=datetime.now(timezone.utc)
            )
            summary_records.append(summary)

        # Delete existing records (upsert pattern)
        await db.execute(delete(DifficultyPerformanceSummary))

        # Insert new records
        if summary_records:
            db.add_all(summary_records)

        await db.commit()


async def refresh_all() -> int:
    """
    Run all refresh functions. Logs start/finish to analytics_refresh_jobs.
    Called by the nightly scheduled job.

    Returns:
        job_id: ID of the analytics_refresh_jobs record for monitoring

    Raises:
        Exception: Re-raises any exception after logging failure to job table
    """
    async with AsyncSessionLocal() as db:
        # Create job record with status='running'
        job = AnalyticsRefreshJob(
            job_name='nightly_refresh',
            started_at=datetime.now(timezone.utc),
            status=JOB_STATUS_RUNNING,
            finished_at=None
        )
        db.add(job)
        await db.commit()
        await db.refresh(job)
        job_id = job.id

        try:
            # Call each refresh function sequentially
            await refresh_student_performance_summary()
            await refresh_domain_performance_summary()
            await refresh_semester_progress_summary()
            await refresh_topic_gap_summary()
            await refresh_difficulty_performance_summary()

            # Update job status to 'success'
            job.status = JOB_STATUS_SUCCESS
            job.finished_at = datetime.now(timezone.utc)
            await db.commit()

            return job_id

        except Exception as e:
            # Update job status to 'failed' on any exception
            job.status = JOB_STATUS_FAILED
            job.finished_at = datetime.now(timezone.utc)
            await db.commit()

            # Re-raise the exception for logging/alerting
            raise e


async def get_dashboard_widget(widget_key: str) -> dict | None:
    """
    Return cached widget payload if exists and not expired.

    Args:
        widget_key: Unique identifier for the widget (e.g., 'student_performance_chart')

    Returns:
        Cached payload dict if found and not expired, None otherwise
    """
    async with AsyncSessionLocal() as db:
        # Query for widget where key matches and not expired
        query = select(DashboardWidgetCache).where(
            DashboardWidgetCache.widget_key == widget_key,
            DashboardWidgetCache.expires_at > datetime.now(timezone.utc)
        )

        result = await db.execute(query)
        widget = result.scalar_one_or_none()

        if widget:
            return widget.payload
        return None


async def set_dashboard_widget(widget_key: str, payload: dict, ttl_seconds: int = 3600) -> None:
    """
    Upsert a dashboard widget cache entry.

    Args:
        widget_key: Unique identifier for the widget (e.g., 'top_performers_list')
        payload: JSON-serializable dict containing the widget data
        ttl_seconds: Time-to-live in seconds (default: 3600 = 1 hour)
    """
    async with AsyncSessionLocal() as db:
        # Calculate expiration timestamp
        cached_at = datetime.now(timezone.utc)
        expires_at = cached_at + timedelta(seconds=ttl_seconds)

        # Check if widget already exists
        query = select(DashboardWidgetCache).where(
            DashboardWidgetCache.widget_key == widget_key
        )
        result = await db.execute(query)
        existing_widget = result.scalar_one_or_none()

        if existing_widget:
            # Update existing widget
            existing_widget.payload = payload
            existing_widget.cached_at = cached_at
            existing_widget.expires_at = expires_at
        else:
            # Insert new widget
            new_widget = DashboardWidgetCache(
                widget_key=widget_key,
                payload=payload,
                cached_at=cached_at,
                expires_at=expires_at
            )
            db.add(new_widget)

        await db.commit()
