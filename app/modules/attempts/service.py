"""
app/modules/attempts/service.py
---------------------------------
Business logic for the full exam attempt lifecycle.

Flow (see docs/architecture.md, "Student Exam Flow"):
  start_exam()        student enters the secret code -> Attempt + ExamSession
  submit_answer()     student saves one answer at a time (can be changed until submit)
  score_and_finish()  score everything -> Result + TopicResults -> progression decision
  get_result()        read the result back

Cross-module calls (service functions only - never another module's models.py):
  slots/service        get_booking_context()
  exams/service        get_assessment()
  ai_engine/service    get_questions_for_assessment()
  allocation/service   get_allocation_id_for_booking()
  secret_code/service  verify_and_consume_code()
  progress/service     get_enrollment_for_level(), get_eligibility_detail(),
                       record_attempt(), handle_progression(), get_decision_for_attempt()

Transactions: functions here only flush(); the ROUTER commits once at the end,
so attempt + result + progression are saved together or not at all.

Scoring maths lives in scoring.py (pure functions, unit-tested).

TODO: expire_unused_codes() - batch job for no-shows (needs a slots/service function
      to mark bookings 'absent').
"""

from datetime import datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import (
    ATTEMPT_STATUS_IN_PROGRESS,
    ATTEMPT_STATUS_SUBMITTED,
    BOOKING_STATUS_ABSENT,
    BOOKING_STATUS_CANCELLED,
    PASS_PERCENTAGE,
)
from app.core.exceptions import ConflictError, ForbiddenError, NotFoundError, ValidationError
from app.modules.ai_engine import service as ai_engine_service
from app.modules.allocation import service as allocation_service
from app.modules.attempts.models import (
    Attempt,
    AttemptAnswer,
    ExamSession,
    ProctoringEvent,
    Result,
    TopicResult,
)
from app.modules.attempts.scoring import score_attempt
from app.modules.exams import service as exams_service
from app.modules.progress import service as progress_service
from app.modules.secret_code import service as secret_code_service
from app.modules.slots import service as slots_service
from app.utils.time_utils import utcnow_naive


# ── Small helpers ─────────────────────────────────────────────────────────────

def _attempt_to_dict(a: Attempt) -> dict:
    return {
        "id": a.id,
        "slot_booking_id": a.slot_booking_id,
        "student_id": a.student_id,
        "assessment_id": a.assessment_id,
        "enrollment_id": a.enrollment_id,
        "level_id": a.level_id,
        "attempt_no": a.attempt_no,
        "status": a.status,
        "started_at": a.started_at,
        "submitted_at": a.submitted_at,
    }


async def _get_owned_attempt(attempt_id: int, student_id: int, db: AsyncSession) -> Attempt:
    """Load an attempt; 404 if missing, 403 if it belongs to another student."""
    attempt = await db.get(Attempt, attempt_id)
    if attempt is None:
        raise NotFoundError(f"Attempt {attempt_id} not found.")
    if attempt.student_id != student_id:
        raise ForbiddenError("Access denied.")
    return attempt


async def _get_session(attempt_id: int, db: AsyncSession) -> ExamSession | None:
    result = await db.execute(
        select(ExamSession).where(ExamSession.attempt_id == attempt_id).order_by(ExamSession.id.desc())
    )
    return result.scalars().first()


def _compute_expiry(ctx: dict, assessment: dict, now: datetime) -> datetime:
    """Session ends at the slot's end time; falls back to now + assessment duration."""
    slot_date, slot_end = ctx.get("slot_date"), ctx.get("slot_end_time")
    if slot_date is not None and slot_end is not None:
        return datetime.combine(slot_date, slot_end)
    return now + timedelta(minutes=assessment.get("duration_minutes") or 60)


async def _save_answer(
    attempt: Attempt, qmap: dict[int, dict], question_id: int, option_id: int, now: datetime, db: AsyncSession
) -> AttemptAnswer:
    """Validate and upsert one answer (insert, or overwrite the earlier choice)."""
    question = qmap.get(question_id)
    if question is None:
        raise ValidationError(f"Question {question_id} does not belong to this assessment.")
    if option_id not in question["option_ids"]:
        raise ValidationError(f"Option {option_id} is not a valid choice for question {question_id}.")

    answer = await db.scalar(
        select(AttemptAnswer).where(
            AttemptAnswer.attempt_id == attempt.id,
            AttemptAnswer.question_id == question_id,
        )
    )
    if answer is None:
        answer = AttemptAnswer(attempt_id=attempt.id, question_id=question_id)
        db.add(answer)
    answer.selected_option_id = option_id
    answer.answered_at = now
    await db.flush()
    return answer


# ── Counting helpers (also used by progress/service for eligibility) ──────────

async def count_attempts(student_id: int, level_id: int, db: AsyncSession) -> int:
    """How many attempts the student has made on this level (any status)."""
    count = await db.scalar(
        select(func.count(Attempt.id)).where(
            Attempt.student_id == student_id,
            Attempt.level_id == level_id,
        )
    )
    return count or 0


async def has_active_attempt(student_id: int, level_id: int, db: AsyncSession) -> bool:
    """True if the student has an attempt on this level that is still in progress."""
    found = await db.scalar(
        select(Attempt.id)
        .where(
            Attempt.student_id == student_id,
            Attempt.level_id == level_id,
            Attempt.status == ATTEMPT_STATUS_IN_PROGRESS,
        )
        .limit(1)
    )
    return found is not None


# ── Start ─────────────────────────────────────────────────────────────────────

async def start_exam(student_id: int, booking_id: int, plain_code: str, db: AsyncSession) -> dict:
    """
    Verify the student's secret code and start an exam session.

    Checks, in order: booking is theirs and still valid -> no attempt exists yet
    for it -> student is enrolled and eligible -> a seat was allocated ->
    secret code is valid (and is consumed). Then creates the Attempt and its
    ExamSession and tells progress/ the level is now in progress.
    """
    ctx = await slots_service.get_booking_context(booking_id, db)
    if ctx["student_id"] != student_id:
        raise ForbiddenError("This booking belongs to another student.")
    if ctx["status"] in (BOOKING_STATUS_CANCELLED, BOOKING_STATUS_ABSENT):
        raise ValidationError(f"This booking is {ctx['status']} and cannot be used to start an exam.")

    already = await db.scalar(select(Attempt.id).where(Attempt.slot_booking_id == booking_id).limit(1))
    if already is not None:
        raise ConflictError("An attempt has already been started for this booking.")

    assessment = await exams_service.get_assessment(ctx["assessment_id"], db)
    level_id = assessment["level_id"]

    enrollment = await progress_service.get_enrollment_for_level(student_id, level_id, db)
    eligibility = await progress_service.get_eligibility_detail(student_id, level_id, db)
    if not eligibility["eligible"]:
        raise ConflictError(eligibility["reason"] or "You are not eligible to start this exam.")

    allocation_id = await allocation_service.get_allocation_id_for_booking(booking_id, db)
    if allocation_id is None:
        raise ValidationError("No seat has been allocated for this booking yet.")

    # Deliberately vague: never reveal WHY a code failed.
    if not await secret_code_service.verify_and_consume_code(allocation_id, plain_code, db):
        raise ValidationError("Invalid or expired secret code.")

    now = utcnow_naive()
    attempt_no = eligibility["attempts_used"] + 1
    attempt = Attempt(
        slot_booking_id=booking_id,
        student_id=student_id,
        assessment_id=ctx["assessment_id"],
        enrollment_id=enrollment["enrollment_id"],
        level_id=level_id,
        attempt_no=attempt_no,
        started_at=now,
        status=ATTEMPT_STATUS_IN_PROGRESS,
    )
    db.add(attempt)
    await db.flush()

    session = ExamSession(
        attempt_id=attempt.id,
        # TODO: link the consumed secret code (secret_code/service does not expose its id yet).
        secret_code_id=None,
        started_at=now,
        expires_at=_compute_expiry(ctx, assessment, now),
        last_heartbeat_at=now,
    )
    db.add(session)
    await db.flush()

    await progress_service.record_attempt(student_id, level_id, attempt_no, db)

    return {
        "attempt_id": attempt.id,
        "exam_session_id": session.id,
        "attempt_no": attempt.attempt_no,
        "status": attempt.status,
        "started_at": attempt.started_at,
        "expires_at": session.expires_at,
    }


# ── Answering ─────────────────────────────────────────────────────────────────

async def submit_answer(
    attempt_id: int, student_id: int, question_id: int, option_id: int, db: AsyncSession
) -> dict:
    """Save (or change) the student's answer to one question while the exam is running."""
    attempt = await _get_owned_attempt(attempt_id, student_id, db)
    if attempt.status != ATTEMPT_STATUS_IN_PROGRESS:
        raise ConflictError(f"Attempt is {attempt.status}; answers can no longer be changed.")

    now = utcnow_naive()
    session = await _get_session(attempt_id, db)
    if session is not None and session.expires_at is not None and now > session.expires_at:
        raise ConflictError("The exam session has expired.")

    questions = await ai_engine_service.get_questions_for_assessment(attempt.assessment_id, db)
    qmap = {q["question_id"]: q for q in questions}
    answer = await _save_answer(attempt, qmap, question_id, option_id, now, db)
    return {
        "attempt_id": attempt_id,
        "question_id": answer.question_id,
        "selected_option_id": answer.selected_option_id,
        "answered_at": answer.answered_at,
    }


# ── Finish + score ────────────────────────────────────────────────────────────

async def score_and_finish(
    attempt_id: int, student_id: int, db: AsyncSession, answers: list[dict] | None = None
) -> dict:
    """
    Finish the attempt: (optionally) save last answers, score, store Result +
    TopicResults, then let progress/ decide advance / retry / blocked.

    `answers` is an optional list of {"question_id", "selected_option_id"} so a
    client can still send everything in one request at the end.
    """
    attempt = await _get_owned_attempt(attempt_id, student_id, db)
    if attempt.status != ATTEMPT_STATUS_IN_PROGRESS:
        raise ConflictError(f"Attempt is {attempt.status}, expected {ATTEMPT_STATUS_IN_PROGRESS}.")

    questions = await ai_engine_service.get_questions_for_assessment(attempt.assessment_id, db)
    if not questions:
        raise ValidationError("This assessment has no questions, so it cannot be scored.")
    qmap = {q["question_id"]: q for q in questions}

    now = utcnow_naive()
    for item in answers or []:
        await _save_answer(attempt, qmap, item["question_id"], item["selected_option_id"], now, db)

    saved = await db.execute(select(AttemptAnswer).where(AttemptAnswer.attempt_id == attempt_id))
    selected = {a.question_id: a.selected_option_id for a in saved.scalars().all()}

    score = score_attempt(questions, selected, PASS_PERCENTAGE)

    result = Result(
        attempt_id=attempt.id,
        total_marks=score["total_marks"],
        scored_marks=score["scored_marks"],
        percentage=score["percentage"],
        verdict=score["verdict"],
        computed_at=now,
    )
    db.add(result)
    await db.flush()

    topic_rows = [
        TopicResult(
            result_id=result.id,
            topic_id=t["topic_id"],
            scored_marks=t["scored_marks"],
            total_marks=t["total_marks"],
            accuracy=t["accuracy"],
        )
        for t in score["topics"]
    ]
    db.add_all(topic_rows)

    attempt.status = ATTEMPT_STATUS_SUBMITTED
    attempt.submitted_at = now
    session = await _get_session(attempt_id, db)
    if session is not None:
        session.ended_at = now
    await db.flush()

    decision = await progress_service.handle_progression(
        attempt_id=attempt.id,
        student_id=student_id,
        level_id=attempt.level_id,
        attempt_no=attempt.attempt_no,
        result_id=result.id,
        verdict=result.verdict,
        db=db,
    )
    return _result_to_dict(result, topic_rows, decision)


def _result_to_dict(result: Result, topic_rows: list[TopicResult], decision: dict | None) -> dict:
    return {
        "id": result.id,
        "attempt_id": result.attempt_id,
        "total_marks": result.total_marks,
        "scored_marks": result.scored_marks,
        "percentage": result.percentage,
        "verdict": result.verdict,
        "computed_at": result.computed_at,
        "topic_results": [
            {
                "id": t.id,
                "topic_id": t.topic_id,
                "scored_marks": t.scored_marks,
                "total_marks": t.total_marks,
                "accuracy": t.accuracy,
            }
            for t in topic_rows
        ],
        "progression": decision,
    }


# ── Reading back ──────────────────────────────────────────────────────────────

async def get_result(attempt_id: int, student_id: int, db: AsyncSession) -> dict:
    """Return the result of an attempt with topic breakdown and progression decision."""
    await _get_owned_attempt(attempt_id, student_id, db)
    result = await db.scalar(select(Result).where(Result.attempt_id == attempt_id))
    if result is None:
        raise NotFoundError("Result not yet available for this attempt.")
    topics = await db.execute(
        select(TopicResult).where(TopicResult.result_id == result.id).order_by(TopicResult.topic_id)
    )
    decision = await progress_service.get_decision_for_attempt(attempt_id, db)
    return _result_to_dict(result, list(topics.scalars().all()), decision)


async def list_student_attempts(student_id: int, db: AsyncSession) -> list[dict]:
    """All attempts of one student, newest first."""
    result = await db.execute(
        select(Attempt).where(Attempt.student_id == student_id).order_by(Attempt.id.desc())
    )
    return [_attempt_to_dict(a) for a in result.scalars().all()]


async def get_attempt_detail(attempt_id: int, student_id: int, db: AsyncSession) -> dict:
    """One attempt plus the answers saved so far (option ids only - no marking info)."""
    attempt = await _get_owned_attempt(attempt_id, student_id, db)
    rows = await db.execute(
        select(AttemptAnswer).where(AttemptAnswer.attempt_id == attempt_id).order_by(AttemptAnswer.id)
    )
    data = _attempt_to_dict(attempt)
    data["answers"] = [
        {
            "id": a.id,
            "question_id": a.question_id,
            "selected_option_id": a.selected_option_id,
            "answered_at": a.answered_at,
        }
        for a in rows.scalars().all()
    ]
    return data


# ── Session upkeep + proctoring ───────────────────────────────────────────────

async def heartbeat(attempt_id: int, student_id: int, db: AsyncSession) -> dict:
    """Record that the student's browser is still connected."""
    await _get_owned_attempt(attempt_id, student_id, db)
    session = await _get_session(attempt_id, db)
    if session is None:
        raise NotFoundError("No exam session exists for this attempt.")
    session.last_heartbeat_at = utcnow_naive()
    await db.flush()
    return {"attempt_id": attempt_id, "last_heartbeat_at": session.last_heartbeat_at}


async def record_proctoring_event(
    attempt_id: int, student_id: int, event_type: str, details: dict | None, db: AsyncSession
) -> dict:
    """Insert a proctoring event (tab-switch, focus loss, ...) for the attempt's session."""
    await _get_owned_attempt(attempt_id, student_id, db)
    session = await _get_session(attempt_id, db)
    if session is None:
        raise NotFoundError("No exam session exists for this attempt.")
    event = ProctoringEvent(
        exam_session_id=session.id,
        event_type=event_type,
        occurred_at=utcnow_naive(),
        details=details or {},
    )
    db.add(event)
    await db.flush()
    return {"id": event.id, "event_type": event.event_type, "occurred_at": event.occurred_at}


async def expire_unused_codes() -> None:
    """
    Batch operation: expire timed-out sessions, mark absent, apply no-show rule.
    """
    # TODO: find expired sessions, mark bookings absent via slots/service, call progress/service
    pass
