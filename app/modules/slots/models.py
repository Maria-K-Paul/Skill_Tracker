from sqlalchemy import Column, Integer, String, Date, Time, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from enum import Enum

class SlotStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"

class BookingStatus(str, Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"

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
