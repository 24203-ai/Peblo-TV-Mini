import uuid
from sqlalchemy import Column, String, Integer, DateTime, func, UniqueConstraint
from app.db.base_class import Base

class Artwork(Base):
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    entity_type = Column(String, nullable=False) # 'show', 'season', 'episode'
    entity_id = Column(String, nullable=False)
    type = Column(String, nullable=False) # 'poster', 'banner', 'thumbnail'
    storage_key = Column(String, nullable=False)
    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    content_type = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        # Usually one artwork type per entity
        UniqueConstraint("entity_type", "entity_id", "type", name="uq_entity_artwork_type"),
    )
