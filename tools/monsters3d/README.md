# The monsters in 3D

The first-person view shows every monster in the game - and the treasure
hoard - as a 3D model from `www/assets/proto/fp/monsters/<id>.glb`.
Configuration and procedural motion (idle breathing/hover/squash/sway, `still`
for the gold, flinch on a correct answer, lunge on a wrong one) are in
`www/js/proto/fp-monsters.js`. The same models are rendered to sprite sheets
for the isometric cemetery (`render_all.sh`) and for the encounter card
(`render_cards.sh`).

Pipeline:
1. **Inputs**: the cutouts from `www/assets/proto/monsters/<id>.png`, padded
   to 1024 px with premultiplied alpha.
2. **Restyle** (`restyle_3d.py`, Qwen-Image-Edit): goblin, giant rat, vampire
   bunny and bat swarm are flat line art, which TRELLIS turned into picture
   cards. A 3D-looking render of the same character fixes that. Slime,
   zombie, mimic, wolf and snake go in unchanged.
3. **Image to 3D** (`generate_trellis.py`, TRELLIS): textured GLB per monster.
   Pass `_3dlook.png` as the second argument to build from a restyled render.
4. **Prepare** (`prepare.py`, headless Blender): removes loose blobs floating
   free of the figure, puts the base on the floor, centres the model,
   decimates to 9k triangles with smooth shading, uses non-metallic
   materials and a 512 px JPEG texture (90-275 KB per model):
   ```
   blender -b --python prepare.py -- <id>.glb ../../www/assets/proto/fp/monsters/<id>.glb 9000 512
   ./prepare_all.sh              # every mesh here that has no prepared copy yet
   ```
5. **Sprite sheets**: `./render_all.sh` for the isometric cemetery (160 px
   frames) and `./render_cards.sh` for the encounter card (448 px frames,
   shot nearly head on from a 60k-triangle copy of the mesh).

A model that comes out as a flat picture card has flat line art as its input:
restyle it (step 2), delete `<id>.glb` and the prepared copy, and run steps 3
and 4 again. The orc, the vampire lord, the will-o'-the-wisp and the spirit of
the mine all needed that. The restyle also fixes what the illustration left
out or flattened: the dark knight was painted from the knees up and came out
legless, and the witch's cauldron came out as a flat plane.

Licences: TRELLIS (MIT) and Qwen-Image-Edit (Apache 2.0). Inputs are the
project's own monster illustrations.
