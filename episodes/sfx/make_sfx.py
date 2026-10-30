"""Sound effects synthesised from scratch (noise, oscillators, envelopes): no samples, nothing to license.

  python make_sfx.py      -> public/sfx/<name>.wav  (44.1 kHz mono, peak -3 dBFS)

Each effect is a short function of numpy arrays; src/Russia/sound.tsx places them on the timeline.
"""
import os
import numpy as np
from scipy import signal

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "sfx")
rng = np.random.default_rng(1862)


def t_(d):
    return np.arange(int(SR * d)) / SR


def noise(d):
    return rng.standard_normal(int(SR * d))


def env(d, a=0.005, decay=0.3, shape=1.0):
    t = t_(d)
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / decay) ** shape


def bp(x, lo, hi, order=2):
    return signal.sosfilt(signal.butter(order, [lo, hi], "bandpass", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, "lowpass", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, "highpass", fs=SR, output="sos"), x)


def sweep_bp(x, f0, f1, q=2.0, block=256):
    """Band-pass whose centre glides f0 -> f1 (whooshes)."""
    out = np.zeros_like(x)
    n = len(x)
    zi = None
    for i in range(0, n, block):
        fc = f0 * (f1 / f0) ** (i / n)
        sos = signal.butter(2, [fc / (1 + 1 / q), min(fc * (1 + 1 / q), SR / 2 - 100)], "bandpass", fs=SR, output="sos")
        if zi is None:
            zi = signal.sosfilt_zi(sos) * 0
        out[i:i + block], zi = signal.sosfilt(sos, x[i:i + block], zi=zi)
    return out


def tone(freqs, d, decays, amps=None, phase_mod=0.0):
    t = t_(d)
    amps = amps or [1] * len(freqs)
    return sum(a * np.sin(2 * np.pi * f * t + phase_mod * np.sin(2 * np.pi * 3 * t)) * np.exp(-t / dc) for f, dc, a in zip(freqs, decays, amps))


def chirp(f0, f1, d, decay):
    t = t_(d)
    f = f0 * (f1 / f0) ** (t / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / decay)


def reverb(x, size=1.2, mix=0.25):
    ir_t = t_(size)
    ir = noise(size) * np.exp(-ir_t / (size / 5))
    ir = lp(ir, 6000)
    wet = signal.fftconvolve(x, ir)[: len(x) + int(SR * size * 0.6)]
    dry = np.concatenate([x, np.zeros(len(wet) - len(x))])
    wet /= np.max(np.abs(wet)) + 1e-9
    return dry * (1 - mix) + wet * mix * np.max(np.abs(x))


def pad(x, d):
    n = int(SR * d)
    return np.concatenate([x, np.zeros(max(0, n - len(x)))])[:n]


FX = {}


def fx(fn):
    FX[fn.__name__] = fn
    return fn


@fx
def whoosh():
    d = 0.55
    x = sweep_bp(noise(d), 300, 3200, q=1.5) * np.sin(np.pi * t_(d) / d) ** 2
    return x


@fx
def whoosh_low():
    d = 0.7
    return sweep_bp(noise(d), 1400, 180, q=1.4) * np.sin(np.pi * t_(d) / d) ** 1.5


@fx
def paper():
    d = 0.32
    x = hp(noise(d), 1800) * (rng.random(int(SR * d)) < 0.08) * 3 + hp(noise(d), 2500) * 0.25
    return x * env(d, 0.002, 0.09)


@fx
def tear():
    d = 0.75
    crack = (rng.random(int(SR * d)) < np.linspace(0.02, 0.18, int(SR * d))) * rng.standard_normal(int(SR * d))
    return hp(crack * 2 + noise(d) * 0.3, 1200) * np.linspace(1, 0.4, int(SR * d)) * env(d, 0.01, 0.6)


@fx
def pop():
    return chirp(900, 220, 0.16, 0.05) + hp(noise(0.16), 3000) * env(0.16, 0.001, 0.008) * 0.6


@fx
def thud():
    return chirp(110, 45, 0.45, 0.12) * 1.2 + lp(noise(0.45), 400) * env(0.45, 0.002, 0.05)


@fx
def boom():
    d = 2.2
    x = lp(noise(d), 700) * env(d, 0.004, 0.35) * 1.6 + chirp(70, 28, d, 0.6) * 1.4 + hp(noise(d), 2000) * env(d, 0.001, 0.03)
    return reverb(x, 1.6, 0.3)


@fx
def cannon():
    d = 1.8
    crack = hp(noise(d), 1500) * env(d, 0.0005, 0.015) * 2
    return reverb(crack + lp(noise(d), 500) * env(d, 0.003, 0.25) + chirp(80, 30, d, 0.4) * 1.3, 1.8, 0.35)


@fx
def gunshots():
    d = 1.4
    x = np.zeros(int(SR * d))
    for k, at in enumerate([0.0, 0.18, 0.31, 0.55, 0.62]):
        s = int(at * SR)
        shot = hp(noise(0.3), 900) * env(0.3, 0.0005, 0.02 + 0.01 * k) + lp(noise(0.3), 300) * env(0.3, 0.001, 0.06)
        x[s:s + len(shot)] += shot[: len(x) - s] * (0.9 - 0.1 * k)
    return reverb(x, 1.4, 0.35)


@fx
def coin():
    d = 0.8
    x = pad(tone([2093, 3136, 4699, 6272], 0.5, [0.25, 0.15, 0.1, 0.06], [1, 0.6, 0.4, 0.2]), d)
    x2 = np.roll(pad(tone([2349, 3520, 5274], 0.4, [0.2, 0.12, 0.08], [0.8, 0.5, 0.3]), d), int(0.09 * SR))
    return x + x2 * 0.8


@fx
def coins():
    d = 1.4
    x = np.zeros(int(SR * d))
    for k in range(9):
        s = int(rng.random() * 1.0 * SR)
        f = 1800 + rng.random() * 1600
        c = tone([f, f * 1.51, f * 2.27], 0.35, [0.15, 0.09, 0.05], [1, 0.5, 0.3])
        x[s:s + len(c)] += c[: len(x) - s] * (0.5 + 0.5 * rng.random())
    return x


@fx
def bell():
    d = 4.0
    f = 196
    return reverb(tone([f * 0.5, f, f * 1.19, f * 1.5, f * 2.0, f * 2.52, f * 3.0], d, [2.4, 1.8, 1.4, 1.1, 0.8, 0.5, 0.4], [0.6, 1, 0.7, 0.5, 0.4, 0.3, 0.2]), 2.0, 0.3)


@fx
def ding():
    return reverb(tone([1318, 2637, 3951], 1.2, [0.5, 0.3, 0.2], [1, 0.4, 0.2]), 0.8, 0.2)


@fx
def tick():
    return hp(noise(0.05), 3000) * env(0.05, 0.0005, 0.004) + tone([4200], 0.05, [0.006])


@fx
def clock():
    d = 2.0
    x = np.zeros(int(SR * d))
    c = tick()
    for k in range(8):
        s = int(k * 0.25 * SR)
        x[s:s + len(c)] += c * (1 if k % 2 == 0 else 0.6)
    return x


@fx
def snip():
    x = np.zeros(int(SR * 0.35))
    for at in [0.0, 0.12]:
        s = int(at * SR)
        c = hp(noise(0.06), 2500) * env(0.06, 0.0005, 0.006) + tone([5200, 7400], 0.06, [0.01, 0.006])
        x[s:s + len(c)] += c
    return x


@fx
def clang():
    return reverb(tone([523, 1240, 1890, 2770, 3410], 1.4, [0.6, 0.4, 0.3, 0.2, 0.15], [1, 0.8, 0.6, 0.5, 0.3]) + hp(noise(1.4), 2000) * env(1.4, 0.0005, 0.01), 1.0, 0.25)


@fx
def splash():
    d = 1.2
    x = bp(noise(d), 400, 5000) * env(d, 0.003, 0.18)
    for k in range(10):
        s = int((0.15 + rng.random() * 0.7) * SR)
        drop = chirp(1200 + rng.random() * 1500, 400, 0.08, 0.03) * 0.3
        x[s:s + len(drop)] += drop[: len(x) - s]
    return x


@fx
def waves():
    d = 6.0
    t = t_(d)
    swell = 0.5 + 0.5 * np.sin(2 * np.pi * t / 3 - np.pi / 2)
    return lp(noise(d), 900) * (0.25 + 0.75 * swell ** 2) + hp(lp(noise(d), 4000), 1500) * swell ** 4 * 0.3


@fx
def wind():
    d = 6.0
    t = t_(d)
    return sweep_bp(noise(d), 300, 600, q=3) * (0.6 + 0.4 * np.sin(2 * np.pi * t / 2.7)) + bp(noise(d), 900, 1500) * 0.1


@fx
def train():
    d = 4.0
    x = np.zeros(int(SR * d))
    for k in range(int(d / 0.25)):
        s = int(k * 0.25 * SR)
        ch = bp(noise(0.2), 200, 2500) * env(0.2, 0.004, 0.06) * (1 if k % 2 == 0 else 0.6)
        x[s:s + len(ch)] += ch[: len(x) - s]
    wh = (np.sin(2 * np.pi * 740 * t_(1.2)) + 0.6 * np.sin(2 * np.pi * 880 * t_(1.2))) * np.sin(np.pi * t_(1.2) / 1.2) * 0.35
    x[int(2.4 * SR): int(2.4 * SR) + len(wh)] += wh
    return x


@fx
def rocket():
    d = 5.0
    t = t_(d)
    u = t / d  # the roar brightens as the rocket climbs
    roar = lp(noise(d), 350) * (1 - u) + lp(noise(d), 1600) * u
    return roar * np.minimum(1, t / 1.5) * (1 - np.maximum(0, t - 4)) + chirp(40, 90, d, 6) * 0.8 * np.minimum(1, t / 2)


@fx
def beep():
    d = 1.6
    x = np.zeros(int(SR * d))
    b = np.sin(2 * np.pi * 1000 * t_(0.12)) * 0.6
    for at in [0.0, 0.4, 0.8, 1.2]:
        s = int(at * SR)
        x[s:s + len(b)] += b
    return x


@fx
def sting():
    """Low dramatic hit for dark beats."""
    d = 3.0
    return reverb(chirp(55, 48, d, 1.2) * 1.4 + lp(noise(d), 200) * env(d, 0.02, 0.6) + tone([110, 165], d, [0.9, 0.7], [0.4, 0.3]), 2.0, 0.4)


@fx
def boing():
    t = t_(0.7)
    f = 220 * (1 + 0.5 * np.sin(2 * np.pi * 9 * t) * np.exp(-t / 0.25))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.25)


@fx
def drumroll():
    d = 1.6
    x = np.zeros(int(SR * d))
    for k in range(int(d / 0.045)):
        s = int(k * 0.045 * SR)
        hit = bp(noise(0.08), 900, 6000) * env(0.08, 0.001, 0.02) * (0.4 + 0.6 * k * 0.045 / d)
        x[s:s + len(hit)] += hit[: len(x) - s]
    return x


@fx
def crowd():
    """Cheering crowd: many short formant-filtered noise 'voices' plus applause clicks."""
    d = 3.0
    x = np.zeros(int(SR * d))
    for k in range(40):
        s = int(rng.random() * 2.2 * SR)
        f = 350 + rng.random() * 600
        v = bp(noise(0.6), f, f * 2.2) * np.sin(np.pi * t_(0.6) / 0.6) * (0.4 + rng.random())
        x[s:s + len(v)] += v[: len(x) - s]
    claps = (rng.random(int(SR * d)) < 0.01) * rng.standard_normal(int(SR * d))
    x += hp(claps, 1000) * 1.5
    return x * np.minimum(1, (d - t_(d)) / 0.8)


@fx
def typing():
    d = 1.2
    x = np.zeros(int(SR * d))
    for k in range(10):
        s = int((k * 0.11 + rng.random() * 0.03) * SR)
        c = hp(noise(0.03), 2000) * env(0.03, 0.0005, 0.005)
        x[s:s + len(c)] += c
    return x


@fx
def sparkle():
    d = 1.2
    x = np.zeros(int(SR * d))
    for k in range(8):
        s = int(k * 0.07 * SR)
        c = tone([1568 * 2 ** (k / 12 * 2)], 0.4, [0.15])
        x[s:s + len(c)] += c[: len(x) - s] * 0.5
    return reverb(x, 1.0, 0.3)


@fx
def gulp():
    return chirp(300, 600, 0.25, 0.1) * 0.6 + chirp(250, 520, 0.25, 0.1)[::-1] * 0.3


@fx
def fire():
    d = 3.0
    crackle = (rng.random(int(SR * d)) < 0.004) * rng.standard_normal(int(SR * d)) * 3
    return lp(noise(d), 500) * 0.3 + hp(crackle, 1500)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    import soundfile as sf
    for name, fn in FX.items():
        x = np.asarray(fn(), dtype=np.float64)
        x = x / (np.max(np.abs(x)) + 1e-9) * 10 ** (-3 / 20)
        fade = min(len(x), int(0.01 * SR))
        x[-fade:] *= np.linspace(1, 0, fade)
        sf.write(os.path.join(OUT, f"{name}.wav"), x.astype(np.float32), SR, subtype="PCM_16")
    print(len(FX), "effects ->", OUT)
