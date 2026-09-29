import logging
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
import datetime

logger = logging.getLogger(__name__)

class AuditLog(Base):
    __tablename__ = 'audit_logs'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String, index=True)
    resource_type = Column(String)
    resource_id = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

async def write_audit_log(session, user_id, action, resource_type, resource_id, details=None):
    logger.info(f"Audit Log - User {user_id} performed {action} on {resource_type} {resource_id}. Details: {details}")
    log = AuditLog(user_id=user_id, action=action, resource_type=resource_type, resource_id=str(resource_id), details=details)
    session.add(log)
    await session.commit()

