import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_active_admin, get_current_user
from app.models.publish_run import PublishRun
from app.services.publish_validation import validate_for_publish
from app.services.catalogue_builder import build_catalogue
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class PublishResult(BaseModel):
    id: str
    status: str
    created_at: datetime
    error_log: dict

@router.post("/", response_model=PublishResult)
def trigger_publish(db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    # 1. Run validation
    problems = validate_for_publish(db)
    
    # 2. Record Publish Run
    status = "failed" if problems else "success"
    
    run = PublishRun(
        id=str(uuid.uuid4()),
        initiated_by=current_user.id,
        status=status,
        error_info={"problems": problems} if problems else {}
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    
    if problems:
        # If there are problems, we do NOT build the catalogue
        raise HTTPException(
            status_code=400, 
            detail={
                "message": "Validation failed. Catalogue was not published.", 
                "run_id": run.id,
                "problems": problems
            }
        )
        
    # 3. Build atomic JSON
    # Path inside /assets for public access
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    dest_path = os.path.join(root_dir, "assets", "catalogue.json")
    
    counts = build_catalogue(db, dest_path)
    
    return {
        "id": run.id,
        "status": run.status,
        "created_at": run.started_at or datetime.now(),
        "error_log": {"counts": counts}
    }

@router.get("/runs", response_model=List[PublishResult])
def get_publish_runs(db: Session = Depends(get_db), current_user = Depends(get_current_user), limit: int = 20):
    return db.query(PublishRun).order_by(PublishRun.started_at.desc()).limit(limit).all()

@router.get("/validation-report")
def get_validation_report(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Returns all CURRENT publish-blocking problems, grouped for editors.
    Editors can view this to fix content before an admin publishes.
    """
    problems = validate_for_publish(db)
    
    # Group by entity for editor-friendly structure
    grouped = {}
    for p in problems:
        entity_key = f"{p['entity']}: {p['title']}"
        if entity_key not in grouped:
            grouped[entity_key] = {
                "entity": p["entity"],
                "id": p["id"],
                "title": p["title"],
                "issues": []
            }
        
        # Provide human-readable reason & action
        action = "Please update the record."
        if "no section" in p["message"]:
            action = "Assign a section to the show."
        elif "no duration" in p["message"]:
            action = "Edit the episode and specify its duration in seconds."
        elif "thumbnail" in p["message"]:
            action = "Upload a thumbnail artwork for the episode."
        elif "parent show" in p["message"] and "not published" in p["message"]:
            action = "Publish the parent show first, or remove the episode."
            
        grouped[entity_key]["issues"].append({
            "message": p["message"],
            "suggested_action": action
        })
        
    return {
        "status": "blocked" if problems else "ready",
        "total_issues": len(problems),
        "report": list(grouped.values())
    }

