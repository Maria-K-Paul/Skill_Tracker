from datetime import datetime
from enum import Enum

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Time

from app.core.database import Base


class SlotStatus(str, Enum):
    DRAFT = "draft"
    OPEN = "open"
    CLOSED = "closed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class BookingStatus(str, Enum):
    BOOKED = "booked"
    CANCELLED = "cancelled"


class Slot(Base):
    __tablename__ = 'slots'
    id = Column(Integer, primary_key=True)
    assessment_id = Column(Integer, ForeignKey('assessments.id'), nullable=True)
    start_time = Column(Time)
    end_time = Column(Time)
    booking_cutoff = Column(DateTime)
    status = Column(String, default=SlotStatus.DRAFT.value)
    date = Column(Date, nullable=True)


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
    booked_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String)
    cancelled_at = Column(DateTime, nullable=True)
