"""Generate a monster illustration with a text-to-image Space on Hugging Face.

    python generate_monster.py pumpkin_man,will_o_wisp,banshee,clown,grim_reaper
        [--space black-forest-labs/FLUX.1-schnell] [--seed 7] [--steps 4]
        [--size 1024x768] [--force] [--dry-run] [--prompt "..."]

Reads each monster's `imagePrompt` from www/js/data/monsters.js (through
node, so the file stays the single source of truth), appends the shared
style line of the existing illustrations and writes www/assets/<id>.jpg at
800x600 like the rest of the set. Existing files are kept unless --force.
Needs `hf auth login` (the Space's GPU quota is per account) and the venv in
tools/art/.venv (gradio_client, huggingface_hub, pillow).

Spaces: FLUX.1-schnell (Apache 2.0 weights) is the default; --space picks
another Gradio text-to-image Space with an /infer endpoint of the same shape
(Qwen/Qwen-Image is a known fallback). On a quota error the script waits and
retries a few times, then tries the fallback Space.
"""
import io, os, subprocess, sys, time, json, shutil

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
STYLE = ('painterly cartoon fantasy illustration for a children\'s game, kid-friendly, warm soft lighting, '
         'rich colours, soft edges, full body character centred in a Halloween night cemetery scene with '
         'moonlight, glowing lanterns and gravestones, no text, no watermark, no frame')
SPACES = ['black-forest-labs/FLUX.1-schnell', 'Qwen/Qwen-Image']


def opt(name, default=None):
    a = sys.argv
    return a[a.index(name) + 1] if name in a and a.index(name) + 1 < len(a) else default


def prompts_from_js(ids):
    js = ("const M = require(%s).MONSTERS || MONSTERS; "
          "console.log(JSON.stringify(Object.fromEntries(M.filter(m => %s.includes(m.id)).map(m => [m.id, m.imagePrompt]))));"
          % (json.dumps(os.path.join(ROOT, 'www', 'js', 'data', 'monsters.js')), json.dumps(ids)))
    out = subprocess.check_output(['node', '-e', js], cwd=ROOT)
    return json.loads(out)


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
    ids = [s for s in (sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else '').split(',') if s]
    if not ids:
        print(__doc__)
        return
    space = opt('--space', SPACES[0])
    seed = int(opt('--seed', 7))
    steps = int(opt('--steps', 4))
    w, h = [int(v) for v in opt('--size', '1024x768').split('x')]
    force = '--force' in sys.argv
    dry = '--dry-run' in sys.argv
    override = opt('--prompt')
    prompts = prompts_from_js(ids)
    from PIL import Image
    for mid in ids:
        # JPEG: the paintings have no transparency, and as PNG the forty of
        # them weighed 31 MB of the app
        out = os.path.join(ROOT, 'www', 'assets', mid + '.jpg')
        if os.path.exists(out) and not force:
            print(mid, 'exists', flush=True)
            continue
        base = override or prompts.get(mid)
        if not base:
            print(mid, 'no imagePrompt in monsters.js', flush=True)
            continue
        prompt = base + ', ' + STYLE
        if dry:
            print(mid, '->', prompt)
            continue
        t0 = time.time()
        done = False
        for attempt, sp in enumerate([space] + [s for s in SPACES if s != space]):
            for retry in range(3):
                try:
                    path = call_space(sp, prompt, seed, steps, w, h)
                    img = Image.open(path).convert('RGB')
                    img = img.resize((800, 600), Image.LANCZOS)
                    img.save(out, quality=86, optimize=True, progressive=True)
                    print(mid, 'ok %.0fs via %s' % (time.time() - t0, sp), flush=True)
                    done = True
                    break
                except Exception as e:
                    msg = str(e)
                    print(mid, 'attempt failed on', sp, ':', msg[:200], flush=True)
                    if 'quota' in msg.lower() or 'gpu' in msg.lower() or 'queue' in msg.lower():
                        time.sleep(20 * (retry + 1))
                        continue
                    break
            if done:
                break
        if not done:
            print(mid, 'FAILED', flush=True)


if __name__ == '__main__':
    main()
