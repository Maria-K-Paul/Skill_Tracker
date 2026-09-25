"""
app/modules/ai_engine/router.py
---------------------------------
AI engine module router — admin-only question generation trigger.

Placeholder returns {"module": "ai-engine", "status": "ok"}.

TODO: POST /ai-engine/generate        — trigger question generation for a topic
TODO: GET  /ai-engine/questions       — list generated questions for review
TODO: DELETE /ai-engine/questions/{id} — remove a question from bank
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/", summary="AI engine module health check")
async def ai_engine_root() -> dict:
    """Placeholder endpoint — confirms the ai_engine module is mounted."""
    return {"module": "ai-engine", "status": "ok"}
