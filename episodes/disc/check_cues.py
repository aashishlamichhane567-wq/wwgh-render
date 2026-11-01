"""Lists every W("word", n) cue in src/Disc/scenes*.tsx and flags missing words and ambiguous ones (word occurs
more than once in its scene), so a cue never silently lands on the wrong occurrence."""
import glob, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from make_vo import parse, tokens, norm

scenes = {k: [norm(sh) for l in ls if l for sh, _ in tokens(l)] for k, ls in parse().items()}
root = os.path.join(os.path.dirname(__file__), "..", "..", "src", "Disc")
bad = 0
for path in sorted(glob.glob(os.path.join(root, "scenes*.tsx"))):
    src = open(path).read()
    parts = re.split(r'useW\("(\w+)"\)', src)
    for i in range(1, len(parts), 2):
        key, body = parts[i], parts[i + 1]
        toks = scenes.get(key)
        if toks is None:
            print(f"{key}: no such scene"); bad += 1; continue
        for word, n in re.findall(r'\bW\("([^"]+)"(?:,\s*(\d+))?\)', body):
            n = int(n or 0); wn = norm(word); count = toks.count(wn)
            if count <= n:
                print(f"MISSING {key}: {word!r} #{n} (occurs {count}x)"); bad += 1
            elif count > 1:
                idx = [j for j, t in enumerate(toks) if t == wn][n]
                ctx = " ".join(toks[max(0, idx - 3): idx + 4])
                print(f"ambiguous {key}: {word!r} #{n} of {count} -> ...{ctx}...")
print("problems:", bad)
