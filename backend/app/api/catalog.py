import os
import json
from typing import Optional, List
from fastapi import APIRouter, Query, HTTPException

router = APIRouter()

def _load_catalogue() -> dict:
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    path = os.path.join(root_dir, "assets", "catalogue.json")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Catalogue not published yet.")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("/search")
def search_catalog(
    q: Optional[str] = None,
    category: Optional[str] = None,
    language: Optional[str] = None,
    section: Optional[str] = None
):
    """
    Search the published catalogue.
    - q matches show title, episode title, or category (case-insensitive)
    - filters compose using AND
    - scaling limitation: parses the JSON file entirely in memory per request.
      If catalogue gets huge, this should move to Elasticsearch or similar index.
    """
    catalogue = _load_catalogue()
    
    results = []
    
    # Optional lowercase query for easier matching
    q_lower = q.lower() if q else None
    cat_lower = category.lower() if category else None
    
    for sec_name, shows in catalogue.items():
        # Apply section filter early
        if section and section.lower() != sec_name.lower():
            continue
            
        for show in shows:
            # We must filter episodes based on language and q (if q matches episode).
            # But if q matches the show title, all its valid episodes are included.
            
            show_title_match = False
            if q_lower and q_lower in show["title"].lower():
                show_title_match = True
                
            filtered_episodes = []
            
            for ep in show.get("episodes", []):
                # 1. Apply category filter
                if cat_lower and cat_lower != ep.get("category", "").lower():
                    continue
                    
                # 2. Apply language filter
                if language and language not in ep.get("languages", []):
                    continue
                    
                # 3. Apply 'q' text search (if not already matched by show title)
                if q_lower and not show_title_match:
                    ep_title_match = q_lower in ep["title"].lower()
                    ep_cat_match = q_lower in ep.get("category", "").lower()
                    if not (ep_title_match or ep_cat_match):
                        continue
                
                filtered_episodes.append(ep)
                
            # If the show has filtered episodes (or if it matched the query and we just want to return the show, 
            # but usually we only return shows that have matching episodes given the filters, unless the show 
            # has no episodes but matched. Let's return the show if it has filtered episodes OR if it matched q and had no language/category filters that stripped everything)
            if filtered_episodes:
                # Create a copy of the show with only the matching episodes
                show_copy = show.copy()
                show_copy["episodes"] = filtered_episodes
                show_copy["section"] = sec_name # attach section for convenience
                results.append(show_copy)

    # Sort deterministically by show title
    results.sort(key=lambda s: s["title"])
    return {"results": results}
