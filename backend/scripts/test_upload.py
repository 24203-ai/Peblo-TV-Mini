import urllib.request
import urllib.parse
import json
import os

# 1. Login
data = urllib.parse.urlencode({'username': 'admin', 'password': 'admin123'}).encode('utf-8')
req = urllib.request.Request('http://localhost:8000/admin/auth/token', data=data)
res = urllib.request.urlopen(req)
token = json.loads(res.read().decode('utf-8'))['access_token']
headers = {'Authorization': f'Bearer {token}'}

# 2. Upload file via multipart/form-data
import mimetypes
from email.message import EmailMessage

boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = bytearray()

fields = {
    'entity_type': 'episode',
    'entity_id': 'test-id',
    'type': 'thumbnail'
}

for k, v in fields.items():
    body.extend(f'--{boundary}\r\n'.encode('utf-8'))
    body.extend(f'Content-Disposition: form-data; name="{k}"\r\n\r\n'.encode('utf-8'))
    body.extend(f'{v}\r\n'.encode('utf-8'))

# File
file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'assets', 'thumb_good.jpg')
filename = os.path.basename(file_path)
mimetype = mimetypes.guess_type(file_path)[0] or 'application/octet-stream'

body.extend(f'--{boundary}\r\n'.encode('utf-8'))
body.extend(f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'.encode('utf-8'))
body.extend(f'Content-Type: {mimetype}\r\n\r\n'.encode('utf-8'))

with open(file_path, 'rb') as f:
    body.extend(f.read())
body.extend(b'\r\n')
body.extend(f'--{boundary}--\r\n'.encode('utf-8'))

headers['Content-Type'] = f'multipart/form-data; boundary={boundary}'
headers['Content-Length'] = str(len(body))

req = urllib.request.Request('http://localhost:8000/admin/artwork/', data=body, headers=headers)
try:
    res = urllib.request.urlopen(req)
    print('Success:', res.read().decode('utf-8'))
except Exception as e:
    print('Failed:', e)
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
