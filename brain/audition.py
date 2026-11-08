"""Narrator audition for the brain-and-body channel: python brain/audition.py <voice A|B|C>
Qwen3-TTS VoiceDesign (Apache-2.0) makes a reference clip from a text description (nobody is cloned), Qwen3-TTS Base
clones it line by line with a per-line delivery direction, whisper checks every line, and the lines are joined with
the pause written in brain/cold_open.txt.  Output: out/<voice>.wav plus out/<voice>.txt (wpm and QA per line)."""
import difflib, os, re, subprocess, sys
import numpy as np, soundfile as sf, torch

VOICES = {
    "A": "A warm, curious American woman in her early thirties, science podcast host. Clear and friendly, a little playful "
         "with dry humour, relaxed unhurried pace, natural pauses, never announcer-like.",
    "B": "A calm British man in his mid thirties with a soft, intimate late-night radio voice. Curious and gently amused, "
         "low and warm, unhurried, natural pauses, never theatrical.",
    "C": "A young American man in his late twenties, a science YouTuber talking to a friend. Bright, curious, conversational, "
         "quick dry wit, clear diction, medium pace.",
}
REF_TEXT = ("Every night, you lie down and switch off. At least, that's what it feels like. Underneath, your brain is busy, "
            "and some nights it gets things a little bit wrong.")
CHAIN = ("highpass=f=60,lowshelf=f=150:g=2,equalizer=f=2600:t=q:w=1.4:g=-1.5,deesser=i=0.2,"
         "acompressor=threshold=-22dB:ratio=3:attack=8:release=120:makeup=2,loudnorm=I=-16:TP=-1.5:LRA=9")
HERE = os.path.dirname(os.path.abspath(__file__))
words = lambda s: [w for w in (re.sub(r"[^a-z']", "", x.lower()) for x in s.split()) if w]
NUM = set("sixty seventy".split())


def trim(w, sr, thr=0.012):
    i = np.where(np.abs(w) > thr)[0]
    return w[max(0, i[0] - int(.04 * sr)): i[-1] + int(.08 * sr)] if len(i) else w


def main(v):
    from qwen_tts import Qwen3TTSModel
    from faster_whisper import WhisperModel
    torch.set_num_threads(os.cpu_count() or 4)
    os.makedirs("out", exist_ok=True)
    rows = [l.split("|", 2) for l in open(os.path.join(HERE, "cold_open.txt"), encoding="utf-8") if l.strip() and not l.startswith("#")]
    rows = [(float(p), d.strip(), t.strip()) for p, d, t in rows]

    design = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.float32)
    torch.manual_seed(11)
    w, sr = design.generate_voice_design(text=REF_TEXT, language="English", instruct=VOICES[v])
    sf.write(f"out/{v}_ref.wav", w[0], sr)
    del design

    model = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-Base", device_map="cpu", dtype=torch.float32)
    prompt = model.create_voice_clone_prompt(ref_audio=f"out/{v}_ref.wav", ref_text=REF_TEXT)
    prompt = prompt[0] if isinstance(prompt, list) else prompt
    generate = model.model.generate  # the Base model's generate() takes instruct_ids, as in episodes/russia/make_vo.py
    asr = WhisperModel("base.en", device="cpu", compute_type="int8")
    parts, report = [], []
    for n, (pause, direction, text) in enumerate(rows):
        best = None
        for attempt in range(3):
            torch.manual_seed(100 + n * 7 + attempt)
            ids = [model._tokenize_texts([model._build_instruct_text(direction)])[0]]
            model.model.generate = lambda *a, **k: generate(*a, **{**k, "instruct_ids": ids})
            wavs, sr = model.generate_voice_clone(text=[text], language=["English"], voice_clone_prompt=[prompt])
            wav = trim(np.asarray(wavs[0], dtype=np.float32), sr)
            a16 = np.interp(np.linspace(0, len(wav) - 1, int(len(wav) * 16000 / sr)), np.arange(len(wav)), wav).astype(np.float32)
            heard = " ".join(s.text for s in asr.transcribe(a16, language="en", beam_size=1)[0])
            want = [x for x in words(text) if x not in NUM]
            score = difflib.SequenceMatcher(None, want, [x for x in words(heard) if x not in NUM and not x.isdigit()]).ratio()
            wpm = 60 * len(words(text)) / (len(wav) / sr)
            ok = score >= 0.86 and 110 <= wpm <= 205
            if best is None or (ok, score) > (best[0], best[1]):
                best = (ok, score, wpm, wav, heard)
            if ok:
                break
        ok, score, wpm, wav, heard = best
        report.append(f"{'ok ' if ok else 'BAD'} score={score:.2f} wpm={wpm:4.0f} :: {text}\n      heard: {heard.strip()}")
        parts += [wav, np.zeros(int(sr * pause), dtype=np.float32)]
    raw = f"out/{v}_raw.wav"
    sf.write(raw, np.concatenate(parts), sr)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", CHAIN, "-ar", "48000", f"out/{v}.wav"], check=True)
    os.remove(raw)
    total = sum(len(words(t)) for _, _, t in rows)
    dur = sf.info(f"out/{v}.wav").duration
    open(f"out/{v}.txt", "w").write(f"voice {v}: {VOICES[v]}\n{dur:.1f}s, {60 * total / dur:.0f} wpm overall\n\n" + "\n".join(report) + "\n")
    print(open(f"out/{v}.txt").read())


if __name__ == "__main__":
    main(sys.argv[1])
