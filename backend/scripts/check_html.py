import urllib.request
import re
try:
    html = urllib.request.urlopen('http://localhost:5173/').read().decode('utf-8')
    print("Served scripts:", re.findall(r'src="(.*?)"', html))
except Exception as e:
    print(e)
