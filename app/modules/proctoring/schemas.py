"""
app/modules/proctoring/schemas.py
---------------------------------
Pydantic schemas for the proctoring module.
"""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field

class CreateSessionRequest(BaseModel):
    booking_id: int = Field(gt=0, description="The slot booking this exam is for")
    secret_code: str = Field(min_length=1, description="Plaintext code handed out in the hall")

class ProctoringEventRequest(BaseModel):
    event_type: str = Field(min_length=1, max_length=50, description="e.g. TAB_SWITCH, FULLSCREEN_EXIT")
    details: Optional[dict[str, Any]] = None

class ProctoringSessionResponse(BaseModel):
    attempt_id: int
    exam_session_id: int
    status: str
    last_heartbeat_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    violation_count: int = 0
