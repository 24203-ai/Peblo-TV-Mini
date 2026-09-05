import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.db.database import SessionLocal
from app.models.show import Show
from app.models.season import Season
from app.models.episode import Episode
from app.models.user import User
from app.core.security import get_password_hash # Wait, I haven't implemented this yet!

def main():
    db = SessionLocal()
    
    # 1. Clear existing data
    db.query(Episode).delete()
    db.query(Season).delete()
    db.query(Show).delete()
    db.query(User).delete()
    db.commit()

    admin = User(id="admin_1", username="admin", hashed_password=get_password_hash("admin123"), role="admin")
    editor = User(id="editor_1", username="editor", hashed_password=get_password_hash("editor123"), role="editor")
    db.add_all([admin, editor])
    db.commit()

    # 3. Load seed data
    seed_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "seed_shows.json")
    with open(seed_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 4. Insert data
    # To keep the seed idempotent based on titles, we'll keep a cache
    shows_cache = {}
    seasons_cache = {}

    for row in data:
        show_title = row.get("show_title")
        if not show_title:
            continue
            
        if show_title not in shows_cache:
            show = Show(title=show_title, synopsis=row.get("synopsis"), section=row.get("section"), status=row.get("status", "draft"))
            db.add(show)
            db.flush() # Get ID
            shows_cache[show_title] = show
        
        show = shows_cache[show_title]

        season_key = f"{show.id}_{row.get('season_number', 1)}"
        if season_key not in seasons_cache:
            season = Season(show_id=show.id, season_number=row.get("season_number", 1))
            db.add(season)
            db.flush()
            seasons_cache[season_key] = season
        
        season = seasons_cache[season_key]

        existing = db.query(Episode).filter_by(content_group=row.get("content_group"), language=row.get("language")).first()
        if existing:
            print(f"Skipping duplicate episode: {row.get('content_group')} {row.get('language')}")
            continue

        ep = Episode(
            season_id=season.id,
            title=row.get("episode_title"),
            description=row.get("synopsis"),
            duration=row.get("duration_seconds"),
            language=row.get("language"),
            content_group=row.get("content_group"),
            category=row.get("categories")[0] if row.get("categories") else None,
            status=row.get("status", "draft")
        )
        db.add(ep)
        db.flush()
        
        from app.models.artwork import Artwork
        artwork_list = row.get("artwork_available", [])
        for art_type in artwork_list:
            if art_type == "thumbnail":
                art = Artwork(entity_type="episode", entity_id=ep.id, type="thumbnail", storage_key="thumb_good.jpg", width=640, height=360, file_size_bytes=4308, content_type="jpeg")
            elif art_type == "poster":
                art = Artwork(entity_type="episode", entity_id=ep.id, type="poster", storage_key="poster_good.jpg", width=600, height=900, file_size_bytes=9292, content_type="jpeg")
            elif art_type == "banner":
                art = Artwork(entity_type="episode", entity_id=ep.id, type="banner", storage_key="banner_good.jpg", width=1280, height=720, file_size_bytes=15028, content_type="jpeg")
            else:
                continue
            db.add(art)

    try:
        db.commit()
        print("Seed data successfully imported.")
    except Exception as e:
        db.rollback()
        print(f"Failed to seed data: {e}")

if __name__ == "__main__":
    main()
