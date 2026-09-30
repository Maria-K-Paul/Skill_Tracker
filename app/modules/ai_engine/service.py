"""
app/modules/ai_engine/service.py
--------------------------------
Read access to the question bank for OTHER modules.

attempts/ must not import ai_engine's models.py, so it asks this service for
the questions of an assessment instead.

SECURITY: the dicts returned here contain the CORRECT option ids. They are for
server-side scoring only and must never be sent to a student.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.ai_engine.models import Question, QuestionOption


async def get_questions_for_assessment(assessment_id: int, db: AsyncSession) -> list[dict]:
    """
    Return every question of an assessment together with its option ids.

    Each item:
        {
          "question_id": int,
          "topic_id": int | None,
          "marks": int,
          "option_ids": [int, ...],          # every valid choice
          "correct_option_ids": [int, ...],  # the choice(s) that earn marks
        }
    """
    q_result = await db.execute(
        select(Question).where(Question.assessment_id == assessment_id).order_by(Question.id)
    )
    questions = list(q_result.scalars().all())
    if not questions:
        return []

    question_ids = [q.id for q in questions]
    o_result = await db.execute(
        select(QuestionOption)
        .where(QuestionOption.question_id.in_(question_ids))
        .order_by(QuestionOption.id)
    )
    options_by_question: dict[int, list[QuestionOption]] = {}
    for opt in o_result.scalars().all():
        options_by_question.setdefault(opt.question_id, []).append(opt)

    items: list[dict] = []
    for q in questions:
        opts = options_by_question.get(q.id, [])
        items.append(
            {
                "question_id": q.id,
                "topic_id": q.topic_id,
                "marks": q.marks or 0,
                "option_ids": [o.id for o in opts],
                "correct_option_ids": [o.id for o in opts if o.is_correct],
            }
        )
    return items
