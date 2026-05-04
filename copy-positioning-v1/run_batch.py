#!/usr/bin/env python3
"""Submit the yield.fm copy positioning corpus through the brain workspace API.

This intentionally uses tiktok.highscore.page/api/tribe, not the raw Modal URL,
so completed jobs are assigned to a project and tagged in the authenticated
brain workspace.
"""
import argparse
import http.cookiejar as cookiejar
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

API_BASE = "https://tiktok.highscore.page"
AUTH_BASE = "https://notes.highscore.page"
SESSION_DIR = Path.home() / ".brainmaster"
COOKIE_FILE = SESSION_DIR / "cookies.txt"


def load_session() -> requests.Session:
    session = requests.Session()
    session.cookies = cookiejar.LWPCookieJar(str(COOKIE_FILE))
    if COOKIE_FILE.exists():
        session.cookies.load(ignore_discard=True, ignore_expires=True)
    return session


def require_auth(session: requests.Session) -> str:
    response = session.get(f"{AUTH_BASE}/api/auth/me", timeout=20)
    if response.status_code != 200:
        raise RuntimeError("not authenticated; run: python /data/workspace/brainmaster.py login --email <email>")
    email = response.json().get("email")
    if not email:
        raise RuntimeError("auth check succeeded but no email was returned")
    return email


def api_json(session: requests.Session, method: str, path: str, **kwargs):
    response = session.request(method, f"{API_BASE}{path}", timeout=60, **kwargs)
    try:
        data = response.json()
    except Exception:
        data = {"raw": response.text}
    if response.status_code >= 400:
        raise RuntimeError(f"{method} {path} failed {response.status_code}: {data}")
    return data


def get_or_create_project(session: requests.Session, name: str) -> dict:
    projects = api_json(session, "GET", "/api/tribe/projects")
    for project in projects:
        if project.get("name") == name:
            return project
    return api_json(session, "POST", "/api/tribe/projects", json={"name": name})


def submit_file(session: requests.Session, path: Path) -> str:
    with path.open("rb") as handle:
        response = session.post(
            f"{API_BASE}/api/tribe/submit",
            files={"file": (path.name, handle, "text/plain")},
            timeout=300,
        )
    try:
        data = response.json()
    except Exception:
        data = {"raw": response.text}
    if response.status_code >= 400:
        raise RuntimeError(f"submit failed {response.status_code} for {path}: {data}")
    return data["call_id"]


def poll_status(session: requests.Session, call_id: str) -> dict:
    data = api_json(session, "GET", f"/api/tribe/status/{call_id}")
    return data


def assign_project(session: requests.Session, project_id: str, item: dict, result: dict) -> None:
    api_json(
        session,
        "POST",
        f"/api/tribe/projects/{project_id}/jobs",
        json={
            "job_id": result["job_id"],
            "filename": Path(item["file"]).name,
            "role": item["role"],
            "n_segments": result["n_segments"],
        },
    )


def save_job_history(session: requests.Session, item: dict, result: dict) -> None:
    api_json(
        session,
        "POST",
        "/api/tribe/jobs",
        json={
            "job_id": result["job_id"],
            "filename": Path(item["file"]).name,
            "n_segments": result["n_segments"],
            "duration_seconds": result.get("duration_seconds"),
            "n_vertices": result.get("n_vertices"),
        },
    )


def upsert_record(session: requests.Session, item: dict, result: dict) -> None:
    note = f"yield.fm copy positioning v1; item_id={item['id']}; file={item['file']}"
    outcomes = [item.get("direction") or item["group"]]
    api_json(
        session,
        "PUT",
        f"/api/tribe/records/{result['job_id']}",
        json={
            "saved": True,
            "category": item["category"],
            "outcomes": outcomes,
            "note": note,
            "tags": item["tags"],
        },
    )


def write_json(path: Path, data: dict) -> None:
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n")
    tmp.replace(path)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".", help="batch root containing manifest.json")
    parser.add_argument("--poll-interval", type=int, default=20)
    parser.add_argument("--max-wait", type=int, default=7200)
    parser.add_argument("--submit-only", action="store_true")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    manifest = json.loads((root / "manifest.json").read_text())
    state_path = root / "batch_state.json"
    state = json.loads(state_path.read_text()) if state_path.exists() else {
        "batch": manifest["batch"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "project": None,
        "items": {},
    }

    session = load_session()
    email = require_auth(session)
    print(f"authenticated as {email}")

    project = get_or_create_project(session, manifest["project_name"])
    state["project"] = {
        "project_id": project["project_id"],
        "name": project["name"],
        "created_at": project["created_at"],
    }
    write_json(state_path, state)
    print(f"project: {project['project_id']} {project['name']}")

    for item in manifest["items"]:
        entry = state["items"].setdefault(item["id"], {"item": item})
        if entry.get("job_id"):
            continue
        if entry.get("call_id") and not entry.get("error"):
            continue
        file_path = root / item["file"]
        print(f"submit {item['id']} -> {file_path.relative_to(root)}")
        entry.pop("error", None)
        entry["call_id"] = submit_file(session, file_path)
        entry["submitted_at"] = datetime.now(timezone.utc).isoformat()
        write_json(state_path, state)

    if args.submit_only:
        return 0

    start = time.time()
    while True:
        pending = []
        for item_id, entry in state["items"].items():
            if entry.get("job_id"):
                continue
            pending.append((item_id, entry))

        if not pending:
            break
        if time.time() - start > args.max_wait:
            raise TimeoutError(f"timed out with {len(pending)} pending jobs")

        for item_id, entry in pending:
            status = poll_status(session, entry["call_id"])
            entry["last_status"] = status.get("status")
            entry["checked_at"] = datetime.now(timezone.utc).isoformat()
            if status.get("status") == "done":
                result = status["result"]
                item = entry["item"]
                entry["result"] = result
                entry["job_id"] = result["job_id"]
                entry["completed_at"] = datetime.now(timezone.utc).isoformat()
                write_json(state_path, state)
                try:
                    save_job_history(session, item, result)
                    entry["saved_to_job_history"] = True
                except Exception as exc:
                    entry["job_history_error"] = str(exc)
                try:
                    assign_project(session, project["project_id"], item, result)
                    entry["assigned_to_project"] = True
                except Exception as exc:
                    entry["project_assignment_error"] = str(exc)
                    entry["assigned_to_project"] = False
                try:
                    upsert_record(session, item, result)
                    entry["record_upserted"] = True
                except Exception as exc:
                    entry["record_upsert_error"] = str(exc)
                print(f"done {item_id} -> {result['job_id']} ({result['n_segments']} segments)")
            elif status.get("status") == "error":
                entry["error"] = status.get("detail")
                print(f"error {item_id}: {entry['error']}", file=sys.stderr)
            write_json(state_path, state)

        remaining = sum(1 for entry in state["items"].values() if not entry.get("job_id") and not entry.get("error"))
        if remaining:
            print(f"waiting: {remaining} jobs still pending")
            time.sleep(args.poll_interval)
        else:
            break

    print(f"state: {state_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
