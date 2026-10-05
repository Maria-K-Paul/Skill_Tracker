"""
app/modules/analytics/schemas.py
----------------------------------
Pydantic schemas for the analytics module.

Response models for all analytics endpoints and summary tables.
"""

from pydantic import BaseModel, Field, model_validator
from datetime import datetime
from typing import Optional


class StudentPerformanceSummaryResponse(BaseModel):
    """Response model for student performance summary."""
    student_id: int
    track_id: int
    total_attempts: int = Field(..., ge=0, description="Total number of attempts")
    passed_levels: int = Field(..., ge=0, description="Number of levels passed")
    avg_percentage: float = Field(..., ge=0.0, le=100.0, description="Average percentage across attempts")
    last_updated: datetime

    class Config:
        from_attributes = True


class DomainPerformanceSummaryResponse(BaseModel):
    """Response model for domain (track) performance summary."""
    track_id: int
    total_students: int = Field(..., ge=0, description="Total students enrolled in track")
    avg_pass_rate: float = Field(..., ge=0.0, le=1.0, description="Average pass rate (0.0 to 1.0)")
    last_updated: datetime

    class Config:
        from_attributes = True


class SemesterProgressSummaryResponse(BaseModel):
    """Response model for semester progress summary."""
    student_id: int
    academic_year_id: int
    levels_completed: int = Field(..., ge=0, description="Number of levels completed this semester")
    last_updated: datetime

    class Config:
        from_attributes = True


class TopicGapSummaryResponse(BaseModel):
    """Response model for topic gap summary (skill gaps)."""
    student_id: int
    topic_id: int
    avg_accuracy: float = Field(..., ge=0.0, le=1.0, description="Average accuracy for this topic (0.0 to 1.0)")
    attempt_count: int = Field(..., gt=0, description="Number of attempts on this topic")
    last_updated: datetime

    class Config:
        from_attributes = True


class DifficultyPerformanceSummaryResponse(BaseModel):
    """Response model for difficulty performance summary."""
    student_id: int
    difficulty: str = Field(..., description="Difficulty level: easy, medium, or hard")
    correct_count: int = Field(..., ge=0, description="Number of correct answers")
    total_count: int = Field(..., gt=0, description="Total number of questions attempted")
    accuracy: float = Field(default=0.0, ge=0.0, le=1.0, description="Calculated accuracy (correct/total)")
    last_updated: datetime

    class Config:
        from_attributes = True

    @model_validator(mode="after")
    def compute_accuracy(self) -> "DifficultyPerformanceSummaryResponse":
        if self.total_count > 0:
            self.accuracy = self.correct_count / self.total_count
        return self


class DashboardWidgetCacheResponse(BaseModel):
    """Response model for dashboard widget cache."""
    widget_key: str
    payload: dict = Field(..., description="Cached widget data as JSON")
    cached_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True


class AnalyticsRefreshJobResponse(BaseModel):
    """Response model for analytics refresh job status."""
    id: int
    job_name: str
    started_at: datetime
    finished_at: Optional[datetime] = None
    status: str = Field(..., description="Job status: running, success, or failed")

    class Config:
        from_attributes = True


class RefreshTriggerResponse(BaseModel):
    """Response model for manual refresh trigger."""
    job_id: int
    status: str
    message: str
