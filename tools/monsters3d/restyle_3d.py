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
                  "flying in a loose swarm with a hand's gap between them, none of them touching, each bat whole and separate, "
                  "the swarm together making a rounded cluster about as wide as it is tall, wings open, at different heights, "
                  "same colours, soft studio lighting, whole group visible and centred, plain white background."),
    'beholder': ("Turn this into a 3D rendered cartoon beholder figurine like a vinyl toy: a perfectly round ball-shaped body, spherical from "
                 "every side, one big eye in the middle, eye stalks spread evenly around the sphere, same purple and green colours, "
                 "soft studio lighting, whole body visible and centred, plain white background."),
    'slime': ("Turn this into a 3D rendered cartoon slime figurine like a vinyl toy: a fat round dome of green jelly, ball-shaped and deep, "
              "not flat, same smiling face and colours, soft studio lighting, whole body visible and centred, plain white background."),
    'ghost': ("Turn this into a 3D rendered opaque cartoon ghost figurine like a vinyl toy: solid pale surface, no transparency, no glow, "
              "same friendly face and shape, soft studio lighting, whole body visible and centred, plain white background."),
    'lost_soul': ("Turn this into a 3D rendered opaque cartoon spirit figurine like a vinyl toy: solid pale blue surface, no transparency, no glow, "
                  "same shape and face, soft studio lighting, whole body visible and centred, plain white background."),
    'banshee': ("Turn this into a 3D rendered opaque cartoon figurine of a ghostly woman in a flowing veil, like a vinyl toy: solid pale surface, "
                "no transparency, no glow, same pose and face, soft studio lighting, whole body visible and centred, plain white background."),
    'skeleton': ("Turn this into a 3D rendered cartoon skeleton figurine like a chunky vinyl toy: thick sturdy bones, chunky proportions, "
                 "same pose and armour, soft studio lighting, whole body visible and centred, plain white background."),
    'will_o_wisp': ("Turn this into a 3D rendered opaque cartoon figurine of a little glowing flame spirit, like a vinyl toy: "
                    "solid pale yellow-green surface, no transparency, no glow, same friendly face and teardrop shape, "
                    "soft studio lighting, whole body visible and centred, plain white background."),
    'spirit_of_the_mine': ("Turn this into a 3D rendered opaque cartoon figurine of a friendly miner ghost in a helmet, like a vinyl toy: "
                           "solid pale surface, no transparency, no glow, same face and shape, soft studio lighting, "
                           "whole body visible and centred, plain white background."),
    'witch': ("Turn this into a 3D rendered cartoon witch figurine like a vinyl toy: the same friendly witch in her hat and robe, "
              "stirring a deep round cast-iron cauldron that stands on three legs, the cauldron a fat rounded pot seen from the side, "
              "whole figure and whole cauldron visible and centred, soft studio lighting, plain white background."),
    'dark_knight': ("Turn this into a 3D rendered cartoon knight figurine like a vinyl toy: the same black armour, purple cape and glowing "
                    "red eyes, standing at full height from head to feet with both armoured legs and boots visible, holding his sword down, "
                    "whole body in frame and centred, soft studio lighting, plain white background."),
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
