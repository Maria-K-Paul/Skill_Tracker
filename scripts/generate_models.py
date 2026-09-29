import os

SCHEMA = """
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, JSON, Date, Time
from sqlalchemy.orm import relationship
from app.core.database import Base

"""

users_models = """
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    is_active = Column(Boolean, default=True)
    failed_login_count = Column(Integer, default=0)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

class Department(Base):
    __tablename__ = 'departments'
    id = Column(Integer, primary_key=True)
    name = Column(String)

class AcademicYear(Base):
    __tablename__ = 'academic_years'
    id = Column(Integer, primary_key=True)
    label = Column(String)

class Student(Base):
    __tablename__ = 'students'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    department_id = Column(Integer, ForeignKey('departments.id'))
    academic_year_id = Column(Integer, ForeignKey('academic_years.id'))
    roll_number = Column(String)

class DomainIncharge(Base):
    __tablename__ = 'domain_incharge'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    track_id = Column(Integer, ForeignKey('tracks.id'))
"""

auth_models = """
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Role(Base):
    __tablename__ = 'roles'
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)

class UserRole(Base):
    __tablename__ = 'user_roles'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    role_id = Column(Integer, ForeignKey('roles.id'))

class RefreshToken(Base):
    __tablename__ = 'refresh_tokens'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    token_hash = Column(String)
    expires_at = Column(DateTime)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime)
"""

domains_models = """
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
"""

progress_models = """
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
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
    decided_at = Column(DateTime)
"""

exams_models = """
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
"""

slots_models = """
from sqlalchemy import Column, Integer, String, Date, Time, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Slot(Base):
    __tablename__ = 'slots'
    id = Column(Integer, primary_key=True)
    assessment_id = Column(Integer, ForeignKey('assessments.id'))
    date = Column(Date)
    start_time = Column(Time)
    end_time = Column(Time)
    booking_cutoff = Column(DateTime)
    status = Column(String)

class SlotHall(Base):
    __tablename__ = 'slot_halls'
    id = Column(Integer, primary_key=True)
    slot_id = Column(Integer, ForeignKey('slots.id'))
    hall_id = Column(Integer, ForeignKey('halls.id'))

class SlotBooking(Base):
    __tablename__ = 'slot_bookings'
    id = Column(Integer, primary_key=True)
    slot_id = Column(Integer, ForeignKey('slots.id'))
    student_id = Column(Integer, ForeignKey('students.id'))
    attempt_number = Column(Integer)
    booked_at = Column(DateTime)
    status = Column(String)
"""

halls_models = """
from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Hall(Base):
    __tablename__ = 'halls'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    location = Column(String)
    capacity = Column(Integer)
"""

allocation_models = """
from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Allocation(Base):
    __tablename__ = 'allocations'
    id = Column(Integer, primary_key=True)
    slot_booking_id = Column(Integer, ForeignKey('slot_bookings.id'))
    hall_id = Column(Integer, ForeignKey('halls.id'))
    seat_no = Column(Integer)
    allocated_at = Column(DateTime)
"""

secret_code_models = """
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class SecretCode(Base):
    __tablename__ = 'secret_codes'
    id = Column(Integer, primary_key=True)
    allocation_id = Column(Integer, ForeignKey('allocations.id'))
    code_encrypted = Column(String)
    is_used = Column(Boolean, default=False)
    expires_at = Column(DateTime)
    used_at = Column(DateTime)
"""

attempts_models = """
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Attempt(Base):
    __tablename__ = 'attempts'
    id = Column(Integer, primary_key=True)
    slot_booking_id = Column(Integer, ForeignKey('slot_bookings.id'))
    student_id = Column(Integer, ForeignKey('students.id'))
    assessment_id = Column(Integer, ForeignKey('assessments.id'))
    attempt_no = Column(Integer)
    started_at = Column(DateTime)
    submitted_at = Column(DateTime)
    status = Column(String)

class ExamSession(Base):
    __tablename__ = 'exam_sessions'
    id = Column(Integer, primary_key=True)
    attempt_id = Column(Integer, ForeignKey('attempts.id'))
    secret_code_id = Column(Integer, ForeignKey('secret_codes.id'))
    started_at = Column(DateTime)
    expires_at = Column(DateTime)
    ended_at = Column(DateTime)
    last_heartbeat_at = Column(DateTime)

class ProctoringEvent(Base):
    __tablename__ = 'proctoring_events'
    id = Column(Integer, primary_key=True)
    exam_session_id = Column(Integer, ForeignKey('exam_sessions.id'))
    event_type = Column(String)
    occurred_at = Column(DateTime)
    details = Column(String)  # JSONB in postgres, but String is safer in sqlalchemy if JSON is not imported, let's use JSON from sqlalchemy
"""

attempts_models_fix = attempts_models.replace("from sqlalchemy import Column", "from sqlalchemy import Column, JSON\nfrom sqlalchemy import Column")
attempts_models_fix = attempts_models_fix.replace("details = Column(String)", "details = Column(JSON)")

attempts_models_extra = """

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
    accuracy = Column(Float)
"""
attempts_models_final = attempts_models_fix + attempts_models_extra

ai_engine_models = """
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
"""

analytics_models = """
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
"""

core_models = """
from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = 'audit_log'
    id = Column(Integer, primary_key=True)
    action = Column(String)
    actor_user_id = Column(Integer, ForeignKey('users.id'))
    target_user_id = Column(Integer, ForeignKey('users.id'))
    details = Column(JSON)
    ip_address = Column(String)
    created_at = Column(DateTime)
"""

def write_models(path, content):
    with open(path, 'w') as f:
        f.write(content)

base_path = "c:/Studies/Skill_wise-learning/Skill_Tracker/app/modules/"
write_models(base_path + "users/models.py", users_models)
write_models(base_path + "auth/models.py", auth_models)
write_models(base_path + "domains/models.py", domains_models)
write_models(base_path + "progress/models.py", progress_models)
write_models(base_path + "exams/models.py", exams_models)
write_models(base_path + "slots/models.py", slots_models)
write_models(base_path + "halls/models.py", halls_models)
write_models(base_path + "allocation/models.py", allocation_models)
write_models(base_path + "secret_code/models.py", secret_code_models)
write_models(base_path + "attempts/models.py", attempts_models_final)
write_models(base_path + "ai_engine/models.py", ai_engine_models)
write_models(base_path + "analytics/models.py", analytics_models)
write_models("c:/Studies/Skill_wise-learning/Skill_Tracker/app/core/audit.py", core_models)

print("Done")
