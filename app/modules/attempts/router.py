"""
app/modules/attempts/router.py
--------------------------------
Attempts module router — exam session lifecycle for students and admins.

Placeholder returns {"module": "attempts", "status": "ok"}.

TODO: POST /attempts/start              — student: enter code, start session
TODO: POST /attempts/{id}/answer        — student: submit an answer
TODO: POST /attempts/{id}/submit        — student: finish and score the attempt
TODO: POST /attempts/{id}/heartbeat     — student: update last_heartbeat_at
TODO: POST /attempts/{id}/event         — student: record proctoring event
TODO: GET  /attempts/{id}/result        — student: view result after submission
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/", summary="Attempts module health check")
async def attempts_root() -> dict:
    """Placeholder endpoint — confirms the attempts module is mounted."""
    return {"module": "attempts", "status": "ok"}
