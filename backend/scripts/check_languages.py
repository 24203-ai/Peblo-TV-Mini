import json
data = json.load(open('data/seed_shows.json', encoding='utf-8'))
eps = [(e['episode_title'], e['language'], e.get('content_group')) for e in data if e.get('show_title')=="Moti's Many Lives" and e.get('episode_title')=='The Lost Kite']
for ep in eps:
    print(ep)
