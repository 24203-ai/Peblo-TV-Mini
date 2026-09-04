import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Dummy catalogue matching the expected format
DUMMY_CATALOGUE = {
    "featured": [
        {
            "id": "s1",
            "title": "Rhyme Rangers",
            "section": "featured",
            "episodes": [
                {
                    "id": "e1",
                    "title": "The Big Race",
                    "category": "kids",
                    "languages": ["en", "es"]
                },
                {
                    "id": "e2",
                    "title": "Learning Colors",
                    "category": "educational",
                    "languages": ["en"]
                }
            ]
        }
    ],
    "action": [
        {
            "id": "s2",
            "title": "Space Invaders",
            "section": "action",
            "episodes": [
                {
                    "id": "e3",
                    "title": "Pilot",
                    "category": "sci-fi",
                    "languages": ["en", "ja"]
                }
            ]
        }
    ]
}

@pytest.fixture
def mock_load_catalogue():
    with patch("app.api.catalog._load_catalogue", return_value=DUMMY_CATALOGUE) as mock:
        yield mock

def test_search_by_show_title(mock_load_catalogue):
    response = client.get("/catalog/search?q=rhyme")
    assert response.status_code == 200
    results = response.json()["results"]
    assert len(results) == 1
    assert results[0]["title"] == "Rhyme Rangers"
    # All episodes should be included when show title matches
    assert len(results[0]["episodes"]) == 2

def test_search_by_episode_title(mock_load_catalogue):
    response = client.get("/catalog/search?q=pilot")
    assert response.status_code == 200
    results = response.json()["results"]
    assert len(results) == 1
    assert results[0]["title"] == "Space Invaders"
    assert len(results[0]["episodes"]) == 1
    assert results[0]["episodes"][0]["title"] == "Pilot"

def test_search_by_category_q(mock_load_catalogue):
    response = client.get("/catalog/search?q=sci-fi")
    assert response.status_code == 200
    results = response.json()["results"]
    assert len(results) == 1
    assert results[0]["title"] == "Space Invaders"

def test_language_filter(mock_load_catalogue):
    response = client.get("/catalog/search?language=es")
    assert response.status_code == 200
    results = response.json()["results"]
    assert len(results) == 1
    assert results[0]["title"] == "Rhyme Rangers"
    # Only the episode with 'es' should be returned
    assert len(results[0]["episodes"]) == 1
    assert results[0]["episodes"][0]["title"] == "The Big Race"

def test_section_filter(mock_load_catalogue):
    response = client.get("/catalog/search?section=action")
    assert response.status_code == 200
    results = response.json()["results"]
    assert len(results) == 1
    assert results[0]["title"] == "Space Invaders"

def test_multiple_filters_composing(mock_load_catalogue):
    # category = kids AND language = es
    response = client.get("/catalog/search?category=kids&language=es")
    assert response.status_code == 200
    results = response.json()["results"]
    assert len(results) == 1
    assert results[0]["title"] == "Rhyme Rangers"
    assert len(results[0]["episodes"]) == 1
    assert results[0]["episodes"][0]["title"] == "The Big Race"
    
    # category = kids AND language = ja (should return empty)
    response = client.get("/catalog/search?category=kids&language=ja")
    assert response.status_code == 200
    assert len(response.json()["results"]) == 0
