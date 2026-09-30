"""
app/modules/attempts/router.py
--------------------------------
Attempts module router - exam session lifecycle for students.
Mounted by main.py at /api/v1/attempts.

  POST /attempts/start              enter the secret code, start the exam
  GET  /attempts                    my attempts
  GET  /attempts/{id}               one attempt with my saved answers
  POST /attempts/{id}/answer        save / change one answer
  POST /attempts/{id}/submit        finish, score, get the result
  POST /attempts/{id}/heartbeat     "still here" ping
  POST /attempts/{id}/event         record a proctoring event (tab switch, ...)
  GET  /attempts/{id}/result        result + topic breakdown + progression decision

Routers stay thin: authenticate, call the service, commit, shape the response.
"""

from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_student_id
from app.modules.attempts import schemas, service

router = APIRouter()


@router.post(
    "/start",
    response_model=schemas.ExamSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start an exam with the secret code",
)
async def start_exam(
    body: schemas.StartExamRequest,
    student_id: int = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    data = await service.start_exam(student_id, body.booking_id, body.secret_code, db)
    await db.commit()
    return data


@router.get("/", response_model=list[schemas.AttemptResponse], summary="List my attempts")
async def list_my_attempts(
    student_id: int = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    return await service.list_student_attempts(student_id, db)


@router.get("/{attempt_id}", response_model=schemas.AttemptDetailResponse, summary="Attempt detail")
async def get_attempt(
    attempt_id: int = Path(gt=0),
    student_id: int = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return await service.get_attempt_detail(attempt_id, student_id, db)


@router.post("/{attempt_id}/answer", response_model=schemas.AnswerResponse, summary="Save one answer")
async def submit_answer(
    body: schemas.SubmitAnswerRequest,
    attempt_id: int = Path(gt=0),
    student_id: int = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    data = await service.submit_answer(attempt_id, student_id, body.question_id, body.selected_option_id, db)
    await db.commit()
    return data


@router.post("/{attempt_id}/submit", response_model=schemas.ResultResponse, summary="Finish and score the attempt")
async def submit_attempt(
    body: schemas.SubmitAttemptRequest | None = None,
    attempt_id: int = Path(gt=0),
    student_id: int = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    answers = [a.model_dump() for a in body.answers] if body else None
    data = await service.score_and_finish(attempt_id, student_id, db, answers=answers)
    await db.commit()
    return data


@router.post("/{attempt_id}/heartbeat", response_model=schemas.HeartbeatResponse, summary="Session heartbeat")
async def heartbeat(
    attempt_id: int = Path(gt=0),
    student_id: int = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    data = await service.heartbeat(attempt_id, student_id, db)
    await db.commit()
    return data


@router.post(
    "/{attempt_id}/event",
    response_model=schemas.ProctoringEventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record a proctoring event",
)
async def proctoring_event(
    body: schemas.ProctoringEventRequest,
    attempt_id: int = Path(gt=0),
    student_id: int = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    data = await service.record_proctoring_event(attempt_id, student_id, body.event_type, body.details, db)
    await db.commit()
    return data


@router.get("/{attempt_id}/result", response_model=schemas.ResultResponse, summary="My result")
async def get_result(
    attempt_id: int = Path(gt=0),
    student_id: int = Depends(get_current_student_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return await service.get_result(attempt_id, student_id, db)
