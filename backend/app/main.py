from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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
def health_check() -> dict[str, str]:
    return {"status": "healthy"}