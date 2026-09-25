"""
app/modules/users/schemas.py
----------------------------
Pydantic schemas for the users module.

TODO: Add StudentProfileResponse schema.
TODO: Add DomainInchargeResponse with track_id scope.
TODO: Add StudentListResponse for admin queries.
"""

from pydantic import BaseModel


class StudentProfileResponse(BaseModel):
    """Response schema for student profile endpoint."""
    id: int
    roll_number: str
    department: str
    academic_year: str
    # TODO: add email from linked user record
