"""
app/modules/analytics/router.py
---------------------------------
Analytics module router — admin dashboard and summary data endpoints.

Placeholder returns {"module": "analytics", "status": "ok"}.

TODO: POST /analytics/refresh              — manually trigger refresh_all() (admin)
TODO: GET  /analytics/student/{id}         — student performance summary
TODO: GET  /analytics/domain/{track_id}    — domain performance summary
TODO: GET  /analytics/topic-gaps/{student_id} — topic gap summary for a student
TODO: GET  /analytics/dashboard/{widget_key}  — cached widget data
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/", summary="Analytics module health check")
async def analytics_root() -> dict:
    """Placeholder endpoint — confirms the analytics module is mounted."""
    return {"module": "analytics", "status": "ok"}
