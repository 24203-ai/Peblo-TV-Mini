import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.deps import get_current_active_admin, get_current_user
from app.models.user import User
from unittest.mock import patch

client = TestClient(app)

def override_get_editor():
    return User(id="editor1", username="editor", role="editor")

def override_get_admin():
    return User(id="admin1", username="admin", role="admin")

def test_editor_cannot_publish():
    # Override current_user to be an editor
    app.dependency_overrides[get_current_active_admin] = get_current_active_admin
    app.dependency_overrides[get_current_user] = override_get_editor
    
    # Since get_current_active_admin explicitly checks current_user.role, 
    # it relies on get_current_user. By overriding get_current_user to return an editor, 
    # get_current_active_admin should raise a 403.
    response = client.post("/admin/catalog/publish/")
    assert response.status_code == 403
    assert response.json()["detail"] == "The user doesn't have enough privileges"
    
    app.dependency_overrides = {}

@patch("app.api.publish.validate_for_publish", return_value=[])
@patch("app.api.publish.build_catalogue", return_value={"sections": 1, "shows": 1, "episodes": 1})
def test_admin_can_publish(mock_build, mock_validate):
    app.dependency_overrides[get_current_user] = override_get_admin
    # get_current_active_admin calls get_current_user, which is overridden to admin
    
    # Needs db override or mock since the endpoint expects a real DB session.
    # To bypass DB issues purely for RBAC check, we can just patch validate_for_publish
    # but the endpoint does `db.add(run)`. So we also need to mock db session.
    with patch("app.api.publish.Session") as mock_db:
        # Override the dependency for get_db
        from app.db.database import get_db
        app.dependency_overrides[get_db] = lambda: mock_db
        
        response = client.post("/admin/catalog/publish/")
        # If RBAC succeeds, it reaches the mocked logic and returns 200
        assert response.status_code == 200
        assert response.json()["status"] == "success"
        
    app.dependency_overrides = {}

@patch("app.api.publish.validate_for_publish")
def test_validation_report(mock_validate):
    app.dependency_overrides[get_current_user] = override_get_editor
    
    # Return some fake problems resembling actual seed data issues
    mock_validate.return_value = [
        {"entity": "Show", "id": "s1", "title": "Rhyme Rangers", "message": "Show 'Rhyme Rangers' is marked for publishing but has no section."},
        {"entity": "Episode", "id": "e1", "title": "Trailer", "message": "Episode 'Trailer' cannot be published because it has no duration."}
    ]
    
    from app.db.database import get_db
    app.dependency_overrides[get_db] = lambda: None
    
    response = client.get("/admin/catalog/publish/validation-report")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "blocked"
    assert data["total_issues"] == 2
    
    report = data["report"]
    assert len(report) == 2
    
    # Check grouping
    show_issue = next(r for r in report if r["entity"] == "Show")
    assert show_issue["title"] == "Rhyme Rangers"
    assert "no section" in show_issue["issues"][0]["message"]
    
    ep_issue = next(r for r in report if r["entity"] == "Episode")
    assert ep_issue["title"] == "Trailer"
    assert "no duration" in ep_issue["issues"][0]["message"]
    
    app.dependency_overrides = {}
