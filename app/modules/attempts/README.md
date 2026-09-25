# Attempts Module

Manages the full exam attempt lifecycle: session start, answering, scoring, and proctoring.

## Tables
- `attempts` — one record per attempt at a level (linked to `slot_booking`).
- `attempt_answers` — one row per question answered.
- `results` — computed after submission: marks, percentage, verdict.
- `topic_results` — per-topic accuracy for skill-gap analysis.
- `exam_sessions` — active session window with heartbeat tracking.
- `proctoring_events` — tab-switches, heartbeats, integrity signals.

## Key Rules
- Session starts only when a valid, unused, non-expired secret code is entered.
- Code is verified via `secret_code/service.verify_and_consume_code()`.
- Scoring triggers `progress/service.handle_progression()`.
- Expired sessions (no submission) trigger absent marking and progression logic.
