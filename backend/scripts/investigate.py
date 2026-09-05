import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.db.database import SessionLocal
from app.models.show import Show
from app.models.season import Season
from app.models.episode import Episode

db = SessionLocal()
shows = db.query(Show).filter(Show.title == 'Discover India with Moti').all()
for show in shows:
    print(f"Show: {show.title} (ID: {show.id})")
    seasons = db.query(Season).filter(Season.show_id == show.id).all()
    for s in seasons:
        print(f"  Season {s.season_number} (ID: {s.id})")
        eps = db.query(Episode).filter(Episode.season_id == s.id).all()
        for e in eps:
            print(f"    Episode {e.title} (Lang: {e.language}, CG: {e.content_group})")
