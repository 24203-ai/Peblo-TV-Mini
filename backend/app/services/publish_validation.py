from typing import List, Dict
from sqlalchemy.orm import Session
from app.models.show import Show
from app.models.season import Season
from app.models.episode import Episode
from app.models.artwork import Artwork

def validate_for_publish(db: Session) -> List[Dict]:
    """
    Returns a list of problems that block publishing.
    Each problem is a dictionary: {"entity": "Show/Episode", "id": "...", "message": "..."}
    If empty, publishing can proceed.
    """
    problems = []

    # 1. A published show must have a section
    shows = db.query(Show).filter(Show.status == "published").all()
    for show in shows:
        if not show.section:
            problems.append({
                "entity": "Show",
                "id": show.id,
                "title": show.title,
                "message": f"Show '{show.title}' is marked for publishing but has no section."
            })
            
    # 2. An episode cannot be published without duration and required artwork
    # We will assume required artwork for an episode is 'thumbnail'.
    episodes = db.query(Episode).filter(Episode.status == "published").all()
    
    # We also need to check (content_group, language) uniqueness, but that is already
    # enforced by the database unique constraint uq_content_group_language.
    
    for ep in episodes:
        if not ep.duration:
            problems.append({
                "entity": "Episode",
                "id": ep.id,
                "title": ep.title,
                "message": f"Episode '{ep.title}' cannot be published because it has no duration."
            })
            
        artwork = db.query(Artwork).filter(
            Artwork.entity_type == "episode", 
            Artwork.entity_id == ep.id, 
            Artwork.type == "thumbnail"
        ).first()
        
        if not artwork:
            problems.append({
                "entity": "Episode",
                "id": ep.id,
                "title": ep.title,
                "message": f"Episode '{ep.title}' cannot be published without a thumbnail artwork."
            })

        # Ensure the episode's show is also published, otherwise it's orphaned in the catalogue
        season = db.query(Season).filter(Season.id == ep.season_id).first()
        if season:
            show = db.query(Show).filter(Show.id == season.show_id).first()
            if show and show.status != "published":
                problems.append({
                    "entity": "Episode",
                    "id": ep.id,
                    "title": ep.title,
                    "message": f"Episode '{ep.title}' is published, but its parent show '{show.title}' is not published."
                })
            
    return problems
