
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Attempt(Base):
    __tablename__ = 'attempts'
    id = Column(Integer, primary_key=True)
    slot_booking_id = Column(Integer, ForeignKey('slot_bookings.id'))
    student_id = Column(Integer, ForeignKey('students.id'))
    assessment_id = Column(Integer, ForeignKey('assessments.id'))
    # Denormalised copies (added when the assessment service was merged in).
    # They let us count attempts per level and find the enrollment without
    # importing the exams / progress models.
    enrollment_id = Column(Integer, ForeignKey('enrollments.id'), nullable=True)
    level_id = Column(Integer, ForeignKey('levels.id'), nullable=True)
    attempt_no = Column(Integer)
    started_at = Column(DateTime)
    submitted_at = Column(DateTime)
    status = Column(String)

class ExamSession(Base):
    __tablename__ = 'exam_sessions'
    id = Column(Integer, primary_key=True)
    attempt_id = Column(Integer, ForeignKey('attempts.id'))
    secret_code_id = Column(Integer, ForeignKey('secret_codes.id'))
    status = Column(String, default="ACTIVE")

    started_at = Column(DateTime)
    expires_at = Column(DateTime)
    ended_at = Column(DateTime)
    last_heartbeat_at = Column(DateTime)
    status = Column(String)

class ProctoringEvent(Base):
    __tablename__ = 'proctoring_events'
    id = Column(Integer, primary_key=True)
    exam_session_id = Column(Integer, ForeignKey('exam_sessions.id'))
    event_type = Column(String)
    occurred_at = Column(DateTime)
    details = Column(JSON)  # JSONB in postgres

class AttemptAnswer(Base):
    __tablename__ = 'attempt_answers'
    id = Column(Integer, primary_key=True)
    attempt_id = Column(Integer, ForeignKey('attempts.id'))
    question_id = Column(Integer, ForeignKey('questions.id'))
    selected_option_id = Column(Integer, ForeignKey('question_options.id'))
    answered_at = Column(DateTime)

class Result(Base):
    __tablename__ = 'results'
    id = Column(Integer, primary_key=True)
    attempt_id = Column(Integer, ForeignKey('attempts.id'))
    total_marks = Column(Integer)
    scored_marks = Column(Integer)
    percentage = Column(Float)
    verdict = Column(String)
    computed_at = Column(DateTime)

class TopicResult(Base):
    __tablename__ = 'topic_results'
    id = Column(Integer, primary_key=True)
    result_id = Column(Integer, ForeignKey('results.id'))
    topic_id = Column(Integer, ForeignKey('topics.id'))
    scored_marks = Column(Integer)
    total_marks = Column(Integer)
    accuracy = Column(Float)  # 0.0 - 1.0 (fraction), matches DIFFICULTY_THRESHOLD_* constants
