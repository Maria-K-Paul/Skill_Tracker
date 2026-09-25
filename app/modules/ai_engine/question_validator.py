"""
app/modules/ai_engine/question_validator.py
---------------------------------------------
Validates LLM-generated questions before they are persisted to the question bank.

Validation rules (to be enforced):
- Question text must be non-empty and above minimum length.
- Must have exactly 4 options (or configurable count).
- Exactly one option must be marked is_correct=True.
- Explanation must be non-empty.
- Difficulty must be one of: easy, medium, hard.
- No duplicate question text against existing questions for this topic (fuzzy match optional).

TODO: implement validate_question(question_dict) → bool
TODO: implement validate_batch(questions: list[dict]) → list[dict]  (returns only valid ones)
TODO: add duplicate detection against existing DB questions.
TODO: add content quality checks (e.g. minimum word count, no placeholder text).
"""

from app.core.constants import DIFFICULTY_CHOICES


def validate_question(question: dict) -> bool:
    """
    Validate a single parsed question dict from the LLM.
    Returns True if the question passes all rules.

    TODO: implement all validation checks listed in module docstring.
    """
    # TODO: check text length
    # TODO: check options count
    # TODO: check exactly one correct option
    # TODO: check difficulty in DIFFICULTY_CHOICES
    # TODO: check explanation non-empty
    return True  # placeholder — always passes until implemented


def validate_batch(questions: list) -> list:
    """Return only the questions from the list that pass validate_question()."""
    return [q for q in questions if validate_question(q)]
