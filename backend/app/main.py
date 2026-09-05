from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api import auth, shows, seasons, episodes, artwork, publish, catalog
import os
app = FastAPI(
    title="Peblo TV Mini API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For take-home, allow all or specific local ports later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/admin/auth", tags=["auth"])
app.include_router(shows.router, prefix="/admin/shows", tags=["shows"])
app.include_router(seasons.router, prefix="/admin/seasons", tags=["seasons"])
app.include_router(episodes.router, prefix="/admin/episodes", tags=["episodes"])
app.include_router(artwork.router, prefix="/admin/artwork", tags=["artwork"])
app.include_router(publish.router, prefix="/admin/catalog/publish", tags=["publish"])

# Public viewer API
app.include_router(catalog.router, prefix="/catalog", tags=["catalog"])

# Mount static files for assets
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
assets_dir = os.path.join(root_dir, "assets")
os.makedirs(assets_dir, exist_ok=True)
app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/health")
def health_check(db: Session = Depends(get_db)) -> dict[str, str]:
    """
    Health check endpoint.
    Alerting Reasoning: In production, we would alert on the failure rate of this endpoint 
    dropping below 99.9% over a 5-minute rolling window, or if latency spikes above 500ms. 
    This is because this endpoint verifies core API responsiveness and database connectivity (via Depends(get_db)). 
    If this fails, the CMS cannot save content and the publish job cannot run, meaning a critical outage.
    """
    try:
        # Simple query to verify DB connection is alive
        db.execute("SELECT 1")
    except Exception as e:
        raise HTTPException(status_code=503, detail="Database connection failed")
        
    return {"status": "healthy"}