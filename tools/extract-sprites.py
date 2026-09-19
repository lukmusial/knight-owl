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

# Per-sprite overrides where the default model (isnet-general-use) fails:
# - giant_snake: isnet drops the coils crossing the dark background and u2net
#   cut away the back of the neck along the belly; birefnet-general keeps all of it
# - goblin: isnet lost the lower edge of the left ear against the torch-lit wall;
#   birefnet-general keeps both ears
# - bat_swarm: every model keeps the dark cave centre as "subject"; a hue filter
#   that rejects the teal/blue cave colours and keeps the purple/pink bats works
MODEL_OVERRIDE = {'giant_snake': 'birefnet-general', 'goblin': 'birefnet-general'}
FILTER_OVERRIDE = {'bat_swarm': 'hue_purple'}
# The cemetery monsters (FLUX text-to-image) stand in busy scenes: rembg also
# keeps a tree, the moon or a pumpkin as "subject". Keep only the connected
# blob(s) that overlap the middle of the picture, where the character stands.
# 'central': blobs overlapping the middle third; 'largest': the biggest blob;
# 'glow': the blob with the most bright yellow-green pixels (the wisp, not the tree)
CENTRAL_ONLY = {'pumpkin_man': 'central', 'will_o_wisp': 'glow', 'banshee': 'largest', 'clown': 'central', 'grim_reaper': 'central'}


def keep_central(cut, mode='central'):
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



def paint_out(img, cut):
    """The illustration with the character painted out, so an animated sprite
    can move across the scene without its twin showing underneath.

    The hole is filled by inpainting, then blended back with a distance
    feather: full replacement where the character stood, fading to the
    untouched painting over a band outside it. Nothing is darkened and no
    edge is composited hard, which is what used to leave the character's
    silhouette visible as a discoloured patch."""
    import numpy as np
    try:
        import cv2
    except ImportError:
        return None
    FEATHER = 26                      # px the fill fades out over
    rgb = np.asarray(img.convert('RGB'))[:, :, ::-1].copy()
    alpha = np.asarray(cut.convert('RGBA'))[:, :, 3]
    mask = (alpha > 20).astype(np.uint8) * 255
    # cover the character and the dark outline the illustration draws round it
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    core = cv2.dilate(mask, k, iterations=3)

    # inpaint at half size: cheap, and the smear reads as depth of field
    small = cv2.resize(rgb, (rgb.shape[1] // 2, rgb.shape[0] // 2), interpolation=cv2.INTER_AREA)
    small_mask = cv2.resize(core, (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST)
    filled = cv2.inpaint(small, small_mask, 9, cv2.INPAINT_TELEA)
    filled = cv2.resize(filled, (rgb.shape[1], rgb.shape[0]), interpolation=cv2.INTER_LINEAR)
    # Blur by the size of the hole. Inpainting a character-sized area only
    # smears the edge colours inward, which keeps his silhouette; washing it
    # out at this scale turns the patch into out-of-focus background instead.
    area = float((core > 0).sum())
    wash = float(np.clip((area ** 0.5) / 5.0, 6.0, 70.0))
    filled = cv2.GaussianBlur(filled, (0, 0), wash).astype(np.float32)

    # Give the fill some grain so it does not read as plastic. It has to be
    # synthetic: the painting's own high frequencies carry the character's
    # edges, and adding those back would draw his outline again.
    outside = core == 0
    detail = rgb.astype(np.float32) - cv2.GaussianBlur(rgb, (0, 0), 5).astype(np.float32)
    sigma = float(detail[outside].std()) if outside.any() else 2.0
    rs = np.random.RandomState(7)
    noise = rs.normal(0.0, min(sigma, 6.0), rgb.shape[:2]).astype(np.float32)
    noise = cv2.GaussianBlur(noise, (0, 0), 0.8)
    filled += noise[:, :, None]

    # 1 inside the hole, fading to 0 over FEATHER px outside it
    dist = cv2.distanceTransform((core == 0).astype(np.uint8), cv2.DIST_L2, 3)
    a = np.clip(1.0 - dist / float(FEATHER), 0.0, 1.0)
    a = np.where(core > 0, 1.0, a).astype(np.float32)[:, :, None]

    out = rgb.astype(np.float32) * (1.0 - a) + filled * a
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)[:, :, ::-1])


def rebuild_plates(args):
    """Repaint <id>_bg.jpg from the cutouts already in the sprite folder.
    Much faster than a full run, and the cutouts stay exactly as they are."""
    only = set(filter(None, args.only.split(',')))
    index_path = DST / 'index.json'
    index = json.load(open(index_path)) if index_path.exists() else {}
    done = 0
    for path in sorted(SRC.glob('*.png')):
        if path.stem in SKIP:
            continue
        if only and path.stem not in only:
            continue
        entry = index.get(path.stem)
        cut_path = DST / path.name
        if not entry or not entry.get('bbox') or not cut_path.exists():
            continue
        full = Image.open(path).convert('RGBA')
        # put the cropped cutout back where it came from, so the mask lines up
        stamp = Image.new('RGBA', full.size, (0, 0, 0, 0))
        cut = Image.open(cut_path).convert('RGBA')
        b = entry['bbox']
        box_w, box_h = b[2] - b[0], b[3] - b[1]
        if cut.size != (box_w, box_h):
            cut = cut.resize((box_w, box_h), Image.LANCZOS)
        stamp.paste(cut, (b[0], b[1]))
        plate = paint_out(full, stamp)
        if plate is None:
            print('opencv missing; cannot paint plates', file=sys.stderr)
            return
        plate.convert('RGB').save(DST / (path.stem + '_bg.jpg'), quality=85, optimize=True)
        entry['bg'] = True
        index[path.stem] = entry
        done += 1
        print(f'{path.stem}: plate repainted')
    with open(index_path, 'w') as f:
        json.dump(index, f, indent=1, sort_keys=True)
    print('repainted', done, 'plates')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', default='')
    ap.add_argument('--max', type=int, default=512)
    ap.add_argument('--model', default='isnet-general-use')
    ap.add_argument('--no-bg', action='store_true', help='skip the inpainted background plates')
    ap.add_argument('--bg-only', action='store_true',
                    help='rebuild only the background plates, reusing the cutouts already extracted')
    args = ap.parse_args()

    if args.bg_only:
        rebuild_plates(args)
        return

    from rembg import remove, new_session
    sessions = {}

    def session_for(model):
        if model not in sessions:
            sessions[model] = new_session(model)
        return sessions[model]

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
        if FILTER_OVERRIDE.get(path.stem) == 'hue_purple':
            cut = hue_purple_cutout(img)
        else:
            model = MODEL_OVERRIDE.get(path.stem, args.model)
            cut = remove(img, session=session_for(model), post_process_mask=True)
        if path.stem in CENTRAL_ONLY:
            cut = keep_central(cut, CENTRAL_ONLY[path.stem])
        uncropped = cut
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
        entry = {
            'w': cut.width, 'h': cut.height,
            # subject bounding box in the original illustration
            'bbox': list(bbox)
        }
        if not args.no_bg:
            full = Image.open(path).convert('RGBA')
            plate = paint_out(full, uncropped)
            if plate is not None:
                plate.convert('RGB').save(DST / (path.stem + '_bg.jpg'), quality=85, optimize=True)
                entry['bg'] = True
        index[path.stem] = entry
        print(f'{path.stem}: {cut.width}x{cut.height} ({out.stat().st_size // 1024} KB)')

    with open(index_path, 'w') as f:
        json.dump(index, f, indent=1, sort_keys=True)
    print('wrote', len(index), 'sprites to', DST)


if __name__ == '__main__':
    main()
