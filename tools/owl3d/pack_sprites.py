"""Pack render_iso.py frames into a Phaser atlas (PNG + JSON hash).

    python pack_sprites.py <frames_dir> <out_basename>

Frames are cropped to the union of their opaque areas (so every frame keeps
the same size and the feet stay put), laid out in a grid, and the JSON meta
carries the feet pivot and the figure height in pixels.
"""
import json, os, sys
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
meta = json.load(open(os.path.join(src, 'pivot.json')))
names = sorted(f[:-4] for f in os.listdir(src) if f.endswith('.png'))
imgs = {n: Image.open(os.path.join(src, n + '.png')).convert('RGBA') for n in names}

box = None
for im in imgs.values():
    b = im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    if not b: continue
    box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
pad = 2
box = (max(0, box[0] - pad), max(0, box[1] - pad), min(meta['size'], box[2] + pad), min(meta['size'], box[3] + pad))
fw, fh = box[2] - box[0], box[3] - box[1]
cols = 8
rows = (len(names) + cols - 1) // cols
sheet = Image.new('RGBA', (cols * fw, rows * fh), (0, 0, 0, 0))
frames = {}
heights = []
for i, n in enumerate(names):
    x, y = (i % cols) * fw, (i // cols) * fh
    crop = imgs[n].crop(box)
    sheet.paste(crop, (x, y))
    frames[n] = {'frame': {'x': x, 'y': y, 'w': fw, 'h': fh}, 'rotated': False, 'trimmed': False,
                 'spriteSourceSize': {'x': 0, 'y': 0, 'w': fw, 'h': fh}, 'sourceSize': {'w': fw, 'h': fh}}
    b = crop.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    if b: heights.append(b[3] - b[1])

S = meta['size']
pivot = {'x': round((meta['pivot']['x'] * S - box[0]) / fw, 4), 'y': round((meta['pivot']['y'] * S - box[1]) / fh, 4)}
sheet.save(out + '.png', optimize=True)
json.dump({'frames': frames, 'meta': {'image': os.path.basename(out) + '.png', 'size': {'w': sheet.width, 'h': sheet.height},
           'scale': '1', 'pivot': pivot, 'figureHeight': max(heights), 'clips': meta['clips'], 'facings': meta['facings']}},
          open(out + '.json', 'w'), indent=1)
print('sheet', sheet.size, 'frame', fw, fh, 'pivot', pivot, 'figure', max(heights))
