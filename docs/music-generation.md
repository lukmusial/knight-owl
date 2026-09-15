# AI music generators for the start-screen theme

Survey of online, prompt-based music generators (plus free music libraries as a fallback) that could produce the looping start-screen theme for Mr Owl's Dungeon Adventure. Every entry was checked on 15 Sep 2026 by fetching the pages listed; the licence column quotes or closely paraphrases what the vendor's own page states. Where a page could not be read (several pricing pages are client-rendered or bot-blocked) this is said explicitly and the figures are marked as third-party.

## What we need

- One instrumental track, roughly 60 to 90 seconds, that loops cleanly on the start screen. The `Music` module (`www/js/modules/music.js`) already loads `assets/music/start-theme.mp3` into a looping `HTMLAudioElement` at volume 0.55 and fades it in on the first user gesture; the folder `www/assets/music/` exists and is empty.
- Style: exciting adventure, orchestral, opening trumpet and brass fanfare, soaring strings, timpani, a feeling of exploration and wonder, playful enough for children. Inspiration is the Baldur's Gate II main theme, in spirit only; no vendor may be asked to copy it.
- Licence: the game is an offline mobile app shipped on browser, Android and iOS and may be sold. The music must be usable commercially, in a downloadable app, on more than one platform, and the right must survive cancelling any subscription. Bundling means the file is redistributed inside the app package.
- Budget: MP3, about 1 MB. At 128 kbps that is about 60 s stereo; see the encoding table at the end.

## Comparison table

"Prompt" means free-text description to music. "Length" is the maximum per generation. "Own site" marks facts read from the vendor's pages; "3rd party" marks facts only available from reviews because the vendor page is client-rendered or blocked bots.

| Tool | URL | Prompt | Free tier | Paid (entry) | Length | Formats | API | Commercial use of output | Fit |
|---|---|---|---|---|---|---|---|---|---|
| Suno | https://suno.com | Yes, with instrumental option | $0, 50 credits/day; from 3 Sep 2026 "up to 7 total (lifetime) trial downloads for personal, non-commercial use only" (help.suno.com/en/articles/13614785) | Pro $8/mo (2,500 credits, 20 downloads/mo), Premier $24/mo (60 downloads/mo); own site | Up to 8 min (v4.5/v5) | MP3 all plans; WAV and stems Pro/Premier, web only | No public API; July 2026 partner intake form only | Paid: "Suno hereby assigns to you all of its right, title and interest in and to any Output"; free: "personal and non-commercial purposes" only | Strong |
| Udio | https://www.udio.com | Yes | $0 (3rd party: 100 credits/mo) | 3rd party: Standard $10/mo, Pro $30/mo | 2:10 per generation, extendable | None: downloads disabled since 29 Oct 2025 | No | Terms (Last Revised 12 Nov 2025): "you may use Output solely for your personal and non-commercial purposes, provided that you may not download any copies of your Output from the App for any purpose" | Unusable |
| Stable Audio (app) | https://stableaudio.com | Yes | 3rd party: 20 tracks/mo, 45 s, personal only | 3rd party: Pro $12/mo, 500 tracks, 3 min, commercial; Studio $29.99; Max $89.99 | Up to 3 min on Pro (3rd party); Stable Audio 3.0 model "up to six minutes" (stability.ai/stable-audio) | MP3/WAV (3rd party) | Yes, platform.stability.ai; 3rd party: Stable Audio 2.5 = 20 credits = $0.20 per generation, 25 free credits | Pricing and terms pages are client-rendered and could not be read. Stability's own product page: "Commercially safe models, trained on fully licensed datasets. Legal indemnification provided under our Enterprise license." | Good, but verify the plan terms in a browser before paying |
| Stable Audio Open 1.0 (open weights) | https://huggingface.co/stabilityai/stable-audio-open-1.0 | Yes, local | Free download | n/a | 47 s (Open Small: 11 s) at 44.1 kHz | WAV | Self-hosted | Stability AI Community License: "free for everyone, unless you're using the Core Models for a commercial purpose and you or your organization generate over USD $1M" (stability.ai/license). Model card: "better suited for sound effects and field recordings than music" | Weak for a full theme |
| Mubert Render | https://mubert.com/render | Yes (prompt, or genre/mood) | Ambassador: 25 generations, 5 MP3 downloads/mo, personal projects only, attribution required | Creator $14/mo non-commercial; Pro $39/mo commercial ("indie game on a Pro Plan"); Business $199/mo for apps | Up to 25 min | MP3; WAV on paid | Yes: Trial $49/mo (100 generations), Startup $199/mo (5,000), Startup+ $499/mo; 15 s to 25 min, MP3/WAV, "cleared for monetization" | "All the copyright is owned by Mubert Inc. We license tracks for different use cases." Pro covers an indie game; "In order to use our tracks as background music in the app, a Business Plan or API subscription is required." After cancelling: "you can keep the old ones posted and continue monetization" but not use tracks in new projects | OK if Mubert confirms Pro covers a game shipped as an app |
| Beatoven.ai | https://www.beatoven.ai | Yes (Maestro model) | Limited free generations (3rd party; free downloads not confirmed) | 3rd party: Creator $10/mo (30 download-minutes), Visionary $20/mo (60), or $3/minute | Not stated | MP3, WAV | Composition API offered; pricing not public | Own homepage: "Non-exclusive perpetual licence" for downloaded tracks, royalty-free, listed uses include games; not for upload to streaming services. /pricing and /license returned 404 to automated fetch | Good value |
| Soundraw | https://soundraw.io | No: genre/mood/theme/length pickers and a mixer, not free text | Preview only; download needs a plan | Creator £4.99/mo (unlimited MP3), Artist Pro £10.75/mo (WAV, stems); prices shown in GBP on the site | Not stated | MP3; WAV/stems on Artist Pro+ | Yes: API Starter $29.99/mo (100 songs), API Pro $300/mo (1,000 songs, 6-month minimum) | Licence schedule lists "video games"; pricing page: a downloaded track "remains licensed for life, even if you cancel later"; Terms: Soundraw keeps all IP; no Content ID, no reselling the music | OK, but not prompt-based |
| AIVA | https://www.aiva.ai | Style presets plus audio/MIDI influence on the site; free-text prompting reported for "AIVA 2.0" by third parties, not shown on the site | Free €0: 3 downloads/mo, 3 min, MP3+MIDI, "Copyright owned by AIVA", "No monetization", "Credit must be given to AIVA" | Standard €11/mo (annual): "Limited monetization" on YouTube, Twitch, TikTok, Instagram only (no games); Pro €33/mo (annual): 300 downloads, 5:30, WAV, "Copyright owned by YOU", "Full monetization" | 3 / 5 / 5:30 min by plan | MP3, MIDI; WAV on Pro | Not mentioned | Only Pro allows use in a sold game; MIDI export is a bonus for editing | Good (Pro only) |
| Loudly | https://www.loudly.com | Yes (VEGA instrumental models) | Own FAQ: free tracks limited to 30 s, non-commercial (3rd party: 1 download/day) | 3rd party: Personal $10/mo (7-min max, MP3+WAV), Pro $30/mo | 7 min Personal, 30 min Pro (3rd party) | MP3, WAV | Yes | Own licence agreement: "you do not automatically acquire any proprietary rights to any Loudly Output"; own FAQ: "After you cancel, any music you downloaded during the subscription term remains available for use in personal, non-commercial projects." Apps/games not addressed | Poor: commercial right ends with the subscription |
| Boomy | https://boomy.com | Style-based; free text not verified (site is a JS shell, support site is Cloudflare-gated) | Free: saves only, no downloads (3rd party) | 3rd party: Creator $9.99/mo (10 MP3 downloads/mo), Pro $29.99/mo | Not stated | MP3 | No | support.boomy.com (via search snippets): Boomy keeps copyright by default; Creator and Pro "grant full commercial rights to songs you download while you are subscribed", rights persist after cancelling | Weak (pop/beat oriented, unverifiable) |
| MusicGen (Meta) | https://huggingface.co/facebook/musicgen-small | Yes, local | Free download | n/a | 30 s per pass (continuation possible) | WAV | HF page: "This model isn't deployed by any Inference Provider". Tested 15 Sep 2026: `api-inference.huggingface.co` no longer resolves in DNS; `router.huggingface.co/hf-inference/models/facebook/musicgen-small` returns HTTP 401 without a token, and would not run even with one because no provider hosts it | Weights "CC-BY-NC 4.0" (code MIT): non-commercial, so not usable in a sold app | Unusable |
| Riffusion / Fuzz | https://www.riffusion.com | Yes | n/a | n/a | n/a | n/a | Discontinued. `riffusion.com` 301-redirects to `producer.ai`, which 301-redirects to `flowmusic.app` (checked with curl). Google acquired it in Feb 2026; see Google Flow Music below | Gone |
| Google Flow Music | https://www.flowmusic.app (also flowmusic.google) | Yes (chat with a "producer") | $0 with "Daily top-up credits", 2 concurrent generations; homepage: "free unlimited downloads" | Starter $6/mo, Plus $18/mo, Member $48/mo billed yearly ("Save 25%"); 3,000 / 10,000 / 30,000 credits (own pricing page). Same credits bundled with Google AI Plus/Pro/Ultra | Full songs (not stated numerically) | Download in app | No (Lyria via Gemini API instead) | Terms link goes to the Google Terms of Service: "Some of our services allow you to generate original content. Google won't claim ownership over that content." Commercial-use rights on paid plans and non-commercial on free are reported by third parties only | Promising, verify in a browser |
| Google Lyria via Gemini API | https://ai.google.dev/gemini-api/docs/music-generation | Yes, "Instrumental only, no vocals" supported | No free tier for Lyria | Lyria 3 Clip $0.04/song (30 s fixed), Lyria 3 Pro $0.08/song, Lyria 3.5 $0.08/song ("a couple of minutes", length steerable by prompt) | 30 s or a few minutes | MP3 default, WAV on 3.5; 44.1 kHz stereo; SynthID watermark | Yes, that is the product | Gemini API terms: Google "won't claim ownership over that content"; no non-commercial restriction found; paid tier data is not used for training. MusicFX (labs.google) now 307-redirects to flowmusic.google | Very good value for iterating |
| ElevenLabs Eleven Music | https://elevenlabs.io/music | Yes, instrumental option | $0, 10,000 credits, non-commercial, attribution "Created in collaboration with ElevenLabs" required | Starter $6/mo, Creator $22/mo; music costs 900 credits/min; API for paid plans (3rd party: about $0.15/min) | 3 s to 5 min (docs; API page says up to 10 min) | MP3 44.1 kHz 128 to 192 kbps, WAV | Yes | Music page: "Online and offline commercial use is permitted, except for film, TV, and Studio Games" on self-serve. Model terms (26 May 2026): "Studio Games means video games which are commercialised (either by sale, advertising or any other forms of monetisation) and made available for download or use through more than one platform." Our game is sold on browser, Android and iOS, so it is a Studio Game and needs Enterprise | Unusable on self-serve |
| Adobe Firefly Generate Music (successor to Project Music GenAI Control) | https://www.adobe.com/products/firefly/features/ai-music-generator.html | Yes, instrumental only ("not for generating vocals or songwriting") | "free daily generations" with an Adobe account | Firefly / Creative Cloud credits | 5 s to 5 min | WAV (or muxed into video) | Not mentioned | Product page: "The music you create is royalty-free, fully licensed, and safe for commercial projects". Adobe community answer: "Anything you generate through Firefly can be used commercially." Project Music GenAI Control itself (2024 research preview) never shipped separately | Best free path |

Notes on what could not be verified from the vendor: Udio's pricing, Stable Audio's plan table and terms, Loudly's pricing table, Boomy's pricing and support articles, Beatoven's pricing page (server 404). If you go with one of these, open the page in a browser and check the current wording before paying.

## Licensing summary

Which plan lets us ship the generated track inside a sold, multi-platform app, and keep it after cancelling:

| Tool | Free plan | Paid plan that works | Attribution | Survives cancellation |
|---|---|---|---|---|
| Suno | No (personal, non-commercial; 7 lifetime downloads) | Pro $8/mo or Premier: output assigned to you, commercial use allowed for downloaded songs | None | Yes (assignment), but Suno warns "no representation or warranty that any copyright will vest in any Output" and forbids removing its watermark/metadata |
| Udio | No | None: downloads disabled, output "personal and non-commercial" | n/a | n/a |
| Stable Audio app | No (3rd party) | Pro and above (3rd party); Enterprise adds indemnification | None reported | Not verified |
| Stable Audio Open | Yes (self-hosted) | n/a | Community License, none required | Yes, under $1M revenue |
| Mubert | No (personal projects, attribution) | Pro for an indie game; Business or API if Mubert treats it as "background music in the app" | None on paid | Partly: existing projects may stay published, no new projects |
| Beatoven | Unclear | Any paid plan: "Non-exclusive perpetual licence" | None | Yes (perpetual) |
| Soundraw | No | Any paid plan; "video games" listed; download "remains licensed for life" | None | Yes for downloaded tracks |
| AIVA | No (credit AIVA, no monetisation) | Pro only ("Copyright owned by YOU"); Standard excludes games | None on Pro | Yes (you own the copyright) |
| Loudly | No | None cleanly: downloaded music reverts to "personal, non-commercial" after cancelling | None | No |
| Boomy | No | Creator/Pro (unverified) | None | Reported yes |
| MusicGen | No (CC-BY-NC) | n/a | n/a | n/a |
| Flow Music | Reported no | Paid plans reported to include commercial use; Google claims no ownership | None | Not stated |
| Lyria (Gemini API) | n/a (no free tier) | Pay per song; no ownership claim, no non-commercial clause found | None | Yes |
| ElevenLabs | No (attribution, non-commercial) | Enterprise only, because a multi-platform sold game is a "Studio Game" | Free plan only | n/a |
| Adobe Firefly | Yes: free daily generations are "safe for commercial projects" | Same | None | Yes |

## Recommended path

**Best paid: Suno Pro ($8 for one month).** Prompt-based, up to 8 minutes, WAV download, and the clearest ownership language of the group (Suno assigns its rights in the output to paid subscribers; commercial use is tied to a "permitted download", so download the final take while subscribed and keep the WAV). Generate 10 to 20 takes with the prompts below, pick one, cancel. Backup paid options: AIVA Pro (one month at monthly rate) if you want MIDI to edit the arrangement, or Lyria 3.5 via the Gemini API at $0.08 per song if you prefer scripting many variations.

**Best free: Adobe Firefly Generate Music.** Free daily generations with an Adobe account, instrumental-only by design, 5 s to 5 min, WAV export, and Adobe's page says the output is licensed for commercial projects. Second free choice: Google Flow Music's free tier gives "free unlimited downloads", but the commercial-use grant on the free tier is only reported second-hand, so treat it as a sketchpad and regenerate the final take on a paid month if you keep it. If no generator satisfies, use the library tracks below (CC0 needs no credit; CC-BY needs a README line).

**Best offline/open: none is a good fit yet.** MusicGen is CC-BY-NC, so it is out for a sold app. Stable Audio Open 1.0 is commercially usable under the Community License (under $1M revenue) but tops out at 47 s and Stability itself says it is better at sound effects than music; you would need to run it locally (GPU, `stable-audio-tools`) and stitch/crossfade two passes. Watch Stable Audio 3.0 Small/Medium open weights (announced on stability.ai/stable-audio, same licence family) and Apache-licensed community models (e.g. ACE-Step, not checked here).

**Avoid:** Udio (no downloads, non-commercial terms), Loudly (rights lapse on cancel), ElevenLabs self-serve (multi-platform sold games excluded), MusicGen (NC), Soundraw only if you accept a preset-driven rather than prompt-driven workflow.

## Generation prompts

Paste as the style/description field; set "instrumental" where the tool has a toggle, and ask for 60 to 90 s where the tool takes a duration.

**Main prompt**

```
Epic yet warm orchestral fantasy adventure theme for a children's dungeon-crawler game start screen.
Opens with a bright heroic trumpet and French horn fanfare over timpani rolls, then soaring string melody
with woodwind flourishes and glockenspiel sparkle. Medieval fantasy, sense of exploration, wonder and
courage, playful undertone, friendly not scary. Cinematic live orchestra sound, clear mix, no vocals,
no choir, no synths. 110 bpm, D major, steady march-like pulse, 4/4. Builds to a full-orchestra
restatement of the fanfare, then returns to the opening material so it can loop seamlessly.
Instrumental only. 75 seconds.
```

**Variant A (lighter, more whimsical)**

```
Playful orchestral adventure theme for a family fantasy game menu. Bouncy pizzicato strings and
xylophone intro, then a cheerful trumpet fanfare answered by flutes and clarinets, warm horns and
gentle timpani underneath. Storybook medieval castle mood, curious and brave, light-hearted, suitable
for young children. Real orchestra, no vocals, no electronic drums. 120 bpm, G major, 4/4, clean
loop with the ending matching the intro. Instrumental only, about 70 seconds.
```

**Variant B (grander, more mysterious)**

```
Sweeping orchestral fantasy main theme with a sense of ancient dungeons and heroic quest. Low strings
and soft timpani pulse open, a solo horn call rises into a full brass fanfare with trumpets, then a
wide soaring string theme with harp arpeggios and shimmering cymbals. Awe, mystery and adventure,
optimistic and noble, still gentle enough for kids. Film-score orchestra, no vocals, no choir.
100 bpm, D minor moving to D major, 4/4. Ends on a sustained chord that resolves back into the
opening pulse for looping. Instrumental only, 80 to 90 seconds.
```

Tips per tool: Suno takes the text above in "Style of Music" with lyrics left empty and the instrumental toggle on (or write `[Instrumental]`); Lyria 3.5 and Firefly accept the prompt as-is and honour the duration when you state it; Mubert and Beatoven respond better if you also pick "Orchestral / Cinematic / Epic" tags; AIVA's Standard/Pro "Fantasy" or "Epic Orchestral" preset with a 1:30 length gets close even without a text prompt.

### Making it loop

1. Ask for it in the prompt ("returns to the opening material so it can loop", "clean ending"), and generate a little longer than needed (90 to 120 s) so you can cut on a bar line.
2. Pick a loop point on a downbeat where the texture is similar at both ends (the fanfare restatement is a good target: cut just before it and let the start of the file be the fanfare).
3. If the seam clicks or the harmony jumps, crossfade the tail into the head with ffmpeg (installed at `/usr/local/bin/ffmpeg`, 8.0.1):

```bash
# 1) trim to whole bars, e.g. 0:00 to 1:12 at 110 bpm = 33 bars of 4/4 (1 bar = 2.1818 s)
ffmpeg -i take.wav -ss 0 -t 72 -c copy trimmed.wav

# 2) crossfade the last 4 s into the first 4 s: the file now starts at 4 s and ends with a blended seam
ffmpeg -i trimmed.wav -filter_complex \
 "[0:a]atrim=0:4,asetpts=PTS-STARTPTS[head]; \
  [0:a]atrim=4,asetpts=PTS-STARTPTS[body]; \
  [body][head]acrossfade=d=4:c1=tri:c2=tri[out]" -map "[out]" loop.wav

# 3) normalise loudness (quieter than SFX so speech/TTS stays clear) and encode
ffmpeg -i loop.wav -af "loudnorm=I=-18:TP=-1.5:LRA=9" \
  -c:a libmp3lame -b:a 112k -ar 44100 -ac 2 -write_xing 1 \
  www/assets/music/start-theme.mp3
ls -l www/assets/music/start-theme.mp3
```

MP3 adds a few milliseconds of encoder padding at the seam; `libmp3lame` writes the LAME gapless header, which Chrome, Android WebView and iOS WKWebView honour, so a bar-aligned loop is usually inaudible. If a gap remains on a device, cut the loop point in a sustained-strings passage instead of a silence, or try a shorter crossfade (2 s).

## How to add the track

- File: `www/assets/music/start-theme.mp3` (Capacitor `webDir` is `www`, so it ships in the Android and iOS bundles automatically; `npm run android:run` / `npm run ios:run` copy it). No code change needed: `Music.play()` in `www/js/main.js` already loads `assets/music/start-theme.mp3` with `loop = true`.
- Size budget (about 1 MB): at 128 kbps stereo, 60 s = 960 KB; at 112 kbps, 72 s = 1.0 MB; at 96 kbps mono, 90 s = 1.08 MB. Prefer 112 kbps joint stereo at 60 to 72 s; drop to 96 kbps mono only if the 90 s cut is needed. Add `-ac 1` for mono.
- Keep the original WAV outside the repo (or in a release asset) as proof of the generation and download date, together with a note of the plan you were on when you downloaded it; Suno, Mubert and Soundraw all tie commercial rights to that.
- Credit line in `README.md` (under "License"), only when the licence requires it:
  - CC-BY track: `Start-screen music: "<Title>" by <Author>, CC BY 4.0 (<url>).` For Kevin MacLeod the required form is: `"<Title>" Kevin MacLeod (incompetech.com) Licensed under Creative Commons: By Attribution 4.0 https://creativecommons.org/licenses/by/4.0/`.
  - AIVA Free, Mubert Ambassador, ElevenLabs Free: credit required and non-commercial anyway, so do not ship these.
  - Suno Pro/Premier, AIVA Pro, Beatoven, Soundraw, Adobe Firefly, Lyria, CC0 tracks: no credit required; a one-line "Music generated with <tool>" in the README is still good practice.

## Fallback: royalty-free libraries

| Source | Licence terms (as stated) | Candidate tracks |
|---|---|---|
| OpenGameArt.org, music search `https://opengameart.org/art-search-advanced?keys=fantasy+orchestral&field_art_type_tid[]=12` (filters for CC0, CC-BY 3.0/4.0, OGA-BY, CC-BY-SA, GPL) | Per-track; CC0 needs no credit, CC-BY needs the author's name, CC-BY-SA/GPL are viral (avoid) | "RPG - Main Menu - Fanfare Loop" by Joseph Collard, CC-BY 4.0, WAV/MP3/MIDI, C major 120 bpm, brass quartet plus percussion, "should be able to loop as is" (https://opengameart.org/content/rpg-main-menu-fanfare-loop). "Fantasy Orchestral Theme" by Joth, CC0, MP3, strings-led opening theme, "Credit ... appreciated, but not required" (https://opengameart.org/content/fantasy-orchestral-theme). "CC0 Fantasy Music & Sounds" by Sir Gawain, CC0, MP3/OGG, includes "A Legend Will Rise (Orchestral)" and "Determined Pursuit (epic orchestra loop)" (https://opengameart.org/content/cc0-fantasy-music-sounds). "RPG Title Screen Music Pack", 19 looping WAVs, CC-BY 4.0, credit the composer named in each filename (https://opengameart.org/content/rpg-title-screen-music-pack). "Epic Orchestral Fantasy Theme" by Markus Lindner, CC-BY 4.0, FLAC/MP3 (https://opengameart.org/content/epic-orchestral-fantasy-theme). "Battle March - Epic Orchestral Music Loop" by PlayOnLoop, CC-BY 3.0, short WAV loop, credit link to playonloop.com (https://opengameart.org/content/battle-march-epic-orchestral-music-loop). Skip "Orchestral Epic Fantasy Music" by Zefz (CC-BY-SA 3.0 / GPL 3.0). |
| Kevin MacLeod, https://incompetech.com (FAQ: https://incompetech.com/music/royalty-free/faq.html) | "Creative Commons: By Attribution 4.0"; free for commercial use including games with the credit text above; a paid Standard License removes the attribution requirement | From the site's catalogue (`pieces.json`): "Call to Adventure" 4:07, 178 bpm, full orchestra with trumpet/horn/trombone, "Action, Bright, Bouncy, Humorous, Epic" (closest to the brief; cut a 75 s loop from the opening section); "Heroic Age" 1:37, 129 bpm, winds, trombones, tuba, strings, "Action, Bright, Driving, Epic"; "Fanfare for Space" 1:01, brass/strings/percussion, "Epic, Uplifting"; "Crusade" 3:19, 89 bpm, brass and anvils, darker. |
| Pixabay Music, https://pixabay.com/music/ (licence: https://pixabay.com/service/license-summary/) | Pixabay Content License: "Use Content for free", "without having to attribute the author", commercial use allowed; "You cannot sell or distribute Content ... on a Standalone basis"; check each track for "additional intellectual property rights" notes | Search "fantasy orchestral adventure" and filter by duration 1 to 2 min; no specific track was verified here. |

## Sources checked

Suno: https://suno.com/terms, https://suno.com/pricing, https://help.suno.com/en/articles/13614785, https://help.suno.com/en/articles/2746945, https://suno.com/blog/introducing-v4-5. Udio: https://www.udio.com/terms-of-service (text extracted from the page payload), https://www.udio.com/pricing (client-rendered, unreadable), https://www.digitalmusicnews.com/2025/10/31/udio-downloads-disabled-umg-deal/. Stable Audio: https://stableaudio.com/pricing and /terms (client-rendered, unreadable), https://stability.ai/stable-audio, https://stability.ai/license, https://huggingface.co/stabilityai/stable-audio-open-1.0, https://huggingface.co/stabilityai/stable-audio-open-small, https://undetectr.com/blog/stable-audio-review (3rd party). Mubert: https://mubert.com/render/pricing, https://mubert.com/render/faq, https://mubert.com/api. Beatoven: https://www.beatoven.ai/ (pricing/licence pages 404 to automated fetch), https://www.saasworthy.com/product/beatoven-ai/pricing (3rd party). Soundraw: https://soundraw.io/, /pricing, /terms, /license, /api. AIVA: https://www.aiva.ai/, /pricing. Loudly: https://www.loudly.com/, /faq, /license-agreement, /music/pricing (client-rendered). Boomy: https://boomy.com (JS shell), support.boomy.com articles via search snippets. MusicGen: https://huggingface.co/facebook/musicgen-small plus curl tests of the HF inference endpoints. Riffusion/Flow Music: curl redirect chain riffusion.com to producer.ai to flowmusic.app, https://www.flowmusic.app/pricing, https://policies.google.com/terms, https://one.google.com/about/google-ai-plans/. Lyria: https://ai.google.dev/gemini-api/docs/music-generation, https://ai.google.dev/gemini-api/docs/pricing, https://ai.google.dev/gemini-api/terms, https://labs.google/fx/tools/music-fx (redirects). ElevenLabs: https://elevenlabs.io/music, /pricing, /terms-of-use, /eleven-music-api, /eleven-music-model-specific-terms, /docs/overview/capabilities/music. Adobe: https://www.adobe.com/products/firefly/features/ai-music-generator.html, https://blog.adobe.com/en/publish/2026/08/20/adobe-firefly-expands-its-creative-ai-studio-generate-music-speech-and-sound-effects-in-one-place, Adobe community thread 1477168. Libraries: OpenGameArt pages listed above, https://incompetech.com/music/royalty-free/faq.html and pieces.json, https://pixabay.com/service/license-summary/.
