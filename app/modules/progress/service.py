"""
app/modules/progress/service.py
---------------------------------
Business logic for enrollment, level progress, eligibility and progression decisions.

Max 3 attempts per level (constants.MAX_ATTEMPTS); after a 3rd failure
enrollment.is_blocked is set to True.

Cross-module calls (service functions only, never another module's models):
- domains/service   - level lookups (track, next level).
- attempts/service  - attempt counting. Imported INSIDE functions because
                      attempts/service also imports this module (avoids a
                      circular import at start-up).
Called by:
- slots/service.book_slot()              -> check_eligibility()
- attempts/service.start_exam()          -> get_enrollment_for_level(), get_eligibility_detail(), record_attempt()
- attempts/service.score_and_finish()    -> handle_progression()

Transactions: functions here only flush(); the router commits.

The rules themselves live in rules.py (pure functions, unit-tested).
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import (
    LEVEL_STATUS_IN_PROGRESS,
    LEVEL_STATUS_LOCKED,
    LEVEL_STATUS_PASSED,
    LEVEL_STATUS_UNLOCKED,
    MAX_ATTEMPTS,
)
from app.core.exceptions import ConflictError, ForbiddenError, NotFoundError
from app.modules.domains import service as domains_service
from app.modules.progress.models import Enrollment, LevelProgress, ProgressionDecision
from app.modules.progress.rules import decide_progression, evaluate_eligibility
from app.utils.time_utils import utcnow_naive


# ── Internal helpers ──────────────────────────────────────────────────────────

async def _find_enrollment(student_id: int, track_id: int, db: AsyncSession) -> Enrollment | None:
    return await db.scalar(
        select(Enrollment).where(
            Enrollment.student_id == student_id,
            Enrollment.track_id == track_id,
        )
    )


async def _find_level_progress(enrollment_id: int, level_id: int, db: AsyncSession) -> LevelProgress | None:
    return await db.scalar(
        select(LevelProgress).where(
            LevelProgress.enrollment_id == enrollment_id,
            LevelProgress.level_id == level_id,
        )
    )


async def _get_or_create_level_progress(
    enrollment_id: int, level_id: int, db: AsyncSession, default_status: str = LEVEL_STATUS_LOCKED
) -> LevelProgress:
    progress = await _find_level_progress(enrollment_id, level_id, db)
    if progress is None:
        progress = LevelProgress(enrollment_id=enrollment_id, level_id=level_id, status=default_status)
        db.add(progress)
        await db.flush()
    return progress


def _progress_to_dict(p: LevelProgress) -> dict:
    return {
        "id": p.id,
        "enrollment_id": p.enrollment_id,
        "level_id": p.level_id,
        "status": p.status,
        "unlocked_at": p.unlocked_at,
        "completed_at": p.completed_at,
    }


# ── Enrollment ────────────────────────────────────────────────────────────────

async def enroll_student(student_id: int, track_id: int, db: AsyncSession) -> dict:
    """
    Enroll a student in a track.

    Creates the Enrollment plus one LevelProgress row per level of the track:
    the first level is 'unlocked', the rest are 'locked'.
    """
    levels = await domains_service.list_levels_for_track(track_id, db)
    if not levels:
        raise NotFoundError(f"Track {track_id} not found or has no levels.")

    if await _find_enrollment(student_id, track_id, db) is not None:
        raise ConflictError("You are already enrolled in this track.")

    now = utcnow_naive()
    enrollment = Enrollment(student_id=student_id, track_id=track_id, enrolled_at=now, is_blocked=False)
    db.add(enrollment)
    await db.flush()

    for index, level in enumerate(levels):
        first = index == 0
        db.add(
            LevelProgress(
                enrollment_id=enrollment.id,
                level_id=level["id"],
                status=LEVEL_STATUS_UNLOCKED if first else LEVEL_STATUS_LOCKED,
                unlocked_at=now if first else None,
            )
        )
    await db.flush()

    return {
        "id": enrollment.id,
        "student_id": enrollment.student_id,
        "track_id": enrollment.track_id,
        "enrolled_at": enrollment.enrolled_at,
        "is_blocked": bool(enrollment.is_blocked),
    }


async def get_enrollment_for_level(student_id: int, level_id: int, db: AsyncSession) -> dict:
    """
    Return the student's enrollment for the track that owns `level_id`.
    Raises NotFoundError (unknown level) or ForbiddenError (not enrolled).
    """
    level = await domains_service.get_level(level_id, db)
    enrollment = await _find_enrollment(student_id, level["track_id"], db)
    if enrollment is None:
        raise ForbiddenError("You are not enrolled in the track for this level.")
    return {
        "enrollment_id": enrollment.id,
        "track_id": level["track_id"],
        "is_blocked": bool(enrollment.is_blocked),
    }


async def is_locked(student_id: int, track_id: int, db: AsyncSession) -> bool:
    """Return True if the student is blocked from this track."""
    enrollment = await _find_enrollment(student_id, track_id, db)
    return bool(enrollment and enrollment.is_blocked)


# ── Eligibility ───────────────────────────────────────────────────────────────

async def get_eligibility_detail(student_id: int, level_id: int, db: AsyncSession) -> dict:
    """
    Full eligibility answer for the API: eligible flag, attempts used/allowed and a reason.
    """
    # Lazy import: attempts/service imports this module at the top.
    from app.modules.attempts import service as attempts_service

    level = await domains_service.get_level(level_id, db)
    enrollment = await _find_enrollment(student_id, level["track_id"], db)
    if enrollment is None:
        return {
            "level_id": level_id,
            "eligible": False,
            "attempts_used": 0,
            "max_attempts": MAX_ATTEMPTS,
            "reason": "You are not enrolled in this track",
        }

    progress = await _find_level_progress(enrollment.id, level_id, db)
    attempts_used = await attempts_service.count_attempts(student_id, level_id, db)
    active = await attempts_service.has_active_attempt(student_id, level_id, db)

    eligible, reason = evaluate_eligibility(
        is_blocked=bool(enrollment.is_blocked),
        level_status=progress.status if progress else None,
        attempts_used=attempts_used,
        max_attempts=MAX_ATTEMPTS,
        has_active_attempt=active,
    )
    return {
        "level_id": level_id,
        "eligible": eligible,
        "attempts_used": attempts_used,
        "max_attempts": MAX_ATTEMPTS,
        "reason": reason,
    }


async def check_eligibility(student_id: int, level_id: int, db: AsyncSession) -> bool:
    """
    Return True if the student may book / start an attempt for this level.
    Called by slots/service.book_slot() before a booking is accepted.
    """
    detail = await get_eligibility_detail(student_id, level_id, db)
    return detail["eligible"]


# ── Attempt lifecycle hooks ───────────────────────────────────────────────────

async def record_attempt(student_id: int, level_id: int, attempt_no: int, db: AsyncSession) -> None:
    """Mark the level as 'in_progress' because a new attempt has started."""
    level = await domains_service.get_level(level_id, db)
    enrollment = await _find_enrollment(student_id, level["track_id"], db)
    if enrollment is None:
        return
    progress = await _get_or_create_level_progress(enrollment.id, level_id, db, LEVEL_STATUS_UNLOCKED)
    progress.status = LEVEL_STATUS_IN_PROGRESS
    await db.flush()


async def handle_progression(
    attempt_id: int,
    student_id: int,
    level_id: int,
    attempt_no: int,
    result_id: int,
    verdict: str,
    db: AsyncSession,
) -> dict:
    """
    Apply the progression rules after an attempt has been scored.

      pass                              -> advance: level 'passed', next level unlocked
      fail, attempts remaining          -> retry:   level back to 'unlocked'
      fail on the last allowed attempt  -> blocked: enrollment.is_blocked = True

    Always inserts one ProgressionDecision row and returns it as a dict.
    """
    level = await domains_service.get_level(level_id, db)
    next_level = await domains_service.get_next_level(level_id, db)

    enrollment = await _find_enrollment(student_id, level["track_id"], db)
    if enrollment is None:
        raise NotFoundError("Enrollment not found for this attempt.")

    plan = decide_progression(
        verdict=verdict,
        attempt_no=attempt_no,
        max_attempts=MAX_ATTEMPTS,
        has_next_level=next_level is not None,
    )
    now = utcnow_naive()

    progress = await _get_or_create_level_progress(enrollment.id, level_id, db, LEVEL_STATUS_UNLOCKED)
    progress.status = plan["level_status"]
    if plan["level_status"] == LEVEL_STATUS_PASSED:
        progress.completed_at = now

    if plan["unlock_next"] and next_level is not None:
        next_progress = await _get_or_create_level_progress(enrollment.id, next_level["id"], db)
        if next_progress.status == LEVEL_STATUS_LOCKED:
            next_progress.status = LEVEL_STATUS_UNLOCKED
            next_progress.unlocked_at = now

    if plan["block_enrollment"]:
        enrollment.is_blocked = True

    decision = ProgressionDecision(
        attempt_id=attempt_id,
        result_id=result_id,
        decision=plan["decision"],
        reason=plan["reason"],
        decided_at=now,
    )
    db.add(decision)
    await db.flush()
    return _decision_to_dict(decision)


def _decision_to_dict(d: ProgressionDecision) -> dict:
    return {
        "id": d.id,
        "attempt_id": d.attempt_id,
        "result_id": d.result_id,
        "decision": d.decision,
        "reason": d.reason,
        "decided_at": d.decided_at,
    }


async def get_decision_for_attempt(attempt_id: int, db: AsyncSession) -> dict | None:
    """Return the progression decision recorded for an attempt, or None."""
    decision = await db.scalar(
        select(ProgressionDecision).where(ProgressionDecision.attempt_id == attempt_id)
    )
    return _decision_to_dict(decision) if decision is not None else None


async def get_level_status(student_id: int, level_id: int, db: AsyncSession) -> dict:
    """Return the student's level_progress row for a level (used by GET /progress/level/{id})."""
    info = await get_enrollment_for_level(student_id, level_id, db)
    progress = await _find_level_progress(info["enrollment_id"], level_id, db)
    if progress is None:
        raise NotFoundError("No progress record exists for this level yet.")
    return _progress_to_dict(progress)
