"""Generate looping background music candidates with a text-to-audio Space.

    python generate_loop.py [name ...] [--seconds 30] [--steps 100] [--local] [--force] [--dry-run]

Tracks are defined in TRACKS (name -> prompt). For each, the script asks the
Stable Audio Open Space (artificialguybr/Stable-Audio-Open-Zero, weights under
the Stability AI Community License: free below USD 1M revenue) for a clip and
falls back to facebook/MusicGen on Hugging Face; with --local (or when both
Spaces fail) it runs facebook/musicgen-small on this machine (CPU, a few
minutes per clip; torch + transformers in tools/music/.venv). MusicGen weights
are CC-BY-NC: those loops are development placeholders, see
docs/music-generation.md. The clip is then made into a seamless loop with
ffmpeg (crossfade the tail into the head, loudness-normalise, mono 96 kbps
mp3) at www/assets/music/<name>.mp3. Raw wavs stay in tools/music/out/.
"""
import os, shutil, subprocess, sys, time

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT_DIR = os.path.join(os.path.dirname(__file__), 'out')
DEST = os.path.join(ROOT, 'www', 'assets', 'music')

TRACKS = {
    'cemetery-carousel': (
        'Haunted carousel waltz for a children\'s Halloween game, detuned calliope organ and music box, slow 3/4 at '
        '90 bpm, creaking rhythm, glockenspiel, distant organ swells, eerie but playful, minor key, instrumental, loopable, no vocals'),
    'cemetery-shanty': (
        'Graveyard sea shanty for dancing skeletons in a children\'s game, fiddle lead, accordion, bones and woodblock '
        'percussion, stomping 6/8 at 100 bpm, minor key, jaunty and spooky, instrumental, loopable, no vocals'),
    'cemetery-lullaby': (
        'Moonlit cemetery lullaby for a children\'s game, soft wordless choir pad, celesta and harp arpeggios, slow 60 bpm, '
        'gentle and mysterious, minor key with a warm resolve, instrumental, loopable, no vocals'),
    'cemetery-gothic': (
        'Gothic cemetery night theme for a children\'s adventure game, slow pipe organ chords and a haunting '
        'music box melody, deep church bell tolling, soft choir pad, distant thunder, minor key, 70 bpm, 4/4, '
        'atmospheric and mysterious but not frightening, instrumental, loopable, no vocals'),
    'cemetery-quirky': (
        'Dark but quirky Halloween waltz for a children\'s game, playful pizzicato strings, bouncy bassoon and '
        'clarinet, xylophone and tubular bells, creaky harpsichord, spooky fun like a haunted carnival, '
        'minor key, 3/4 waltz at 120 bpm, mischievous and light-hearted, instrumental, loopable, no vocals'),
    'cemetery-ominous': (
        'Ominous slow cemetery ambience for a children\'s game, low sustained cello and double bass drone, '
        'sparse tolling bell, breathy low flute, occasional soft timpani heartbeat, wind through dead trees, '
        'dark and tense but calm, minor key, 60 bpm, instrumental, loopable, no vocals'),
}


def opt(name, default=None):
    a = sys.argv
    return a[a.index(name) + 1] if name in a and a.index(name) + 1 < len(a) else default


def gen_ace_step(prompt, seconds, seed, steps):
    """ACE-Step (Apache-2.0 model) on the official Space; instrumental via the [inst] lyric tag."""
    from gradio_client import Client
    from huggingface_hub import get_token
    c = Client('ACE-Step/ACE-Step', verbose=False, token=get_token())
    res = c.predict(api_name='/__call__', audio_duration=float(seconds), prompt=prompt, lyrics='[inst]',
                    infer_step=int(steps), guidance_scale=15.0, scheduler_type='euler', cfg_type='apg',
                    omega_scale=10.0, manual_seeds=str(seed), guidance_interval=0.5, guidance_interval_decay=0.0,
                    min_guidance_scale=3.0, use_erg_tag=True, use_erg_lyric=False, use_erg_diffusion=True)
    path = res[0] if isinstance(res, (list, tuple)) else res
    return path if isinstance(path, str) else path['path']


def gen_diffrhythm(prompt, seed, steps):
    """DiffRhythm (Apache-2.0) on the official Space; empty lyrics = instrumental, 95 s clip."""
    from gradio_client import Client
    from huggingface_hub import get_token
    c = Client('ASLP-lab/DiffRhythm', verbose=False, token=get_token())
    res = c.predict(api_name='/infer_music', lrc='', ref_audio_path=None, text_prompt=prompt, seed=int(seed),
                    randomize_seed=False, steps=int(steps), cfg_strength=4.0, file_type='wav',
                    odeint_method='euler', preference_infer='quality first', Music_Duration=95)
    return res if isinstance(res, str) else res['path']


def gen_stable_audio(prompt, seconds, steps):
    from gradio_client import Client
    from huggingface_hub import get_token
    c = Client('artificialguybr/Stable-Audio-Open-Zero', verbose=False, token=get_token())
    res = c.predict(prompt, float(seconds), float(steps), 7.0, api_name='/predict')
    return res if isinstance(res, str) else res['path']


def gen_musicgen(prompt):
    from gradio_client import Client
    from huggingface_hub import get_token
    c = Client('facebook/MusicGen', verbose=False, token=get_token())
    res = c.predict(prompt, None, api_name='/predict_batched')
    path = res[0] if isinstance(res, (list, tuple)) else res
    if isinstance(path, dict):
        path = path.get('video') or path.get('path')
    return path


def gen_local(prompt, seconds, out_wav):
    """facebook/musicgen-small on the CPU (30 s per pass is the model's limit)."""
    import torch, scipy.io.wavfile as wavfile
    from transformers import AutoProcessor, MusicgenForConditionalGeneration
    torch.manual_seed(7)
    processor = AutoProcessor.from_pretrained('facebook/musicgen-small')
    model = MusicgenForConditionalGeneration.from_pretrained('facebook/musicgen-small')
    inputs = processor(text=[prompt], padding=True, return_tensors='pt')
    tokens = int(min(30, seconds) * 50)   # 50 audio tokens per second
    audio = model.generate(**inputs, do_sample=True, guidance_scale=3.0, max_new_tokens=tokens)
    rate = model.config.audio_encoder.sampling_rate
    wavfile.write(out_wav, rate, audio[0, 0].numpy())
    return out_wav


def make_loop(src, dest, xfade=3.0):
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    tmp = dest + '.loop.wav'
    subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-filter_complex',
        '[0:a]atrim=0:%s,asetpts=PTS-STARTPTS[head];[0:a]atrim=%s,asetpts=PTS-STARTPTS[body];'
        '[body][head]acrossfade=d=%s:c1=tri:c2=tri[out]' % (xfade, xfade, xfade),
        '-map', '[out]', tmp])
    subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp,
        '-af', 'loudnorm=I=-20:TP=-1.5:LRA=9', '-c:a', 'libmp3lame', '-b:a', '96k', '-ar', '44100', '-ac', '1',
        '-write_xing', '1', dest])
    os.remove(tmp)


def main():
    names = [a for a in sys.argv[1:] if not a.startswith('--') and not a.replace('.', '').isdigit()] or list(TRACKS)
    names = [n for n in names if n in TRACKS]
    seconds = float(opt('--seconds', 40))
    steps = int(opt('--steps', 60))
    backend = opt('--backend')   # ace | diffrhythm | stable | musicgen | local
    seed = int(opt('--seed', 7))
    os.makedirs(OUT_DIR, exist_ok=True)
    for name in names:
        dest = os.path.join(DEST, name + '.mp3')
        if os.path.exists(dest) and '--force' not in sys.argv:
            print(name, 'exists', flush=True)
            continue
        prompt = TRACKS[name]
        if '--dry-run' in sys.argv:
            print(name, '->', prompt)
            continue
        t0 = time.time()
        wav = os.path.join(OUT_DIR, name + '.wav')
        src, via = None, None
        order = ['ace', 'diffrhythm', 'stable', 'musicgen', 'local']
        if '--local' in sys.argv:
            order = ['local']
        elif backend:
            order = [backend]
        for be in order:
            for attempt in range(2):
                try:
                    if be == 'ace':
                        src, via = gen_ace_step(prompt, seconds, seed, steps), 'ACE-Step (Apache-2.0)'
                    elif be == 'diffrhythm':
                        src, via = gen_diffrhythm(prompt, seed, 32), 'DiffRhythm (Apache-2.0)'
                    elif be == 'stable':
                        src, via = gen_stable_audio(prompt, seconds, 100), 'Stable Audio Open (Community License)'
                    elif be == 'musicgen':
                        src, via = gen_musicgen(prompt), 'musicgen space (CC-BY-NC placeholder)'
                    else:
                        src, via = gen_local(prompt, seconds, wav), 'local musicgen-small (CC-BY-NC placeholder)'
                    break
                except Exception as e:
                    print(name, be, 'attempt', attempt + 1, 'failed:', str(e)[:200].replace('\n', ' '), flush=True)
                    time.sleep(10)
            if src:
                break
        if not src:
            print(name, 'FAILED on every backend', flush=True)
            continue
        import json
        json.dump({'track': name, 'backend': via, 'prompt': prompt, 'seed': seed, 'seconds': seconds,
                   'date': time.strftime('%Y-%m-%d')}, open(os.path.join(OUT_DIR, name + '.json'), 'w'), indent=1)
        if src != wav:
            # trim long clips (DiffRhythm gives 95 s) to the requested length before looping
            subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-t', str(seconds), wav])
        make_loop(wav, dest)
        print(name, 'ok %.0fs via %s -> %s (%d KB)' % (time.time() - t0, via, os.path.relpath(dest, ROOT), os.path.getsize(dest) // 1024), flush=True)


if __name__ == '__main__':
    main()
