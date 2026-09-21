#!/usr/bin/env python3
"""
Extract character sprites from the full-scene monster illustrations.

Removes the painted background with rembg (isnet-general-use model), drops the
crumbs of scenery it leaves behind, trims to the character's bounding box,
downsizes to at most MAX_SIZE pixels on the long edge and writes transparent
PNGs to www/assets/proto/monsters/<id>.png.

The encounter card used to need the illustration with the character painted
out as well; it stands the monster in a generated room now
(tools/art/generate_backdrops.py), so nothing is inpainted here any more.

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

# Per-sprite overrides where the default model (isnet-general-use) fails:
# - giant_snake: isnet drops the coils crossing the dark background and u2net
#   cut away the back of the neck along the belly; birefnet-general keeps all of it
# - goblin: isnet lost the lower edge of the left ear against the torch-lit wall;
#   birefnet-general keeps both ears
# - bat_swarm: every model keeps the dark cave centre as "subject"; a hue filter
#   that rejects the teal/blue cave colours and keeps the purple/pink bats works
MODEL_OVERRIDE = {'giant_snake': 'birefnet-general', 'goblin': 'birefnet-general',
                  # isnet kept the gold hoard beside the knight and dropped his cape
                  'dark_knight': 'birefnet-general',
                  # isnet cut the clown's balloon away with the background
                  'clown': 'birefnet-general'}
FILTER_OVERRIDE = {'bat_swarm': 'hue_purple'}
# The cemetery monsters (FLUX text-to-image) stand in busy scenes: rembg also
# keeps a tree, the moon or a pumpkin as "subject". Keep only the connected
# blob(s) that overlap the middle of the picture, where the character stands.
# 'central': blobs overlapping the middle third; 'largest': the biggest blob;
# 'glow': the blob with the most bright yellow-green pixels (the wisp, not the tree)
CENTRAL_ONLY = {'pumpkin_man': 'central', 'will_o_wisp': 'glow', 'banshee': 'largest', 'clown': 'central', 'grim_reaper': 'central',
                'dark_knight': 'largest', 'dwarf': 'largest', 'lich': 'central', 'spirit_of_the_mine': 'largest',
                'beholder': 'largest'}


# Characters who hold something away from the body: how far (px) a blob may
# float from the kept ones and still be counted as theirs. The clown's balloon
# hangs about 150 px above his hand, on a string rembg does not keep.
LINK_PX = {'clown': 120}


def keep_central(cut, mode='central', link=0):
    """Keep the alpha blob(s) that hold the character, drop the scenery blobs."""
    import numpy as np
    from scipy import ndimage
    rgba = np.asarray(cut).copy()
    alpha = rgba[..., 3] > 40
    labels, n = ndimage.label(ndimage.binary_closing(alpha, iterations=2))
    if n <= 1:
        return cut
    h, w = alpha.shape
    sizes = ndimage.sum(alpha, labels, range(1, n + 1))
    if mode == 'largest':
        keep = [int(np.argmax(sizes)) + 1]
    elif mode == 'glow':
        rgb = rgba[..., :3].astype(np.float32) / 255.0
        glow = (rgb[..., 1] > 0.6) & (rgb[..., 0] > 0.45) & (rgb[..., 2] < 0.65) & alpha
        counts = ndimage.sum(glow, labels, range(1, n + 1))
        keep = [int(np.argmax(counts)) + 1]
    else:
        cx0, cx1, cy0, cy1 = int(w * 0.34), int(w * 0.66), int(h * 0.2), int(h * 0.95)
        central = np.zeros_like(alpha)
        central[cy0:cy1, cx0:cx1] = True
        overlap = ndimage.sum(central, labels, range(1, n + 1))
        keep = [i + 1 for i in range(n) if overlap[i] > 0 and sizes[i] > 0.02 * sizes.max()]
        if not keep:
            keep = [int(np.argmax(sizes)) + 1]
    mask = np.isin(labels, keep)
    # Things the character holds away from its body - the clown's balloon on
    # its string - come out as blobs of their own. Anything close enough to
    # what has been kept is his; the scenery further off is not.
    for _ in range(3 if link else 0):
        near = ndimage.binary_dilation(mask, iterations=link)
        grown = set(int(v) for v in np.unique(labels[near]) if v)
        grown = [i for i in grown if sizes[i - 1] > 0.01 * sizes.max()]
        if set(grown) == set(keep):
            break
        keep = grown
        mask = np.isin(labels, keep)
    rgba[..., 3] = np.where(mask, rgba[..., 3], 0)
    return Image.fromarray(rgba, 'RGBA')


def drop_specks(cut, min_share=0.01):
    """Drop the crumbs of background rembg leaves behind: any blob holding
    under min_share of the biggest one's pixels. Parts a character genuinely
    holds away from its body (the clown's balloon, the wisp's lantern) are far
    bigger than that, so they stay."""
    import numpy as np
    from scipy import ndimage
    rgba = np.asarray(cut).copy()
    alpha = rgba[..., 3] > 40
    labels, n = ndimage.label(ndimage.binary_closing(alpha, iterations=2))
    if n <= 1:
        return cut
    sizes = ndimage.sum(alpha, labels, range(1, n + 1))
    biggest = sizes.max()
    keep = [i + 1 for i, sz in enumerate(sizes) if sz >= min_share * biggest]
    if len(keep) == n:
        return cut
    mask = np.isin(labels, keep)
    rgba[..., 3] = np.where(mask, rgba[..., 3], 0)
    return Image.fromarray(rgba, 'RGBA')


def hue_purple_cutout(img):
    """Keep purple/pink/grey-pink pixels (bats), drop teal/blue and near-black (cave)."""
    import numpy as np
    from scipy import ndimage
    rgb = np.asarray(img.convert('RGBA')).astype(np.float32) / 255.0
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = rgb[..., :3].max(-1)
    mn = rgb[..., :3].min(-1)
    d = mx - mn + 1e-6
    h = np.zeros_like(mx)
    h = np.where(mx == r, ((g - b) / d) % 6, h)
    h = np.where(mx == g, (b - r) / d + 2, h)
    h = np.where(mx == b, (r - g) / d + 4, h)
    h = (h * 60) % 360
    sat = np.where(mx > 0, d / (mx + 1e-6), 0)
    cave = ((h > 150) & (h < 245)) | (mx < 0.16) | ((sat < 0.12) & (mx < 0.45))
    keep = ~cave
    keep = ndimage.binary_opening(keep, iterations=1)
    keep = ndimage.binary_closing(keep, iterations=2)
    labels, n = ndimage.label(keep)
    sizes = ndimage.sum(keep, labels, range(1, n + 1))
    big = [i + 1 for i, sz in enumerate(sizes) if sz > 350]
    keep = np.isin(labels, big)
    alpha = ndimage.binary_dilation(keep, iterations=2).astype(np.float32)
    alpha = ndimage.gaussian_filter(alpha, 1.0)
    out = np.dstack([rgb[..., :3], alpha])
    return Image.fromarray((out * 255).astype(np.uint8), 'RGBA')



def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', default='')
    ap.add_argument('--max', type=int, default=512)
    ap.add_argument('--model', default='isnet-general-use')
    args = ap.parse_args()

    from rembg import remove, new_session
    sessions = {}

    def session_for(model):
        if model not in sessions:
            sessions[model] = new_session(model)
        return sessions[model]

    only = set(filter(None, args.only.split(',')))
    files = sorted(p for p in SRC.glob('*.jpg') if p.stem not in SKIP)
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
        if FILTER_OVERRIDE.get(path.stem) == 'hue_purple':
            cut = hue_purple_cutout(img)
        else:
            model = MODEL_OVERRIDE.get(path.stem, args.model)
            cut = remove(img, session=session_for(model), post_process_mask=True)
        if path.stem in CENTRAL_ONLY:
            cut = keep_central(cut, CENTRAL_ONLY[path.stem], LINK_PX.get(path.stem, 0))
        if path.stem not in FILTER_OVERRIDE:
            cut = drop_specks(cut)
        bbox = cut.getbbox()
        if not bbox:
            print('no subject found:', path.name, file=sys.stderr)
            continue
        cut = cut.crop(bbox)
        scale = min(1.0, args.max / max(cut.size))
        if scale < 1.0:
            cut = cut.resize((round(cut.width * scale), round(cut.height * scale)), Image.LANCZOS)
        out = DST / (path.stem + '.png')
        cut.save(out, optimize=True)
        entry = {
            'w': cut.width, 'h': cut.height,
            # subject bounding box in the original illustration
            'bbox': list(bbox)
        }
        index[path.stem] = entry
        print(f'{path.stem}: {cut.width}x{cut.height} ({out.stat().st_size // 1024} KB)')

    with open(index_path, 'w') as f:
        json.dump(index, f, indent=1, sort_keys=True)
    print('wrote', len(index), 'sprites to', DST)


if __name__ == '__main__':
    main()
