"""
app/modules/analytics/schemas.py
----------------------------------
Pydantic schemas for the analytics module.

TODO: Add StudentPerformanceSummaryResponse.
TODO: Add DomainPerformanceSummaryResponse.
TODO: Add TopicGapSummaryResponse for student skill-gap view.
TODO: Add DashboardWidgetCacheResponse for dashboard endpoints.
"""

from pydantic import BaseModel
from datetime import datetime


class StudentPerformanceSummaryResponse(BaseModel):
    student_id: int
    track_id: int
    total_attempts: int
    passed_levels: int
    avg_percentage: float
    last_updated: datetime


class TopicGapSummaryResponse(BaseModel):
    student_id: int
    topic_id: int
    avg_accuracy: float
    attempt_count: int
    last_updated: datetime
