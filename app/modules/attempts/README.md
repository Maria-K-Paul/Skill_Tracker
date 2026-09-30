# Attempts Module

Manages the full exam attempt lifecycle: session start, answering, scoring, and proctoring.
(The former standalone *assessment service* — attempts, answer evaluation and results — was merged into this module.)

## Tables
- `attempts` — one record per attempt at a level (linked to `slot_booking`; also stores `enrollment_id` and `level_id`).
- `attempt_answers` — one row per question answered (`selected_option_id`).
- `results` — computed after submission: marks, percentage, verdict (`pass` / `fail`).
- `topic_results` — per-topic accuracy (0.0–1.0) for skill-gap analysis.
- `exam_sessions` — active session window with heartbeat tracking.
- `proctoring_events` — tab-switches, heartbeats, integrity signals.

## Files
- `service.py` — lifecycle logic (`start_exam`, `submit_answer`, `score_and_finish`, `get_result`, ...).
- `scoring.py` — pure scoring maths, unit-tested in `tests/test_scoring.py`.

## Key Rules
- Session starts only when a valid, unused, non-expired secret code is entered
  (`secret_code/service.verify_and_consume_code()`).
- The student must be enrolled and eligible (`progress/service.get_eligibility_detail()`).
- Scoring: a question earns its `marks` if the chosen option is the correct one; skipped = 0.
  PASS when percentage >= `constants.PASS_PERCENTAGE`.
- Scoring triggers `progress/service.handle_progression()`.
- Expired sessions (no submission) trigger absent marking and progression logic (TODO).
