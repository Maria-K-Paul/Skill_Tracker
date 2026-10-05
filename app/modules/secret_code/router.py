"""
app/modules/secret_code/router.py
-----------------------------------
Secret code module router — admin-only endpoints.

SECURITY: No student-facing routes exist in this module.
Every code reveal writes an audit log entry via service.reveal_code_for_admin().

Routes:
  GET  /secret-code/{secret_code_id}/status  — code metadata, no plaintext
  POST /secret-code/{secret_code_id}/reveal  — decrypt for admin (audited)
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.modules.secret_code import schemas, service

router = APIRouter()


@router.get(
    "/{secret_code_id}/status",
    response_model=schemas.SecretCodeStatusResponse,
    summary="Get secret code status (admin)",
)
async def get_secret_code_status(
    secret_code_id: int,
    current_admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> schemas.SecretCodeStatusResponse:
    """
    Return metadata for a secret code without decrypting it.
    Safe to call repeatedly — no audit log entry is written.
    """
    from sqlalchemy import select
    from app.modules.secret_code.models import SecretCode
    from app.core.exceptions import NotFoundError

    code = await db.get(SecretCode, secret_code_id)
    if code is None:
        raise NotFoundError(f"Secret code {secret_code_id} not found.")
    return schemas.SecretCodeStatusResponse.model_validate(code)


@router.post(
    "/{secret_code_id}/reveal",
    response_model=schemas.SecretCodeRevealResponse,
    summary="Reveal decrypted secret code (admin, audited)",
)
async def reveal_secret_code(
    secret_code_id: int,
    current_admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> schemas.SecretCodeRevealResponse:
    """
    Decrypt and return the plaintext secret code.  Admin only.
    Every call writes one audit log entry — by design.
    """
    from app.modules.secret_code.models import SecretCode
    from app.core.exceptions import NotFoundError

    admin_id: int = current_admin["id"]
    plaintext = await service.reveal_code_for_admin(
        secret_code_id=secret_code_id,
        revealed_by_user_id=admin_id,
        db=db,
    )
    await db.commit()

    code = await db.get(SecretCode, secret_code_id)
    if code is None:
        raise NotFoundError(f"Secret code {secret_code_id} not found.")

    return schemas.SecretCodeRevealResponse(
        id=code.id,
        allocation_id=code.allocation_id,
        plaintext_code=plaintext,
        is_used=code.is_used,
        expires_at=code.expires_at,
    )
