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

`cemetery-gothic.mp3`, `cemetery-quirky.mp3`, `cemetery-ominous.mp3` — three
27 s seamless loops for the Halloween cemetery level, mono 96 kbps, generated
with `tools/music/generate_loop.py` (prompts in the script). The isometric
page plays `cemetery-ominous` by default; `?music=gothic|quirky|ominous|none`
on `proto/isometric.html` switches (the choice is remembered). Once one is
chosen, delete the other two.

Same licence caveat as the start theme: the Hugging Face Spaces were down,
so these were generated locally with MusicGen (CC-BY-NC weights) and are
development placeholders; `generate_loop.py` prefers the Stable Audio Open
Space (Community License) when it is up.
