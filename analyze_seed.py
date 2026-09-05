import json

with open('data/seed_shows.json', encoding='utf-8') as f:
    data = json.load(f)

print('Total episodes:', len(data))
shows = {}
problems = []

for i, ep in enumerate(data):
    # Check for missing values
    if 'duration_seconds' not in ep or ep['duration_seconds'] is None:
        problems.append(f"Episode '{ep.get('episode_title')}' missing duration")
    if 'language' not in ep or ep['language'] not in ['en', 'es', 'fr', 'ja', 'hi']:
        problems.append(f"Episode '{ep.get('episode_title')}' invalid language: {ep.get('language')}")
    if not ep.get('section'):
        problems.append(f"Show '{ep.get('show_title')}' missing section")
    if ep.get('season_number') == 0:
        problems.append(f"Episode '{ep.get('episode_title')}' is in Season 0")

for p in set(problems):
    print(p)
