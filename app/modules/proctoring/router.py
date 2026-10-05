"""
app/modules/proctoring/router.py
--------------------------------
Proctoring module router - secure exam environment management.
Mounted by main.py at /api/v1/proctoring.
"""

from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_student_id
from app.modules.proctoring import schemas, service

router = APIRouter()

@router.post(
    "/sessions",
    response_model=schemas.ProctoringSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Validate exam key and create session (Normal Browser)",
)
async def create_session(
    body: schemas.CreateSessionRequest,
    student_id: int = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    data = await service.create_session(student_id, body.booking_id, body.secret_code, db)
    await db.commit()
    return data

@router.post(
    "/sessions/{session_id}/heartbeat",
    response_model=schemas.ProctoringSessionResponse,
    summary="Update live session heartbeat (SEB)",
)
async def heartbeat(
    session_id: int = Path(gt=0),
    student_id: int = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    data = await service.process_heartbeat(session_id, student_id, db)
    await db.commit()
    return data

@router.post(
    "/sessions/{session_id}/events",
    response_model=schemas.ProctoringSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record a proctoring event and evaluate violations",
)
async def record_event(
    body: schemas.ProctoringEventRequest,
    session_id: int = Path(gt=0),
    student_id: int = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    data = await service.record_event(session_id, student_id, body.event_type, body.details or {}, db)
    await db.commit()
    return data

@router.post(
    "/sessions/{session_id}/end",
    response_model=schemas.ProctoringSessionResponse,
    summary="End the exam session",
)
async def end_session(
    session_id: int = Path(gt=0),
    student_id: int = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    data = await service.end_session(session_id, student_id, db)
    await db.commit()
    return data
