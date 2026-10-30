"""The Russia episode's score, composed in code: one looping cue per era, written note by note as MIDI and rendered
with FluidSynth through the FluidR3 General MIDI soundfont (MIT licence). Melodies are original except
"Korobeiniki" (a 19th-century Russian folk song, public domain).

  python compose.py   -> public/music/<cue>.mp3 (44.1 kHz stereo, 192 kbps) ; needs fluidsynth + /usr/share/sounds/sf2/FluidR3_GM.sf2
"""
import os, subprocess
import mido

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "music")
SF2 = "/usr/share/sounds/sf2/FluidR3_GM.sf2"
TPB = 480
N = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}
N.update({"Db": 1, "Eb": 3, "Gb": 6, "Ab": 8, "Bb": 10})


def p(name):
    """'A4' -> 69."""
    return 12 * (int(name[-1]) + 1) + N[name[:-1]]


GM = dict(strings=48, slowstrings=49, cello=42, bass=43, pizz=45, harp=46, timp=47, choir=52, horn=60, brass=61, tuba=58, trombone=57,
          oboe=68, clarinet=71, flute=73, celesta=8, glock=9, bells=14, taiko=116, epiano=4, pad=89, synthstrings=50, banjo=105)


class Song:
    def __init__(self, bpm):
        self.bpm, self.tracks = bpm, {}

    def track(self, name, program, ch, vol=100, pan=64):
        self.tracks[name] = dict(program=program, ch=ch, vol=vol, pan=pan, ev=[])
        return name

    def note(self, tr, beat, dur, pitch, vel=80):
        self.tracks[tr]["ev"].append((beat, dur, pitch if isinstance(pitch, int) else p(pitch), vel))

    def chord(self, tr, beat, dur, pitches, vel=70):
        for q in pitches:
            self.note(tr, beat, dur, q, vel)

    def line(self, tr, beat, notes, vel=85, legato=0.95):
        """notes: [(pitch | None, beats)]"""
        for q, d in notes:
            if q is not None:
                self.note(tr, beat, d * legato, q, vel)
            beat += d
        return beat

    def save(self, path):
        mid = mido.MidiFile(ticks_per_beat=TPB)
        meta = mido.MidiTrack()
        meta.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(self.bpm)))
        mid.tracks.append(meta)
        for t in self.tracks.values():
            tr = mido.MidiTrack()
            ch = t["ch"]
            if ch != 9:
                tr.append(mido.Message("program_change", program=t["program"], channel=ch, time=0))
            tr.append(mido.Message("control_change", control=7, value=t["vol"], channel=ch, time=0))
            tr.append(mido.Message("control_change", control=10, value=t["pan"], channel=ch, time=0))
            tr.append(mido.Message("control_change", control=91, value=70, channel=ch, time=0))
            msgs = []
            for b, d, q, v in t["ev"]:
                msgs.append((int(b * TPB), 1, q, v))
                msgs.append((int((b + d) * TPB), 0, q, 0))
            msgs.sort(key=lambda m: (m[0], m[1]))
            last = 0
            for tick, on, q, v in msgs:
                tr.append(mido.Message("note_on" if on else "note_off", note=q, velocity=v, channel=ch, time=tick - last))
                last = tick
            mid.tracks.append(tr)
        mid.save(path)


def triad(root, kind="m", octave=3):
    r = p(f"{root}{octave}")
    return [r, r + (3 if kind == "m" else 4), r + 7]


# ─────────────── cues ───────────────

def saga():
    s = Song(84)
    pad, harp, horn, taiko, bass = s.track("pad", GM["strings"], 0, 82), s.track("harp", GM["harp"], 1, 88), s.track("horn", GM["horn"], 2, 96), s.track("taiko", GM["taiko"], 3, 90), s.track("bass", GM["bass"], 4, 90)
    prog = [("D", "m"), ("C", "M"), ("Bb", "M"), ("C", "M")] * 4
    for i, (r, k) in enumerate(prog):
        b = i * 4
        s.chord(pad, b, 4, triad(r, k, 3), 58)
        s.note(bass, b, 4, triad(r, k, 2)[0], 70)
        ch = triad(r, k, 4)
        for j, q in enumerate([ch[0], ch[1], ch[2], ch[1] + 12 - 12, ch[0] + 12, ch[2], ch[1], ch[2]]):
            s.note(harp, b + j * 0.5, 0.5, q, 62)
        s.note(taiko, b, 1, p("D2"), 96); s.note(taiko, b + 2.5, 0.5, p("D2"), 60); s.note(taiko, b + 3, 1, p("D2"), 80)
    m1 = [("D4", 2), ("F4", 1), ("G4", 1), ("A4", 3), ("G4", 1), ("F4", 1), ("E4", 1), ("D4", 1), ("C4", 1), ("D4", 4)]
    m2 = [("A4", 2), ("C5", 1), ("D5", 1), ("E5", 3), ("D5", 1), ("C5", 1), ("A4", 1), ("G4", 1), ("E4", 1), ("D4", 4)]
    b = 16
    b = s.line(horn, b, m1, 82); b = s.line(horn, b, m2, 88); b = s.line(horn, b, m1, 84); s.line(horn, b, m2, 90)
    return s, 64


def chronicle():
    s = Song(66)
    choir, cello, bassl, bells, timp = s.track("choir", GM["choir"], 0, 80), s.track("cello", GM["cello"], 1, 100), s.track("bass", GM["bass"], 2, 92), s.track("bells", GM["bells"], 3, 70), s.track("timp", GM["timp"], 4, 85)
    prog = [("A", "m"), ("D", "m"), ("A", "m"), ("E", "M")] * 4
    for i, (r, k) in enumerate(prog):
        b = i * 4
        s.chord(choir, b, 4, [q + 12 for q in triad(r, k, 3)], 56)
        s.note(bassl, b, 4, p("A1") if r == "A" else triad(r, k, 2)[0], 72)
        if i % 2 == 0:
            s.note(bells, b, 3, p("A4"), 64); s.note(bells, b, 3, p("E5"), 40)
        for j in range(4):
            s.note(timp, b + 3 + j * 0.25, 0.25, p("A2"), 30 + j * 12)
    m1 = [("A3", 2), ("C4", 1), ("B3", 1), ("A3", 2), ("E3", 2), ("F3", 1), ("G3", 1), ("A3", 1), ("C4", 1), ("B3", 4)]
    m2 = [("A3", 2), ("C4", 1), ("D4", 1), ("E4", 3), ("D4", 1), ("C4", 1), ("B3", 1), ("A3", 1), ("G#3", 1), ("A3", 4)]
    b = 16
    b = s.line(cello, b, m1, 80); b = s.line(cello, b, m2, 86); b = s.line(cello, b, m1, 82); s.line(cello, b, m2, 88)
    return s, 64


KOROBEINIKI = [("E5", 1), ("B4", .5), ("C5", .5), ("D5", 1), ("C5", .5), ("B4", .5), ("A4", 1), ("A4", .5), ("C5", .5), ("E5", 1), ("D5", .5), ("C5", .5),
               ("B4", 1.5), ("C5", .5), ("D5", 1), ("E5", 1), ("C5", 1), ("A4", 1), ("A4", 2),
               (None, .5), ("D5", 1), ("F5", .5), ("A5", 1), ("G5", .5), ("F5", .5), ("E5", 1.5), ("C5", .5), ("E5", 1), ("D5", .5), ("C5", .5),
               ("B4", 1), ("B4", .5), ("C5", .5), ("D5", 1), ("E5", 1), ("C5", 1), ("A4", 1), ("A4", 2)]
KORO_CHORDS = [("A", "m"), ("A", "m"), ("E", "M"), ("A", "m"), ("D", "m"), ("C", "M"), ("E", "M"), ("A", "m")]


def empire(bpm=128, lead="oboe", full=False):
    s = Song(bpm)
    mel, pizz, tuba, drum = s.track("mel", GM[lead], 0, 100), s.track("pizz", GM["pizz"], 1, 92), s.track("tuba", GM["tuba"], 2, 88), s.track("drum", 0, 9, 70)
    if full:
        brass, strings = s.track("brass", GM["brass"], 3, 92), s.track("strings", GM["strings"], 4, 84)
    for rep in range(4):
        for i, (r, k) in enumerate(KORO_CHORDS):
            b = rep * 32 + i * 4
            ch = triad(r, k, 3)
            for j in range(4):
                s.note(tuba, b + j, 0.5, triad(r, k, 2)[0] + (7 if j % 2 else 0), 78)
                s.chord(pizz, b + j + 0.5, 0.4, [q + 12 for q in ch], 60)
                s.note(drum, b + j + 0.5, 0.2, 38, 34 if not full else 60)
            if full:
                s.chord(strings, b, 4, [q + 12 for q in ch], 54)
                s.note(drum, b, 0.3, 36, 80)
        b = rep * 32
        if rep >= 1:
            s.line(mel, b, KOROBEINIKI, 88 if rep < 3 else 96)
            if full:
                s.line(brass, b, [((x[:-1] + str(int(x[-1]) - 1)) if x else None, d) for x, d in KOROBEINIKI], 80)
        else:
            s.line(mel, b + 16, KOROBEINIKI[19:], 70)
    return s, 128


def napoleon():
    s = Song(112)
    brass, strings, timp, drum = s.track("brass", GM["brass"], 0, 100), s.track("strings", GM["strings"], 1, 86), s.track("timp", GM["timp"], 2, 92), s.track("drum", 0, 9, 80)
    prog = [("D", "m"), ("D", "m"), ("Bb", "M"), ("A", "M")] * 4
    for i, (r, k) in enumerate(prog):
        b = i * 4
        ch = triad(r, k, 3)
        for j in range(8):
            s.note(strings, b + j * 0.5, 0.45, ch[j % 3], 60)
        for j, (t, v) in enumerate([(0, 90), (0.75, 50), (1, 70), (2, 85), (2.5, 55), (2.75, 55), (3, 70)]):
            s.note(drum, b + t, 0.2, 38, v)
        s.note(timp, b, 1, triad(r, k, 2)[0], 90); s.note(timp, b + 2, 1, triad(r, k, 2)[0] + 7, 70)
    fan = [("D4", .5), ("D4", .5), ("D4", 1), ("A4", 2), ("G4", 1), ("F4", 1), ("E4", 1), ("D4", 1),
           ("F4", .5), ("F4", .5), ("F4", 1), ("C5", 2), ("A4", 4), ("Bb4", 1.5), ("A4", .5), ("G4", 1), ("F4", 1), ("E4", 2), ("C#4", 2), ("D4", 4)]
    b = 8
    b = s.line(brass, b, fan, 92); s.line(brass, b + 4, fan, 98)
    return s, 64


def soviet():
    s = Song(104)
    brass, strings, bass, drum = s.track("brass", GM["brass"], 0, 100), s.track("strings", GM["strings"], 1, 84), s.track("bass", GM["tuba"], 2, 90), s.track("drum", 0, 9, 84)
    prog = [("C", "m"), ("C", "m"), ("F", "m"), ("G", "M"), ("Ab", "M"), ("F", "m"), ("G", "M"), ("C", "m")] * 2
    for i, (r, k) in enumerate(prog):
        b = i * 4
        s.chord(strings, b, 4, [q + 12 for q in triad(r, k, 3)], 56)
        for j in range(4):
            s.note(bass, b + j, 0.6, triad(r, k, 2)[0] + (7 if j % 2 else 0), 80)
            s.note(drum, b + j, 0.2, 36 if j % 2 == 0 else 38, 85 if j % 2 == 0 else 70)
    mel = [("G3", 1), ("C4", 1.5), ("D4", .5), ("Eb4", 2), ("C4", 2), ("F4", 1), ("Eb4", 1), ("D4", 1), ("C4", 1), ("G4", 4),
           ("Ab4", 1.5), ("G4", .5), ("F4", 1), ("Eb4", 1), ("D4", 2), ("Bb3", 2), ("C4", 1), ("D4", 1), ("Eb4", 1), ("D4", 1), ("C4", 4)]
    b = 0
    for _ in range(2):
        b = s.line(brass, b, mel, 90)
    return s, 64


def elegy():
    s = Song(60)
    strings, choir, bass, timp = s.track("strings", GM["slowstrings"], 0, 92), s.track("choir", GM["choir"], 1, 70), s.track("bass", GM["bass"], 2, 88), s.track("timp", GM["timp"], 3, 70)
    prog = [("D", "m"), ("Bb", "M"), ("G", "m"), ("A", "M")] * 4
    for i, (r, k) in enumerate(prog):
        b = i * 4
        s.chord(strings, b, 4, [q + 12 for q in triad(r, k, 3)], 60)
        s.chord(choir, b, 4, triad(r, k, 3), 46)
        s.note(bass, b, 4, triad(r, k, 2)[0], 66)
        if i % 4 == 0:
            s.note(timp, b, 2, p("D2"), 70)
    return s, 64


def space():
    s = Song(90)
    cel, pad, glock = s.track("cel", GM["celesta"], 0, 96), s.track("pad", GM["synthstrings"], 1, 80), s.track("glock", GM["glock"], 2, 70)
    prog = [("E", "M"), ("C#", "m"), ("A", "M"), ("B", "M")] * 4
    for i, (r, k) in enumerate(prog):
        b = i * 4
        ch = triad(r, k, 4)
        s.chord(pad, b, 4, triad(r, k, 3), 56)
        for j, q in enumerate([ch[0], ch[1], ch[2], ch[0] + 12, ch[2], ch[1], ch[2], ch[0] + 12]):
            s.note(cel, b + j * 0.5, 0.5, q, 64)
        if i % 2:
            s.note(glock, b + 3, 1, ch[2] + 12, 60)
    return s, 64


def modern():
    s = Song(100)
    pad, ep, bass, drum = s.track("pad", GM["pad"], 0, 84), s.track("ep", GM["epiano"], 1, 86), s.track("bass", GM["bass"], 2, 84), s.track("drum", 0, 9, 60)
    prog = [("F", "m"), ("Db", "M"), ("Ab", "M"), ("Eb", "M")] * 4
    for i, (r, k) in enumerate(prog):
        b = i * 4
        ch = triad(r, k, 4)
        s.chord(pad, b, 4, triad(r, k, 3), 54)
        s.note(bass, b, 1.5, triad(r, k, 2)[0], 72); s.note(bass, b + 2, 1.5, triad(r, k, 2)[0], 64)
        for j in range(8):
            s.note(ep, b + j * 0.5, 0.3, ch[(j * 2) % 3], 50 + (j % 2) * 10)
        for j in range(4):
            s.note(drum, b + j, 0.2, 36 if j % 2 == 0 else 42, 64 if j % 2 == 0 else 40)
    return s, 64


CUES = {"saga": saga, "chronicle": chronicle, "empire": empire, "napoleon": napoleon, "soviet": soviet, "elegy": elegy, "space": space, "modern": modern,
        "finale": lambda: empire(150, "clarinet", full=True)}

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for name, fn in CUES.items():
        song, beats = fn()
        mid = os.path.join(OUT, f"{name}.mid")
        song.save(mid)
        raw = os.path.join(OUT, f"{name}.raw.wav")
        subprocess.run(["fluidsynth", "-ni", "-g", "0.7", "-r", "44100", "-F", raw, SF2, mid], check=True, capture_output=True)
        loop = beats * 60 / song.bpm  # cut exactly at the loop point, keep a short tail for the crossfade
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-t", f"{loop + 0.05:.3f}", "-af", "loudnorm=I=-20:TP=-2:LRA=9", "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "192k", os.path.join(OUT, f"{name}.mp3")], check=True)
        os.remove(raw); os.remove(mid)
        print(name, f"{loop:.1f}s loop")
