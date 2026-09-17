# Mr Owl 3D figure

Pipeline that turns the Mr Owl illustration into the rigged, animated
`www/assets/proto/fp/mr_owl.glb` used by the first-person view's
third-person camera (`www/js/proto/fp-owl.js`).

1. **Image to 3D**: `generate_trellis.py` sends `owl_input.png` (the
   transparent cutout, padded to ~1024 px) to Microsoft TRELLIS on Hugging
   Face and saves the textured mesh as `owl_trellis_raw.glb` (29k triangles,
   1024 px texture). Needs `hf auth login` for GPU quota.
2. **Rig and animate**: `rig.py` runs headless in Blender 4.5:
   ```
   blender -b --python rig.py -- owl_trellis_raw.glb ../../www/assets/proto/fp/mr_owl.glb 0.75
   ```
   It decimates to 75 % (~22k triangles) with smooth shading and builds a
   13-bone skeleton: root, hips, spine, head, legs and feet, wings (arm and
   hand) and tail. Joint positions were read off orthographic renders
   (`render_views.py`). Skin weights are region-gated distance falloff. The
   sword and shield are bound rigidly to the wing-hands, and faces that
   bridge them to the body are removed so nothing stretches. Clips:
   **Idle** (2 s breathing loop), **Walk** (legs stride, wings swing and lift),
   **Flap** (two wing beats with a hop) and **Attack** (sword chop). Also saves
   a `.blend` next to the output.
3. **Check**: `blender -b mr_owl.blend --python poses.py -- pose` renders
   key poses from the front and side.

Licences: TRELLIS code and weights are MIT. The input art is the project's
own illustration.
