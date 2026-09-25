"""
app/modules/exams/schemas.py
-----------------------------
Pydantic schemas for the exams module (admin only).

TODO: Add AssessmentCreateRequest with level_id, title, duration_minutes, status.
TODO: Add AssessmentResponse.
TODO: Add AssessmentUpdateRequest for status transitions.
"""

from pydantic import BaseModel


class AssessmentCreateRequest(BaseModel):
    level_id: int
    title: str
    duration_minutes: int
    status: str = "draft"
    # TODO: validate status against ASSESSMENT_STATUS_* constants


class AssessmentResponse(BaseModel):
    id: int
    level_id: int
    title: str
    duration_minutes: int
    status: str
    created_by: int
