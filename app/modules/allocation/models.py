
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
