"""
app/modules/progress/rules.py
-----------------------------
The business rules of progression, written as pure functions (no database).

service.py gathers the facts from the database, asks these functions what the
rules say, then applies the answer. Keeping the rules here makes them easy to
unit-test.
"""

from app.core.constants import (
    DECISION_ADVANCE,
    DECISION_BLOCKED,
    DECISION_RETRY,
    LEVEL_STATUS_FAILED,
    LEVEL_STATUS_LOCKED,
    LEVEL_STATUS_PASSED,
    LEVEL_STATUS_UNLOCKED,
    VERDICT_PASS,
)


def evaluate_eligibility(
    *,
    is_blocked: bool,
    level_status: str | None,
    attempts_used: int,
    max_attempts: int,
    has_active_attempt: bool,
) -> tuple[bool, str | None]:
    """
    Decide whether a student may start / book a new attempt for a level.

    Returns (eligible, reason). `reason` explains a refusal and is None when eligible.
    `level_status` is None when no level_progress row exists yet (treated as open).
    """
    if is_blocked:
        return False, f"Track blocked after {max_attempts} failed attempts"
    if level_status == LEVEL_STATUS_PASSED:
        return False, "Level already passed"
    if level_status == LEVEL_STATUS_LOCKED:
        return False, "Level is locked"
    if attempts_used >= max_attempts:
        return False, f"All {max_attempts} attempts have been used"
    if has_active_attempt:
        return False, "An attempt is already in progress"
    return True, None


def decide_progression(
    *,
    verdict: str,
    attempt_no: int,
    max_attempts: int,
    has_next_level: bool,
) -> dict:
    """
    Decide what happens after a scored attempt.

    Returns:
        decision:         "advance" | "retry" | "blocked"
        reason:           human-readable explanation
        level_status:     new status for the level just attempted
        unlock_next:      True if the next level should be unlocked
        block_enrollment: True if enrollment.is_blocked must be set
    """
    if verdict == VERDICT_PASS:
        return {
            "decision": DECISION_ADVANCE,
            "reason": "Passed the assessment"
            if has_next_level
            else "Passed the final level - track complete",
            "level_status": LEVEL_STATUS_PASSED,
            "unlock_next": has_next_level,
            "block_enrollment": False,
        }

    if attempt_no >= max_attempts:
        return {
            "decision": DECISION_BLOCKED,
            "reason": f"Failed after {max_attempts} attempts",
            "level_status": LEVEL_STATUS_FAILED,
            "unlock_next": False,
            "block_enrollment": True,
        }

    return {
        "decision": DECISION_RETRY,
        "reason": f"Attempt {attempt_no} of {max_attempts} used",
        "level_status": LEVEL_STATUS_UNLOCKED,
        "unlock_next": False,
        "block_enrollment": False,
    }
