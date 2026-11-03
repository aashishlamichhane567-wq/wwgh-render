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
 # math
 "m1": f"extreme close-up of a vintage brass stopwatch on a wooden desk at night, lamp light glinting, a phone glowing beside it, {STYLE}",
 "m2": f"medium shot of {GUY} sitting up straight on a sofa at night, eyebrows raised in surprise, looking at his phone, earbuds in, lamp and plants, {STYLE}",
 "m3": f"wide shot of {GUY} standing alone at a glowing finish line on an empty running track at night, small crowd of figures walking away in the distance, confetti in the air, stadium lights, {STYLE}",
 "m4": f"extreme close-up of a thumb flicking upward across a glowing phone screen with motion streaks, dark room, {STYLE}",
 # caught
 "c1": f"extreme close-up of the eyes of {GUY}, lit by blue screen glow, eyes glancing sideways guiltily, {STYLE}",
 "c2": f"over-the-shoulder medium shot of {GUY} at a desk in a dark bedroom watching a laptop, the laptop shows a video and a column of colorful thumbnails beside it, his eyes drifting to the thumbnails, {STYLE}",
 "c3": f"close-up of a thumb scrolling a phone while many small colorful speech bubbles float up off the screen into the dark, {STYLE}",
 "c4": f"wide shot of {GUY} at a desk in a dark room surrounded by dozens of floating glowing browser windows and screens, {STYLE}",
 "c5": f"medium shot of {GUY} leaning toward a huge monitor where a tiny video player sits shrunk in the corner and a big glowing empty search bar fills the screen, {STYLE}",
 # wired
 "w1": f"medium shot of {GUY} on a sofa covering his face with one hand, embarrassed, peeking through fingers, lamp light, {STYLE}",
 "w2": f"wide shot inside a crowded subway train at night, every passenger staring down at a glowing phone, {STYLE}",
 "w3": f"close-up of a glowing human brain made of neon teal wires and circuits, amber sparks firing, dark background, {STYLE}",
 "w4": f"medium shot of {GUY} on a sofa turning his head sharply toward a small glowing amber butterfly of light floating beside him, wide curious eyes, {STYLE}",
 "w5": f"wide shot of {GUY} leaping off the side of a small wooden boat into a dark ocean at night under the moon, splash, {STYLE}",
 # truth
 "t1": f"wide shot of a giant dark control room full of huge glowing screens and machinery all aimed at one tiny person sitting on a sofa in the middle, {STYLE}",
 "t2": f"close-up of an endless waterfall of glowing vertical video cards pouring down into darkness, {STYLE}",
 "t3": f"medium shot of {GUY} hopping across stepping stones made of glowing phone screens over dark water at night, {STYLE}",
 "t4": f"extreme close-up of the face of {GUY} very close to a phone, eyes glazed, the screen reflected in his pupils, blue light, {STYLE}",
 # end
 "e1": f"medium shot of {GUY} standing up from a sofa with a proud smile, putting his phone down, warm lamp light, first dawn light at the window, {STYLE}",
 "e2": f"wide shot of {GUY} walking out of a huge maze whose walls are giant glowing phone screens, triumphant, open night sky ahead, {STYLE}",
 "e3": f"close-up of {GUY} winking at the viewer with a playful grin, thumb hovering over a glowing phone, lamp rim light, {STYLE}",
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
