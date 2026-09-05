import subprocess
import os
import sys

root_dir = os.path.dirname(os.path.abspath(__file__))

def start_service(name, cmd, cwd):
    log_file = open(f"{name}_run.log", "w")
    print(f"Starting {name} in {cwd}...")
    proc = subprocess.Popen(
        cmd,
        cwd=cwd,
        stdout=log_file,
        stderr=log_file,
        shell=True
    )
    return proc

backend_cmd = os.path.join(".venv", "Scripts", "uvicorn.exe") + " app.main:app --reload --port 8000"
cms_cmd = "npm run dev -- --port 5173"
viewer_cmd = "npm run dev -- --port 5174"

start_service("backend", backend_cmd, os.path.join(root_dir, "backend"))
start_service("cms", cms_cmd, os.path.join(root_dir, "frontend", "cms"))
start_service("viewer", viewer_cmd, os.path.join(root_dir, "frontend", "viewer"))

print("Services launched. Check *_run.log files for output.")
