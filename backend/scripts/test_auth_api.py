import urllib.request
import urllib.parse
import json

# 1. Login
data = urllib.parse.urlencode({'username': 'admin', 'password': 'admin123'}).encode('utf-8')
req = urllib.request.Request('http://localhost:8000/admin/auth/login', data=data)
res = urllib.request.urlopen(req)
token = json.loads(res.read().decode('utf-8'))['access_token']
headers = {'Authorization': f'Bearer {token}'}

# 2. Get show ID
req = urllib.request.Request('http://localhost:8000/admin/shows', headers=headers)
shows = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
moti = next(s for s in shows if s['title'] == 'Discover India with Moti')
show_id = moti['id']
print(f"Show ID: {show_id}")

# 3. Get seasons
req = urllib.request.Request(f'http://localhost:8000/admin/seasons?show_id={show_id}', headers=headers)
seasons = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
print(f"Seasons returned: {len(seasons)}")
for s in seasons:
    print(f"Season {s['season_number']} (ID: {s['id']}) (Show ID: {s['show_id']})")
    
    # 4. Get episodes
    req = urllib.request.Request(f'http://localhost:8000/admin/episodes?season_id={s["id"]}', headers=headers)
    eps = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
    print(f"  Episodes returned: {len(eps)}")
    for e in eps[:5]:
        print(f"    - {e['title']} (Season ID: {e['season_id']})")
