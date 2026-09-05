import urllib.request
import urllib.parse
import json

# 1. Login
data = urllib.parse.urlencode({'username': 'admin', 'password': 'admin123'}).encode('utf-8')
req = urllib.request.Request('http://localhost:8000/admin/auth/token', data=data)
res = urllib.request.urlopen(req)
token = json.loads(res.read().decode('utf-8'))['access_token']
headers = {'Authorization': f'Bearer {token}'}

# 2. Trigger publish
req = urllib.request.Request('http://localhost:8000/admin/catalog/publish/', headers=headers, method='POST')
try:
    res = urllib.request.urlopen(req)
    print('Publish Success:', res.read().decode('utf-8'))
except Exception as e:
    print('Publish Failed:', e)
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
