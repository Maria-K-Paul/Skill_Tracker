
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Enrollment(Base):
    __tablename__ = 'enrollments'
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('students.id'))
    track_id = Column(Integer, ForeignKey('tracks.id'))
    enrolled_at = Column(DateTime)
    is_blocked = Column(Boolean, default=False)

class LevelProgress(Base):
    __tablename__ = 'level_progress'
    id = Column(Integer, primary_key=True)
    enrollment_id = Column(Integer, ForeignKey('enrollments.id'))
    level_id = Column(Integer, ForeignKey('levels.id'))
    status = Column(String)
    unlocked_at = Column(DateTime)
    completed_at = Column(DateTime)

class ProgressionDecision(Base):
    __tablename__ = 'progression_decisions'
    id = Column(Integer, primary_key=True)
    attempt_id = Column(Integer, ForeignKey('attempts.id'))
    result_id = Column(Integer, ForeignKey('results.id'))
    decision = Column(String)
    reason = Column(Text)  # human-readable explanation, e.g. 'Failed after 3 attempts'
    decided_at = Column(DateTime)
