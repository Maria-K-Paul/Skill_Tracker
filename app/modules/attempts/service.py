"""
app/modules/attempts/service.py
---------------------------------
Business logic for the full exam attempt lifecycle.

Cross-module calls (via service functions only, never direct model imports):
- secret_code/service.verify_and_consume_code() — on start_exam.
- progress/service.record_attempt() and handle_progression() — on start + finish.
- No direct import of other modules' models.py or router.py.

TODO: implement start_exam(student_id, booking_id, plain_code) → ExamSession
      - verify code via secret_code/service.verify_and_consume_code()
      - create Attempt (status='in_progress', attempt_no from booking)
      - create ExamSession (started_at=now, expires_at=slot.end_time)
      - call progress/service.record_attempt()
TODO: implement submit_answer(attempt_id, question_id, option_id) → AttemptAnswer
      - validate exam_session is still active (not expired)
      - upsert AttemptAnswer
TODO: implement score_and_finish(attempt_id) → Result
      - mark Attempt status='submitted'
      - compute marks per question using question.marks + is_correct
      - compute per-topic accuracy → insert TopicResult rows
      - compute total percentage and verdict → insert Result
      - call progress/service.handle_progression(attempt_id, result)
TODO: implement expire_unused_codes()
      - find sessions past expires_at with no ended_at
      - mark absent on slot_booking
      - call progress/service for no-show progression logic
TODO: implement record_proctoring_event(session_id, event_type, details)
      - insert ProctoringEvent row
"""


async def start_exam(student_id: int, booking_id: int, plain_code: str) -> dict:
    """
    Verify the student's secret code and start an exam session.

    TODO: verify code, create Attempt + ExamSession, call progress service.
    """
    pass


async def submit_answer(attempt_id: int, question_id: int, option_id: int) -> dict:
    """Upsert an answer for a question within an active attempt."""
    # TODO: validate session active, upsert AttemptAnswer
    pass


async def score_and_finish(attempt_id: int) -> dict:
    """
    Score the attempt, compute results + topic results, trigger progression.
    """
    # TODO: compute Result and TopicResult, call progress/service.handle_progression
    pass


async def expire_unused_codes() -> None:
    """
    Batch operation: expire timed-out sessions, mark absent, apply no-show rule.
    """
    # TODO: find expired sessions, update bookings, call progress service
    pass


async def record_proctoring_event(
    session_id: int, event_type: str, details: dict
) -> None:
    """Insert a proctoring event (tab-switch, heartbeat, etc.)."""
    # TODO: insert ProctoringEvent
    pass
