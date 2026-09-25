# Progress Module

Manages student enrollments, level progress tracking, and progression decisions.

## Tables
- `enrollments` — student ↔ track enrollment. `is_blocked=True` locks them out.
- `level_progress` — per-level status (locked/unlocked/in_progress/passed/failed).
- `progression_decisions` — records advance/retry/blocked after each scored attempt.

## Key Rules
- **MAX_ATTEMPTS = 3** per level. After 3 fails → `enrollment.is_blocked = True`.
- `check_eligibility()` is called by `slots/service` before a student can book.
- `handle_progression()` is called by `attempts/service` after scoring.
- Students decide for themselves when to book — no forced pace.
