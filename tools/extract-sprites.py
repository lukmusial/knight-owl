#!/usr/bin/env python3
"""
Extract character sprites from the full-scene monster illustrations.

Removes the painted background with rembg (isnet-general-use model), trims to
the character's bounding box, downsizes to at most MAX_SIZE pixels on the long
edge and writes transparent PNGs to www/assets/proto/monsters/<id>.png.

Usage (one-off, needs a venv with rembg, pillow, numpy, onnxruntime, scikit-image):
    python tools/extract-sprites.py [--only goblin,dragon] [--max 512]

The prototypes load these cutouts when present and fall back to masking the
original illustrations at runtime when they are missing.
"""
import argparse
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'www' / 'assets'
DST = SRC / 'proto' / 'monsters'
SKIP = {'placeholder', 'start', 'victory'}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', default='')
    ap.add_argument('--max', type=int, default=512)
    ap.add_argument('--model', default='isnet-general-use')
    args = ap.parse_args()

    from rembg import remove, new_session
    session = new_session(args.model)

    only = set(filter(None, args.only.split(',')))
    files = sorted(p for p in SRC.glob('*.png') if p.stem not in SKIP)
    if only:
        files = [p for p in files if p.stem in only]
    DST.mkdir(parents=True, exist_ok=True)

    index_path = DST / 'index.json'
    index = {}
    if index_path.exists():
        with open(index_path) as f:
            index = json.load(f)   # merge so --only runs keep the other entries
    for path in files:
        img = Image.open(path).convert('RGBA')
        cut = remove(img, session=session, post_process_mask=True)
        bbox = cut.getbbox()
        if not bbox:
            print('no subject found:', path.name, file=sys.stderr)
            continue
        cut = cut.crop(bbox)
        scale = min(1.0, args.max / max(cut.size))
        if scale < 1.0:
            cut = cut.resize((round(cut.width * scale), round(cut.height * scale)), Image.LANCZOS)
        out = DST / path.name
        cut.save(out, optimize=True)
        index[path.stem] = {
            'w': cut.width, 'h': cut.height,
            # subject bounding box in the original 800x436 illustration
            'bbox': list(bbox)
        }
        print(f'{path.stem}: {cut.width}x{cut.height} ({out.stat().st_size // 1024} KB)')

    with open(index_path, 'w') as f:
        json.dump(index, f, indent=1, sort_keys=True)
    print('wrote', len(index), 'sprites to', DST)


if __name__ == '__main__':
    main()
