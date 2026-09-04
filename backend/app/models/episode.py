import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, func, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Episode(Base):
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    season_id = Column(String, ForeignKey("season.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    duration = Column(Integer, nullable=True) # duration in seconds
    language = Column(String, nullable=False)
    content_group = Column(String, nullable=False)
    category = Column(String, nullable=True)
    status = Column(String, nullable=False, default="draft")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    season = relationship("Season", back_populates="episodes")

    __table_args__ = (
        UniqueConstraint("content_group", "language", name="uq_content_group_language"),
    )
