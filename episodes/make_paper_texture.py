"""Paper grain + fibre texture (greyscale PNG with alpha) multiplied over every paper frame: drawn once, so no per-frame SVG noise filters."""
import os, numpy as np
from PIL import Image, ImageFilter

rng = np.random.default_rng(7)
W, H = 1920, 1080
def blur_noise(scale, sigma):
    n = rng.random((H // scale + 2, W // scale + 2)).astype(np.float32)
    im = Image.fromarray((n * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(sigma))
    return np.asarray(im, dtype=np.float32) / 255
grain = rng.random((H, W)).astype(np.float32)
mottle = blur_noise(40, 18)
fib = np.asarray(Image.fromarray((rng.random((H // 3, W // 40)) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.2)), dtype=np.float32) / 255
dark = 0.55 * grain * 0.25 + 0.35 * mottle + 0.25 * fib
alpha = np.clip((dark - dark.mean()) * 1.6 + 0.18, 0, 1)
rgba = np.zeros((H, W, 4), np.uint8)
rgba[..., 0], rgba[..., 1], rgba[..., 2] = 92, 70, 44
rgba[..., 3] = (alpha * 255).astype(np.uint8)
out = os.path.join(os.path.dirname(__file__), "..", "public", "tex", "paper.png")
Image.fromarray(rgba, "RGBA").save(out, optimize=True)
print(out, os.path.getsize(out))
