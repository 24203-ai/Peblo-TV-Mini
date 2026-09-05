from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.db.database import get_db
from app.models.episode import Episode
from app.schemas.content import EpisodeCreate, EpisodeUpdate, EpisodeResponse


router = APIRouter()

@router.get("/", response_model=List[EpisodeResponse])
def get_episodes(season_id: str = None, db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    query = db.query(Episode)
    if season_id:
        query = query.filter(Episode.season_id == season_id)
    return query.offset(skip).limit(limit).all()

@router.get("/{episode_id}", response_model=EpisodeResponse)
def get_episode(episode_id: str, db: Session = Depends(get_db)):
    episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")
    return episode

@router.post("/", response_model=EpisodeResponse)
def create_episode(episode: EpisodeCreate, db: Session = Depends(get_db)):
    db_episode = Episode(**episode.model_dump())
    db.add(db_episode)
    try:
        db.commit()
        db.refresh(db_episode)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Episode with this content_group and language already exists")
    return db_episode

@router.put("/{episode_id}", response_model=EpisodeResponse)
def update_episode(episode_id: str, episode_in: EpisodeUpdate, db: Session = Depends(get_db)):
    db_episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not db_episode:
        raise HTTPException(status_code=404, detail="Episode not found")
    
    update_data = episode_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_episode, key, value)
        
    try:
        db.commit()
        db.refresh(db_episode)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Episode with this content_group and language already exists")
    return db_episode

@router.delete("/{episode_id}")
def delete_episode(episode_id: str, db: Session = Depends(get_db)):
    db_episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not db_episode:
        raise HTTPException(status_code=404, detail="Episode not found")
    db.delete(db_episode)
    db.commit()
    return {"ok": True}
