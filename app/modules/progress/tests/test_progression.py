"""
Unit tests for progress/rules.py (ported from the assessment service's
test_eligibility.py and test_progression.py). Pure logic - no database needed.
"""

from app.modules.progress.rules import decide_progression, evaluate_eligibility

MAX = 3


def _elig(**overrides):
    base = dict(is_blocked=False, level_status="unlocked", attempts_used=0,
                max_attempts=MAX, has_active_attempt=False)
    base.update(overrides)
    return evaluate_eligibility(**base)


# ── eligibility ───────────────────────────────────────────────────────────────

def test_eligible_when_all_conditions_met():
    assert _elig() == (True, None)


def test_eligible_when_no_level_progress_row_yet():
    assert _elig(level_status=None)[0] is True


def test_not_eligible_when_track_blocked():
    ok, reason = _elig(is_blocked=True)
    assert ok is False and "blocked" in reason.lower()


def test_not_eligible_when_level_already_passed():
    ok, reason = _elig(level_status="passed")
    assert ok is False and "passed" in reason.lower()


def test_not_eligible_when_level_locked():
    ok, reason = _elig(level_status="locked")
    assert ok is False and "locked" in reason.lower()


def test_not_eligible_when_max_attempts_reached():
    ok, reason = _elig(attempts_used=3)
    assert ok is False and "3" in reason


def test_eligible_with_attempts_remaining():
    assert _elig(attempts_used=2)[0] is True


def test_not_eligible_when_attempt_in_progress():
    ok, reason = _elig(has_active_attempt=True)
    assert ok is False and "in progress" in reason.lower()


# ── progression ───────────────────────────────────────────────────────────────

def _prog(**overrides):
    base = dict(verdict="pass", attempt_no=1, max_attempts=MAX, has_next_level=True)
    base.update(overrides)
    return decide_progression(**base)


def test_advance_on_pass_unlocks_next_level():
    p = _prog()
    assert p["decision"] == "advance"
    assert p["level_status"] == "passed"
    assert p["unlock_next"] is True
    assert p["block_enrollment"] is False


def test_advance_on_final_level_unlocks_nothing():
    p = _prog(has_next_level=False)
    assert p["decision"] == "advance"
    assert p["unlock_next"] is False
    assert "complete" in p["reason"].lower()


def test_pass_on_last_attempt_still_advances():
    assert _prog(attempt_no=3)["decision"] == "advance"


def test_retry_when_failed_with_attempts_left():
    p = _prog(verdict="fail", attempt_no=1)
    assert p["decision"] == "retry"
    assert p["level_status"] == "unlocked"
    assert p["block_enrollment"] is False
    assert p["reason"] == "Attempt 1 of 3 used"


def test_still_retry_on_second_failure():
    assert _prog(verdict="fail", attempt_no=2)["decision"] == "retry"


def test_blocked_on_third_failure():
    p = _prog(verdict="fail", attempt_no=3)
    assert p["decision"] == "blocked"
    assert p["block_enrollment"] is True
    assert p["level_status"] == "failed"
    assert p["unlock_next"] is False
