#!/usr/bin/env python3
"""Pull ROI averages for each job_id and compute cosine similarity matrix."""
import glob
import http.cookiejar as cookiejar
import json
import os
import re
import sys
from pathlib import Path

import numpy as np
import requests

API_BASE = "https://tiktok.highscore.page"
SESSION_DIR = Path(os.environ.get("BRAINMASTER_HOME", str(Path.home() / ".brainmaster")))
COOKIE_FILE = SESSION_DIR / "cookies.txt"

s = requests.Session()
s.cookies = cookiejar.LWPCookieJar(str(COOKIE_FILE))
if COOKIE_FILE.exists():
    s.cookies.load(ignore_discard=True, ignore_expires=True)

# Parse job_ids from sub logs
labels = {}
for f in sorted(glob.glob("/tmp/sub_*.log")):
    name = re.search(r"sub_(\w+)\.log", f).group(1)
    text = Path(f).read_text()
    m = re.search(r'"job_id":\s*"([0-9a-f]+)"', text)
    if m:
        labels[name] = m.group(1)

print(f"Loaded {len(labels)} job_ids")
for k, v in labels.items():
    print(f"  {k:8s} -> {v}")

# Fetch ROI for each
rois = {}
for name, job_id in labels.items():
    r = s.get(f"{API_BASE}/api/tribe/jobs/{job_id}/roi", timeout=30)
    if r.status_code != 200:
        print(f"  {name}: ROI fetch failed {r.status_code}")
        continue
    rois[name] = r.json()
    n_parcels = len(rois[name])
    sample_T = len(next(iter(rois[name].values())))
    print(f"  {name}: {n_parcels} parcels, T={sample_T}")

# Build per-job vector: mean activation per parcel
parcels = sorted(set().union(*[set(r.keys()) for r in rois.values()]))
print(f"\nUnion parcels: {len(parcels)}")

vectors = {}
for name, roi in rois.items():
    v = np.array([np.mean(roi.get(p, [0.0])) for p in parcels])
    vectors[name] = v

names = sorted(vectors.keys())

def cos(a, b):
    na = np.linalg.norm(a); nb = np.linalg.norm(b)
    if na == 0 or nb == 0: return 0.0
    return float(np.dot(a, b) / (na * nb))

# Pairwise cosine similarity matrix
print("\n=== Cosine similarity (mean-per-parcel vectors) ===")
print(f"{'':8s} " + " ".join(f"{n:>8s}" for n in names))
for n1 in names:
    row = [f"{cos(vectors[n1], vectors[n2]):>8.4f}" for n2 in names]
    print(f"{n1:8s} " + " ".join(row))

# Distance from each candidate to each anchor
candidates = [n for n in names if n.startswith("cand_")]
anchors = [n for n in names if n.startswith("anchor_")]

print("\n=== Candidate -> Anchor cosine similarity ===")
print(f"{'cand':12s} " + " ".join(f"{a:>14s}" for a in anchors) + "    closest_anchor")
for c in candidates:
    sims = {a: cos(vectors[c], vectors[a]) for a in anchors}
    closest = max(sims, key=sims.get)
    print(f"{c:12s} " + " ".join(f"{sims[a]:>14.4f}" for a in anchors) + f"    {closest}")

# Save vectors
out = {n: v.tolist() for n, v in vectors.items()}
Path("vectors.json").write_text(json.dumps({"parcels": parcels, "vectors": out}, indent=2))
print("\nSaved vectors.json")
