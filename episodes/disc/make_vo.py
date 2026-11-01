"""Voiceover + word timings for the discipline hook test.

  python make_vo.py design   # Qwen3-TTS VoiceDesign: makes the narrator's reference clip from NARRATOR_DESIGN
  python make_vo.py qwen     # Qwen3-TTS Base cloning that clip, batched, QA'd -> public/vo_disc/<scene>.wav
  python make_vo.py deep     # Kokoro am_onyx (deep documentary voice), one take per line, QA'd -> public/vo_disc/<scene>.wav
  python make_vo.py tts      # Chatterbox, one take per script line, QA'd by faster-whisper -> public/vo_disc/<scene>.wav
  python make_vo.py timing   # faster-whisper word times aligned to the script -> src/Disc/timing.ts
  python make_vo.py estimate # no audio: timing.ts from word counts, for blocking out scenes before the VO exists

Voice (current): a synthetic British documentary narrator. Qwen3-TTS VoiceDesign (Apache-2.0) generated the reference
clip episodes/disc/voice_ref.wav from the text description NARRATOR_DESIGN (no real person cloned); Qwen3-TTS Base then
clones that clip for every line, so the voice stays identical across the episode. NARR_CHAIN is baked into each file.
Run qwen/design with a Python that has qwen-tts and faster-whisper installed (CPU is fine: about 7x real time).
Earlier cuts: Kokoro-82M am_onyx at 0.8x with DEEP_CHAIN (deep()); Chatterbox cloned from the channel's own narrator (public/vo_wwgh/*.wav), exaggeration 0.45, cfg 0.3.
Script syntax (episodes/disc/script.txt): "## key" starts a scene, one line = one TTS take, a blank line = longer
pause, and shown{spoken} captions "shown" while the narrator says "spoken" (years, mostly).
"""
import difflib, json, os, re, subprocess, sys
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SCRIPT = os.path.join(ROOT, "episodes/disc/script.txt")
OUT_DIR = os.path.join(ROOT, "public/vo_disc")
TIMING = os.path.join(ROOT, "src/Disc/timing.ts")
REF = os.path.join(ROOT, "public/vo_wwgh/end.wav")
KOKORO_DIR = os.environ.get("KOKORO_DIR", "")  # holds kokoro-v1.0.onnx and voices-v1.0.bin (github.com/thewh1teagle/kokoro-onnx releases)
DEEP_VOICE, DEEP_SPEED = "am_onyx", 0.8
DEEP_CHAIN = ("highpass=f=55,lowshelf=f=140:g=2.5,equalizer=f=320:t=q:w=1.1:g=-2,equalizer=f=3200:t=q:w=1.2:g=1.5,"
              "deesser=i=0.25,acompressor=threshold=-21dB:ratio=2.5:attack=8:release=120:makeup=2")
NARRATOR_DESIGN = ("A deep, warm, middle-aged British male documentary narrator. Rich low voice, calm authority, a hint of dry wit, "
                   "unhurried storytelling pace with natural pauses.")
VOICE_REF = os.path.join(ROOT, "episodes/disc/voice_ref.wav")
VOICE_REF_TEXT = ("In eight sixty-two, the tribes of the north looked around and said: our land is great and rich, but there is no order "
                  "in it. So they did something no country has done before or since. They invited foreigners to come and rule them.")
LINE_CACHE = os.path.join(ROOT, "episodes/disc/vo_lines")  # one wav per script line (git-ignored); lets a long run resume
NARR_CHAIN = ("highpass=f=60,lowshelf=f=150:g=2,equalizer=f=3000:t=q:w=1.2:g=2,deesser=i=0.2,"
              "acompressor=threshold=-22dB:ratio=3:attack=8:release=120:makeup=2,loudnorm=I=-16:TP=-1.5:LRA=9")
DELIVERY = os.path.join(ROOT, "episodes/disc/delivery.txt")  # per-scene and per-line emotion directions
os.makedirs(OUT_DIR, exist_ok=True)
SR = 24000
FPS = 30
GAP_LINE, GAP_PARA = 0.42, 0.9  # seconds of silence between takes
LEAD, TAIL = 12, 16  # frames before / after the voice in each scene
FIRST_LEAD = 24
GAP_MID = 0.22  # a line that ends mid-sentence ("said:", "to Constantinople,") runs on instead of pausing like a full stop
gap = lambda line: GAP_MID if line.rstrip('"').endswith((",", ":", ";")) else GAP_LINE


def parse():
    scenes, key = {}, None
    for raw in open(SCRIPT, encoding="utf-8"):
        line = raw.rstrip("\n")
        if line.startswith("## "):
            key = line[3:].strip()
            scenes[key] = []
        elif line.startswith("#") or key is None:
            continue
        elif not line.strip():
            if scenes[key] and scenes[key][-1] != "":
                scenes[key].append("")
        else:
            scenes[key].append(line.strip())
    for k in scenes:
        while scenes[k] and scenes[k][-1] == "":
            scenes[k].pop()
    return scenes


TOK = re.compile(r"(\S+?)\{([^}]*)\}(\S*)|(\S+)")


def tokens(line):
    """[(shown, spoken)] for a script line."""
    out = []
    for m in TOK.finditer(line):
        if m.group(4):
            out.append((m.group(4), m.group(4)))
        else:
            shown = m.group(1) + m.group(3)
            # keep the shown token's punctuation on the spoken side so TTS phrasing survives
            out.append((shown, m.group(2) + re.sub(r"[\w']", "", m.group(3))))
    return out


def spoken(line):
    return " ".join(s for _, s in tokens(line))


norm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower().replace("’", "'"))


def words_of(text):
    return [w for w in (norm(x) for x in re.split(r"[\s\-]+", text)) if w]


# ─────────────── TTS ───────────────

def trim(wav, thr=0.012, pad=0.04):
    a = np.abs(wav)
    idx = np.where(a > thr)[0]
    if not len(idx):
        return wav
    s = max(0, idx[0] - int(pad * SR))
    e = min(len(wav), idx[-1] + int(pad * SR * 2))
    return wav[s:e]


def tts():
    import torch, torchaudio
    from chatterbox.tts import ChatterboxTTS
    from faster_whisper import WhisperModel

    torch.set_num_threads(os.cpu_count() or 4)
    model = ChatterboxTTS.from_pretrained(device="cpu")
    model.prepare_conditionals(REF, exaggeration=0.45)
    asr = WhisperModel("base.en", device="cpu", compute_type="int8")
    os.makedirs(OUT_DIR, exist_ok=True)
    only = set(sys.argv[2:])
    report = []
    for key, lines in parse().items():
        if only and key not in only:
            continue
        path = os.path.join(OUT_DIR, f"{key}.wav")
        if os.path.exists(path) and not only:
            print("skip", key, flush=True)
            continue
        parts = []
        for line in lines:
            if line == "":
                parts.append(np.zeros(int(SR * (GAP_PARA - GAP_LINE)), dtype=np.float32))
                continue
            text = spoken(line)
            # QA ignores voiced numbers: whisper writes "1547" where the script says "fifteen forty-seven"
            want = [w for sh, sp in tokens(line) if sh == sp for w in words_of(sp)]
            best = None
            for attempt in range(4):
                torch.manual_seed(1000 + attempt * 77 + len(parts))
                wav = model.generate(text, exaggeration=0.45, cfg_weight=0.3, temperature=0.7)
                wav = trim(wav.squeeze(0).numpy().astype(np.float32))
                segs, _ = asr.transcribe(wav.astype(np.float32) if SR == 16000 else resample(wav), language="en", beam_size=1)
                heard = [w for w in words_of(" ".join(s.text for s in segs)) if not w.isdigit()]
                score = difflib.SequenceMatcher(None, want, heard).ratio()
                dur = len(wav) / SR
                rate = len(words_of(text)) / max(dur, 0.1)  # words per second: Chatterbox sometimes drags or rushes a take
                ok = score >= 0.86 and 1.6 <= rate <= 3.9
                print(f"  {key} try{attempt} score={score:.2f} wps={rate:.2f} {dur:.1f}s :: {text[:60]}", flush=True)
                if best is None or score > best[0]:
                    best = (score, wav)
                if ok:
                    break
            if best[0] < 0.86:
                report.append((key, best[0], text))
            parts.append(best[1])
            parts.append(np.zeros(int(SR * GAP_LINE), dtype=np.float32))
        audio = np.concatenate(parts[:-1]) if parts else np.zeros(1, dtype=np.float32)
        torchaudio.save(path, torch.from_numpy(audio).unsqueeze(0), SR)
        print("wrote", path, f"{len(audio) / SR:.1f}s", flush=True)
    for r in report:
        print("LOW SCORE", r, flush=True)


def deep():
    """Kokoro am_onyx for every line, whisper QA like tts(), DEEP_CHAIN baked in."""
    from kokoro_onnx import Kokoro
    from faster_whisper import WhisperModel
    kok = Kokoro(os.path.join(KOKORO_DIR, "kokoro-v1.0.onnx"), os.path.join(KOKORO_DIR, "voices-v1.0.bin"))
    asr = WhisperModel("base.en", device="cpu", compute_type="int8")
    os.makedirs(OUT_DIR, exist_ok=True)
    only = set(sys.argv[2:])
    for key, lines in parse().items():
        if only and key not in only:
            continue
        parts = []
        for line in lines:
            if line == "":
                parts.append(np.zeros(int(SR * (GAP_PARA - GAP_LINE)), dtype=np.float32))
                continue
            text = spoken(line).replace('"', "")
            want = [w for sh, sp in tokens(line) if sh == sp for w in words_of(sp)]
            best = None
            for attempt, speed in enumerate([DEEP_SPEED, DEEP_SPEED - 0.03, DEEP_SPEED + 0.03]):
                a, sr = kok.create(text, voice=DEEP_VOICE, speed=speed, lang="en-us")
                a = trim(np.asarray(a, dtype=np.float32))
                segs, _ = asr.transcribe(resample(a), language="en", beam_size=1)
                heard = [w for w in words_of(" ".join(s.text for s in segs)) if not w.isdigit()]
                score = difflib.SequenceMatcher(None, want, heard).ratio()
                print(f"  {key} try{attempt} score={score:.2f} {len(a) / SR:.1f}s :: {text[:60]}", flush=True)
                if best is None or score > best[0]:
                    best = (score, a)
                if score >= 0.86:
                    break
            parts.append(best[1])
            parts.append(np.zeros(int(SR * GAP_LINE), dtype=np.float32))
        audio = np.concatenate(parts[:-1])
        raw = os.path.join(OUT_DIR, f"{key}.raw.wav")
        import soundfile as sf
        sf.write(raw, audio, SR)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", DEEP_CHAIN, "-ar", str(SR), "-ac", "1", os.path.join(OUT_DIR, f"{key}.wav")], check=True)
        os.remove(raw)
        print("wrote", key, f"{len(audio) / SR:.1f}s", flush=True)


def design():
    import torch, soundfile as sf
    from qwen_tts import Qwen3TTSModel
    torch.set_num_threads(os.cpu_count() or 4)
    m = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.float32)
    w, sr = m.generate_voice_design(text=VOICE_REF_TEXT, language="English", instruct=NARRATOR_DESIGN)
    sf.write(VOICE_REF, w[0], sr)
    print("wrote", VOICE_REF, f"{len(w[0]) / sr:.1f}s")


NUM_WORDS = set("one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen "
                "nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million".split())


def delivery():
    """{script line: direction} from DELIVERY (scene default, overridden by a line whose start matches)."""
    scenes, default, rules, key = parse(), {}, {}, None
    for raw in open(DELIVERY, encoding="utf-8"):
        line = raw.strip()
        if line.startswith("## "):
            key, d = line[3:].split("|", 1)
            key = key.strip()
            default[key] = d.strip()
            rules[key] = []
        elif line and not line.startswith("#"):
            start, d = line.split("|", 1)
            rules[key].append((start.strip(), d.strip()))
    out = {}
    for k, lines in scenes.items():
        for l in lines:
            if l:
                hit = [d for st, d in rules.get(k, []) if l.startswith(st)]
                assert len(hit) <= 1, (k, l)
                out[l] = hit[0] if hit else default[k]
    for k, rs in rules.items():
        for st, _ in rs:
            assert any(l.startswith(st) for l in scenes[k] if l), f"delivery rule matches no line: {k}: {st}"
    return out


def qwen(batch=int(os.environ.get("VO_BATCH", 4))):
    """Every script line cloned from VOICE_REF with Qwen3-TTS Base, `batch` lines per call (much faster on CPU), whisper QA."""
    import hashlib, torch, soundfile as sf
    from qwen_tts import Qwen3TTSModel
    from faster_whisper import WhisperModel
    torch.set_num_threads(os.cpu_count() or 4)
    model = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-Base", device_map="cpu", dtype=torch.float32)
    prompt = model.create_voice_clone_prompt(ref_audio=VOICE_REF, ref_text=VOICE_REF_TEXT)
    prompt = prompt[0] if isinstance(prompt, list) else prompt
    asr = WhisperModel("base.en", device="cpu", compute_type="int8")
    os.makedirs(LINE_CACHE, exist_ok=True)
    only = set(sys.argv[2:])
    scenes = {k: v for k, v in parse().items() if not only or k in only}
    direction = delivery()
    path_of = lambda line: os.path.join(LINE_CACHE, hashlib.sha1((spoken(line) + "|" + direction[line]).encode()).hexdigest()[:16] + ".wav")
    # The Base (cloning) model has no public instruction argument, but its generate() accepts instruct_ids like the
    # VoiceDesign model's; passing the direction there keeps voice A's timbre and changes the delivery.
    generate = model.model.generate

    def check(line, wav, sr):
        # whisper writes spelled-out numbers as digits, so number words are left out of the comparison
        want = [w for sh, sp in tokens(line) if sh == sp for w in words_of(sp) if w not in NUM_WORDS]
        a16 = np.interp(np.linspace(0, len(wav) - 1, int(len(wav) * 16000 / sr)), np.arange(len(wav)), wav).astype(np.float32)
        segs, _ = asr.transcribe(a16, language="en", beam_size=1)
        heard = [w for w in words_of(" ".join(s.text for s in segs)) if not w.isdigit()]
        rate = len(words_of(spoken(line))) / max(len(wav) / sr, 0.1)
        return difflib.SequenceMatcher(None, want, heard).ratio(), rate

    todo = sorted({l for ls in scenes.values() for l in ls if l and not os.path.exists(path_of(l))}, key=len)
    print(len(todo), "lines to voice", flush=True)
    takes = int(os.environ.get("VO_TAKES", 1))
    if takes > 1:  # several takes of each line in one batch; keep the most expressive one that passes QA
        import librosa
        def liveliness(wav, sr):
            f0, _, _ = librosa.pyin(wav, fmin=50, fmax=300, sr=sr)
            f0 = f0[~np.isnan(f0)]
            rms = librosa.feature.rms(y=wav)[0]
            db = 20 * np.log10(rms[rms > rms.max() * 0.05] + 1e-9)
            return np.std(12 * np.log2(f0 / np.median(f0))) + 0.3 * db.std()
        failed = []
        for n, line in enumerate(todo):
            torch.manual_seed(31 + n)
            ids = [model._tokenize_texts([model._build_instruct_text(direction[line])])[0]] * takes
            model.model.generate = lambda *a, **k: generate(*a, **{**k, "instruct_ids": ids})
            wavs, sr = model.generate_voice_clone(text=[spoken(line).replace('"', "")] * takes, language=["English"] * takes, voice_clone_prompt=[prompt] * takes)
            scored = []
            for t, wav in enumerate(wavs):
                wav = np.asarray(wav, dtype=np.float32)
                score, rate = check(line, wav, sr)
                ok = score >= 0.86 and (1.7 <= rate <= 4.2 or len(words_of(spoken(line))) < 4)
                live = liveliness(wav, sr)
                print(f"  take{t} {'ok ' if ok else 'BAD'} score={score:.2f} wps={rate:.2f} live={live:.2f} :: {spoken(line)[:60]}", flush=True)
                scored.append((ok, live, wav))
            ok, live, wav = max(scored, key=lambda x: (x[0], x[1]))
            if ok:
                sf.write(path_of(line), wav, sr)
                print(f"  kept live={live:.2f}", flush=True)
            else:  # no take passed QA: let the single-take retry loop below have it
                failed.append(line)
        todo = failed
    for attempt in range(4):
        failed = []
        for i in range(0, len(todo), batch):
            group = todo[i:i + batch]
            torch.manual_seed(7 + attempt * 1000 + i)
            texts = [spoken(l).replace('"', "") for l in group]
            ids = [model._tokenize_texts([model._build_instruct_text(direction[l])])[0] for l in group]
            model.model.generate = lambda *a, **k: generate(*a, **{**k, "instruct_ids": ids})
            wavs, sr = model.generate_voice_clone(text=texts, language=["English"] * len(group), voice_clone_prompt=[prompt] * len(group))
            for line, wav in zip(group, wavs):
                wav = np.asarray(wav, dtype=np.float32)
                score, rate = check(line, wav, sr)
                ok = score >= 0.86 and (1.7 <= rate <= 4.2 or len(words_of(spoken(line))) < 4)
                print(f"  try{attempt} {'ok ' if ok else 'BAD'} score={score:.2f} wps={rate:.2f} :: {spoken(line)[:70]}", flush=True)
                if ok or attempt == 3:
                    sf.write(path_of(line), wav, sr)
                else:
                    failed.append(line)
        todo = failed
        if not todo:
            break

    for key, lines in scenes.items():
        parts = []
        for line in lines:
            if line == "":
                parts.append(np.zeros(int(SR * (GAP_PARA - GAP_LINE)), dtype=np.float32))
                continue
            wav, sr = sf.read(path_of(line), dtype="float32")
            assert sr == SR, sr
            parts += [trim(wav), np.zeros(int(SR * gap(line)), dtype=np.float32)]
        raw = os.path.join(OUT_DIR, f"{key}.raw.wav")
        sf.write(raw, np.concatenate(parts[:-1]), SR)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", NARR_CHAIN, "-ar", str(SR), "-ac", "1", os.path.join(OUT_DIR, f"{key}.wav")], check=True)
        os.remove(raw)
        print("wrote", key, flush=True)


def resample(wav):
    """24 kHz -> 16 kHz for whisper."""
    n = int(len(wav) * 16000 / SR)
    return np.interp(np.linspace(0, len(wav) - 1, n), np.arange(len(wav)), wav).astype(np.float32)


def load_wav(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


# ─────────────── Timing ───────────────

_ASR = []


def whisper():
    if not _ASR:
        from faster_whisper import WhisperModel
        _ASR.append(WhisperModel("small.en", device="cpu", compute_type="int8"))
    return _ASR[0]


def align(lines, audio16):
    """[(start_s, end_s, shown)] for every shown token, from whisper word times matched to the spoken script."""
    asr = whisper()
    prompt = " ".join(spoken(l) for l in lines if l)
    segs, _ = asr.transcribe(audio16, language="en", word_timestamps=True, initial_prompt=prompt[:800], beam_size=5)
    heard = [(w.start, w.end, norm(w.word)) for s in segs for w in s.words if norm(w.word)]
    shown, sp = [], []  # sp: (word, index into shown)
    for l in lines:
        if not l:
            continue
        for s_tok, p_tok in tokens(l):
            shown.append(s_tok)
            for w in words_of(p_tok):
                sp.append((w, len(shown) - 1))
    times = [None] * len(sp)
    sm = difflib.SequenceMatcher(None, [w for w, _ in sp], [h[2] for h in heard], autojunk=False)
    for a, b, n in sm.get_matching_blocks():
        for i in range(n):
            times[a + i] = heard[b + i][:2]
    # interpolate unmatched spoken words between their matched neighbours
    total = len(audio16) / 16000
    i = 0
    while i < len(sp):
        if times[i] is not None:
            i += 1
            continue
        j = i
        while j < len(sp) and times[j] is None:
            j += 1
        t0 = times[i - 1][1] if i > 0 else 0.0
        t1 = times[j][0] if j < len(sp) else total
        step = (t1 - t0) / (j - i)
        for k in range(i, j):
            times[k] = (t0 + step * (k - i), t0 + step * (k - i + 1))
        i = j
    out = []
    for idx, tok in enumerate(shown):
        ts = [times[k] for k, (_, si) in enumerate(sp) if si == idx]
        if not ts:  # a token with no spoken words (e.g. a lone dash): pin to the previous one
            ts = [out[-1][:2]] if out else [(0.0, 0.1)]
        out.append((ts[0][0], ts[-1][1], tok))
    return out


def write_timing(scenes_t):
    lines = ["// GENERATED by episodes/disc/make_vo.py (Qwen3-TTS narrator; see the module docstring) — do not edit by hand.",
             "// Scene-relative frames; word times from faster-whisper aligned to the script.", "", "export const SCENES = {"]
    start = 0
    caps = {}
    for i, (key, dur_s, words) in enumerate(scenes_t):
        lead = FIRST_LEAD if i == 0 else LEAD
        dur = lead + int(round(dur_s * FPS)) + TAIL
        lines.append(f'  "{key}": {{ "start": {start}, "dur": {dur}, "lead": {lead} }},')
        caps[key] = [[lead + int(round(s * FPS)), lead + max(int(round(s * FPS)) + 1, int(round(e * FPS))), t] for s, e, t in words]
        start += dur
    lines += ["} as const;", "", "/** Per scene: [startFrame, endFrame, token] for every spoken word. */",
              f"export const CAPS: Record<string, [number, number, string][]> = {json.dumps(caps, ensure_ascii=False)};", "",
              f"export const TOTAL_FRAMES = {start};", ""]
    open(TIMING, "w", encoding="utf-8").write("\n".join(lines))
    print(f"wrote {TIMING}: {start} frames = {start / FPS / 60:.2f} min")


def timing():
    """Word times per scene. With the Qwen line cache present, each line is aligned on its own and offset by its known
    position in the assembled scene (exactly how qwen() concatenates them), which is far more robust than aligning a
    whole scene at once: whisper can lose its place in a long file and drift every later word."""
    import hashlib, soundfile as sf
    direction = delivery()
    path_of = lambda line: os.path.join(LINE_CACHE, hashlib.sha1((spoken(line) + "|" + direction[line]).encode()).hexdigest()[:16] + ".wav")
    out = []
    for key, lines in parse().items():
        if not all(os.path.exists(path_of(l)) for l in lines if l):
            break
        t, words = 0.0, []
        for l in lines:
            if not l:
                t += GAP_PARA - GAP_LINE
                continue
            wav, sr = sf.read(path_of(l), dtype="float32")
            wav = trim(wav)
            for s0, s1, tok in align([l], resample(wav)):
                words.append((t + s0, t + s1, tok))
            t += len(wav) / SR + gap(l)
        t -= gap(lines[-1])  # qwen() drops the gap after the last line
        total = len(load_wav(os.path.join(OUT_DIR, f"{key}.wav"))) / 16000
        assert abs(total - t) < 0.05, (key, total, t)
        out.append((key, total, words))
        print(key, f"{total:.1f}s", len(words), "words (per line)", flush=True)
    else:
        write_timing(out)
        return
    print("line cache incomplete; aligning whole scenes", flush=True)
    out = []
    for key, lines in parse().items():
        audio = load_wav(os.path.join(OUT_DIR, f"{key}.wav"))
        words = align(lines, audio)
        out.append((key, len(audio) / 16000, words))
        print(key, f"{len(audio) / 16000:.1f}s", len(words), "words", flush=True)
    write_timing(out)


def estimate(wps=2.55):
    out = []
    for key, lines in parse().items():
        t, words = 0.0, []
        for l in lines:
            if not l:
                t += GAP_PARA - GAP_LINE
                continue
            for s_tok, p_tok in tokens(l):
                d = max(0.18, len(words_of(p_tok)) / wps) + (0.25 if re.search(r"[.,:;?!]$", s_tok) else 0)
                words.append((t, t + d * 0.9, s_tok))
                t += d
            t += GAP_LINE
        out.append((key, t, words))
    write_timing(out)


if __name__ == "__main__":
    {"tts": tts, "deep": deep, "design": design, "qwen": qwen, "timing": timing, "estimate": estimate}[sys.argv[1]]()
