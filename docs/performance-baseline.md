# Performance baseline

Figures the game was last known good at, and how each was taken. Append a new
dated section when re-baselining; never overwrite an old one, they are the
history.

## 2026-09-21 (rain) - cemetery rain and puddles experiment

Same machine and Chrome as the baseline below, run from the experiment's
worktree. The rain adds one particle emitter (screen space, one texture), up
to 80 puddle images on the floor layer, a pool of up to 20 rings and 24
drops, and Mr Owl's reflection. Measured with `npm run test:cem:rain`
(rain clock wound on so every puddle is full and the streaks are at full
strength; single runs, headless SwiftShader) and `npm run test:cem:perf`.

| figure | with rain | baseline |
|---|---|---|
| `updateRain` per frame (puddles, rings, drops, reflection) | 0.03-0.06 ms | - |
| emitter `preUpdate` per frame (130-220 streaks alive) | 0.15 ms | - |
| logic ms/frame (`tickMsPerFrame`) | 0.027 | 0.029 |
| draw calls | 35 | 31 (27-33) |
| visible sprites (streaks not counted: the emitter is one object) | 164 | 160 |
| top-level objects | 45 | 44 |
| props in depth bands | 644 | 644 |
| unit suite | 446/446 | 433/433 |

The extra draw calls are the streak batch and the puddle textures (four
canvases, so puddles of different shapes break the batch between them);
packing the four shapes and the ring into one atlas would bring most of
that back.

## 2026-09-21 (later) - after the card and asset optimisation pass (BASELINE going forward)

Same machine and Chrome as the section below. Changes in this pass: the card
animation loop is stopped when a card is put away (`MonsterStage.release`);
the cutout is only fetched when there is no sheet; the idle loop writes the
style only when the frame changes; card sheets keep one idle frame for the
facings the turn-around passes through (48 -> 28 frames); the treasure and
victory pictures load when their screen opens; the isometric palette is a
constant instead of a 682 KB download; the 40 illustrations are JPEG
(31.0 MB -> 3.5 MB).

| figure | now | the baseline below |
|---|---|---|
| 3D loops after a card is put away | 1.00 (`test:fp:perf` now checks it) | 1.85-2.00 |
| cemetery boot network | 8.53 MB, 140 req | 11.40 MB, 144 req |
| cemetery ready | 1521 ms | 1773 ms |
| card, first goblin fight | 416 KB | 620 KB |
| card, first dragon fight | 846 KB | 1522 KB |
| card, first zombie fight | 215 KB | - |
| `assets/proto/card/` | 12.3 MB (36 sheets, 28 frames each) | 16.5 MB (48 frames) |
| illustrations `assets/*.jpg` | 3.4 MB (40 files) | 31.0 MB as PNG |
| `www/` total | 67 MB | 97.1 MB |
| debug APK, clean build | 63.5 MB (63,452,035 B) | 98.0 MB |
| unit suite | 433/433 | 426/426 |

Cemetery boot and card figures: median of runs 2-4 (boot) and a single cold
load (cards), same method as below, script kept outside the repo. The JS heap
was also read (14.3 MB at scene ready) but at a different moment from the
figure below, so the two are not compared.

**Build note**: `./gradlew assembleDebug` packages incrementally and leaves
the space of replaced files inside the APK: the incremental build of this
tree was still 98.0 MB with 74 MB of content. Measure (and ship) a
`./gradlew clean assembleDebug`.

## 2026-09-21 - halloween-cemetery working tree (superseded by the section above)

Two states were measured side by side on the same machine, in the same
session:

- **WT** - the working tree on `halloween-cemetery` at `db7a63c` plus
  uncommitted changes (tree dirty: 36 GLB monster models + treasure in the 3D
  view, card sprite sheets in `assets/proto/card/`, painted backdrops in
  `assets/proto/backdrops/`, MonsterStage rewrite, cemetery wanderer mix,
  clown and will-o'-the-wisp map sheets). **This is the baseline.**
- **HEAD** - commit `db7a63c` checked out clean in a temporary worktree
  (`git worktree add /tmp/ko-head HEAD`, `node_modules` symlinked in), for
  comparison only.

Machine: MacBook Pro, Intel Core i7-8850H 2.6 GHz, 6 cores / 12 threads,
16 GB, macOS 15.8 (24H23), Node 24.14.1, Python 3.8.10, Chrome for Testing
145.0.7632.46 (puppeteer cache), headless, SwiftShader (no GPU).

Method: every harness was run 4 times per tree; the first run pays for a cold
page load and is discarded; the table gives the median of runs 2-4 with the
range in brackets. The cemetery level is generated from a fresh seed on every
load, so its counts move between runs by level shape alone.

**Headless frame rate is noise** (SwiftShader, throttled). It is recorded, not
tracked.

### Cemetery scene - `npm run test:cem:perf`

| Metric | WT (baseline) | HEAD db7a63c |
|---|---|---|
| logic ms/frame (`tickMsPerFrame`) | 0.029 (0.028-0.039) | 0.024 (0.023-0.039) |
| draw calls | 31 (27-33) | 33 (31-37) |
| visible sprites | 160 (144-173) | 152 (145-162) |
| chunk pool (live/pool) | 17/17 (17-18) | 18/18 (17-18) |
| chunk bakes over the route | 44 (33-51) | 33 (31-33) |
| cells visible / total | 34/209 | 31/207 |
| top-level objects | 44 (44-44) | 44 (44-44) |
| props in depth bands | 644 (623-645) | 638 (637-644) |
| generation ms | 90 (50-108) | 82 (49-107) |
| monsters | 21 | 21 |
| tiles seen | 1492 (1446-1576) | 1502 (1470-1572) |
| fps (noise) | 12 (10-13) | 8 (8-10) |

Chunk bakes vary more than 10% within each tree: they follow the headless
frame count (each frame bakes the chunks dirtied since the last), not the code.
A second set of 3+3 runs (below) had them the other way round (WT 45, HEAD
52). Treat bakes as watch-only unless they move far outside 31-52.

### Cemetery load (throwaway probe, see Reproduce)

| Metric | WT (baseline) | HEAD db7a63c |
|---|---|---|
| goto -> scene ready, ms | 1773 (1689-2187) | 1629 (1612-1646) |
| JS heap at ready, MB | 11.9 (11.7-13.5) | 11.4 (10.3-11.8) |
| network bytes / requests to ready (blob: excluded) | 11.40 MB / 144 | 11.08 MB / 138 |
| chunk bakes (second set) | 45 (44-52) | 52 (51-52) |

The +0.32 MB / +6 requests are the clown and will-o'-the-wisp map sheets
(+0.38 MB) less the smaller re-rendered sheets.

### 3D view - `npm run test:fp:perf`

| Metric | WT (baseline) | HEAD db7a63c |
|---|---|---|
| animation-frame callbacks per frame, at rest | 1.00 (4/4 runs) | 1.00 (4/4 runs) |
| after 20 walked steps | 1.00 (4/4 runs) | 1.00 (4/4 runs) |
| harness wall time, s | 20.8 (20.0-20.9) | 22.9 (19.9-23.1) |
| page boot to game in progress, ms | 1082 (998-1163) | 1134 (928-1156) |
| boot network | 77 req, 5.97 MB | 77 req, 5.95 MB |
| frame at rest (calls / triangles) | 31 / 35,321 | 31 / 35,321 |
| one monster in the chamber | +2 calls, +9,002 tris (model) | +3 calls, +6 tris (billboard) for the 28 kinds that had no model |
| load one monster (troll, dragon, lich ...) | 14-15 ms GLB | 7 ms billboard |
| rAF callbacks per frame after one card was shown and the quiz hidden | 1.85-2.00 (goblin x3, troll, skeleton) | 1.58 (skeleton), 1.00 (goblin: no sheet) |

The last row is not covered by `test:fp:perf` (it walks without fighting).

### Encounter card (throwaway probe, 3D page, renderer stopped, cache off)

Bytes fetched the first time each monster's card is shown:

| Monster | WT (baseline) | HEAD db7a63c |
|---|---|---|
| goblin | 607-638 KB | 162 KB |
| skeleton | 682-695 KB | 289 KB |
| troll | 1132-1146 KB | 285 KB |
| dragon | 1522 KB | 299 KB |
| grim_reaper | 562-583 KB | 243 KB |
| clown | 653-691 KB | 284 KB |
| will_o_wisp | 362-377 KB | 71 KB |
| treasure | 439-469 KB | 228 KB |
| median of the 8 | 640 KB | 264 KB |

Time from `MonsterStage.show` to the figure placed: 10-46 ms in both trees on
localhost (noise at this scale). Decode of the sheet (`createImageBitmap`,
median of 5, 2 runs): card dragon 46 ms, card goblin 27 ms, card skeleton
23 ms, card grim_reaper 17 ms, map skeleton 10 ms, map grim_reaper 9 ms,
backdrop jpg 4 ms.

Texture memory (decoded RGBA = w x h x 4) of the 36 card sheets: 765 MB in
total, median 20.8 MB per sheet, largest `dragon.png` 4232x2346 = 39.7 MB
(1.18 MB PNG), `spider.png` 33.1 MB, `wolf.png` 31.0 MB. The 12 map sheets
have a median of 8.4 MB, the largest 22.0 MB. One card sheet is decoded per
fight.

### Flows and suites

| Metric | WT (baseline) | HEAD db7a63c |
|---|---|---|
| `npm run test:cem` (whole level) | pass, 57 s (55-60), 36 checks | pass, 57 s (57-58), 35 checks |
| `node tests/run-tests.js` | 426/426, 39.6 s (30.4-40.8) | 414/414, 33.8 s (33.1-35.0) |

The unit suite failed once in 9 WT runs (1 test, not reproduced in 5 reruns);
`monster-stage.js` was being edited at the time.

### Payload

| Item | WT (baseline) | HEAD db7a63c |
|---|---|---|
| `www/` total (files) | 97.1 MB | 72.4 MB |
| `assets/proto/card/` | 16.5 MB (36 sheets) | - |
| `assets/proto/fp/monsters/` | 13.4 MB (37 GLB, 9k tris, 512 px jpg each) | 5.3 MB (9 GLB) |
| `assets/proto/backdrops/` | 2.15 MB (26 jpg) | - (38 `*_bg.jpg` plates) |
| `assets/proto/iso/monsters/` | 2.75 MB | 2.6 MB |
| `assets/proto/monsters/` (cutouts) | 6.8 MB | 8.8 MB (incl. plates) |
| `assets/*.png` illustrations | 31.0 MB (40 files) | same |
| `android/.../app-debug.apk` | 98.0 MB (98,013,151 B, built 09:24 from WT) | not built; ~74.7 MB estimated |
| largest single mid-play download | `card/dragon.png` 1.18 MB | `fp/monsters/giant_rat.glb` 0.42 MB |

### Reproduce

```bash
npm run test:cem:perf        # x4, drop the first
npm run test:fp:perf         # x4
npm run test:cem             # x3
time node tests/run-tests.js # x4
du -sh www www/assets/proto/{card,fp/monsters,backdrops,iso/monsters,monsters}
ls -l android/app/build/outputs/apk/debug/app-debug.apk
unzip -l android/app/build/outputs/apk/debug/app-debug.apk   # what is inside
```

HEAD comparison: `git worktree add /tmp/ko-head HEAD && ln -s $PWD/node_modules
/tmp/ko-head/node_modules`, run the same commands from `/tmp/ko-head`, then
`git worktree remove --force /tmp/ko-head`.

The load, card, model and render-loop-after-a-fight figures came from
throwaway puppeteer scripts kept outside the repo (same Chrome, same flags as
the repo harnesses):

- *cemetery load*: `cem-perf.js` with `page.metrics().JSHeapUsedSize` at
  scene ready, the time from `goto` to ready, and `requestfinished` byte
  counts excluding `blob:` URLs (Phaser re-reads images through blobs).
- *card*: on `/proto/first-person.html`, `FpRenderer.stop()`, cache off, then
  for each id `MonsterStage.show(<img width 480>, id)`; wait for the actor to
  be placed and the network to go idle; sum the response bytes.
- *model*: time `FpMonsters.load(id)` (WT) or `FpTextures.billboard(id)`
  (HEAD); `FpRenderer.setEntity(currentRoom, ...)` then the median of 10
  `FpRenderer.getRenderInfo()` samples.
- *after a fight*: wrap `requestAnimationFrame` as `fp-perf.js` does, measure
  callbacks per tick for 3 s, `MonsterStage.show(#monster-image, id)`, wait
  1.5 s, `UI.hideQuizModal()`, measure again.
- *decode*: `createImageBitmap(blob)` on each sheet, 5 times, median.
