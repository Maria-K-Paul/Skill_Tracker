"""
app/modules/ai_engine/difficulty.py
-------------------------------------
Determines the target question difficulty based on a student's historical
per-topic accuracy from topic_result and difficulty_performance_summary.

Difficulty selection rules:
- accuracy > 80%           => HARD   questions
- 50% <= accuracy <= 80%   => MEDIUM questions
- accuracy < 50%           => EASY   questions
- No historical data (first attempt) => default to MEDIUM

Accuracy is read from:
- topic_results.accuracy   — per-topic accuracy from the most recent result
- difficulty_performance_summary — aggregated by difficulty level

Cross-module calls: reads from topic_result and difficulty_performance_summary
via their respective service layers (not direct model imports).

TODO: implement get_target_difficulty(student_id, topic_id) → str
      - query difficulty_performance_summary for student + topic
      - fall back to MEDIUM on no data
TODO: implement compute_accuracy(correct_count, total_count) → float
"""

from app.core.constants import (
    DIFFICULTY_EASY,
    DIFFICULTY_MEDIUM,
    DIFFICULTY_HARD,
    DIFFICULTY_THRESHOLD_HARD,
    DIFFICULTY_THRESHOLD_MEDIUM,
)


def select_difficulty(accuracy: float | None) -> str:
    """
    Map a student's topic accuracy to a target difficulty level.

    Args:
        accuracy: float between 0.0 and 1.0, or None for first attempt.

    Returns:
        One of: 'easy', 'medium', 'hard'
    """
    if accuracy is None:
        return DIFFICULTY_MEDIUM  # first attempt — no data
    if accuracy > DIFFICULTY_THRESHOLD_HARD:
        return DIFFICULTY_HARD
    if accuracy >= DIFFICULTY_THRESHOLD_MEDIUM:
        return DIFFICULTY_MEDIUM
    return DIFFICULTY_EASY


async def get_target_difficulty(student_id: int, topic_id: int) -> str:
    """
    Look up the student's accuracy for this topic and return the target difficulty.

    TODO: query difficulty_performance_summary or topic_gap_summary for student+topic.
    TODO: aggregate accuracy across recent attempts for this topic.
    """
    # TODO: implement DB lookup
    accuracy = None  # placeholder — no data yet
    return select_difficulty(accuracy)
