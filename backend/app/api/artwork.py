import os
import uuid
import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.artwork import Artwork

from app.services.storage import get_storage
from app.services.validation import validate_artwork
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class ArtworkResponse(BaseModel):
    id: str
    entity_type: str
    entity_id: str
    type: str
    storage_key: str
    width: int
    height: int
    file_size_bytes: int
    content_type: str
    created_at: datetime
    url: Optional[str] = None

    class Config:
        from_attributes = True

@router.post("/", response_model=ArtworkResponse)
async def upload_artwork(
    entity_type: str = Form(...),
    entity_id: str = Form(...),
    type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Save uploaded file to temp path
    suffix = os.path.splitext(file.filename)[1] if file.filename else ""
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # Validate
        is_valid, error_msg, metadata = validate_artwork(tmp_path, type)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_msg)
            
        # Store
        storage = get_storage()
        ext = metadata["content_type"]
        storage_key = f"{entity_type}/{entity_id}/{type}_{uuid.uuid4().hex[:8]}.{ext}"
        
        storage.save(tmp_path, storage_key)
        
        # Save to DB
        # Remove old artwork for same entity_type, entity_id, type if any
        existing = db.query(Artwork).filter_by(entity_type=entity_type, entity_id=entity_id, type=type).first()
        if existing:
            db.delete(existing)
            db.flush()
            
        artwork = Artwork(
            entity_type=entity_type,
            entity_id=entity_id,
            type=type,
            storage_key=storage_key,
            width=metadata["width"],
            height=metadata["height"],
            file_size_bytes=metadata["file_size_bytes"],
            content_type=metadata["content_type"]
        )
        db.add(artwork)
        db.commit()
        db.refresh(artwork)
        
        resp = ArtworkResponse.model_validate(artwork)
        resp.url = storage.get_url(storage_key)
        return resp
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
