from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.show import Show
from app.schemas.content import ShowCreate, ShowUpdate, ShowResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ShowResponse])
def get_shows(db: Session = Depends(get_db), current_user = Depends(get_current_user), skip: int = 0, limit: int = 100):
    return db.query(Show).offset(skip).limit(limit).all()

@router.get("/{show_id}", response_model=ShowResponse)
def get_show(show_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    show = db.query(Show).filter(Show.id == show_id).first()
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")
    return show

@router.post("/", response_model=ShowResponse)
def create_show(show: ShowCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_show = Show(**show.model_dump())
    db.add(db_show)
    db.commit()
    db.refresh(db_show)
    return db_show

@router.put("/{show_id}", response_model=ShowResponse)
def update_show(show_id: str, show_in: ShowUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_show = db.query(Show).filter(Show.id == show_id).first()
    if not db_show:
        raise HTTPException(status_code=404, detail="Show not found")
    
    update_data = show_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_show, key, value)
        
    db.commit()
    db.refresh(db_show)
    return db_show

@router.delete("/{show_id}")
def delete_show(show_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_show = db.query(Show).filter(Show.id == show_id).first()
    if not db_show:
        raise HTTPException(status_code=404, detail="Show not found")
    db.delete(db_show)
    db.commit()
    return {"ok": True}
