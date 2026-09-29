
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Question(Base):
    __tablename__ = 'questions'
    id = Column(Integer, primary_key=True)
    assessment_id = Column(Integer, ForeignKey('assessments.id'))
    topic_id = Column(Integer, ForeignKey('topics.id'))
    subtopic_id = Column(Integer, ForeignKey('subtopics.id'))
    text = Column(Text)
    marks = Column(Integer)
    difficulty = Column(String)
    explanation = Column(Text)

class QuestionOption(Base):
    __tablename__ = 'question_options'
    id = Column(Integer, primary_key=True)
    question_id = Column(Integer, ForeignKey('questions.id'))
    text = Column(Text)
    is_correct = Column(Boolean)
