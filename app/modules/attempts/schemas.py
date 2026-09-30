"""
app/modules/attempts/schemas.py
---------------------------------
Pydantic schemas for the attempts module.

SECURITY: no schema here ever contains the secret code, the correct option, or
per-question marks - students only see what they chose and the final result.
"""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field, computed_field, field_validator

from app.core.constants import VERDICT_PASS


# ── Requests ──────────────────────────────────────────────────────────────────

class StartExamRequest(BaseModel):
    """Student enters their secret code to start an exam session."""
    booking_id: int = Field(gt=0, description="The slot booking this exam is for")
    secret_code: str = Field(min_length=1, description="Plaintext code handed out in the hall")

    @field_validator("secret_code")
    @classmethod
    def strip_code(cls, value: str) -> str:
        return value.strip()


class SubmitAnswerRequest(BaseModel):
    question_id: int = Field(gt=0)
    selected_option_id: int = Field(gt=0)


class SubmitAttemptRequest(BaseModel):
    """
    Body of POST /attempts/{id}/submit.
    `answers` is optional: answers are normally saved one by one via /answer,
    but the client may also send the remaining ones here in a single request.
    """
    answers: list[SubmitAnswerRequest] = []

    @field_validator("answers")
    @classmethod
    def no_duplicate_questions(cls, answers: list[SubmitAnswerRequest]) -> list[SubmitAnswerRequest]:
        ids = [a.question_id for a in answers]
        if len(ids) != len(set(ids)):
            raise ValueError("Each question can only be answered once per submission")
        return answers


class ProctoringEventRequest(BaseModel):
    event_type: str = Field(min_length=1, max_length=50, description="e.g. 'tab_switch'")
    details: Optional[dict[str, Any]] = None


# ── Responses ─────────────────────────────────────────────────────────────────

class ExamSessionResponse(BaseModel):
    """Returned when an exam starts. Contains no secret code."""
    attempt_id: int
    exam_session_id: int
    attempt_no: int
    status: str
    started_at: datetime
    expires_at: Optional[datetime] = None


class AnswerResponse(BaseModel):
    attempt_id: int
    question_id: int
    selected_option_id: int
    answered_at: Optional[datetime] = None


class AttemptAnswerResponse(BaseModel):
    id: int
    question_id: int
    selected_option_id: Optional[int] = None
    answered_at: Optional[datetime] = None


class AttemptResponse(BaseModel):
    id: int
    slot_booking_id: Optional[int] = None
    student_id: int
    assessment_id: Optional[int] = None
    enrollment_id: Optional[int] = None
    level_id: Optional[int] = None
    attempt_no: int
    status: str
    started_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None


class AttemptDetailResponse(AttemptResponse):
    answers: list[AttemptAnswerResponse] = []


class TopicResultResponse(BaseModel):
    id: int
    topic_id: int
    scored_marks: int
    total_marks: int
    accuracy: float


class ProgressionSummary(BaseModel):
    """What happens next: advance, retry or blocked."""
    id: int
    attempt_id: int
    result_id: int
    decision: str
    reason: Optional[str] = None
    decided_at: datetime


class ResultResponse(BaseModel):
    id: int
    attempt_id: int
    total_marks: int
    scored_marks: int
    percentage: float
    verdict: str
    computed_at: datetime
    topic_results: list[TopicResultResponse] = []
    progression: Optional[ProgressionSummary] = None

    @computed_field  # type: ignore[prop-decorator]
    @property
    def is_passed(self) -> bool:
        return self.verdict == VERDICT_PASS


class HeartbeatResponse(BaseModel):
    attempt_id: int
    last_heartbeat_at: datetime


class ProctoringEventResponse(BaseModel):
    id: int
    event_type: str
    occurred_at: datetime
