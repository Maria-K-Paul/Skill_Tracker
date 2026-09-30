"""
app/modules/progress/router.py
--------------------------------
Progress module router - enrollment, level status, eligibility.
Mounted by main.py at /api/v1/progress.

  POST /progress/enroll                  student enrolls in a track
  GET  /progress/is-eligible/{level_id}  can I attempt this level now?
  GET  /progress/level/{level_id}        my progress on a level

TODO: GET /progress/my-tracks - student's enrolled tracks with levels
"""

from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_student_id
from app.modules.progress import schemas, service

router = APIRouter()


@router.post(
    "/enroll",
    response_model=schemas.EnrollmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Enroll in a track",
)
async def enroll(
    body: schemas.EnrollRequest,
    student_id: int = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    data = await service.enroll_student(student_id, body.track_id, db)
    await db.commit()
    return data


@router.get(
    "/is-eligible/{level_id}",
    response_model=schemas.EligibilityCheckResponse,
    summary="Eligibility check for a level",
)
async def is_eligible(
    level_id: int = Path(gt=0),
    student_id: int = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return await service.get_eligibility_detail(student_id, level_id, db)


@router.get(
    "/level/{level_id}",
    response_model=schemas.LevelProgressResponse,
    summary="My progress on a level",
)
async def level_status(
    level_id: int = Path(gt=0),
    student_id: int = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return await service.get_level_status(student_id, level_id, db)
