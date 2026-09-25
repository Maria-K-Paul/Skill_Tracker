"""
app/modules/progress/schemas.py
---------------------------------
Pydantic schemas for the progress module.

TODO: Add EnrollmentResponse, LevelProgressResponse.
TODO: Add ProgressionDecisionResponse.
TODO: Add EligibilityCheckResponse for slots/service consumption.
"""

from pydantic import BaseModel
from datetime import datetime


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
