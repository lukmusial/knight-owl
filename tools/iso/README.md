# Isometric view: Blender-rendered props

## Wall torch (`render_torch.py`)

Models a wall torch in Blender and renders it for the dungeon chambers:

```
blender -b --python tools/iso/render_torch.py -- www/assets/proto/iso/torch.png 200
```

Writes `torch.png` plus `torch.json` with the wall mount point and the top of
the wrap (where the animated flame sits) as fractions of the image.

## Cemetery props from the Kenney kits (`render_kit.py`)

The Halloween cemetery level dresses its grounds with Kenney's CC0 3D kits
rendered as 2D isometric sprites, so they match the Kenney "Isometric
Miniature Dungeon" tiles of the dungeon level:

- Graveyard Kit: https://kenney.nl/assets/graveyard-kit (gravestones, crypts,
  lamp posts, pumpkins, benches, pillars, rocks, coffins, debris)
- Nature Kit: https://kenney.nl/assets/nature-kit (picket fence and gate,
  trees, rocks, column)

Download and unzip both kits somewhere outside the repository (they are not
committed), then:

```
blender -b --python tools/iso/render_kit.py -- \
  --kit graveyard=~/Downloads/kenney_graveyard-kit \
  --kit nature=~/Downloads/kenney_nature-kit \
  --manifest tools/iso/cemetery_models.json \
  --out www/assets/proto/iso/cemetery [--only tomb_small,grave_0] [--samples 48]
```

`--list` prints the bounding box of every model the manifest refers to (or of
every model in the kits when no manifest is given) without rendering; use it
to pick `scale`, `offset` and `footprint` for new entries.

Camera: orthographic, azimuth 45°, elevation 30° (`asin 0.5`), so a unit
floor square projects exactly onto the 128x64 diamond of the isometric grid
(`--ppt` = pixels per tile width, 128). One model unit is one tile; the kits
are modelled on a 1-unit grid (a fence segment is 1.0 long). World +X is
screen down-right (+gx), world -Y is screen down-left (+gy). Note that
`render_torch.py` and `tools/owl3d/render_iso.py` use `atan(0.5)`; that is
fine for figures but would not align floor footprints.

Lighting is a key sun from camera-left-above and a soft fill; the night
look (blue moonlight, warm lantern pools) is applied at runtime with Phaser
tints, not baked into the sprites.

### Manifest (`cemetery_models.json`)

```json
{ "ppt": 128, "sprites": {
  "grave_0":   { "kit": "graveyard", "src": ["gravestone-bevel"], "scale": 1.3, "footprint": [1, 1] },
  "fence_w":   { "kit": "nature", "src": ["fence_simple"], "rot": 90, "offset": [-0.5, 0, 0], "footprint": [1, 1] },
  "lantern_post": { "kit": "graveyard", "src": ["lightpost-single"], "scale": 1.15, "footprint": [1, 1], "light": "top" },
  "tomb_small": { "footprint": [2, 2], "door": [0, -1.0, 0], "parts": [
      { "kit": "graveyard", "src": ["crypt-small"], "scale": 1.35 },
      { "kit": "graveyard", "src": ["crypt-small-roof"], "scale": 1.35, "pos": [0, 0, 1.35] } ] }
} }
```

- `src` is an ordered list of candidate model basenames (glb, gltf or obj).
- `rot` (degrees about Z), `offset`/`pos` (tile units) and `scale` transform
  a model; `parts` composes several models into one sprite.
- `light` (`"top"` or `[x, y, z]`) and `door` (`[x, y, z]`, floor point) are
  projected into the image and written to the output manifest.

Output: `www/assets/proto/iso/cemetery/<name>.png` (trimmed, transparent)
and `cemetery.json` with `w`, `h`, `anchor` (the floor point of the footprint
centre as a fraction of the image; it can fall outside 0..1 for pieces that
sit on a tile edge, like the fence), `footprint`, `light` and `door`.
`www/js/proto/cem-textures.js` reads the manifest and falls back to
procedural stand-ins for any sprite that is missing.

The sprite names the scene expects: `grave_0..5`, `grave_cross_large`,
`grave_mound`, `tree_0..3`, `statue_0..2`, `bench`, `pumpkin_0..2`,
`rock_0..1`, `lantern_post`, `fence_n`, `fence_w`, `gate_n`, `fence_post`,
`tomb_small`, `tomb_large`, `bones`, `coffin`.
