# Music

`start-theme.mp3` — launch-screen theme, 27 s seamless loop, mono 112 kbps.

Generated locally with Meta MusicGen (`facebook/musicgen-small`, prompt-based;
prompt: "Epic warm orchestral fantasy adventure theme, heroic trumpet fanfare,
soaring strings, french horns, timpani, medieval exploration, sense of wonder,
playful, cinematic, 110 bpm, D major, no vocals"), then loop-crossfaded and
loudness-normalised with ffmpeg.

**Licence caveat:** the MusicGen weights are CC-BY-NC 4.0, so this file is a
placeholder for development only. Before a commercial release regenerate the
theme with a service whose terms allow it (see docs/music-generation.md for the
comparison, prompts and the ffmpeg loop recipe) and replace this file.

## Cemetery loops (candidates)

Six 27-40 s seamless loops for the Halloween cemetery, mono 96 kbps, made with
`tools/music/generate_loop.py` (prompts live in that script, provenance in
`tools/music/out/<name>.json`):

| File | Mood |
|---|---|
| `cemetery-gothic.mp3` | pipe organ, music box, tolling bell |
| `cemetery-quirky.mp3` | haunted-carnival waltz, pizzicato, bassoon |
| `cemetery-ominous.mp3` | low drone, sparse bell, timpani heartbeat |
| `cemetery-carousel.mp3` | detuned calliope waltz, glockenspiel |
| `cemetery-shanty.mp3` | skeleton sea shanty, fiddle, bones percussion |
| `cemetery-lullaby.mp3` | wordless choir, celesta and harp |

The isometric page plays `cemetery-ominous` by default;
`?music=gothic|quirky|ominous|carousel|shanty|lullaby|none` switches and the
choice is remembered. Pick one for release and delete the rest.

All six were generated with **ACE-Step** (`ACE-Step/ACE-Step` on Hugging Face,
Apache-2.0 model and code, instrumental via the `[inst]` tag). Unlike the
MusicGen start theme there is no non-commercial clause on these files.
`generate_loop.py` falls back to DiffRhythm (Apache-2.0), Stable Audio Open
(Community License) and finally a local MusicGen (CC-BY-NC, development only).
