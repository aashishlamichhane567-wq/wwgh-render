# Kaggle GPU job: animate AttnHybrid stills with WanGP (Wan 2.2 TI2V 5B FastWan).
# Setup follows github.com/Square-Zero-Labs/Wan2GP-on-Kaggle; generation uses WanGP's headless --process.
# push.sh rewrites KEYS before each push. Clips land in /kaggle/working/clips/<key>.mp4.
import json, os, shutil, subprocess, sys, urllib.request
from pathlib import Path

KEYS = ["e"]
FRAMES = 97            # 4 s at 24 fps
RES = "1280x720"
RAW = "https://raw.githubusercontent.com/aashishlamichhane567-wq/wwgh-render/claude/disc-hook-test"
STYLE = ", 2D cel-shaded cartoon animation, consistent clean line art and colours, smooth natural motion, static camera"

WORK = Path("/kaggle/working"); DATA = Path("/tmp/wgp-data"); ROOT = Path("/tmp/Wan2GP")
CLIPS = WORK / "clips"; OUT = DATA / "outputs"; STILLS = DATA / "stills"
for d in (CLIPS, OUT, STILLS, DATA / "ckpts", DATA / "loras", DATA / "cache"): d.mkdir(parents=True, exist_ok=True)

def sh(cmd, **kw):
    print("+", " ".join(map(str, cmd)), flush=True)
    subprocess.run(cmd, check=True, **kw)

sh(["nvidia-smi"])
env = os.environ.copy()
env.update(DEBIAN_FRONTEND="noninteractive", PIP_NO_CACHE_DIR="1", HF_HOME=str(DATA / "cache/hf"),
           TORCH_HOME=str(DATA / "cache/torch"), XDG_CACHE_HOME=str(DATA / "cache/xdg"), WAN_CACHE_DIR=str(DATA / "cache"))

if not ROOT.exists():
    sh(["git", "clone", "--depth", "1", "https://github.com/deepbeepmeep/Wan2GP.git", str(ROOT)])
for name in ("ckpts", "loras"):
    p = ROOT / name
    if not p.is_symlink():
        shutil.rmtree(p, ignore_errors=True); p.symlink_to(DATA / name, target_is_directory=True)
sh(["apt-get", "update", "-qq"], env=env)
sh(["apt-get", "install", "-y", "-qq", "--no-install-recommends", "ffmpeg", "libglib2.0-0", "libgl1", "libportaudio2"], env=env)

# Keep Kaggle's CUDA torch; install the rest of WanGP's requirements around it.
import torch, importlib
pins = [f"torch=={torch.__version__.split('+')[0]}"]
for n in ("torchvision", "torchaudio"):
    try: pins.append(f"{n}=={importlib.import_module(n).__version__.split('+')[0]}")
    except Exception: pass
(DATA / "pins.txt").write_text("\n".join(pins) + "\n")
sh([sys.executable, "-m", "pip", "install", "-q", "--upgrade-strategy", "only-if-needed",
    "-r", str(ROOT / "requirements.txt"), "-c", str(DATA / "pins.txt")], env=env)

# Headless fixes from the Kaggle notebook: Agg backend, and -vsync 0 when ffmpeg lacks -fps_mode.
t = ROOT / "preprocessing/matanyone/tools/interact_tools.py"
if t.exists(): t.write_text(t.read_text().replace("matplotlib.use('TkAgg')", "matplotlib.use('Agg')"))
helptext = subprocess.run(["ffmpeg", "-hide_banner", "-h", "full"], capture_output=True, text=True)
if "-fps_mode" not in helptext.stdout + helptext.stderr:
    t = ROOT / "shared/utils/video_decode.py"
    if t.exists(): t.write_text(t.read_text().replace('cmd += ["-fps_mode", "passthrough", "-frames:v",', 'cmd += ["-vsync", "0", "-frames:v",'))

from PIL import Image
motion = json.loads(urllib.request.urlopen(f"{RAW}/episodes/attn/animate/motion.json").read())
jobs = []
for k in KEYS:
    webp = STILLS / f"{k}.webp"
    urllib.request.urlretrieve(f"{RAW}/public/hybrid/{k}.webp", webp)
    png = STILLS / f"{k}.png"
    Image.open(webp).convert("RGB").resize((1280, 720), Image.LANCZOS).save(png)
    jobs.append({"model_type": "ti2v_2_2_fastwan", "prompt": motion[k] + STYLE, "image_start": str(png),
                 "image_prompt_type": "S", "resolution": RES, "video_length": FRAMES, "seed": 7,
                 "output_filename": k})
(DATA / "jobs.json").write_text(json.dumps(jobs, indent=1))

subprocess.run([sys.executable, "-u", "wgp.py", "--process", str(DATA / "jobs.json"), "--output-dir", str(OUT),
                "--profile", "5", "--verbose", "1"], cwd=ROOT, env=env)

# Map outputs back to shot keys: by name first, then by queue order for anything left.
vids = sorted(OUT.rglob("*.mp4"), key=lambda p: p.stat().st_mtime)
left = [k for k in KEYS]
for v in list(vids):
    k = next((k for k in left if v.stem == k or v.stem.startswith(k + "_") or v.stem.startswith(k + ".")), None)
    if k: shutil.copy(v, CLIPS / f"{k}.mp4"); left.remove(k); vids.remove(v)
for k, v in zip(left[:], vids):
    shutil.copy(v, CLIPS / f"{k}.mp4"); left.remove(k)
print("CLIPS:", sorted(p.name for p in CLIPS.iterdir()), "MISSING:", left, flush=True)
