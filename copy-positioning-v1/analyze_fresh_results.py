#!/usr/bin/env python3
import http.cookiejar as cookiejar
import json
from pathlib import Path

import numpy as np
import requests

ROOT = Path(__file__).resolve().parent
API_BASE = "https://tiktok.highscore.page"
COOKIE_FILE = Path.home() / ".brainmaster" / "cookies.txt"


def session():
    s = requests.Session()
    s.cookies = cookiejar.LWPCookieJar(str(COOKIE_FILE))
    if COOKIE_FILE.exists():
        s.cookies.load(ignore_discard=True, ignore_expires=True)
    return s


def cosine(a, b):
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    return 0.0 if denom == 0 else float(np.dot(a, b) / denom)


def main():
    manifest = json.loads((ROOT / "manifest.json").read_text())
    jobs = json.loads((ROOT / "results" / "jobs.json").read_text())
    items = {item["id"]: item for item in manifest["items"]}
    job_ids = {job["id"]: job["job_id"] for job in jobs["jobs"] if job.get("job_id")}
    missing = sorted(set(items) - set(job_ids))
    if missing:
        raise RuntimeError(f"missing jobs: {missing}")

    s = session()
    rois = {}
    for item_id, job_id in sorted(job_ids.items()):
        cache = ROOT / "results" / f"fresh_{item_id}.roi.json"
        if cache.exists():
            rois[item_id] = json.loads(cache.read_text())
        else:
            r = s.get(f"{API_BASE}/api/tribe/jobs/{job_id}/roi", timeout=60)
            r.raise_for_status()
            rois[item_id] = r.json()
            cache.write_text(json.dumps(rois[item_id]))

    parcels = sorted(p for p in set().union(*(set(r.keys()) for r in rois.values())) if not p.startswith("_"))
    vectors = {}
    for item_id, roi in rois.items():
        vectors[item_id] = np.array([
            float(np.mean(roi[p])) if isinstance(roi.get(p), list) and roi[p] else 0.0
            for p in parcels
        ])

    groups = {"defi": [], "finance": [], "music": [], "negative": []}
    candidates = []
    for item_id, item in items.items():
        if item["role"] == "reference":
            groups[item["group"]].append(item_id)
        else:
            candidates.append(item_id)

    centroids = {
        group: np.mean(np.vstack([vectors[item_id] for item_id in ids]), axis=0)
        for group, ids in groups.items()
    }
    weights = manifest["scoring"]
    rows = []
    for item_id in candidates:
        sims = {group: cosine(vectors[item_id], centroid) for group, centroid in centroids.items()}
        weighted = (
            weights["defi"] * sims["defi"]
            + weights["finance"] * sims["finance"]
            + weights["music"] * sims["music"]
            + weights["negative"] * sims["negative"]
        )
        balance = float(np.std([sims["defi"], sims["finance"], sims["music"]]))
        rows.append({
            "id": item_id,
            "direction": items[item_id].get("direction"),
            "job_id": job_ids[item_id],
            "final": weighted - balance,
            "weighted": weighted,
            "balance_penalty": balance,
            **sims,
        })
    rows.sort(key=lambda row: row["final"], reverse=True)

    out = {
        "project_id": jobs["project_id"],
        "n_items": len(items),
        "n_parcels": len(parcels),
        "scores": rows,
    }
    (ROOT / "fresh_analysis.json").write_text(json.dumps(out, indent=2, sort_keys=True) + "\n")

    lines = [
        "# yield.fm copy positioning v1 - fresh run",
        "",
        f"Project: `{jobs['project_name']}` / `{jobs['project_id']}`",
        f"Items: {len(items)}",
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
        text = (ROOT / items[row["id"]]["file"]).read_text().strip()
        lines.extend([f"### {row['id']}", "", text, ""])
    (ROOT / "fresh_analysis.md").write_text("\n".join(lines) + "\n")
    print("\n".join(lines[:20]))
    print(f"\nwrote {ROOT / 'fresh_analysis.json'}")
    print(f"wrote {ROOT / 'fresh_analysis.md'}")


if __name__ == "__main__":
    main()
