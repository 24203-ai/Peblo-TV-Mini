from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.season import Season
from app.schemas.content import SeasonCreate, SeasonUpdate, SeasonResponse


router = APIRouter()

@router.get("/", response_model=List[SeasonResponse])
def get_seasons(show_id: str = None, db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    query = db.query(Season)
    if show_id:
        query = query.filter(Season.show_id == show_id)
    return query.offset(skip).limit(limit).all()

@router.get("/{season_id}", response_model=SeasonResponse)
def get_season(season_id: str, db: Session = Depends(get_db)):
    season = db.query(Season).filter(Season.id == season_id).first()
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
    return season

@router.post("/", response_model=SeasonResponse)
def create_season(season: SeasonCreate, db: Session = Depends(get_db)):
    db_season = Season(**season.model_dump())
    db.add(db_season)
    db.commit()
    db.refresh(db_season)
    return db_season

@router.put("/{season_id}", response_model=SeasonResponse)
def update_season(season_id: str, season_in: SeasonUpdate, db: Session = Depends(get_db)):
    db_season = db.query(Season).filter(Season.id == season_id).first()
    if not db_season:
        raise HTTPException(status_code=404, detail="Season not found")
    
    update_data = season_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_season, key, value)
        
    db.commit()
    db.refresh(db_season)
    return db_season

@router.delete("/{season_id}")
def delete_season(season_id: str, db: Session = Depends(get_db)):
    db_season = db.query(Season).filter(Season.id == season_id).first()
    if not db_season:
        raise HTTPException(status_code=404, detail="Season not found")
    db.delete(db_season)
    db.commit()
    return {"ok": True}
