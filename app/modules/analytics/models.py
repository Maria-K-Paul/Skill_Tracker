"""
app/modules/analytics/models.py
---------------------------------
ORM model placeholders for analytics summary tables and dashboard cache.

Tables covered:
  analytics_refresh_jobs, student_performance_summary,
  domain_performance_summary, semester_progress_summary,
  topic_gap_summary, difficulty_performance_summary,
  dashboard_widget_cache.
Column comments match docs/db_schema.md exactly.

TODO: Add SQLAlchemy Column definitions.
TODO: Add unique constraints on (student_id, track_id) for summary tables.
"""


class AnalyticsRefreshJob:
    """
    Tracks execution of nightly/periodic analytics refresh jobs.

    Table: analytics_refresh_jobs
        # id: INTEGER (PK)
        # job_name: VARCHAR
        # started_at: TIMESTAMP
        # finished_at: TIMESTAMP
        # status: VARCHAR
    """
    pass


class StudentPerformanceSummary:
    """
    Aggregated per-student, per-track performance metrics.

    Table: student_performance_summary
        # id: INTEGER (PK)
        # student_id: INTEGER (FK → students)
        # track_id: INTEGER (FK → tracks)
        # total_attempts: INTEGER
        # passed_levels: INTEGER
        # avg_percentage: FLOAT
        # last_updated: TIMESTAMP
    """
    pass


class DomainPerformanceSummary:
    """
    Aggregated per-track performance metrics (across all students).

    Table: domain_performance_summary
        # id: INTEGER (PK)
        # track_id: INTEGER (FK → tracks)
        # total_students: INTEGER
        # avg_pass_rate: FLOAT
        # last_updated: TIMESTAMP
    """
    pass


class SemesterProgressSummary:
    """
    Per-student progress aggregated by academic year.

    Table: semester_progress_summary
        # id: INTEGER (PK)
        # student_id: INTEGER (FK → students)
        # academic_year_id: INTEGER (FK → academic_years)
        # levels_completed: INTEGER
        # last_updated: TIMESTAMP
    """
    pass


class TopicGapSummary:
    """
    Per-student per-topic accuracy summary for skill gap identification.

    Table: topic_gap_summary
        # id: INTEGER (PK)
        # student_id: INTEGER (FK → students)
        # topic_id: INTEGER (FK → topics)
        # avg_accuracy: FLOAT
        # attempt_count: INTEGER
        # last_updated: TIMESTAMP
    """
    pass


class DifficultyPerformanceSummary:
    """
    Per-student accuracy broken down by difficulty level.
    Read by ai_engine/difficulty.py to compute target difficulty.

    Table: difficulty_performance_summary
        # id: INTEGER (PK)
        # student_id: INTEGER (FK → students)
        # difficulty: VARCHAR
        # correct_count: INTEGER
        # total_count: INTEGER
        # last_updated: TIMESTAMP
    """
    pass


class DashboardWidgetCache:
    """
    Cached computed values for dashboard widgets to avoid expensive real-time queries.

    Table: dashboard_widget_cache
        # id: INTEGER (PK)
        # widget_key: VARCHAR
        # payload: JSONB
        # cached_at: TIMESTAMP
        # expires_at: TIMESTAMP
    """
    pass
