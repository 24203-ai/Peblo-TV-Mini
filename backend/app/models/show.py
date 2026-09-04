import uuid
from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Show(Base):
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    synopsis = Column(String, nullable=True)
    section = Column(String, nullable=True)
    status = Column(String, nullable=False, default="draft") # draft, published
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    seasons = relationship("Season", back_populates="show", cascade="all, delete-orphan")
