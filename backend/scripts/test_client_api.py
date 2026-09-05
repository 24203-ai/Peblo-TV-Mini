import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

response = client.post("/admin/auth/token", data={"username": "admin", "password": "admin123"})
token = response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

shows = client.get("/admin/shows", headers=headers).json()
for show in shows:
    print(f"Show: {show['title']} (ID: {show['id']})")
    seasons = client.get(f"/admin/seasons?show_id={show['id']}", headers=headers).json()
    for s in seasons:
        print(f"  Season {s['season_number']} (ID: {s['id']}) (Show ID: {s['show_id']})")
        eps = client.get(f"/admin/episodes?season_id={s['id']}", headers=headers).json()
        for e in eps[:3]:
            print(f"    - {e['title']} (Season: {e['season_id']})")
