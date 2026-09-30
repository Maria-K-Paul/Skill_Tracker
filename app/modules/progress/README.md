# Progress Module

Manages student enrollments, level progress tracking, eligibility and progression decisions.
(Eligibility and progression logic from the former standalone *assessment service* now lives here.)

## Tables
- `enrollments` — student ↔ track enrollment. `is_blocked=True` locks them out.
- `level_progress` — per-level status (locked/unlocked/in_progress/passed/failed).
- `progression_decisions` — records advance/retry/blocked (+ `reason`) after each scored attempt.

## Files
- `service.py` — database work (enroll, eligibility, record_attempt, handle_progression).
- `rules.py` — the rules as pure functions, unit-tested in `tests/test_progress_rules.py`.

## Key Rules
- **MAX_ATTEMPTS = 3** per level. After 3 fails → `enrollment.is_blocked = True`.
- Pass → level `passed`, next level `unlocked`. Fail with attempts left → `retry`.
- `check_eligibility(student_id, level_id, db)` is called by `slots/service` before a student can book.
- `handle_progression()` is called by `attempts/service` after scoring.
- Students decide for themselves when to book — no forced pace.
