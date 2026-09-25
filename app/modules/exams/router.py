"""
app/modules/exams/router.py
----------------------------
Exams module router — admin-only assessment management.

Placeholder returns {"module": "exams", "status": "ok"}.

TODO: POST /exams/                          — create assessment
TODO: GET  /exams/{assessment_id}           — get assessment detail
TODO: PATCH /exams/{assessment_id}/status  — update status
TODO: GET  /exams/                          — list assessments
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/", summary="Exams module health check")
async def exams_root() -> dict:
    """Placeholder endpoint — confirms the exams module is mounted."""
    return {"module": "exams", "status": "ok"}
