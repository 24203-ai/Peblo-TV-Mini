import uuid
from sqlalchemy import Column, String, DateTime, JSON, func
from app.db.base_class import Base

class PublishRun(Base):
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    initiated_by = Column(String, nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, nullable=False) # 'started', 'success', 'failed'
    counts = Column(JSON, nullable=True)
    error_info = Column(JSON, nullable=True)
