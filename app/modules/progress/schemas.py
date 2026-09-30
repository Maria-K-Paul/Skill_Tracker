"""
app/modules/progress/schemas.py
---------------------------------
Pydantic schemas for the progress module.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class EnrollRequest(BaseModel):
    track_id: int = Field(gt=0)


class EnrollmentResponse(BaseModel):
    id: int
    student_id: int
    track_id: int
    enrolled_at: datetime
    is_blocked: bool


class LevelProgressResponse(BaseModel):
    id: int
    enrollment_id: int
    level_id: int
    status: str
    unlocked_at: datetime | None
    completed_at: datetime | None


class EligibilityCheckResponse(BaseModel):
    """Answers: 'can this student start / book a new attempt for this level right now?'"""
    level_id: int
    eligible: bool
    attempts_used: int = Field(ge=0)
    max_attempts: int = Field(gt=0)
    reason: Optional[str] = Field(
        default=None, description="Populated when eligible=False, e.g. 'All 3 attempts have been used'"
    )


class ProgressionDecisionResponse(BaseModel):
    id: int
    attempt_id: int
    result_id: int
    decision: str
    reason: Optional[str] = None
    decided_at: datetime
