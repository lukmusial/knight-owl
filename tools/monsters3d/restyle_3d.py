"""Restyle a flat cartoon cutout into a 3D-looking render with Qwen-Image-Edit
(Apache 2.0, Hugging Face Space), before image -> 3D.

    python restyle_3d.py goblin,giant_rat,vampire_bunny,bat_swarm

TRELLIS turns flat line-art drawings (goblin, giant rat, vampire bunny) into
a picture card and lays the bat swarm flat on the floor; a shaded render of
the same character gives it the depth cues it needs. Input <id>_white.png
(cutout on white), output <id>_3dlook.png (fixed seed 7).
"""
import shutil, sys, time
from gradio_client import Client, handle_file
from huggingface_hub import get_token
PROMPT_BAT = ("Turn this flat cartoon illustration of a swarm of bats into a 3D rendered group of cute cartoon bats like Pixar toys, flying close together in a tight cluster, same colours, soft studio lighting, whole group visible and centred, plain white background.")
PROMPT = ("Turn this flat cartoon illustration into a 3D rendered character figure like a Pixar toy: "
          "same character, same pose, same colours and proportions, soft studio lighting with gentle shading, "
          "whole body visible and centred, plain white background, no shadow on the ground.")
client = Client('Qwen/Qwen-Image-Edit', verbose=False, token=get_token())
for mid in sys.argv[1].split(','):
    t0 = time.time()
    try:
        res, seed = client.predict(handle_file(mid + "_white.png"), PROMPT_BAT if mid == "bat_swarm" else PROMPT, 7, False, 4.0, 40, False, api_name='/infer')
        shutil.copy(res if isinstance(res, str) else res['path'], mid + '_3dlook.png')
        print(mid, 'ok %.0fs' % (time.time() - t0), flush=True)
    except Exception as e:
        print(mid, 'FAILED', str(e)[:300], flush=True)
