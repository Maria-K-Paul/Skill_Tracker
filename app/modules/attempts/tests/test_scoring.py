"""
Unit tests for attempts/scoring.py (ported from the assessment service's
test_evaluation.py). Pure logic - no database needed.
"""

from app.modules.attempts.scoring import score_attempt

# Same shape as ai_engine.service.get_questions_for_assessment()
QUESTIONS = [
    {"question_id": 1, "topic_id": 1, "marks": 5, "option_ids": [10, 11], "correct_option_ids": [10]},
    {"question_id": 2, "topic_id": 1, "marks": 5, "option_ids": [20, 21], "correct_option_ids": [21]},
    {"question_id": 3, "topic_id": 2, "marks": 10, "option_ids": [30, 31], "correct_option_ids": [30]},
]  # 20 marks in total


def test_all_correct_answers_pass():
    r = score_attempt(QUESTIONS, {1: 10, 2: 21, 3: 30}, pass_percentage=50)
    assert r["scored_marks"] == 20
    assert r["total_marks"] == 20
    assert r["percentage"] == 100.0
    assert r["verdict"] == "pass"


def test_all_wrong_answers_fail():
    r = score_attempt(QUESTIONS, {1: 11, 2: 20, 3: 31}, pass_percentage=50)
    assert r["scored_marks"] == 0
    assert r["verdict"] == "fail"


def test_unanswered_questions_score_zero():
    r = score_attempt(QUESTIONS, {1: 10}, pass_percentage=50)  # only Q1 answered, correctly
    assert r["scored_marks"] == 5
    assert r["percentage"] == 25.0
    assert r["verdict"] == "fail"


def test_none_selection_counts_as_skipped():
    r = score_attempt(QUESTIONS, {1: None, 2: None, 3: None}, pass_percentage=50)
    assert r["scored_marks"] == 0


def test_exactly_on_pass_mark_passes():
    r = score_attempt(QUESTIONS, {3: 30}, pass_percentage=50)  # 10 / 20 = 50 %
    assert r["percentage"] == 50.0
    assert r["verdict"] == "pass"


def test_topic_breakdown():
    r = score_attempt(QUESTIONS, {1: 10, 2: 20, 3: 30}, pass_percentage=50)
    topics = {t["topic_id"]: t for t in r["topics"]}
    assert topics[1]["scored_marks"] == 5 and topics[1]["total_marks"] == 10
    assert topics[1]["accuracy"] == 0.5
    assert topics[2]["scored_marks"] == 10 and topics[2]["accuracy"] == 1.0
    assert [t["topic_id"] for t in r["topics"]] == [1, 2]


def test_zero_total_marks_never_passes():
    r = score_attempt([{"question_id": 1, "topic_id": 1, "marks": 0, "correct_option_ids": [1]}], {1: 1}, 0)
    assert r["total_marks"] == 0
    assert r["percentage"] == 0.0
    assert r["verdict"] == "fail"


def test_question_without_topic_counts_in_total_but_not_in_topics():
    qs = [{"question_id": 1, "topic_id": None, "marks": 4, "correct_option_ids": [1]}]
    r = score_attempt(qs, {1: 1}, 50)
    assert r["scored_marks"] == 4
    assert r["topics"] == []
