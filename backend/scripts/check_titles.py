import json
data = json.load(open('data/seed_shows.json', encoding='utf-8'))
for show_title in set(e.get('show_title') for e in data):
    eps = [e['episode_title'] for e in data if e.get('show_title') == show_title]
    print(f"--- {show_title} ---")
    print(f"Total: {len(eps)}, Unique titles: {len(set(eps))}")
    if show_title in ["Discover India with Moti", "Moti's Many Lives", "Tiny Tales by Banyan Dadi"]:
        print("Titles:", list(set(eps))[:3], "...")
