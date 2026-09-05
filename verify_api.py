import requests
import json
import time

base_url = "http://localhost:8000"

def get_token(username, password):
    res = requests.post(
        f"{base_url}/admin/auth/token",
        data={"username": username, "password": password}
    )
    if res.status_code == 200:
        return res.json()["access_token"]
    raise Exception(f"Failed to login {username}: {res.text}")

print("--- 1. Search Catalog (Unauthenticated) ---")
try:
    res = requests.get(f"{base_url}/catalog/search?q=rhyme")
    print("Search ?q=rhyme :", res.status_code)
    if res.status_code == 200:
        print(json.dumps(res.json(), indent=2)[:500] + "...\n")
    else:
        print(res.text)
except Exception as e:
    print("Failed to reach API:", e)

try:
    editor_token = get_token("editor", "editor123")
    admin_token = get_token("admin", "admin123")

    print("--- 2. Validation Report (Editor) ---")
    res = requests.get(
        f"{base_url}/admin/catalog/publish/validation-report",
        headers={"Authorization": f"Bearer {editor_token}"}
    )
    print("Editor Report:", res.status_code)
    if res.status_code == 200:
        print(json.dumps(res.json(), indent=2)[:500] + "...\n")
    else:
        print(res.text)

    print("--- 3. Editor Publish (Should 403) ---")
    res = requests.post(
        f"{base_url}/admin/catalog/publish/",
        headers={"Authorization": f"Bearer {editor_token}"}
    )
    print("Editor Publish Status Code:", res.status_code)
    print("Response:", res.text)

    print("\n--- 4. Admin Publish (Should 400 Validation or 200 Success) ---")
    res = requests.post(
        f"{base_url}/admin/catalog/publish/",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    print("Admin Publish Status Code:", res.status_code)
    if res.status_code == 400:
        print("Blocked by validation (as expected due to seed data problems).")
    elif res.status_code == 200:
        print("Published successfully!")
    else:
        print(res.text)
except Exception as e:
    print("Verification failed:", e)
