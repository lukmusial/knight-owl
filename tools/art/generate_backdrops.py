"""Generate the encounter-card backdrops with a text-to-image Space.

    python generate_backdrops.py               # everything missing
    python generate_backdrops.py dungeon_hoard,cemetery_gate [--force]
        [--space black-forest-labs/FLUX.1-schnell] [--steps 4] [--variants 2]

The encounter card used to show the monster's own illustration with the
character inpainted out, which left a scar where it had stood. Instead the
card now stands the monster in an empty painted room: a handful of backdrops
per level theme (dungeon, cemetery), with a matching scene per kind of
monster (a hoard for the dragon, a throne hall for the dark knight).

Writes www/assets/proto/backdrops/<scene>_<n>.jpg at 800x600, the card's
size. The scene list here is the source of truth for the ids; the mapping
from monster to scene lives in www/js/modules/monster-stage.js.
Needs `hf auth login` and the venv in tools/art/.venv.
"""
import os, sys, time

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'www', 'assets', 'proto', 'backdrops')
SPACES = ['black-forest-labs/FLUX.1-schnell', 'Qwen/Qwen-Image']

STYLE = ('painterly cartoon fantasy illustration for a children\'s game, kid-friendly, rich colours, '
         'soft edges, deep perspective, empty room with nothing in the middle, wide establishing shot, '
         'no characters, no people, no creatures, no animals, no monsters, no text, no watermark, no frame')

# scene id -> what is painted. Two variants of each are rendered so the same
# monster does not always turn up in the same room.
SCENES = {
    'dungeon_hall': 'a wide empty stone dungeon hall, arched vaults, burning wall torches, worn flagstones, tattered banners',
    'dungeon_crypt': 'an empty stone crypt, carved sarcophagi along the walls, cobwebs, candles, dust in the torchlight',
    'dungeon_cave': 'an empty rough underground cavern, stalagmites, a still green pool, glowing mushrooms',
    'dungeon_hoard': 'an empty treasure chamber deep in a dungeon, heaps of gold coins, open chests, gems and crowns, torchlight glinting on the gold',
    'dungeon_throne': 'an empty dark throne hall, a big carved stone throne on a dais, tall banners, braziers',
    'dungeon_lava': 'an empty volcanic dungeon cavern, a river of glowing lava, black rock ledges, embers in the air',
    'dungeon_mine': 'an empty abandoned dwarven mine tunnel, wooden props, mine cart rails, hanging lanterns, glittering ore in the walls',
    'dungeon_library': 'an empty dusty dungeon library, tall bookshelves, floating candles, a reading lectern',
    'cemetery_graves': 'an empty Halloween night cemetery, crooked gravestones, low mist, bare trees, a full moon',
    'cemetery_crypt': 'an empty stone mausoleum doorway at night, iron lanterns, ivy, moonlit steps',
    'cemetery_gate': 'an empty wrought iron cemetery gate at night, stone pillars, dead trees, glowing lanterns',
    'cemetery_chapel': 'an empty ruined chapel at night, broken stained glass windows, moonlight through the roof, fallen stones',
    'cemetery_pumpkins': 'an empty pumpkin patch at night beside a graveyard fence, carved glowing jack-o-lanterns, hay bales, a full moon',
}
VARIANTS = 2


def seed_for(n):
    """A distinct seed for every variant (7, 23, 39, ...)."""
    return 7 + 16 * (n - 1)


def opt(name, default=None):
    a = sys.argv
    return a[a.index(name) + 1] if name in a and a.index(name) + 1 < len(a) else default


def call_space(space, prompt, seed, steps, w, h):
    from gradio_client import Client
    from huggingface_hub import get_token
    client = Client(space, verbose=False, token=get_token())
    if space.startswith('black-forest-labs/FLUX'):
        res = client.predict(prompt, seed, False, w, h, steps, api_name='/infer')
    elif space.startswith('Qwen/Qwen-Image'):
        res = client.predict(prompt, seed, False, '4:3', 4.0, max(steps, 30), api_name='/infer')
    else:
        res = client.predict(prompt, seed, False, w, h, steps, api_name='/infer')
    img = res[0] if isinstance(res, (list, tuple)) else res
    return img if isinstance(img, str) else img['path']


def main():
    from PIL import Image
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    names = args[0].split(',') if args else sorted(SCENES)
    space = opt('--space', SPACES[0])
    steps = int(opt('--steps', 4))
    variants = int(opt('--variants', VARIANTS))
    force = '--force' in sys.argv
    dry = '--dry-run' in sys.argv
    os.makedirs(OUT, exist_ok=True)
    failed = []
    for name in names:
        if name not in SCENES:
            print(name, 'unknown scene', flush=True)
            continue
        for n in range(1, variants + 1):
            out = os.path.join(OUT, '%s_%d.jpg' % (name, n))
            if os.path.exists(out) and not force:
                print(os.path.basename(out), 'exists', flush=True)
                continue
            prompt = SCENES[name] + ', ' + STYLE
            if dry:
                print(os.path.basename(out), '->', prompt)
                continue
            seed = seed_for(n)
            t0 = time.time()
            done = False
            for sp in [space] + [s for s in SPACES if s != space]:
                for retry in range(3):
                    try:
                        path = call_space(sp, prompt, seed, steps, 1024, 768)
                        img = Image.open(path).convert('RGB').resize((800, 600), Image.LANCZOS)
                        img.save(out, quality=86, optimize=True)
                        print(os.path.basename(out), 'ok %.0fs via %s' % (time.time() - t0, sp), flush=True)
                        done = True
                        break
                    except Exception as e:
                        msg = str(e)
                        print(os.path.basename(out), 'attempt failed on', sp, ':', msg[:200], flush=True)
                        if any(w in msg.lower() for w in ('quota', 'gpu', 'queue')):
                            time.sleep(20 * (retry + 1))
                            continue
                        break
                if done:
                    break
            if not done:
                print(os.path.basename(out), 'FAILED', flush=True)
                failed.append(os.path.basename(out))

    if failed:
        print('failed:', ', '.join(failed), flush=True)
        sys.exit(1)


if __name__ == '__main__':
    main()
