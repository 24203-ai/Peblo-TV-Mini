from typing import Any
from sqlalchemy.orm import declarative_base, declared_attr

class CustomBase:
    # Generate __tablename__ automatically unless specified
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__dict__.get("__tablename__", cls.__name__.lower())

Base = declarative_base(cls=CustomBase)
