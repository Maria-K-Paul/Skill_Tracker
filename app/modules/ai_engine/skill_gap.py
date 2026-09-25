"""
app/modules/ai_engine/skill_gap.py
------------------------------------
Identifies skill gaps per topic based on topic_result accuracy data.

Used by the AI engine to prioritize which topics to generate questions for,
and by analytics to populate topic_gap_summary.

TODO: implement get_weak_topics(student_id, level_id) → list[dict]
      - query topic_results for the student across all attempts on this level
      - compute average accuracy per topic
      - return topics where avg_accuracy < threshold (e.g. < 0.5)
TODO: implement get_topic_accuracy_map(student_id, level_id) → dict[topic_id, float]
      - aggregate accuracy across attempts ordered by attempt date
"""


async def get_weak_topics(student_id: int, level_id: int) -> list:
    """
    Return topics with below-threshold accuracy for a student on a level.
    Used to guide AI question generation focus.

    TODO: query topic_results via attempts service layer.
    """
    return []


async def get_topic_accuracy_map(student_id: int, level_id: int) -> dict:
    """
    Return a mapping of topic_id → average accuracy for a student on a level.

    TODO: aggregate topic_results across attempts for this level.
    """
    return {}
