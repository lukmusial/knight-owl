"""Restyle a flat cartoon cutout into a 3D-looking render with Qwen-Image-Edit
(Apache 2.0, Hugging Face Space), before image -> 3D.

    python restyle_3d.py goblin,giant_rat,vampire_bunny,bat_swarm
    python restyle_3d.py ghost,lost_soul,banshee,skeleton,spider

TRELLIS turns flat line-art drawings (goblin, giant rat, vampire bunny) into
a picture card and lays the bat swarm flat on the floor; a shaded render of
the same character gives it the depth cues it needs. Input <id>_white.png
(cutout on white), output <id>_3dlook.png (fixed seed 7).
"""
import shutil, sys, time
from gradio_client import Client, handle_file
from huggingface_hub import get_token
PROMPT = ("Turn this flat cartoon illustration into a 3D rendered character figure like a Pixar toy: "
          "same character, same pose, same colours and proportions, soft studio lighting with gentle shading, "
          "whole body visible and centred, plain white background, no shadow on the ground.")
# Per-character prompts where the default turns into a picture card: swarms need
# to stay a cluster, spectres must come out opaque (TRELLIS reads see-through
# pixels as holes; the glow is added back in the game) and thin limbs need bulk.
PROMPTS = {
    'bat_swarm': ("Turn this flat cartoon illustration of a swarm of bats into a 3D rendered group of cute cartoon bats like Pixar toys, "
                  "flying close together in a tight cluster, same colours, soft studio lighting, whole group visible and centred, plain white background."),
    'ghost': ("Turn this into a 3D rendered opaque cartoon ghost figurine like a vinyl toy: solid pale surface, no transparency, no glow, "
              "same friendly face and shape, soft studio lighting, whole body visible and centred, plain white background."),
    'lost_soul': ("Turn this into a 3D rendered opaque cartoon spirit figurine like a vinyl toy: solid pale blue surface, no transparency, no glow, "
                  "same shape and face, soft studio lighting, whole body visible and centred, plain white background."),
    'banshee': ("Turn this into a 3D rendered opaque cartoon figurine of a ghostly woman in a flowing veil, like a vinyl toy: solid pale surface, "
                "no transparency, no glow, same pose and face, soft studio lighting, whole body visible and centred, plain white background."),
    'skeleton': ("Turn this into a 3D rendered cartoon skeleton figurine like a chunky vinyl toy: thick sturdy bones, chunky proportions, "
                 "same pose and armour, soft studio lighting, whole body visible and centred, plain white background."),
    'spider': ("Turn this into a 3D rendered cartoon spider figurine like a chunky vinyl toy: fat round body, thick sturdy legs, "
               "same colours and friendly eyes, soft studio lighting, whole body visible and centred, plain white background."),
}
client = Client('Qwen/Qwen-Image-Edit', verbose=False, token=get_token())
for mid in sys.argv[1].split(','):
    t0 = time.time()
    try:
        res, seed = client.predict(handle_file(mid + "_white.png"), PROMPTS.get(mid, PROMPT), 7, False, 4.0, 40, False, api_name='/infer')
        shutil.copy(res if isinstance(res, str) else res['path'], mid + '_3dlook.png')
        print(mid, 'ok %.0fs' % (time.time() - t0), flush=True)
    except Exception as e:
        print(mid, 'FAILED', str(e)[:300], flush=True)
