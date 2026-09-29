
from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Hall(Base):
    __tablename__ = 'halls'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    location = Column(String)
    capacity = Column(Integer)
