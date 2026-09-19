"""Batch image -> 3D with Microsoft TRELLIS (MIT) on Hugging Face.

    python generate_trellis.py goblin,giant_rat,...   (needs `hf auth login`; PRO quota for batches)

Reads <id>_in.png (the cutout padded to 1024 px, premultiplied alpha; or the
restyled render from restyle_3d.py for flat line-art monsters) and writes
<id>.glb plus a turntable <id>.mp4. Existing .glb files are skipped.
"""
import shutil, sys, time, os
from gradio_client import Client, handle_file
from huggingface_hub import get_token
ids = sys.argv[1].split(',')
# restyled characters come in as <id>_3dlook.png; everything else uses the cutout
SUFFIX = sys.argv[2] if len(sys.argv) > 2 else '_in.png'
client = Client('trellis-community/TRELLIS', verbose=False, token=get_token())
for mid in ids:
    if os.path.exists(mid + '.glb'):
        print(mid, 'exists', flush=True); continue
    t0 = time.time()
    try:
        try: client.predict(api_name='/start_session')
        except Exception: pass
        src = mid + SUFFIX if os.path.exists(mid + SUFFIX) else mid + '_in.png'
        pre = client.predict(handle_file(src), api_name='/preprocess_image')
        pre = pre if isinstance(pre, str) else pre['path']
        res = client.predict(handle_file(pre), [], 42, 7.5, 12, 3.0, 12, 'stochastic', 0.9, 1024, api_name='/generate_and_extract_glb')
        glb = res[2] if isinstance(res[2], str) else res[2]['path']
        shutil.copy(glb, mid + '.glb')
        v = res[0]['video'] if isinstance(res[0], dict) else res[0]
        shutil.copy(v, mid + '.mp4')
        print(mid, 'ok %.0fs' % (time.time() - t0), flush=True)
    except Exception as e:
        print(mid, 'FAILED', str(e)[:300], flush=True)
