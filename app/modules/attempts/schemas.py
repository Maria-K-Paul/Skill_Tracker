"""
app/modules/attempts/schemas.py
---------------------------------
Pydantic schemas for the attempts module.

TODO: Add StartExamRequest (secret_code input from student).
TODO: Add SubmitAnswerRequest (question_id, selected_option_id).
TODO: Add ResultResponse with topic-level breakdown.
TODO: Add ExamSessionResponse (no secret code in response).
TODO: Add ProctoringEventRequest.
"""

from pydantic import BaseModel
from datetime import datetime


class StartExamRequest(BaseModel):
    """Student enters their secret code to start an exam session."""
    secret_code: str  # plaintext entered in hall; verified + consumed by service


class SubmitAnswerRequest(BaseModel):
    question_id: int
    selected_option_id: int


class ResultResponse(BaseModel):
    id: int
    attempt_id: int
    total_marks: int
    scored_marks: int
    percentage: float
    verdict: str
    computed_at: datetime
