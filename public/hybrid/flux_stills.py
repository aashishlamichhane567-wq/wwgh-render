import sys, shutil, os
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from gradio_client import Client
tok = (Path.home()/".claude"/"hf_token.txt").read_text().strip()
STYLE = ("2D animated film still, flat cel-shaded illustration, bold clean ink outlines, painterly gradients, "
         "cinematic composition, night, deep navy and teal palette with one warm amber lamp light, cool blue phone-screen glow, "
         "high-end animated explainer style, no text, no letters, no watermark")
GUY = "a young man in his twenties with short messy black hair and a teal hoodie"
SHOTS = {
 "a": f"extreme close-up over-the-shoulder of two hands holding a glowing smartphone sideways in a dark living room, the screen shows a sunset video, bokeh lamp lights behind, {STYLE}",
 "b": f"medium shot of {GUY} slumped on a cozy sofa in a dark living room at night, holding a phone, shrugging with a bored half-smile, table lamp, plants, bookshelf, {STYLE}",
 "c": f"wide shot of a tall apartment building facade at night seen from the street, dozens of lit windows, in each window a tiny person staring at a phone, some looking away bored, {STYLE}",
 "d": f"wide surreal shot of a long glowing red line stretching across a dark void like a tightrope, a crowd of tiny people walking along it, most of them falling off the edge early into darkness, {STYLE}",
 "e": f"close-up portrait of {GUY} lit by blue phone glow in a dark room, eyes lifting from the phone to look straight at the viewer, slight knowing smile, amber lamp rim light, {STYLE}",
}
def go(k):
    if os.path.exists(f"{k}.webp"): return f"{k} exists"
    for attempt in range(2):
        try:
            r = Client("black-forest-labs/FLUX.1-schnell", token=tok, verbose=False).predict(prompt=SHOTS[k], seed=0, randomize_seed=True, width=1024, height=576, num_inference_steps=4, api_name="/infer")
            shutil.copy(r[0], f"{k}.webp"); return f"{k} ok seed {r[1]}"
        except Exception as e: err = e
    return f"{k} FAIL {err}"
with ThreadPoolExecutor(1) as ex:
    for line in ex.map(go, sys.argv[1:] or SHOTS): print(line, flush=True)
