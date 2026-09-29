
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Assessment(Base):
    __tablename__ = 'assessments'
    id = Column(Integer, primary_key=True)
    level_id = Column(Integer, ForeignKey('levels.id'))
    title = Column(String)
    duration_minutes = Column(Integer)
    status = Column(String)
    created_by = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime)
