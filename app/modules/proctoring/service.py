"""
app/modules/proctoring/service.py
---------------------------------
Business logic for proctoring exam sessions.
"""

import json
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.redis_client import redis_client
from app.core.exceptions import NotFoundError, ForbiddenError, ConflictError
from app.core.constants import (
    SESSION_STATUS_ACTIVE,
    SESSION_STATUS_DISCONNECTED,
    SESSION_STATUS_COMPLETED,
    SESSION_STATUS_TERMINATED,
    MAX_VIOLATIONS,
)
from app.modules.attempts.models import ExamSession, ProctoringEvent, Attempt
from app.modules.attempts import service as attempts_service
from app.utils.time_utils import utcnow_naive

async def _get_redis_key(session_id: int) -> str:
    return f"exam_session:{session_id}"

async def _get_session_from_db(session_id: int, db: AsyncSession) -> ExamSession:
    session = await db.get(ExamSession, session_id)
    if not session:
        raise NotFoundError("Exam session not found.")
    return session

async def create_session(student_id: int, booking_id: int, secret_code: str, db: AsyncSession) -> dict:
    """Validate exam key and create session (Normal Browser Stage 1)."""
    # This creates Attempt and ExamSession under the hood
    data = await attempts_service.start_exam(student_id, booking_id, secret_code, db)
    
    session_id = data["exam_session_id"]
    expires_at = data["expires_at"].isoformat() if data["expires_at"] else None
    
    # Store initial live state in Redis
    redis_key = await _get_redis_key(session_id)
    state = {
        "status": SESSION_STATUS_ACTIVE,
        "last_heartbeat": utcnow_naive().isoformat(),
        "expires_at": expires_at,
        "violation_count": 0
    }
    
    # TTL: Keep alive in Redis for a reasonable time (e.g. 24h)
    await redis_client.setex(redis_key, 86400, json.dumps(state))
    
    return {
        "attempt_id": data["attempt_id"],
        "exam_session_id": session_id,
        "status": state["status"],
        "last_heartbeat_at": utcnow_naive(),
        "expires_at": data["expires_at"],
        "violation_count": 0
    }

async def process_heartbeat(session_id: int, student_id: int, db: AsyncSession) -> dict:
    """Process a heartbeat from the SEB."""
    # Verify ownership
    session = await _get_session_from_db(session_id, db)
    attempt = await db.get(Attempt, session.attempt_id)
    if not attempt or attempt.student_id != student_id:
        raise ForbiddenError("Access denied.")
    
    redis_key = await _get_redis_key(session_id)
    state_str = await redis_client.get(redis_key)
    if not state_str:
        # Fallback if Redis is cleared
        state = {
            "status": session.status,
            "last_heartbeat": utcnow_naive().isoformat(),
            "expires_at": session.expires_at.isoformat() if session.expires_at else None,
            "violation_count": 0
        }
    else:
        state = json.loads(state_str)
        
    if state["status"] in (SESSION_STATUS_TERMINATED, SESSION_STATUS_COMPLETED):
        raise ConflictError(f"Session is already {state['status']}.")
        
    now = utcnow_naive()
    
    # Check expiry
    if state["expires_at"] and now > datetime.fromisoformat(state["expires_at"]):
        raise ConflictError("The exam session has expired.")
        
    if state["status"] == SESSION_STATUS_DISCONNECTED:
        state["status"] = SESSION_STATUS_ACTIVE
        # Record resume event
        event = ProctoringEvent(
            exam_session_id=session_id,
            event_type="SESSION_RESUMED",
            occurred_at=now,
            details={}
        )
        db.add(event)
        session.status = SESSION_STATUS_ACTIVE
        await db.flush()

    state["last_heartbeat"] = now.isoformat()
    await redis_client.setex(redis_key, 86400, json.dumps(state))
    
    return {
        "attempt_id": attempt.id,
        "exam_session_id": session_id,
        "status": state["status"],
        "last_heartbeat_at": now,
        "expires_at": datetime.fromisoformat(state["expires_at"]) if state["expires_at"] else None,
        "violation_count": state.get("violation_count", 0)
    }

async def record_event(session_id: int, student_id: int, event_type: str, details: dict, db: AsyncSession) -> dict:
    """Record a proctoring event and evaluate violations."""
    session = await _get_session_from_db(session_id, db)
    attempt = await db.get(Attempt, session.attempt_id)
    if not attempt or attempt.student_id != student_id:
        raise ForbiddenError("Access denied.")

    redis_key = await _get_redis_key(session_id)
    state_str = await redis_client.get(redis_key)
    state = json.loads(state_str) if state_str else {
        "status": session.status,
        "violation_count": 0,
        "expires_at": session.expires_at.isoformat() if session.expires_at else None
    }
    
    if state["status"] in (SESSION_STATUS_TERMINATED, SESSION_STATUS_COMPLETED):
        raise ConflictError(f"Session is already {state['status']}.")

    now = utcnow_naive()
    event = ProctoringEvent(
        exam_session_id=session_id,
        event_type=event_type,
        occurred_at=now,
        details=details
    )
    db.add(event)
    
    violation_types = {"TAB_SWITCH", "FULLSCREEN_EXIT", "COPY_ATTEMPT", "PASTE_ATTEMPT", "CUT_ATTEMPT"}
    if event_type in violation_types:
        state["violation_count"] += 1
        
        if state["violation_count"] >= MAX_VIOLATIONS:
            state["status"] = SESSION_STATUS_TERMINATED
            session.status = SESSION_STATUS_TERMINATED
            # Add termination event
            termination_event = ProctoringEvent(
                exam_session_id=session_id,
                event_type="SESSION_TERMINATED",
                occurred_at=now,
                details={"reason": "Max violations reached"}
            )
            db.add(termination_event)
            
    await db.flush()
    await redis_client.setex(redis_key, 86400, json.dumps(state))

    return {
        "attempt_id": attempt.id,
        "exam_session_id": session_id,
        "status": state["status"],
        "last_heartbeat_at": now,
        "expires_at": datetime.fromisoformat(state["expires_at"]) if state["expires_at"] else None,
        "violation_count": state["violation_count"]
    }

async def end_session(session_id: int, student_id: int, db: AsyncSession) -> dict:
    """End the session manually (e.g., when exam is submitted)."""
    session = await _get_session_from_db(session_id, db)
    attempt = await db.get(Attempt, session.attempt_id)
    if not attempt or attempt.student_id != student_id:
        raise ForbiddenError("Access denied.")

    session.status = SESSION_STATUS_COMPLETED
    session.ended_at = utcnow_naive()
    await db.flush()

    redis_key = await _get_redis_key(session_id)
    state_str = await redis_client.get(redis_key)
    if state_str:
        state = json.loads(state_str)
        state["status"] = SESSION_STATUS_COMPLETED
        await redis_client.setex(redis_key, 86400, json.dumps(state))

    return {
        "attempt_id": attempt.id,
        "exam_session_id": session_id,
        "status": SESSION_STATUS_COMPLETED,
        "last_heartbeat_at": session.last_heartbeat_at,
        "expires_at": session.expires_at,
        "violation_count": state.get("violation_count", 0) if state_str else 0
    }
