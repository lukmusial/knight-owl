# First-person textures: credits and licence

All textures in this folder (the `.jpg` files) are stylised PBR sets by João Paulo ("Gendo"),
published on 3dtextures.me. The site's FAQ (https://3dtextures.me/about/)
states: "All textures on this site are licensed as CC0."

Licence: Creative Commons CC0 1.0 Universal (public domain dedication),
https://creativecommons.org/publicdomain/zero/1.0/. No attribution is
required. We credit the author anyway.

| File(s) | Source set | Page | Processing |
|---------|------------|------|------------|
| `stone_wall_color.jpg`, `stone_wall_normal.jpg` | Stylized Stone Wall 001 | https://3dtextures.me/2021/01/12/stylized-stone-wall-001/ | 1024 px basecolor/normal downscaled to 512 px JPG. Used for plain chamber walls, passages and (tinted) the vault. |
| `mossy_bricks_color.jpg`, `mossy_bricks_normal.jpg` | Stylized Bricks 004 | https://3dtextures.me/2024/05/31/stylized-bricks-004/ | 1024 px PNG downscaled to 512 px JPG. Used for mossy chamber walls. |
| `flagstone_floor_color.jpg`, `flagstone_floor_normal.jpg` | Stylized Stone Floor 006 | https://3dtextures.me/2024/07/18/stylized-stone-floor-006/ | 1024 px PNG downscaled to 512 px JPG. |
| `wood_planks_color.jpg`, `wood_planks_normal.jpg` | Stylized Wood Planks 002 | https://3dtextures.me/2024/07/19/stylized-wood-planks-002/ | 1024 px PNG downscaled to 256 px JPG. Used for torch handles, barrels and crates. |
| `lava_color.jpg` | Stylized Lava 001 | https://3dtextures.me/2024/07/03/stylized-lava-001/ | 512 px basecolor PNG re-encoded as JPG. |

Downloaded on 17 Sep 2026 from the Google Drive folders linked on each page.
Only the colour and normal maps are shipped; roughness is a per-material constant.

## `mr_owl.glb` (Mr Owl 3D figure)

Generated from the project's own Mr Owl illustration
(`assets/proto/monsters/knight_owl.png`) with Microsoft TRELLIS
(https://github.com/microsoft/TRELLIS, MIT licence, run on the
trellis-community/TRELLIS Hugging Face Space). It was rigged, animated
(Idle, Walk, Flap, Attack) and exported in Blender. The pipeline and scripts
are in `tools/owl3d/`. No third-party artwork is included.

## `monsters/*.glb` (level-1 monsters in 3D)

Generated from the project's own monster illustrations
(`assets/proto/monsters/<id>.png`) with Microsoft TRELLIS (MIT). The goblin,
giant rat, vampire bunny and bat swarm were first restyled into shaded
renders with Qwen-Image-Edit (Apache 2.0). All models were cleaned and
decimated in Blender. The pipeline is in `tools/monsters3d/`. No third-party
artwork is included.
