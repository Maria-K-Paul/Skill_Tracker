"""
app/modules/secret_code/router.py
-----------------------------------
Secret code module router — admin-only endpoints.

SECURITY: No student-facing routes here. All reveals are audited.
Placeholder returns {"module": "secret-code", "status": "ok"}.

TODO: GET /secret-code/{allocation_id}/status — code status (no plaintext)
TODO: POST /secret-code/{allocation_id}/reveal — decrypt for admin (audited)
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/", summary="Secret code module health check")
async def secret_code_root() -> dict:
    """Placeholder endpoint — confirms the secret_code module is mounted."""
    return {"module": "secret-code", "status": "ok"}
