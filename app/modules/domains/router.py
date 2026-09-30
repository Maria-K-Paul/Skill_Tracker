from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.modules.domains.models import Track, Level, Topic, Subtopic
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/domains", tags=["Domains"])

class TrackCreate(BaseModel):
    name: str
    description: str

class LevelCreate(BaseModel):
    level_no: int
    name: str
    description: str

class TopicCreate(BaseModel):
    name: str
    description: str
    sequence_no: int
    is_optional: bool = False

@router.get("/tracks")
async def list_tracks(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Track).where(Track.is_active == True))
    return result.scalars().all()

@router.post("/tracks", dependencies=[Depends(require_admin)])
async def create_track(track: TrackCreate, db: AsyncSession = Depends(get_db)):
    new_track = Track(name=track.name, description=track.description)
    db.add(new_track)
    await db.commit()
    await db.refresh(new_track)
    return new_track

@router.get("/tracks/{track_id}")
async def get_track(track_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Track).where(Track.id == track_id))
    track = result.scalars().first()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    return track

@router.post("/tracks/{track_id}/levels", dependencies=[Depends(require_admin)])
async def create_level(track_id: int, level: LevelCreate, db: AsyncSession = Depends(get_db)):
    new_level = Level(track_id=track_id, level_no=level.level_no, name=level.name, description=level.description)
    db.add(new_level)
    await db.commit()
    await db.refresh(new_level)
    return new_level

@router.get("/levels/{level_id}")
async def get_level(level_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Level).where(Level.id == level_id))
    level = result.scalars().first()
    if not level:
        raise HTTPException(status_code=404, detail="Level not found")
    
    # Get ordered topics that are REQUIRED
    topics_result = await db.execute(select(Topic).where(Topic.level_id == level_id, Topic.is_optional == False).order_by(Topic.sequence_no))
    topics = topics_result.scalars().all()
    
    return {"level": level, "topics": topics}

@router.post("/levels/{level_id}/topics", dependencies=[Depends(require_admin)])
async def create_topic(level_id: int, topic: TopicCreate, db: AsyncSession = Depends(get_db)):
    new_topic = Topic(level_id=level_id, name=topic.name, description=topic.description, sequence_no=topic.sequence_no, is_optional=topic.is_optional)
    db.add(new_topic)
    await db.commit()
    await db.refresh(new_topic)
    return new_topic
