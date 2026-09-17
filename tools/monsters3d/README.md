# Level-1 monsters in 3D

The first-person view shows the nine difficulty-1 monsters (goblin, giant rat,
slime, bat swarm, zombie, mimic, wolf, giant snake, vampire bunny) as 3D models
from `www/assets/proto/fp/monsters/<id>.glb`. Configuration and procedural
motion (idle breathing/hover/squash/sway, flinch on a correct answer, lunge
on a wrong one) are in `www/js/proto/fp-monsters.js`.

Pipeline:
1. **Inputs**: the cutouts from `www/assets/proto/monsters/<id>.png`, padded
   to 1024 px with premultiplied alpha.
2. **Restyle** (`restyle_3d.py`, Qwen-Image-Edit): goblin, giant rat, vampire
   bunny and bat swarm are flat line art, which TRELLIS turned into picture
   cards. A 3D-looking render of the same character fixes that. Slime,
   zombie, mimic, wolf and snake go in unchanged.
3. **Image to 3D** (`generate_trellis.py`, TRELLIS): textured GLB per monster.
4. **Prepare** (`prepare.py`, headless Blender): removes loose blobs floating
   free of the figure, puts the base on the floor, centres the model,
   decimates to 9k triangles with smooth shading, uses non-metallic
   materials and a 512 px JPEG texture (90-275 KB per model):
   ```
   blender -b --python prepare.py -- <id>.glb ../../www/assets/proto/fp/monsters/<id>.glb 9000 512
   ```

Licences: TRELLIS (MIT) and Qwen-Image-Edit (Apache 2.0). Inputs are the
project's own monster illustrations.
