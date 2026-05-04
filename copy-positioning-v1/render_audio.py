#!/usr/bin/env python3
import json
from pathlib import Path

from gtts import gTTS

ROOT = Path(__file__).resolve().parent
AUDIO = ROOT / "audio"


def main():
    AUDIO.mkdir(exist_ok=True)
    manifest = json.loads((ROOT / "manifest.json").read_text())
    items = manifest["items"]
    for idx, item in enumerate(items, 1):
        src = ROOT / item["file"]
        out = AUDIO / f"{item['id']}.mp3"
        if out.exists() and out.stat().st_size > 0:
            print(f"[{idx:02d}/{len(items)}] skip {out.name}")
            continue
        text = src.read_text().strip()
        print(f"[{idx:02d}/{len(items)}] render {out.name}", flush=True)
        gTTS(text=text, lang="en", tld="com", slow=False).save(str(out))


if __name__ == "__main__":
    main()
