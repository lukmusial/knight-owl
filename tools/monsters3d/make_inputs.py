"""Prepare TRELLIS inputs from the extracted monster cutouts.

    python make_inputs.py skeleton,ghost,lost_soul,banshee,pumpkin_man,spider,grim_reaper

For each id writes <id>_in.png (the cutout centred on a 1024 px transparent
square with a margin, premultiplied alpha) and <id>_white.png (the same on
white, for the Qwen restyle pass). Intermediate files stay out of git.
"""
import os, sys
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'www', 'assets', 'proto', 'monsters')
SIZE = 1024
MARGIN = 0.08

for mid in sys.argv[1].split(','):
    path = os.path.join(SRC, mid + '.png')
    if not os.path.exists(path):
        print(mid, 'no cutout at', path)
        continue
    img = Image.open(path).convert('RGBA')
    box = img.getbbox()
    if box:
        img = img.crop(box)
    inner = int(SIZE * (1 - 2 * MARGIN))
    scale = min(inner / img.width, inner / img.height)
    img = img.resize((max(1, round(img.width * scale)), max(1, round(img.height * scale))), Image.LANCZOS)
    canvas = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    canvas.paste(img, ((SIZE - img.width) // 2, (SIZE - img.height) // 2), img)
    canvas.save(mid + '_in.png')
    white = Image.new('RGB', (SIZE, SIZE), (255, 255, 255))
    white.paste(canvas, (0, 0), canvas)
    white.save(mid + '_white.png')
    print(mid, 'ok', canvas.size)
