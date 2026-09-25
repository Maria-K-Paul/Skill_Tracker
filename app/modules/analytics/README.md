# Analytics Module

Nightly and on-demand analytics refresh for summary tables and dashboard widget cache.

## Tables
- `analytics_refresh_jobs` — job execution log.
- `student_performance_summary` — per-student/track aggregated metrics.
- `domain_performance_summary` — per-track aggregated pass rates.
- `semester_progress_summary` — per-student/year level completion.
- `topic_gap_summary` — per-student/topic accuracy for skill gap view.
- `difficulty_performance_summary` — per-student/difficulty accuracy (read by AI engine).
- `dashboard_widget_cache` — pre-computed widget payloads with TTL.

## Key Rules
- All refresh functions are **idempotent** (upsert pattern).
- `difficulty_performance_summary` is read by `ai_engine/difficulty.py` to select target difficulty.
- `topic_gap_summary` is read by `ai_engine/skill_gap.py` for weak-topic detection.
- `refresh_all()` is triggered by a nightly job and should log to `analytics_refresh_jobs`.
