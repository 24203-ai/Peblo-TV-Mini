import json
import os
import tempfile
from sqlalchemy.orm import Session
from app.models.show import Show
from app.models.season import Season
from app.models.episode import Episode
from app.models.artwork import Artwork
from app.services.storage import get_storage

def build_catalogue(db: Session, dest_path: str):
    """
    Builds the catalogue from published content in the database.
    Writes to dest_path atomically.
    """
    storage = get_storage()
    
    # We want to group shows by section
    catalogue = {}
    
    # Fetch all published shows (ordered deterministically by section, then title)
    shows = db.query(Show).filter(Show.status == "published").order_by(Show.section, Show.title).all()
    
    # Pre-fetch all artworks for faster lookup
    artworks = db.query(Artwork).all()
    artwork_map = {}
    for a in artworks:
        if a.entity_type not in artwork_map:
            artwork_map[a.entity_type] = {}
        if a.entity_id not in artwork_map[a.entity_type]:
            artwork_map[a.entity_type][a.entity_id] = {}
        artwork_map[a.entity_type][a.entity_id][a.type] = storage.get_url(a.storage_key)

    for show in shows:
        section = show.section or "uncategorized"
        if section not in catalogue:
            catalogue[section] = []
            
        show_data = {
            "id": show.id,
            "title": show.title,
            "synopsis": show.synopsis,
            "artwork": artwork_map.get("show", {}).get(show.id, {}),
            "seasons": [],
            "episodes": []
        }
        
        # Seasons
        seasons = db.query(Season).filter(Season.show_id == show.id).order_by(Season.season_number).all()
        for season in seasons:
            # We don't display season 0 as a normal season per requirements, 
            # we can include it in a "trailers" section of the show, but let's just 
            # add it to a specific field if it's 0.
            season_data = {
                "id": season.id,
                "season_number": season.season_number,
                "title": season.title,
                "artwork": artwork_map.get("season", {}).get(season.id, {}),
            }
            if season.season_number == 0:
                show_data["trailers_season"] = season_data
            else:
                show_data["seasons"].append(season_data)
                
            # Episodes
            episodes = db.query(Episode).filter(
                Episode.season_id == season.id, 
                Episode.status == "published"
            ).order_by(Episode.content_group, Episode.title).all()
            
            # Collapse episodes by content_group
            collapsed_episodes = {}
            for ep in episodes:
                if ep.content_group not in collapsed_episodes:
                    collapsed_episodes[ep.content_group] = {
                        "id": ep.id, # Primary ID
                        "season_id": season.id,
                        "season_number": season.season_number,
                        "title": ep.title,
                        "description": ep.description,
                        "duration": ep.duration,
                        "content_group": ep.content_group,
                        "category": ep.category,
                        "languages": [],
                        "artwork": artwork_map.get("episode", {}).get(ep.id, {})
                    }
                # If artwork is missing from the primary, try to borrow from variant
                if not collapsed_episodes[ep.content_group]["artwork"]:
                    collapsed_episodes[ep.content_group]["artwork"] = artwork_map.get("episode", {}).get(ep.id, {})
                    
                collapsed_episodes[ep.content_group]["languages"].append(ep.language)
                
            # Ensure deterministic order of languages, then add to show
            for cg in sorted(collapsed_episodes.keys()):
                ep_data = collapsed_episodes[cg]
                ep_data["languages"].sort()
                show_data["episodes"].append(ep_data)

            # Inherit season artwork from the first episode if missing
            if season_data.get("artwork") == {} and show_data["episodes"]:
                season_data["artwork"] = show_data["episodes"][-len(collapsed_episodes)]["artwork"]

        # Sort episodes by season number then title deterministically
        show_data["episodes"].sort(key=lambda e: (e["season_number"], e["title"]))

        # Inherit show artwork from the first episode if missing
        if show_data.get("artwork") == {} and show_data["episodes"]:
            show_data["artwork"] = show_data["episodes"][0]["artwork"]

        catalogue[section].append(show_data)

    # Atomic write
    dir_name = os.path.dirname(dest_path)
    os.makedirs(dir_name, exist_ok=True)
    
    # Create temp file in the same directory to ensure atomic replace across same filesystem
    fd, tmp_path = tempfile.mkstemp(dir=dir_name, prefix="catalogue_", suffix=".tmp")
    with os.fdopen(fd, 'w', encoding="utf-8") as f:
        json.dump(catalogue, f, ensure_ascii=False, indent=2)
        f.flush()
        os.fsync(f.fileno())

    # Atomically replace
    os.replace(tmp_path, dest_path)
    
    # Return some counts
    counts = {
        "sections": len(catalogue),
        "shows": sum(len(shows) for shows in catalogue.values()),
        "episodes": sum(len(show["episodes"]) for section_shows in catalogue.values() for show in section_shows)
    }
    return counts
