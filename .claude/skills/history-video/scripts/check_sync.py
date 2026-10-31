"""check_sync.py <slug> <Name>: caption/voice sync report. For every scene: where the first caption lands (must be ~0 s
after the lead) and how many caption words start where the narration is silent (should be a handful, all soft onsets).
Run from the repo root with any Python that has numpy + soundfile."""
import json, re, sys
import numpy as np, soundfile as sf

slug, name = sys.argv[1], sys.argv[2]
src = open(f"src/{name}/timing.ts").read()
sc = {k: int(l) for k, s, d, l in re.findall(r'"(\w+)": \{ "start": (\d+), "dur": (\d+), "lead": (\d+)', src)}
caps = json.loads(re.search(r"CAPS: Record<string, \[number, number, string\]\[\]> = (\{.*\});", src).group(1))
tot = bad = 0
for k, lead in sc.items():
    a, sr = sf.read(f"public/vo_{slug}/{k}.wav", dtype="float32")
    hop = sr // 100
    e = np.array([np.sqrt(np.mean(a[i:i + hop] ** 2)) for i in range(0, len(a) - hop, hop)])
    on = e > e.max() * 0.03
    miss = []
    for s, _, t in caps[k]:
        i = int((s - lead) / 30 * 100); tot += 1
        if not on[max(0, i - 8):i + 8].any():
            miss.append(t)
    bad += len(miss)
    first = (caps[k][0][0] - lead) / 30
    flag = "  <-- FIRST CAPTION LATE: re-run timing" if first > 0.5 else ""
    print(f"{k:12} first caption {first:5.2f}s  words in silence {len(miss):2d} {miss[:5]}{flag}")
print(f"total words {tot}, starting in silence {bad} ({100 * bad / tot:.1f}%)")
