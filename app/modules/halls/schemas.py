"""
app/modules/halls/schemas.py
-----------------------------
Pydantic schemas for the halls module (admin only).

TODO: Add HallCreateRequest, HallResponse, HallUpdateRequest.
"""

from pydantic import BaseModel


class HallCreateRequest(BaseModel):
    name: str
    location: str
    capacity: int


class HallResponse(BaseModel):
    id: int
    name: str
    location: str
    capacity: int
