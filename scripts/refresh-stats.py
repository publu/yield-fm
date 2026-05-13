#!/usr/bin/env python3
"""Recompute yield-fm/src/data/catalogs.json `stats` block from fresh RE scrape.

Reads:  /data/workspace/royalty-exchange/catalog.json  (raw scrape)
Writes: /data/workspace/yield-fm/src/data/catalogs.json  (stats block only; catalogs[] untouched)

Run this after `python3 /data/workspace/royalty-exchange/royalty_exchange.py sync`.
"""

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from statistics import median

RAW = Path("/data/workspace/royalty-exchange/catalog.json")
OUT = Path("/data/workspace/yield-fm/src/data/catalogs.json")


def f(v):
    try:
        return float(v) if v is not None else None
    except (TypeError, ValueError):
        return None


def main():
    raw = json.loads(RAW.read_text())
    listings = raw["listings"]
    synced_at = raw.get("synced_at", "")
    today = synced_at[:10] if synced_at else datetime.now(timezone.utc).date().isoformat()

    by_state = {}
    for l in listings:
        s = l.get("state", "?")
        by_state[s] = by_state.get(s, 0) + 1

    open_listings = [l for l in listings if l.get("state") == "open"]
    filled = [
        l for l in listings
        if l.get("state") == "filled"
        and l.get("deal_amount") is not None
        and f(l.get("ltm")) and f(l["ltm"]) > 0
    ]

    # Closed-comp multiples: deal/ltm. Drop > 50 as outliers (matches process-data.mjs).
    comps = []
    for l in filled:
        ltm = f(l["ltm"])
        deal = f(l.get("converted_deal_amount") or l.get("deal_amount"))
        if not (ltm and deal):
            continue
        mult = deal / ltm
        if 0 < mult < 50:
            comps.append({
                "listing_id": l.get("listing_id"),
                "ltm": ltm,
                "deal": deal,
                "mult": mult,
                "term": l.get("term"),
                "deal_date": l.get("deal_date"),
                "published_date": l.get("published_date"),
            })

    # ── Multiples ────────────────────────────────────────────
    median_all = round(median([c["mult"] for c in comps]), 2)
    lor_mults = [c["mult"] for c in comps if c["term"] == "life_of_rights"]
    median_lor = round(median(lor_mults), 2) if lor_mults else 0.0
    big_mults = [c["mult"] for c in comps if c["ltm"] >= 50000]
    median_50k = round(median(big_mults), 2) if big_mults else 0.0

    # ── Yields ───────────────────────────────────────────────
    # Filter out sub-4x multiples (bargain-bin comps that imply >25% yield are
    # unrealistic for a real buyer's universe). This matches the prior
    # conservative cut Pablo used.
    MIN_MULT = 4.0

    closed_yields = [100.0 / c["mult"] for c in comps if c["mult"] >= MIN_MULT]
    avg_yield_closed = round(sum(closed_yields) / len(closed_yields), 2) if closed_yields else 0.0

    # Open listings: yield = ltm / list_price * 100, fall back to marketplace_median.
    # Apply same MIN_MULT floor (implied multiple = price/ltm or marketplace_median/ltm).
    open_yields = []
    for l in open_listings:
        ltm = f(l.get("ltm"))
        price = f(l.get("converted_list_price") or l.get("list_price"))
        mkt_med = f(l.get("marketplace_median"))
        if ltm and price and price > 0:
            implied_mult = price / ltm
        elif ltm and mkt_med and mkt_med > 0:
            implied_mult = mkt_med / ltm
        else:
            continue
        if implied_mult >= MIN_MULT and implied_mult < 50:
            open_yields.append(100.0 / implied_mult)
    avg_yield_open = round(sum(open_yields) / len(open_yields), 2) if open_yields else 0.0

    blended = closed_yields + open_yields
    avg_yield_blended = round(sum(blended) / len(blended), 2) if blended else 0.0
    avg_yield_sample = len(blended)

    # ── TTM ──────────────────────────────────────────────────
    # Use synced_at as reference; TTM = past 365d, prior = 365–730d ago.
    ref = datetime.fromisoformat(synced_at.replace("Z", "+00:00")) if synced_at else datetime.now(timezone.utc)
    ttm_cutoff = ref - timedelta(days=365)
    prior_cutoff = ref - timedelta(days=730)

    def parse_dt(s):
        if not s:
            return None
        try:
            return datetime.fromisoformat(s.replace("Z", "+00:00"))
        except ValueError:
            return None

    ttm_comps, prior_comps = [], []
    for c in comps:
        d = parse_dt(c["deal_date"])
        if not d:
            continue
        if d >= ttm_cutoff:
            ttm_comps.append(c)
        elif d >= prior_cutoff:
            prior_comps.append(c)

    median_ttm = round(median([c["mult"] for c in ttm_comps]), 2) if ttm_comps else 0.0
    median_prior = round(median([c["mult"] for c in prior_comps]), 2) if prior_comps else 0.0
    median_delta = round((median_ttm - median_prior) / median_prior * 100, 2) if median_prior else 0.0

    # Apply MIN_MULT filter to TTM yield as well for consistency with avgYieldClosedComps
    ttm_y = [100.0 / c["mult"] for c in ttm_comps if c["mult"] >= MIN_MULT]
    prior_y = [100.0 / c["mult"] for c in prior_comps if c["mult"] >= MIN_MULT]
    yield_ttm = round(sum(ttm_y) / len(ttm_y), 2) if ttm_y else 0.0
    yield_prior = round(sum(prior_y) / len(prior_y), 2) if prior_y else 0.0
    yield_delta = round((yield_ttm - yield_prior) / yield_prior * 100, 2) if yield_prior else 0.0

    ttm_pub = sum(1 for l in listings if (d := parse_dt(l.get("published_date"))) and d >= ttm_cutoff)
    prior_pub = sum(1 for l in listings if (d := parse_dt(l.get("published_date"))) and prior_cutoff <= d < ttm_cutoff)
    universe_growth = round((ttm_pub - prior_pub) / prior_pub * 100, 2) if prior_pub else 0.0

    # ── Assemble ─────────────────────────────────────────────
    existing = json.loads(OUT.read_text())
    new_stats = dict(existing["stats"])
    new_stats.update({
        "totalListings": len(listings),
        "openListings": len(open_listings),
        "closedComps": len(comps),
        "medianMultipleAll": median_all,
        "medianMultipleLoR": median_lor,
        "medianMultiple50k": median_50k,
        "avgYieldOpenListings": avg_yield_open,
        "avgYieldClosedComps": avg_yield_closed,
        "avgYieldBlended": avg_yield_blended,
        "avgYieldSampleSize": avg_yield_sample,
        "asOf": today,
        "medianMultipleTTM": median_ttm,
        "medianMultipleDelta": median_delta,
        "avgYieldDelta": yield_delta,
        "universeGrowthTTM": universe_growth,
    })
    existing["stats"] = new_stats

    OUT.write_text(json.dumps(existing, indent=2) + "\n")

    print(f"Refreshed stats from {RAW} (synced {synced_at[:10]})")
    print(f"  by state: {by_state}")
    print(f"  total={len(listings)} open={len(open_listings)} comps={len(comps)}")
    print(f"  medianMult: all={median_all} LoR={median_lor} >50k={median_50k}")
    print(f"  yields: open={avg_yield_open} closed={avg_yield_closed} blended={avg_yield_blended} (n={avg_yield_sample})")
    print(f"  TTM mult={median_ttm} (Δ {median_delta}%) yield={yield_ttm} (Δ {yield_delta}%)")
    print(f"  universe growth TTM: {universe_growth}% ({ttm_pub} vs {prior_pub})")
    print(f"  asOf: {today}")


if __name__ == "__main__":
    main()
