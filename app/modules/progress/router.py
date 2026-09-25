"""
app/modules/progress/router.py
--------------------------------
Progress module router — enrollment, level status, progression decisions.

Placeholder returns {"module": "progress", "status": "ok"}.

TODO: POST /progress/enroll              — student enrolls in a track
TODO: GET  /progress/my-tracks          — student's enrolled tracks with levels
TODO: GET  /progress/level/{level_id}   — student's progress on a level
TODO: GET  /progress/is-eligible/{level_id} — eligibility check
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/", summary="Progress module health check")
async def progress_root() -> dict:
    """Placeholder endpoint — confirms the progress module is mounted."""
    return {"module": "progress", "status": "ok"}
