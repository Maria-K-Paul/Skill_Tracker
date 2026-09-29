
from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Track(Base):
    __tablename__ = 'tracks'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(Text)
    is_active = Column(Boolean, default=True)

class Level(Base):
    __tablename__ = 'levels'
    id = Column(Integer, primary_key=True)
    track_id = Column(Integer, ForeignKey('tracks.id'))
    level_no = Column(Integer)
    name = Column(String)
    description = Column(Text)

class Topic(Base):
    __tablename__ = 'topics'
    id = Column(Integer, primary_key=True)
    level_id = Column(Integer, ForeignKey('levels.id'))
    name = Column(String)
    description = Column(Text)
    sequence_no = Column(Integer)

class Subtopic(Base):
    __tablename__ = 'subtopics'
    id = Column(Integer, primary_key=True)
    topic_id = Column(Integer, ForeignKey('topics.id'))
    name = Column(String)
    description = Column(Text)
    sequence_no = Column(Integer)
