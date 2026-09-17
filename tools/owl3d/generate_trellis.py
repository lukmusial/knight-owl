"""Image -> textured 3D model with Microsoft TRELLIS (MIT) on Hugging Face.

Usage (Python 3.10+, `pip install gradio_client huggingface_hub`, logged in
with `hf auth login` for enough ZeroGPU quota):
    python generate_trellis.py owl_input.png owl_trellis_raw.glb

The input is the transparent Mr Owl cutout padded and upscaled to ~1024 px
(assets/proto/monsters/knight_owl.png). The trellis-community/TRELLIS Space
gave a proper 3D figure; microsoft/TRELLIS.2 returned a flat card for this
cartoon at the time of writing.
"""
import shutil, sys, time
from gradio_client import Client, handle_file
from huggingface_hub import get_token

src = sys.argv[1] if len(sys.argv) > 1 else 'owl_input.png'
out = sys.argv[2] if len(sys.argv) > 2 else 'owl_trellis_raw.glb'
client = Client('trellis-community/TRELLIS', verbose=False, token=get_token())
t0 = time.time()
try:
    client.predict(api_name='/start_session')
except Exception as e:  # older Space builds have no session endpoint
    print('start_session:', e)
pre = client.predict(handle_file(src), api_name='/preprocess_image')
pre = pre if isinstance(pre, str) else pre['path']
# seed 42, sparse-structure guidance 7.5 / 12 steps, SLat guidance 3 / 12 steps,
# mesh simplify 0.9, texture 1024
res = client.predict(handle_file(pre), [], 42, 7.5, 12, 3.0, 12, 'stochastic', 0.9, 1024,
                     api_name='/generate_and_extract_glb')
glb = res[2] if isinstance(res[2], str) else res[2]['path']
shutil.copy(glb, out)
print('wrote', out, 'in %.0fs' % (time.time() - t0))
