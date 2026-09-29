
from sqlalchemy import Column, Integer, String, DateTime, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class AnalyticsRefreshJob(Base):
    __tablename__ = 'analytics_refresh_jobs'
    id = Column(Integer, primary_key=True)
    job_name = Column(String)
    started_at = Column(DateTime)
    finished_at = Column(DateTime)
    status = Column(String)

class StudentPerformanceSummary(Base):
    __tablename__ = 'student_performance_summary'
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('students.id'))
    track_id = Column(Integer, ForeignKey('tracks.id'))
    total_attempts = Column(Integer)
    passed_levels = Column(Integer)
    avg_percentage = Column(Float)
    last_updated = Column(DateTime)

class DomainPerformanceSummary(Base):
    __tablename__ = 'domain_performance_summary'
    id = Column(Integer, primary_key=True)
    track_id = Column(Integer, ForeignKey('tracks.id'))
    total_students = Column(Integer)
    avg_pass_rate = Column(Float)
    last_updated = Column(DateTime)

class SemesterProgressSummary(Base):
    __tablename__ = 'semester_progress_summary'
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('students.id'))
    academic_year_id = Column(Integer, ForeignKey('academic_years.id'))
    levels_completed = Column(Integer)
    last_updated = Column(DateTime)

class TopicGapSummary(Base):
    __tablename__ = 'topic_gap_summary'
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('students.id'))
    topic_id = Column(Integer, ForeignKey('topics.id'))
    avg_accuracy = Column(Float)
    attempt_count = Column(Integer)
    last_updated = Column(DateTime)

class DifficultyPerformanceSummary(Base):
    __tablename__ = 'difficulty_performance_summary'
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('students.id'))
    difficulty = Column(String)
    correct_count = Column(Integer)
    total_count = Column(Integer)
    last_updated = Column(DateTime)

class DashboardWidgetCache(Base):
    __tablename__ = 'dashboard_widget_cache'
    id = Column(Integer, primary_key=True)
    widget_key = Column(String)
    payload = Column(JSON)
    cached_at = Column(DateTime)
    expires_at = Column(DateTime)
