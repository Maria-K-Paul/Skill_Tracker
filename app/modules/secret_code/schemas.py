"""
app/modules/secret_code/schemas.py
------------------------------------
Pydantic schemas for the secret_code module (admin only).

SECURITY NOTE: SecretCodeResponse must NEVER be returned to student endpoints.

TODO: Add SecretCodeAdminResponse (includes decrypted code — for print only).
TODO: Add SecretCodeStatusResponse (is_used, expires_at — no code value).
"""

from pydantic import BaseModel
from datetime import datetime


class SecretCodeStatusResponse(BaseModel):
    """Safe schema — no plaintext code, safe to log."""
    id: int
    allocation_id: int
    is_used: bool
    expires_at: datetime
    used_at: datetime | None
