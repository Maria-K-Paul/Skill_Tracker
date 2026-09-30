# Assessment Service → Skill Tracker: integration notes

The standalone Assessment Service (FastAPI + sync SQLAlchemy + HTTP clients) was merged into the
modular monolith. Its logic now lives in `attempts/` and `progress/`.

## Where things went
| Assessment service | Now |
|---|---|
| `models/attempt*, result, topic_result` | `attempts/models.py` (existing tables; + `enrollment_id`, `level_id` on `attempts`) |
| `models/level_progress, progression_decision` | `progress/models.py` (+ `reason` on `progression_decisions`) |
| `models/level` | already `domains/models.py` (not duplicated) |
| `attempt_service`, `evaluation_service` | `attempts/service.py` + pure maths in `attempts/scoring.py` |
| `eligibility_service`, `progression_service` | `progress/service.py` + pure rules in `progress/rules.py` |
| `clients/*` (HTTP) | replaced by service-to-service calls |
| `api/routes/*` | `attempts/router.py`, `progress/router.py` |
| Bearer/PyJWT `get_current_user` | `core/dependencies.py` (`require_student`, new `get_current_student_id`) |

## Behaviour changes (vs. the standalone service)
- Multiple choice: answers are `selected_option_id`; correct = `question_options.is_correct`.
- Statuses/decisions use `core/constants.py` (`advance` / `retry` / `blocked`, `pass` / `fail`).
- Pass mark is `constants.PASS_PERCENTAGE` (50.0) — `levels` has no pass-mark column.
- `topic_results.accuracy` is a fraction 0.0–1.0 (matches `DIFFICULTY_THRESHOLD_*`).
- Exam start is gated by the secret code; answers are saved one at a time and `submit` scores them.
- On a 3rd failure `enrollment.is_blocked` is now set; on a pass the next level is unlocked.

## Small changes made in other modules (please review, owners)
- `core/constants.py` (+`LEVEL_STATUS_IN_PROGRESS`, `PASS_PERCENTAGE`), `core/dependencies.py` (+`get_current_student_id`),
  `utils/time_utils.py` (+`utcnow_naive`), `main.py` (registers the `SkillLevelingException` handler —
  without it NotFound/Conflict/Validation errors were returned as HTTP 500).
- `users/service.py` +`get_student_id_for_user`; `domains/service.py` +`get_level`, `get_next_level`, `list_levels_for_track`;
  `exams/service.py` implemented `get_assessment(assessment_id, db)`; `ai_engine/service.py` (new) `get_questions_for_assessment`;
  `allocation/service.py` +`get_allocation_id_for_booking`;
  `slots/service.py` +`get_booking_context` and `check_eligibility` is now called with `db`.
- Migration `a7c3e91d2b45`; `docs/db_schema.md` and `docs/api_contracts.md` updated.

## Known issues in code we did not touch (found while integrating)
- `secret_code/service.py` uses `encrypted_code` / `created_at`, but the model column is `code_encrypted` (no `created_at`).
  `start_exam()` calls `verify_and_consume_code()`, so it will fail until this is fixed.
- `slots/service.py` and `slots/router_student.py` use `uuid.UUID`, `Slot.level_id`, `BookingStatus.BOOKED`,
  `SlotStatus.DRAFT` and `booking.cancelled_at`, none of which exist on the models.
- `slots` passes `current_student["id"]` (a `users.id`) as a student id; use `get_current_student_id` instead.
