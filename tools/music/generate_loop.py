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
    seconds = float(opt('--seconds', 30))
    steps = int(opt('--steps', 100))
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
        if '--local' not in sys.argv:
            for attempt in range(2):
                try:
                    src, via = gen_stable_audio(prompt, seconds, steps), 'stable-audio-open'
                    break
                except Exception as e:
                    print(name, 'stable audio attempt', attempt + 1, 'failed:', str(e)[:200], flush=True)
                    time.sleep(10)
            if not src:
                try:
                    src, via = gen_musicgen(prompt), 'musicgen space (CC-BY-NC placeholder)'
                except Exception as e:
                    print(name, 'musicgen space failed:', str(e)[:200], flush=True)
        if not src:
            try:
                src, via = gen_local(prompt, seconds, wav), 'local musicgen-small (CC-BY-NC placeholder)'
            except Exception as e:
                print(name, 'FAILED', str(e)[:300], flush=True)
                continue
        if src != wav:
            subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, wav])
        make_loop(wav, dest)
        print(name, 'ok %.0fs via %s -> %s (%d KB)' % (time.time() - t0, via, os.path.relpath(dest, ROOT), os.path.getsize(dest) // 1024), flush=True)


if __name__ == '__main__':
    main()
