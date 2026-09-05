import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.db.database import SessionLocal
from app.services.catalogue_builder import build_catalogue

db = SessionLocal()
dest_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "catalogue.json")
try:
    counts = build_catalogue(db, dest_path)
    print("Success:", counts)
except Exception as e:
    print("Error:", e)
finally:
    db.close()
