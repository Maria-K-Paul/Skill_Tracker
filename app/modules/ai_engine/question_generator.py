"""
app/modules/ai_engine/question_generator.py
---------------------------------------------
Orchestrates AI question generation for the question bank.

Questions are generated from topic/subtopic name+description and a target
difficulty only. No source documents. Output must pass question_validator,
then is persisted to Question/QuestionOption.

Workflow:
1. Receive topic_id + subtopic_id (optional) and target difficulty.
2. Fetch topic/subtopic text via domains service layer (name + description only).
3. Compute target difficulty via difficulty.py.
4. Build LLM prompt (from prompts/ directory).
5. Call llm_client.py to get raw response.
6. Parse response into candidate Question + QuestionOption objects.
7. Pass to question_validator.py — discard invalid questions.
8. Persist valid questions to Question / QuestionOption tables.

TODO: implement generate_questions(topic_id, subtopic_id?, count, student_id?) → list[Question]
TODO: implement _parse_llm_response(raw: str) → list[dict]
TODO: implement _persist_questions(questions: list[dict], assessment_id) → list[Question]
"""


async def generate_questions(
    topic_id: int,
    assessment_id: int,
    count: int = 5,
    subtopic_id: int | None = None,
    student_id: int | None = None,
) -> list:
    """
    Generate, validate, and persist questions for a topic.

    TODO: fetch topic text, compute difficulty, call LLM, validate, persist.
    """
    pass


async def _parse_llm_response(raw: str) -> list:
    """Parse raw LLM JSON/text output into structured question dicts."""
    # TODO: implement JSON extraction + fallback parsing
    return []


async def _persist_questions(questions: list, assessment_id: int) -> list:
    """Insert validated questions and their options into the database."""
    # TODO: bulk insert Question + QuestionOption rows
    return []
