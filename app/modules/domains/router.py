"""
app/modules/domains/router.py
------------------------------
Domains module router — track/level/topic browsing for students and admins.

Placeholder returns {"module": "domains", "status": "ok"}.

TODO: GET /domains/tracks               — list active tracks
TODO: GET /domains/tracks/{track_id}    — track detail
TODO: GET /domains/levels/{level_id}    — level detail with ordered topics
TODO: POST /domains/tracks              — admin: create track
TODO: POST /domains/tracks/{id}/levels  — admin: add level
TODO: POST /domains/levels/{id}/topics  — admin: add topic
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/", summary="Domains module health check")
async def domains_root() -> dict:
    """Placeholder endpoint — confirms the domains module is mounted."""
    return {"module": "domains", "status": "ok"}
