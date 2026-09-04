from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

# Episode Schemas
class EpisodeBase(BaseModel):
    title: str
    description: Optional[str] = None
    duration: Optional[int] = None
    language: str
    content_group: str
    category: Optional[str] = None
    status: str = "draft"

class EpisodeCreate(EpisodeBase):
    season_id: str

class EpisodeUpdate(EpisodeBase):
    pass

class EpisodeResponse(EpisodeBase):
    id: str
    season_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Season Schemas
class SeasonBase(BaseModel):
    season_number: int
    title: Optional[str] = None

class SeasonCreate(SeasonBase):
    show_id: str

class SeasonUpdate(SeasonBase):
    pass

class SeasonResponse(SeasonBase):
    id: str
    show_id: str
    episodes: List[EpisodeResponse] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Show Schemas
class ShowBase(BaseModel):
    title: str
    synopsis: Optional[str] = None
    section: Optional[str] = None
    status: str = "draft"

class ShowCreate(ShowBase):
    pass

class ShowUpdate(ShowBase):
    pass

class ShowResponse(ShowBase):
    id: str
    seasons: List[SeasonResponse] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
