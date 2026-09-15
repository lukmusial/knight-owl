# Free / open-source art libraries for Mr Owl's Dungeon Adventure

Survey of freely licensed asset packs that fit the game's painterly-cartoon medieval dungeon look and could feed the two prototype views (`www/proto/first-person.html`, `www/proto/isometric.html`) and the 1990s-style stone/parchment/gold HUD. Every entry was checked on 15 Sep 2026 by fetching the page listed; the licence column quotes what the page states. Where a page could not be fetched or does not state a licence this is said explicitly.

Licence legend: **CC0** (no attribution needed), **CC-BY / OGA-BY** (attribution required, otherwise unrestricted), **custom permissive** (free for commercial use, no redistribution of the raw files), **viral** (CC-BY-SA / GPL: derivative *art* must be released under the same licence; avoid for shipped assets unless you accept that).

Style caveat: most fully-free packs are pixel art. Pixel tiles work for the isometric map (scale 2x or 4x with nearest-neighbour filtering) and for icons, but they will not match the painterly monsters in `www/assets/proto/monsters/`. The best painterly fits are the Kenney vector UI packs, the CC0 PBR photo textures (first-person walls) and the vector monster/UI sets by pzUH and SethByrd.

---

## UI chrome (frames, panels, buttons, parchment)

| Name | URL | Licence (as stated) | What is inside | Fit | Attribution |
|---|---|---|---|---|---|
| Kenney – Fantasy UI Borders | https://kenney.nl/assets/fantasy-ui-borders | Creative Commons CC0 | 130+ separate PNG sprites + tilesheet + vector source; 9-slice borders/panels for "fantasy and RPG windows/dialogs" (2023). | Strongest match for stone/gold-trim frames; 9-slice scales to any HUD panel. | None required ("Kenney.nl" appreciated). |
| Kenney – UI Pack (RPG Expansion) | https://kenney.nl/assets/ui-pack-rpg-expansion | Creative Commons CC0 | 85 files (PNG): buttons, panels, sliders, RPG-style beige/brown widgets (2014). | Good for buttons/sliders in a parchment palette; flatter than the game's painterly look. | None required. |
| Free Fantasy Game GUI (pzUH) | https://opengameart.org/content/free-fantasy-game-gui | CC0 | 40+ buttons, windows, icons; CDR + SVG + transparent PNG, "100% vector"; 10.3 MB. | Cartoon-fantasy wood/gold panels; vector so it can be recoloured to grey-blue stone. | None required. |
| Fantasy UI Box (StumpyStrust) | https://opengameart.org/content/fantasy-ui-box | CC0 | One ornate box in normal/hover/selected states, PNG + PSD. | Single dark-fantasy frame with red accents; useful as a boss/dragon dialog frame. | None required ("give credit or don't"). |
| RPG GUI Construction Kit v1.0 (Lamoot) | https://opengameart.org/content/rpg-gui-construction-kit-v10 | CC-BY 3.0 | Modular buttons, text boxes, dropdowns, panels; GIMP .xcf source; 2.9 MB. Used by Flare RPG. | Classic 1990s RPG wood-and-metal look; closest to Heroes-III chrome. | Credit "Matjaž Lamut" (author's stated form). |
| Wenrexa – Free UI KIT White #5 | https://opengameart.org/content/assets-wenrexa-free-ui-kit-white-interface-5-panels-buttons | CC0 (per OGA listing) | Panels and buttons, modern white style. | Not a fit (modern/flat, not fantasy); listed because it was on the candidate list. Wenrexa has no "Fantasy UI" pack on OGA; the fantasy hit is the pzUH pack above. | None. |
| Craftpix free GUI / dungeon freebies | https://craftpix.net/freebies/ (terms: https://craftpix.net/file-licenses/) | Craftpix custom licence: "use the resources in any number of personal and commercial projects", "sell and distribute games with our assets"; may not resell/redistribute source files; no AI-training use. | Various free GUI kits and dungeon objects, PNG. | Usable in a shipped app; not open-source, so cannot be committed to a public repo as redistributable files. | "No attribution … is required, however any credit will be highly appreciated." |

## Isometric dungeon (2:1 diamonds, walls, set dressing)

| Name | URL | Licence (as stated) | What is inside | Fit | Attribution |
|---|---|---|---|---|---|
| Kenney – Isometric Miniature Dungeon | https://kenney.nl/assets/isometric-miniature-dungeon (mirror with specs: https://opengameart.org/content/isometric-miniature-dungeon) | Creative Commons CC0 | 70–72 PNG tiles/objects with alpha, 256x512 per tile (256 wide, 128 floor height, 30°x45° iso); walls, floors, furniture, crates, barrels, stairs; Unity + Tiled samples. | Best free iso dungeon set; tile width 256 halves cleanly to the 128x64 diamond used by `isometric.html`. Clean vector look, lighter than the painterly style but recolourable. | None required. |
| Isometric Stone Soup (Screaming Brain Studios) | https://screamingbrainstudios.itch.io/isometric-stone-soup (also on OGA) | Public Domain (CC0) | 1,895 tiles / 93 sheets, 64x32 iso, PNG (magenta backgrounds) + 86 Tiled .tsx; 593 floor tiles, 1,302 wall tiles. Iso conversion of the DCSS tiles. | Huge variety of dungeon floors/walls; 64x32 must be scaled 2x to 128x64 (pixel look). | None required. |
| 1000+ Isometric Floor Tiles (Screaming Brain Studios) | https://opengameart.org/content/1000-isometric-floor-tiles | CC0 | 1,049 tiles at 256x128 and 128x64, PNG (black bg) + .tsx; water, autotile blends, 224 interior/exterior floors; "true 2:1 isometric render". | 128x64 size matches the prototype exactly; use for `floor_0..2.png` and `corridor.png`. | None required ("appreciated"). |
| Kenney – Medieval RTS | https://kenney.nl/assets/medieval-rts | Creative Commons CC0 | 120 2D files (PNG): medieval buildings, terrain, units (2016), top-down/3/4 view. | Set dressing (towers, crates) for the map; not true 2:1 iso. | None required. |
| Flare Super Dungeon Tileset v1.0 (WithinAmnesia / Clint Bellanger) | https://opengameart.org/content/flare-super-dungeon-tileset-version-10 | **CC-BY-SA 3.0 (viral)** | 64x32 iso brick/light/dark dungeon variants + collision map + template, PNG. Other Flare iso sets (Old Ruins, snow) are also CC-BY-SA 3.0. | Exactly the Heroes-III-style painted iso dungeon look, but ShareAlike: any tiles you paint over it must also be CC-BY-SA. Reference only unless that is acceptable. | Credit authors + CC-BY-SA 3.0 + release derivatives under the same licence. |
| Dungeon Crawl Stone Soup 32x32 tiles | https://opengameart.org/content/dungeon-crawl-32x32-tiles | CC0 | 3000+ 32x32 orthogonal PNG tiles (terrain, monsters, items, GUI, avatars); 1.4–5.7 MB zips; supplemental set of 3000 more. | Orthogonal, so for props/markers (chest, stairs, portal) rather than diamonds; monsters are usable as `marker_*` tokens. | None required (link appreciated). |
| 0x72 – 16x16 DungeonTileset II | https://0x72.itch.io/dungeontileset-ii | CC-0 ("Credit is not necessary") | v1.7 zip (406 KB) PNG: floors, high/low walls, torches, traps, chests, animated heroes/monsters, autotile atlases. | Cute pixel dungeon; useful as prop/marker sprites at 4x. | None required. |
| Kenney – Tiny Dungeon | https://kenney.nl/assets/tiny-dungeon | Creative Commons CC0 | 130 16x16 pixel tiles (PNG), dungeon/sewer, characters (2022). | Same use as 0x72; very small. | None required. |
| Kenney – Roguelike/RPG Pack | https://kenney.nl/assets/roguelike-rpg-pack | Creative Commons CC0 | 1,700 16x16 pixel assets: tiles, furniture, town, UI buttons/panels (2015). | Props and tiny UI; pixel style. | None required. |
| [LPC] Dungeon Elements (Sharm) | https://opengameart.org/content/lpc-dungeon-elements | CC-BY 4.0 / CC-BY 3.0 / OGA-BY 3.0 / GPL 3.0 / GPL 2.0 (choose one) | 32x32 PNG + GIF: animated fire, cauldron, bones, furniture, prison cell, cobwebs; 40 KB. Note the broader LPC *base* assets are CC-BY-SA 3.0 / GPL 3.0 (viral). | Small prop set for the map. Pick OGA-BY or CC-BY to stay permissive. | "attribute Sharm as graphic artist, and [William.Thompsonj] as contributor"; credit.txt included. |
| Cainos – Pixel Art Top Down Basic | https://cainos.itch.io/pixel-art-top-down-basic | Custom: free and commercial use allowed; redistribution/resale prohibited; attribution optional. | 32x32 sprites, 256x256 ground and 512x512 wall tilesets, 48 props; Unity package (textures usable elsewhere); 2.5 MB. | Top-down (not iso) outdoor; low fit. | None required. |

## First-person textures & props (seamless stone, lava, wood, gates)

| Name | URL | Licence (as stated) | What is inside | Fit | Attribution |
|---|---|---|---|---|---|
| ambientCG (all assets) | https://ambientcg.com (licence: https://docs.ambientcg.com/license/) | Creative Commons CC0 1.0 Universal ("may also include raw files directly in projects like video games") | Seamless PBR sets, JPG/PNG at 1K–16K. Verified examples: Bricks075A (photogrammetry stone/brick wall, 1K–16K), Lava004 (procedural seamless lava, 1K–8K). Also PavingStones*, Rock*, WoodPlanks*. | Direct source for `wall.png`, `floor.png`, `ceiling.png` and a lava texture; downscale 1K colour map to 512x512 and colour-grade to grey-blue. | None required (optional "Created using <asset> from ambientCG.com, licensed under CC0 1.0"). |
| Poly Haven textures | https://polyhaven.com/textures (licence: https://polyhaven.com/license) | CC0 ("use our assets for any purpose, including commercial work") | PBR sets 1K–8K/16K in JPG/PNG/EXR + Blend/glTF. Verified: Castle Wall Slates (Rob Tuytel, 1K–8K, diffuse/normal/rough/AO/disp). Also Castle Wall Variation, Stone Brick Wall 001, Stone Block Wall, Brick & Block and Stone > Walls & Rubble categories. | Same use as ambientCG; castle-wall sets are the most "dungeon" looking. | None required. |
| RPG Stone Wall Texture (ForKotLow) | https://opengameart.org/content/rpg-stone-wall-texture | CC0 | Single 512x512 seamless JPG (270 KB). | Drop-in `wall.png` candidate at the exact prototype size. | None required. |
| Kenney – Isometric Miniature Dungeon (props) | see above | CC0 | Doors, gates, stairs, barrels. | Source for a gate/arch cut-out to build `gate_dragon.png`. | None. |
| 117 Stone Wall Tilable Textures in 8 Themes (p0ss) | https://opengameart.org/content/117-stone-wall-tilable-textures-in-8-themes | **GPL 2.0 (viral)** | 117 stone wall/floor textures at 1024x1024 with normal maps; Cave, Ruins, Temple, Torture themes. One commenter reports imperfect tiling. | Great variety but GPL; avoid in the app. | GPL 2.0 obligations. |
| Screaming Brain Studios – First Person Dungeons / Old School Dungeon Crawler Pack | https://screamingbrainstudios.com/first-person-dungeons/ | **Not verified**: the tutorial page states no licence; the linked itch pack returned 404 on fetch. Their other packs (Stone Soup, Isometric Floor Tiles) are CC0. | Tutorial for building EoB-style back/left/right/floor/ceiling tiles from a 512x512 texture (GIMP perspective + shading). | Useful as a method reference for pre-rendered wall slices; do not use files until a licence is confirmed. | Unknown. |
| "Free the Dungeon" (OGA forum pack) | https://opengameart.org/forumtopic/free-the-dungeon-themed-asset-pack | **Not free**: "exclusive permission … ONLY in OGA Dungeon-related Project". | Wall/floor/ceiling D/N/S textures, columns. | Do not use. | n/a |

## Characters & monsters (style-compatible with cute cartoon)

The game already has 33 painterly monster PNGs (`www/assets/proto/monsters/`). These packs are for extras (NPCs, loot, token variants), not replacements.

| Name | URL | Licence (as stated) | What is inside | Fit | Attribution |
|---|---|---|---|---|---|
| Cute characters, monsters, and game assets (SethByrd) | https://opengameart.org/content/cute-characters-monsters-and-game-assets | CC0 | Layered PSD (13.9 MB): 5 characters (front/iso/side/back), 17 enemies, 31 items; "vibrant, cartoony"; community PNG conversion linked in comments. | Closest to the game's cute cartoon look; vector-ish, so scales to 512x512 tokens. | None required ("sethbyrd.com" appreciated). |
| Kenney – Monster Builder Pack | https://kenney.nl/assets/monster-builder-pack | Creative Commons CC0 | 170 2D parts (bodies, eyes, mouths, limbs) to assemble monsters (2022). | Flat vector; good for quick extra slimes/bats, less so for painterly. | None required. |
| 50+ Monsters Pack 2D (isaiah658) | https://opengameart.org/content/50-monsters-pack-2d | CC0 | 56 pixel monsters, 64x64 front + back sprites, alt palettes; 243 KB. | Pixel style; usable for map tokens only. | None required. |
| Textured Cute Monster Pack (quaternius) | https://opengameart.org/content/textured-cute-monster-pack | CC0 | 21 low-poly animated 3D monsters (FBX/OBJ/Blend), 10 MB. | Could be rendered to painterly-ish 2D or used live in the three.js view. | None required. |
| Dungeon Crawl Stone Soup monsters | see Isometric section | CC0 | Hundreds of 32x32 monster tiles. | Pixel; tokens only. | None. |
| 0x72 DungeonTileset II characters / Kenney Tiny Dungeon | see Isometric section | CC0 | 16x16 animated heroes and monsters. | Pixel; tokens only. | None. |
| Tiny Swords (Pixel Frog) – free pack | https://pixelfrog-assets.itch.io/tiny-swords | Custom: "Feel free to use this asset pack in both personal and commercial projects"; redistribution/resale prohibited. Enemy pack is paid ($15 min). | 64x64 pixel PNG + Aseprite: Warrior/Lancer/Archer/Monk, buildings, terrain, stretchable UI, 5 faction colours. | Cute chunky pixel style; the free half has no monsters. | Optional. |

## Icons

| Name | URL | Licence (as stated) | What is inside | Fit | Attribution |
|---|---|---|---|---|---|
| game-icons.net | https://game-icons.net (about: https://game-icons.net/about.html) | Creative Commons 3.0 BY | ~3,800 monochrome SVG icons (Lorc, Delapouite et al.), PNG export at 16–512 px; online "Studio" recolour tool; batch archive download. | Every RPG icon you will need (sword, shield, potion, scroll, dragon, key). Recolour to gold on stone for the HUD. | Required: e.g. "Icons made by Lorc, Delapouite. Available on https://game-icons.net". |
| Kenney – Game Icons | https://kenney.nl/assets/game-icons | Creative Commons CC0 | 105 flat interface icons (PNG) (2014). | Generic UI (settings, sound, pause). | None required. |
| Pixel Fantasy Icon Pack (vic / supervigge) | https://supervigge.itch.io/pixel-fantasy-icon-pack | CC BY 4.0 | 119 pixel item icons with shadow/empty variants, wood/stone/gold frames, animated selection frame, 4 menu SFX; 716 KB zip; name-your-price. | Inventory/loot icons in a stone-and-gold frame that matches the HUD idea. | Credit "vic / supervigge". |
| Dungeon Crawl Stone Soup item tiles | see above | CC0 | Weapons, armour, potions, scrolls at 32x32. | Pixel loot icons. | None. |

## Fonts

All seven candidates are in the Google Fonts repository under `ofl/`, each directory containing `OFL.txt` (SIL Open Font License 1.1). OFL permits bundling in apps and redistribution; the only conditions are that the font is not sold by itself and that the licence/copyright notice travels with the font files (keep `OFL.txt` next to the .ttf in `www/assets/fonts/`). Verified directories:

| Font | Directory | Licence | Style / suggested use |
|---|---|---|---|
| MedievalSharp | https://github.com/google/fonts/tree/main/ofl/medievalsharp | OFL.txt present | Rounded chiselled "medieval" letters; readable for kids; title/headings. |
| Cinzel | https://github.com/google/fonts/tree/main/ofl/cinzel | OFL.txt present (variable weight) | Roman-inscription capitals; gold-trim HUD labels, monster names. |
| UnifrakturMaguntia | https://github.com/google/fonts/tree/main/ofl/unifrakturmaguntia | OFL.txt present | Blackletter; decorative only (hard to read for children, avoid for Polish diacritics-heavy text). |
| Almendra | https://github.com/google/fonts/tree/main/ofl/almendra | OFL.txt present (Regular/Italic/Bold/BoldItalic) | Calligraphic serif; parchment body text, supports Latin Extended (Polish ą ę ł ś ż). |
| IM Fell English | https://github.com/google/fonts/tree/main/ofl/imfellenglish | OFL.txt present (Roman + Italic) | 17th-century print look; parchment body/lore text. |
| Metamorphous | https://github.com/google/fonts/tree/main/ofl/metamorphous | OFL.txt present | Carved-stone display face; buttons and HUD headings. |
| Grenze Gotisch | https://github.com/google/fonts/tree/main/ofl/grenzegotisch | OFL.txt present (variable weight) | Softened gothic; titles. |

Check Polish glyph coverage (ą ć ę ł ń ó ś ź ż) per font before committing; Almendra, Cinzel, MedievalSharp and Metamorphous cover Latin Extended-A on Google Fonts; verify the others in the specimen page's "Glyphs" tab.

Also: Kenney Fonts (https://kenney.nl/assets/kenney-fonts) – CC0, 11 pixel/rounded TTFs; useful for a pixel-style prototype HUD only.

## Sound

| Name | URL | Licence (as stated) | What is inside | Fit | Attribution |
|---|---|---|---|---|---|
| Kenney – RPG Audio | https://kenney.nl/assets/rpg-audio | Creative Commons CC0 | 50 foley/RPG sounds: footsteps, weapons, cloth, coins (2014). | Footsteps for grid movement, chest/loot sounds. | None required. |
| Kenney – Interface Sounds | https://kenney.nl/assets/interface-sounds | Creative Commons CC0 | 100 UI clicks/confirms/errors (2020). | Answer-correct/wrong, button clicks. | None required. |
| RPG Sound Pack (artisticdude) | https://opengameart.org/content/rpg-sound-pack | CC0 | 95 WAV (12.5 MB): spells, swooshes, sword clashes, inventory, 6 UI sounds, beast/giant/slime/ogre/shade/wolfman voices, door creaks. | Monster growls for encounters, door for gates. | None required ("Sound Effects by artisticdude" appreciated). |
| Fantasy Sound Effects Library (Little Robot Sound Factory) | https://opengameart.org/content/fantasy-sound-effects-library | CC-BY 3.0 | 45 MP3+WAV: 2 dragon growls, 5 goblin voices, footsteps (dirt/water), inventory open, win/lose/achievement jingles, gold pickup, spells, traps. | Dragon and goblin voices match the boss/monster roster. | Required: "Attribute Little Robot Sound Factory, and provide this link where possible: www.littlerobotsoundfactory.com". |
| Freesound | https://freesound.org (FAQ: https://freesound.org/help/faq/) | Per-sound: CC0, CC-BY, or CC-BY-NC (also legacy Sampling+). | Millions of user uploads; filter search by licence. | Ambience (dripping water, torch crackle). Filter to CC0/CC-BY only; NC is unusable if the app is ever monetised. | CC-BY sounds: "'sound' by user (http://freesound.org/s/ID/) licensed under CC-BY 4.0". |

---

## Recommended shortlist

1. **Kenney Fantasy UI Borders** (CC0) – 9-slice stone/gold frames for the whole HUD.
2. **Free Fantasy Game GUI by pzUH** (CC0, vector) – cartoon buttons/windows to recolour into the grey-blue + gold palette.
3. **game-icons.net** (CC-BY 3.0) – all HUD/inventory icons; one credit line covers thousands of icons.
4. **ambientCG Bricks/Rock/PavingStones + Lava004** and **Poly Haven Castle Wall Slates** (CC0) – first-person `wall.png`, `floor.png`, `ceiling.png` and lava.
5. **Kenney Isometric Miniature Dungeon** (CC0, 256-wide iso, walls/floors/stairs/props) – the isometric `wall_n/w`, `rim_*`, `entrance`, `treasure_*` pieces.
6. **Screaming Brain 1000+ Isometric Floor Tiles** (CC0, native 128x64) – `floor_0..2.png`, `corridor.png` variants.
7. **Cinzel + Almendra (+ MedievalSharp for titles)** (OFL) – readable medieval type with Polish diacritics.
8. **Kenney Interface Sounds + RPG Audio, artisticdude RPG Sound Pack** (all CC0) – complete SFX set with zero attribution burden; add Little Robot's dragon/goblin voices (CC-BY) if wanted.

Avoid for shipped files: Flare iso tilesets and LPC base assets (CC-BY-SA), p0ss 117 stone textures (GPL), the OGA "Free the Dungeon" pack (not free), anything CC-BY-NC on Freesound.

## Dropping files into the prototypes

The prototype pages probe for real art and fall back to procedural/derived art when a file is missing, so assets can be added one at a time. Expected filenames are listed in `docs/art-prompts.md`; in short:

- **First-person** (`www/assets/proto/`): `wall.png`, `floor.png`, `ceiling.png` – 512x512, seamless, power-of-two PNG; `gate_dragon.png` – 512x512; `monsters/<id>.png` – 512x512 transparent (already present). To use an ambientCG/Poly Haven set: download the 1K JPG, take the colour (diffuse) map only, crop/resize to 512x512, colour-grade toward mossy grey-blue, export PNG. Keep the normal map aside; the three.js prototype only samples the colour map today.
- **Isometric** (`www/assets/proto/iso/`): `floor_0.png`, `floor_1.png`, `floor_2.png`, `corridor.png` – 128x64 diamonds with transparent corners; `wall_n.png`, `wall_w.png` – 128x96; `rim_s.png`, `rim_e.png` – 128x44; `entrance.png`, `portal.png`, `treasure_chest.png`, `treasure_open.png` – 96x96; `marker_unknown.png` – 64x64; `tok_knight_owl.png` – 128x128; `tok_dragon.png` – 256x256; `highlight_ring.png`, `reach_ring.png` – 128x64. Kenney's 256-wide iso tiles scale to 128 wide at 50%; the 64x32 Stone Soup tiles need 2x nearest-neighbour upscaling.
- Keep originals and the licence text of each pack in a sibling `www/assets/proto/_sources/<pack>/` folder (or outside `www/` if it should not ship) so the provenance of every processed PNG is traceable.

## Licence attribution placement

- **README.md**: add a "Third-party assets" section listing each pack: name, author, URL, licence, and which files derive from it. Do this even for CC0 packs (good practice, and it documents provenance).
- **In-app credits**: add a Credits entry (settings/about screen) that shows the same list. This is *mandatory* for CC-BY / OGA-BY items (game-icons.net, RPG GUI Construction Kit, Pixel Fantasy Icon Pack, Little Robot Sound Factory, LPC Dungeon Elements, any CC-BY Freesound clip) and must include the author name and a link, using the wording each author requests (quoted in the tables above). Since the app is offline, render the credits as static text rather than external links only.
- **Fonts**: ship `OFL.txt` alongside each `.ttf` under `www/assets/fonts/`; the OFL requires the notice to accompany the font files.
- **App stores**: Apple and Google do not require credits in the listing, but the in-app credits screen satisfies CC-BY's "reasonable to the medium" clause.
