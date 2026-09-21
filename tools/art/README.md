# Monster illustrations (text-to-image)

`generate_monster.py` paints a monster's full-scene illustration with a
text-to-image Space on Hugging Face and writes `www/assets/<id>.png` at
800x600 like the rest of the set. The prompt is the monster's `imagePrompt`
from `www/js/data/monsters.js` plus a shared style line (painterly cartoon,
kid-friendly, Halloween night cemetery).

```
python3.12 -m venv tools/art/.venv
tools/art/.venv/bin/pip install gradio_client huggingface_hub pillow
hf auth login                      # the Space's GPU quota is per account
tools/art/.venv/bin/python tools/art/generate_monster.py pumpkin_man,will_o_wisp,banshee,clown,grim_reaper
```

Options: `--space` (default `black-forest-labs/FLUX.1-schnell`, fallback
`Qwen/Qwen-Image`), `--seed`, `--steps`, `--size`, `--prompt` (override the
prompt for a re-roll), `--force` (overwrite), `--dry-run` (print prompts).

Then cut the character out of the scene for the prototype views:

```
tools/art/.venv/bin/pip install "llvmlite==0.43.0" "numba==0.60.0" pymatting onnxruntime numpy scipy scikit-image opencv-python-headless pooch jsonschema tqdm
tools/art/.venv/bin/pip install rembg --no-deps
tools/art/.venv/bin/python tools/extract-sprites.py --only pumpkin_man,will_o_wisp,banshee,clown,grim_reaper
```

(`rembg` pulls `numba`; the pinned `llvmlite` has wheels for Intel Macs.)
The cemetery monsters stand in busy scenes, so `extract-sprites.py` keeps
only the character's blob for them (`CENTRAL_ONLY`: central blobs, the
largest blob, or the glowing one for the wisp); every cutout then has the
crumbs of scenery dropped (`drop_specks`, blobs under 1% of the biggest).
The dark knight was cut with the hoard of gold beside him and without his
cape, which is why he is on `birefnet-general` and the largest blob. Something
a character holds away from its body (the clown's balloon, on a string rembg
does not keep) is linked back in by `LINK_PX`: blobs within that many pixels
of what has been kept are his, the scenery further off is not.

## Encounter-card backdrops

`generate_backdrops.py` paints the empty rooms the encounter card stands the
monster in, two variants of each, into `www/assets/proto/backdrops/`:

```
tools/art/.venv/bin/python tools/art/generate_backdrops.py            # everything missing
tools/art/.venv/bin/python tools/art/generate_backdrops.py dungeon_hoard --force
```

The scene list in that script is the source of truth for the names; which
monster gets which room is `SCENE_FOR` in `www/js/modules/monster-stage.js`.

Licences: FLUX.1-schnell weights are Apache 2.0, Qwen-Image is Apache 2.0.
The generated illustrations are the project's own.
