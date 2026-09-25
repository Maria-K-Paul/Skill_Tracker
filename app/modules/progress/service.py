"""
app/modules/progress/service.py
---------------------------------
Business logic for enrollment, level progress, and progression decisions.

Max 3 attempts per level (see attempt.attempt_no); after that
enrollment.is_blocked is set true.

Cross-module calls:
- Called by slots/service.check_eligibility() before booking.
- Called by attempts/service.score_and_finish() after scoring.
- No direct import of other modules' models.py or router.py.

TODO: implement check_eligibility(student_id, level_id) → bool
      - verify enrollment exists and is_blocked=False
      - count existing attempts for this level (attempt.attempt_no)
      - return False if attempt_no >= MAX_ATTEMPTS
TODO: implement record_attempt(student_id, level_id, attempt_no)
      - update or create LevelProgress status='in_progress'
TODO: implement is_locked(student_id, track_id) → bool
      - return enrollment.is_blocked
TODO: implement handle_progression(attempt_id, result) → ProgressionDecision
      - if pass: advance (unlock next level, set current='passed')
      - if fail and attempt_no < MAX_ATTEMPTS: retry
      - if fail and attempt_no == MAX_ATTEMPTS: blocked (set enrollment.is_blocked=True)
      - insert ProgressionDecision record
TODO: implement enroll_student(student_id, track_id) → Enrollment
"""

from app.core.constants import MAX_ATTEMPTS


async def check_eligibility(student_id: int, level_id: int) -> bool:
    """
    Return True if the student is eligible to book a slot for this level.
    False if enrollment is blocked or attempt limit reached.

    TODO: check enrollment.is_blocked and count attempts via attempt_no.
    """
    return True


async def record_attempt(student_id: int, level_id: int, attempt_no: int) -> None:
    """Update LevelProgress to reflect a new attempt is in progress."""
    # TODO: upsert LevelProgress with status='in_progress'
    pass


async def is_locked(student_id: int, track_id: int) -> bool:
    """Return True if the student is blocked from this track."""
    # TODO: query enrollment.is_blocked
    return False


async def handle_progression(attempt_id: int, result: dict) -> dict:
    """
    Evaluate the result and record a ProgressionDecision.
    Blocks the student if MAX_ATTEMPTS is reached on failure.
    """
    # TODO: implement advance / retry / blocked logic
    pass


async def enroll_student(student_id: int, track_id: int) -> dict:
    """Enroll a student in a track, creating an Enrollment record."""
    # TODO: check not already enrolled, insert Enrollment
    pass
