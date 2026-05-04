#!/usr/bin/env python3
import json
import http.cookiejar as cookiejar
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BRAINMASTER = Path("/data/workspace/brainmaster.py")
RESULTS = ROOT / "results"
JOBS_FILE = RESULTS / "jobs.json"
API_BASE = "https://tiktok.highscore.page"
COOKIE_FILE = Path.home() / ".brainmaster" / "cookies.txt"


def load_manifest():
    return json.loads((ROOT / "manifest.json").read_text())


def run(cmd):
    proc = subprocess.run(cmd, cwd=ROOT, text=True, capture_output=True)
    if proc.returncode != 0:
        raise RuntimeError(f"{' '.join(cmd)}\nSTDOUT:\n{proc.stdout}\nSTDERR:\n{proc.stderr}")
    return proc.stdout


def session():
    import requests

    s = requests.Session()
    s.cookies = cookiejar.LWPCookieJar(str(COOKIE_FILE))
    if COOKIE_FILE.exists():
        s.cookies.load(ignore_discard=True, ignore_expires=True)
    return s


def create_project(name):
    out = run([sys.executable, str(BRAINMASTER), "project-create", name])
    # created project <uuid>: <name>
    for token in out.split():
        if token.count("-") == 4:
            return token.rstrip(":")
    raise RuntimeError(f"Could not parse project id from: {out}")


def submit_call(item_id, item):
    audio_path = ROOT / "audio" / f"{item_id}.mp3"
    path = audio_path if audio_path.exists() else ROOT / item["file"]
    role = item["role"]
    out = run([
        sys.executable,
        str(BRAINMASTER),
        "submit",
        str(path),
    ])
    result = {
        "id": item_id,
        "file": item["file"],
        "role": role,
        "submitted_file": str(path.relative_to(ROOT)),
        "stdout": out,
    }
    for line in out.splitlines():
        line = line.strip()
        if line.startswith("call_id:"):
            result["call_id"] = line.split(":", 1)[1].strip()
    if not result.get("call_id"):
        raise RuntimeError(f"No call_id returned for {item_id}: {out}")
    return result


def poll_call(call_id, max_wait=3600):
    s = session()
    start = time.time()
    while time.time() - start < max_wait:
        r = s.get(f"{API_BASE}/api/tribe/status/{call_id}", timeout=30)
        r.raise_for_status()
        data = r.json()
        status = data.get("status")
        if status == "done":
            return data["result"]
        if status == "error":
            raise RuntimeError(f"{call_id} errored: {data.get('detail')}")
        elapsed = int(time.time() - start)
        print(f"  [{elapsed:>4}s] pending {call_id}", flush=True)
        time.sleep(15)
    raise TimeoutError(f"{call_id} still pending after {max_wait}s")


def assign_project(project_id, item_id, item, result):
    s = session()
    body = {
        "job_id": result["job_id"],
        "filename": item["file"],
        "role": item["role"],
        "n_segments": result["n_segments"],
    }
    r = s.post(f"{API_BASE}/api/tribe/projects/{project_id}/jobs", json=body, timeout=30)
    if r.status_code not in (200, 201):
        print(f"  warn assign failed for {item_id}: {r.status_code} {r.text[:200]}", flush=True)
        return False
    return True


def finish_one(item_id, item, project_id, existing=None):
    result = existing or submit_call(item_id, item)
    if not result.get("job_id"):
        payload = poll_call(result["call_id"])
        result.update(payload)
    result["assigned"] = False
    return result


def main():
    RESULTS.mkdir(exist_ok=True)
    manifest = load_manifest()
    if JOBS_FILE.exists():
        data = json.loads(JOBS_FILE.read_text())
        project_id = data["project_id"]
    else:
        project_id = create_project(manifest["project_name"])
        data = {"project_name": manifest["project_name"], "project_id": project_id, "jobs": []}
        JOBS_FILE.write_text(json.dumps(data, indent=2))

    if "items" in manifest:
        items = [(item["id"], item) for item in manifest["items"]]
    else:
        items = []
        for group in ("anchors", "candidates"):
            for item_id, item in manifest[group].items():
                items.append((item_id, item))

    existing_by_id = {job["id"]: job for job in data["jobs"]}
    for idx, (item_id, item) in enumerate(items, 1):
        existing = existing_by_id.get(item_id)
        if existing and existing.get("job_id"):
            print(f"[{idx:02d}/{len(items)}] skip {item_id}")
            continue
        action = "resume" if existing else "submit"
        print(f"[{idx:02d}/{len(items)}] {action} {item_id} ({item['role']})", flush=True)
        if existing:
            result = finish_one(item_id, item, project_id, existing=existing)
        else:
            result = submit_call(item_id, item)
            data["jobs"].append(result)
            existing_by_id[item_id] = result
            JOBS_FILE.write_text(json.dumps(data, indent=2))
            result = finish_one(item_id, item, project_id, existing=result)
        existing_by_id[item_id].update(result)
        JOBS_FILE.write_text(json.dumps(data, indent=2))
        print(f"  job_id={result.get('job_id')} call_id={result.get('call_id')} assigned={result.get('assigned')}", flush=True)

    print(f"project_id={project_id}")
    print(f"wrote {JOBS_FILE}")


if __name__ == "__main__":
    main()
