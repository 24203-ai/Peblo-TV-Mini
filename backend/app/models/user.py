from sqlalchemy import Column, String
from sqlalchemy.orm import declared_attr
from app.db.base_class import Base

class User(Base):
    @declared_attr
    def __tablename__(cls) -> str:
        return "users"
    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'admin' or 'editor'
