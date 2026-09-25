"""
app/modules/domains/schemas.py
-------------------------------
Pydantic schemas for the domains module.

TODO: Add TrackListResponse, LevelDetailResponse.
TODO: Add TopicResponse with ordered subtopics list.
TODO: Add SubtopicResponse.
"""

from pydantic import BaseModel


class TrackResponse(BaseModel):
    id: int
    name: str
    description: str
    is_active: bool


class LevelResponse(BaseModel):
    id: int
    track_id: int
    level_no: int
    name: str
    description: str


class TopicResponse(BaseModel):
    id: int
    level_id: int
    name: str
    description: str
    sequence_no: int


class SubtopicResponse(BaseModel):
    id: int
    topic_id: int
    name: str
    description: str
    sequence_no: int
