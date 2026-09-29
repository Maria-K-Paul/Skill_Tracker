
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
