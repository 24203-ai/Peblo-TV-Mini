from unittest.mock import MagicMock
from app.services.publish_validation import validate_for_publish
from app.models.show import Show
from app.models.episode import Episode

def test_validate_for_publish_missing_duration():
    # Mock DB Session
    mock_db = MagicMock()
    
    # Setup mock data
    # Show is valid
    valid_show = Show(id="s1", title="Test Show", section="featured", status="published")
    
    # Episode is missing duration
    bad_ep = Episode(id="e1", title="Bad Ep", duration=None, status="published", season_id="sz1")
    
    def mock_query(model):
        q = MagicMock()
        if model == Show:
            q.filter.return_value.all.return_value = [valid_show]
            # Used for checking parent show
            q.filter.return_value.first.return_value = valid_show
        elif model == Episode:
            q.filter.return_value.all.return_value = [bad_ep]
        else:
            q.filter.return_value.all.return_value = []
            q.filter.return_value.first.return_value = None
        return q
        
    mock_db.query.side_effect = mock_query
    
    problems = validate_for_publish(mock_db)
    
    # We should have two problems for the episode: 
    # 1. Missing duration
    # 2. Missing artwork (since we didn't mock Artwork)
    assert len(problems) >= 1
    
    messages = [p["message"] for p in problems]
    assert any("has no duration" in m for m in messages)
