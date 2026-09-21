#!/usr/bin/env python
"""
Shrink the cemetery map sprite sheets to the size the map actually draws.

    tools/art/.venv/bin/python tools/monsters3d/shrink_iso_sheets.py [id ...]

render_all.sh renders every monster at the same figure height (about 120 px),
but the map shows a spider at 40 px and a rat at 37 px (MAP_H x MAP_SCALE in
cem-monsters.js), so those sheets were 4-6x oversampled: the twelve sheets
decoded to 114 MB of GPU memory, the spider alone 21 MB. This rewrites a
sheet whose figure is taller than the map needs at HEADROOM x that height
(still sharp when the player pinches in), repacking the frames on the same
grid and keeping the 128-colour palette. Idempotent: a sheet already small
enough is left alone. The card sheets (assets/proto/card) are not touched.
"""
import json
import math
import os
import re
import sys

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SHEETS = os.path.join(ROOT, 'www', 'assets', 'proto', 'iso', 'monsters')
MONSTERS_JS = os.path.join(ROOT, 'www', 'js', 'proto', 'cem-monsters.js')
HEADROOM = 1.5      # figure pixels per displayed pixel at zoom 1: sharp up to zoom 1.5
QUANT = 128


def read_scales():
    """MAP_H, MAP_SCALE and BOSS_H as cem-monsters.js declares them."""
    src = open(MONSTERS_JS).read()
    map_h = float(re.search(r'var MAP_H = ([0-9.]+)', src).group(1))
    boss_h = float(re.search(r'var BOSS_H = ([0-9.]+)', src).group(1))
    block = re.search(r'var MAP_SCALE = \{(.*?)\};', src, re.S).group(1)
    scales = {m.group(1): float(m.group(2)) for m in re.finditer(r'(\w+):\s*([0-9.]+)', block)}
    return map_h, scales, boss_h


def target_height(mid, map_h, scales, boss_h):
    if mid == 'grim_reaper':
        return boss_h * HEADROOM
    return map_h * scales.get(mid, 1.0) * HEADROOM


def quantise(sheet):
    alpha = sheet.getchannel('A')
    flat = Image.new('RGBA', sheet.size, (0, 0, 0, 0))
    flat.paste(sheet, (0, 0))
    pal = flat.convert('RGB').quantize(colors=max(2, QUANT - 1), method=Image.FASTOCTREE)
    pal = pal.convert('RGBA')
    pal.putalpha(alpha.point(lambda a: 255 if a > 8 else 0))
    return pal.quantize(colors=QUANT, method=Image.FASTOCTREE)


def shrink(mid, map_h, scales, boss_h):
    jpath = os.path.join(SHEETS, mid + '.json')
    ppath = os.path.join(SHEETS, mid + '.png')
    data = json.load(open(jpath))
    meta = data['meta']
    want = target_height(mid, map_h, scales, boss_h)
    have = float(meta['figureHeight'])
    if have <= want + 0.5:
        print('%-12s figure %3d px, map wants %3d: kept' % (mid, have, want))
        return False
    f = want / have
    frames = data['frames']
    first = next(iter(frames.values()))['frame']
    fw, fh = first['w'], first['h']
    cols = meta['size']['w'] // fw
    nfw, nfh = max(1, int(math.floor(fw * f))), max(1, int(math.floor(fh * f)))
    src = Image.open(ppath).convert('RGBA')
    names = list(frames.keys())
    rows = int(math.ceil(len(names) / float(cols)))
    sheet = Image.new('RGBA', (cols * nfw, rows * nfh), (0, 0, 0, 0))
    out_frames = {}
    for i, name in enumerate(names):
        fr = frames[name]['frame']
        crop = src.crop((fr['x'], fr['y'], fr['x'] + fr['w'], fr['y'] + fr['h'])).resize((nfw, nfh), Image.LANCZOS)
        x, y = (i % cols) * nfw, (i // cols) * nfh
        sheet.paste(crop, (x, y))
        out_frames[name] = {'frame': {'x': x, 'y': y, 'w': nfw, 'h': nfh}, 'rotated': False, 'trimmed': False,
                            'spriteSourceSize': {'x': 0, 'y': 0, 'w': nfw, 'h': nfh}, 'sourceSize': {'w': nfw, 'h': nfh}}
    before = os.path.getsize(ppath)
    quantise(sheet).save(ppath, optimize=True)
    meta = dict(meta)
    meta['size'] = {'w': sheet.width, 'h': sheet.height}
    meta['figureHeight'] = round(have * (nfh / float(fh)), 1)
    meta['sourceFigureHeight'] = meta.get('sourceFigureHeight', have)
    json.dump({'frames': out_frames, 'meta': meta}, open(jpath, 'w'), indent=1)
    after = os.path.getsize(ppath)
    print('%-12s figure %3d -> %3d px, frame %dx%d -> %dx%d, sheet %dx%d (%.1f MB decoded), png %d -> %d KB' % (
        mid, have, meta['figureHeight'], fw, fh, nfw, nfh, sheet.width, sheet.height,
        sheet.width * sheet.height * 4 / 1048576.0, before // 1024, after // 1024))
    return True


def main():
    map_h, scales, boss_h = read_scales()
    ids = sys.argv[1:] or sorted(f[:-5] for f in os.listdir(SHEETS) if f.endswith('.json') and f != 'index.json')
    for mid in ids:
        shrink(mid, map_h, scales, boss_h)


if __name__ == '__main__':
    main()
