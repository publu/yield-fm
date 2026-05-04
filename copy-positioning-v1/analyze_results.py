#!/usr/bin/env python3
"""Analyze completed yield.fm copy positioning TRIBE jobs."""
import http.cookiejar as cookiejar
import json
import math
from pathlib import Path

import numpy as np
import requests

API_BASE = "https://tiktok.highscore.page"
SESSION_DIR = Path.home() / ".brainmaster"
COOKIE_FILE = SESSION_DIR / "cookies.txt"


def load_session() -> requests.Session:
    session = requests.Session()
    session.cookies = cookiejar.LWPCookieJar(str(COOKIE_FILE))
    if COOKIE_FILE.exists():
        session.cookies.load(ignore_discard=True, ignore_expires=True)
    return session


def fetch_roi(session: requests.Session, job_id: str) -> dict:
    response = session.get(f"{API_BASE}/api/tribe/jobs/{job_id}/roi", timeout=60)
    response.raise_for_status()
    return response.json()


def cos(a: np.ndarray, b: np.ndarray) -> float:
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


def centroid(vectors: list[np.ndarray]) -> np.ndarray:
    return np.mean(np.vstack(vectors), axis=0)


def main() -> int:
    root = Path(__file__).resolve().parent
    manifest = json.loads((root / "manifest.json").read_text())
    state = json.loads((root / "batch_state.json").read_text())
    session = load_session()

    items_by_id = {item["id"]: item for item in manifest["items"]}
    job_ids = {
        item_id: entry["job_id"]
        for item_id, entry in state["items"].items()
        if entry.get("job_id")
    }
    if len(job_ids) != len(items_by_id):
        missing = sorted(set(items_by_id) - set(job_ids))
        raise RuntimeError(f"missing completed jobs: {missing}")

    rois = {}
    for item_id, job_id in sorted(job_ids.items()):
        rois[item_id] = fetch_roi(session, job_id)
        print(f"fetched ROI {item_id} -> {job_id}")

    parcels = sorted(set().union(*(set(roi.keys()) for roi in rois.values())))
    vectors = {}
    for item_id, roi in rois.items():
        vals = []
        for parcel in parcels:
            series = roi.get(parcel)
            if isinstance(series, list) and series:
                vals.append(float(np.mean(series)))
            else:
                vals.append(0.0)
        vectors[item_id] = np.array(vals, dtype=float)

    groups = {"defi": [], "finance": [], "music": [], "negative": []}
    candidates = []
    for item_id, item in items_by_id.items():
        if item["role"] == "reference":
            groups[item["group"]].append(item_id)
        else:
            candidates.append(item_id)

    centroids = {
        name: centroid([vectors[item_id] for item_id in ids])
        for name, ids in groups.items()
    }

    weights = manifest["scoring"]
    rows = []
    for item_id in candidates:
        sims = {name: cos(vectors[item_id], vec) for name, vec in centroids.items()}
        weighted = (
            weights["defi"] * sims["defi"]
            + weights["finance"] * sims["finance"]
            + weights["music"] * sims["music"]
            + weights["negative"] * sims["negative"]
        )
        balance = float(np.std([sims["defi"], sims["finance"], sims["music"]]))
        final = weighted - balance
        rows.append({
            "id": item_id,
            "direction": items_by_id[item_id].get("direction"),
            "job_id": job_ids[item_id],
            "final": final,
            "weighted": weighted,
            "balance_penalty": balance,
            "defi": sims["defi"],
            "finance": sims["finance"],
            "music": sims["music"],
            "negative": sims["negative"],
        })

    rows.sort(key=lambda row: row["final"], reverse=True)

    out = {
        "project": state["project"],
        "n_items": len(items_by_id),
        "n_parcels": len(parcels),
        "anchors": groups,
        "scores": rows,
    }
    (root / "analysis.json").write_text(json.dumps(out, indent=2, sort_keys=True) + "\n")

    lines = [
        "# yield.fm copy positioning v1",
        "",
        f"Project: `{state['project']['name']}` / `{state['project']['project_id']}`",
        f"Items: {len(items_by_id)}",
        f"Parcels: {len(parcels)}",
        "",
        "| Rank | Candidate | Final | DeFi | Finance | Music | Negative | Balance |",
        "| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |",
    ]
    for idx, row in enumerate(rows, 1):
        lines.append(
            f"| {idx} | `{row['id']}` | {row['final']:.4f} | {row['defi']:.4f} | "
            f"{row['finance']:.4f} | {row['music']:.4f} | {row['negative']:.4f} | "
            f"{row['balance_penalty']:.4f} |"
        )
    lines.append("")
    lines.append("## Copy")
    for row in rows:
        item = items_by_id[row["id"]]
        text = (root / item["file"]).read_text().strip()
        lines.append(f"### {row['id']}")
        lines.append("")
        lines.append(text)
        lines.append("")

    (root / "analysis.md").write_text("\n".join(lines) + "\n")
    print("\n".join(lines[:20]))
    print(f"\nwrote {root / 'analysis.json'}")
    print(f"wrote {root / 'analysis.md'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
