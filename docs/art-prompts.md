# Art prompts for the prototype views

The prototype pages (`www/proto/first-person.html`, `www/proto/isometric.html`) derive all their textures, tiles and tokens at runtime from the existing artwork (crops of `assets/directions/*.png`, circular cut-outs of `assets/<monster>.png`, palette sampling). They also probe for real art files and use them when present. This document lists those files and gives prompts for generating them. Every prompt should be run with the named seed image(s) as the style/reference input.

## Shared style line

> Painterly cartoon fantasy, kid-friendly, mossy grey-blue dungeon stone with warm torch light, soft edges, no text, no watermark. Match the look of `assets/directions/n_s.png` (corridor) and `assets/goblin.png` (character).

All files: PNG, sRGB. Textures for the first-person view must be power-of-two and seamless (tileable). Sprites/tokens need a transparent background.

## First-person view (`www/assets/proto/`)

| File | Size | Seed image(s) | Prompt |
|------|------|---------------|--------|
| `wall.png` | 512x512, seamless | `assets/directions/n_s.png` | Seamless tiling texture of a dungeon stone-block wall, large irregular grey-blue blocks with dark mortar, faint moss in the joints, even lighting, top-down flat view for use as a repeating wall texture. |
| `floor.png` | 512x512, seamless | `assets/directions/n_s.png` (bottom band) | Seamless tiling texture of worn dungeon flagstones seen from directly above, uneven grey-blue slabs, dust and small pebbles in the gaps. |
| `ceiling.png` | 512x512, seamless | `assets/directions/e_w.png` (top band) | Seamless tiling texture of a dark vaulted dungeon ceiling seen from below, rough stone, cobwebs in corners, darker than the wall. |
| `gate_dragon.png` | 512x512 | `assets/dragon.png`, `assets/directions/n_s.png` | A tall iron-bound dungeon gate set in a stone wall, dragon emblem carved above the arch, faint red glow through the bars, front view filling the frame. |
| `monsters/<id>.png` (33 files, ids = `assets/*.png` basenames) | 512x512, transparent | `assets/<id>.png` | The character from the seed image only, full body, facing the viewer, isolated on a transparent background, same painting style, no scenery. |
| `monsters/dragon.png` | 1024x1024, transparent | `assets/dragon.png` | The dragon from the seed image, full body, wings spread, facing the viewer, isolated on transparent background. |

## Isometric view (`www/assets/proto/iso/`)

Tiles are 2:1 isometric diamonds (128 wide, 64 high); wall pieces stand on the top-left (`w`) or top-right (`n`) edge of a diamond. Monster tokens are always cut from the monster PNGs at runtime (no per-monster files are probed yet).

| File | Size | Seed image(s) | Prompt |
|------|------|---------------|--------|
| `floor_0.png`, `floor_1.png`, `floor_2.png` | 128x64 diamond, transparent corners | `assets/directions/e_w.png` | Isometric 2:1 diamond dungeon floor tile, worn grey-blue flagstones, colours matched to the seed floor, soft top light, no outline; three subtly different variants. |
| `corridor.png` | 128x64 diamond | same | Same tile, darker, a narrow cobbled path down the middle. |
| `wall_n.png` | 128x96, transparent | `assets/directions/n_s.png` | Isometric back-wall segment standing along the top-right edge of a diamond tile, stone blocks, torch-lit, bottom edge aligned to the diamond. |
| `wall_w.png` | 128x96, transparent | same | The same segment along the top-left edge (mirror of `wall_n`). |
| `rim_s.png`, `rim_e.png` | 128x44, transparent | same | Low stone parapet along the bottom-right / bottom-left edge of a diamond tile. |
| `entrance.png` | 96x96, transparent | `assets/start.png` | Stone stairway leading up into darkness, isometric, sitting on one diamond tile. |
| `portal.png` | 96x96, transparent | `assets/dragon.png` | Glowing purple rune circle on the floor (boss colour #9c27b0), isometric, soft glow. |
| `marker_unknown.png` | 64x64, transparent | none | Dark round token with a glowing "?" in the centre. |
| `treasure_chest.png`, `treasure_open.png` | 96x96, transparent | `assets/treasure.png` | The seed chest as a round token with a gold ring, closed / open with gold spilling out. |
| `tok_knight_owl.png` | 128x128, transparent | `assets/knight_owl.png` | Mr Owl the knight from the seed as a round portrait token with a cyan (#00bcd4) ring, transparent outside the circle. |
| `tok_dragon.png` | 256x256, transparent | `assets/dragon.png` | The dragon as a round token portrait with a 3px gold ring, transparent outside the circle. |
| `highlight_ring.png`, `reach_ring.png` | 128x64, transparent | none | Cyan (#00bcd4) diamond outline matching a 128x64 tile; solid for `highlight_ring`, dashed for `reach_ring`. |

## Runtime fallbacks

Nothing above is required. Missing files fall back to:

- First-person: crops of `assets/directions/n_s.png` tiled into wall/floor/ceiling textures, then procedural stone blocks if the crop is blocked (e.g. on `file://`); monster billboards are the original PNGs with a soft elliptical alpha mask.
- Isometric: procedurally drawn diamonds and wall faces coloured from a palette sampled off `assets/directions/e_w.png`; tokens are circular cut-outs of the original monster PNGs.

## Cemetery monsters (text-to-image)

The five Halloween monsters were painted with `tools/art/generate_monster.py` on the
`black-forest-labs/FLUX.1-schnell` Space (seed 7 unless noted), from the `imagePrompt`
in `www/js/data/monsters.js` plus this style line:

> painterly cartoon fantasy illustration for a children's game, kid-friendly, warm soft
> lighting, rich colours, soft edges, full body character centred in a Halloween night
> cemetery scene with moonlight, glowing lanterns and gravestones, no text, no watermark,
> no frame

| File | Prompt (before the style line) |
|------|--------------------------------|
| `pumpkin_man.png` | `imagePrompt` of `pumpkin_man` |
| `will_o_wisp.png` | `imagePrompt` of `will_o_wisp` |
| `banshee.png` | `imagePrompt` of `banshee` |
| `clown.png` | `imagePrompt` of `clown` |
| `grim_reaper.png` | seed 11, prompt override: "A cartoon grim reaper in a starry deep purple hooded robe, friendly glowing eyes inside the hood, holding a tall wooden scythe with a glowing crescent blade, standing alone in the open doorway of a dark stone mausoleum, cloudy moonless night sky, nothing behind the character, fantasy art style, impressive but not scary, suitable for children" (the first roll put the moon behind the scythe, which the cutout kept) |

Cutouts: `tools/extract-sprites.py --only pumpkin_man,will_o_wisp,banshee,clown,grim_reaper`
keeps only the character's blob for these scene-heavy pictures.

## Cemetery props (`www/assets/proto/iso/cemetery/`)

Not prompted: rendered from Kenney's CC0 Graveyard Kit and Nature Kit with
`tools/iso/render_kit.py` (manifest `tools/iso/cemetery_models.json`, see `tools/iso/README.md`).
