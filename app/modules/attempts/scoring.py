"""
app/modules/attempts/scoring.py
-------------------------------
Pure scoring maths for an attempt (no database, no FastAPI).

Kept separate from service.py so it can be unit-tested on its own.
"""

from typing import Any, Mapping, Sequence

from app.core.constants import VERDICT_FAIL, VERDICT_PASS


def score_attempt(
    questions: Sequence[Mapping[str, Any]],
    selected_by_question: Mapping[int, int | None],
    pass_percentage: float,
) -> dict[str, Any]:
    """
    Score one attempt.

    Args:
        questions: items from ai_engine.service.get_questions_for_assessment()
            (need: question_id, topic_id, marks, correct_option_ids).
        selected_by_question: {question_id: selected_option_id}. A missing key
            (or None) means the question was skipped and earns 0 marks.
        pass_percentage: minimum percentage (0-100) needed for a PASS.

    Returns a dict with total_marks, scored_marks, percentage (0-100),
    verdict ("pass"/"fail"), and topics: one row per topic with
    scored_marks, total_marks and accuracy (a 0.0-1.0 fraction).
    """
    total_marks = 0
    scored_marks = 0
    topics: dict[int, dict[str, Any]] = {}

    for q in questions:
        marks = int(q.get("marks") or 0)
        selected = selected_by_question.get(q["question_id"])
        correct_ids = set(q.get("correct_option_ids") or [])
        earned = marks if (selected is not None and selected in correct_ids) else 0

        total_marks += marks
        scored_marks += earned

        topic_id = q.get("topic_id")
        if topic_id is not None:
            bucket = topics.setdefault(
                topic_id, {"topic_id": topic_id, "scored_marks": 0, "total_marks": 0}
            )
            bucket["scored_marks"] += earned
            bucket["total_marks"] += marks

    percentage = round(scored_marks / total_marks * 100, 2) if total_marks else 0.0
    # An assessment worth 0 marks can never be passed.
    verdict = VERDICT_PASS if (total_marks > 0 and percentage >= pass_percentage) else VERDICT_FAIL

    topic_rows = []
    for topic_id in sorted(topics):
        t = topics[topic_id]
        t["accuracy"] = round(t["scored_marks"] / t["total_marks"], 4) if t["total_marks"] else 0.0
        topic_rows.append(t)

    return {
        "total_marks": total_marks,
        "scored_marks": scored_marks,
        "percentage": percentage,
        "verdict": verdict,
        "topics": topic_rows,
    }
