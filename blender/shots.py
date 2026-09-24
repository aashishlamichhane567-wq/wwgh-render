"""Blender shots for "Why Animals Get Drunk Too" (wwgh): the two things nobody can film.

    blender -b -P blender/shots.py -- enzyme out/3d/enzyme            # full shot -> out/3d/enzyme/0001.png ...
    blender -b -P blender/shots.py -- brain  out/3d/brain --preview 110,309   # a few low-res frames to check

enzyme: Carrigan et al. 2015. An ape gut enzyme; one piece swaps (the A294V mutation) and it starts processing the
        alcohol molecules drifting in about 40x faster.
brain:  Berridge & Robinson. Small "liking" hotspots stay the same while the dopamine "wanting" pathway grows brighter
        and thicker with every dose.
Beat frames come from blender/beats.json (made from src/Wwgh/timing.ts), so the animation lands on the spoken words.
Renders on CPU Cycles at 1280x720 (Remotion scales it up); the page colour matches the video's paper.
"""
import json
import math
import os
import random
import sys

import bpy
from mathutils import Vector

ARGS = sys.argv[sys.argv.index("--") + 1:]
SHOT, OUT = ARGS[0], ARGS[1]
PREVIEW = [int(x) for x in ARGS[ARGS.index("--preview") + 1].split(",")] if "--preview" in ARGS else None
B = json.load(open(os.path.join(os.path.dirname(__file__), "beats.json")))[SHOT]
L = B["len"]

PAPER, INK, TEAL, AMBER, RED = "#F6F1E7", "#1A1714", "#159A8C", "#F0A018", "#E0342B"


def lin(h):
    """sRGB hex -> linear RGBA."""
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c] + [1]


def material(name, color, emit=0.0, alpha=1.0, rough=0.45):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = lin(color)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Emission Color"].default_value = lin(color)
    p.inputs["Emission Strength"].default_value = emit
    p.inputs["Alpha"].default_value = alpha
    return m


def key(sock, frame, value):
    sock.default_value = value
    sock.keyframe_insert("default_value", frame=frame)


def sphere(name, loc, r, mat, parent=None, seg=24):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=seg, ring_count=seg // 2)
    o = bpy.context.object
    o.name = name
    bpy.ops.object.shade_smooth()
    o.data.materials.append(mat)
    if parent:
        o.parent = parent
    return o


def setup(cam_from, cam_to):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.render.engine = "CYCLES"
    s.cycles.device = "CPU"
    s.cycles.samples = 8 if PREVIEW else 24
    s.cycles.use_denoising = True
    s.render.resolution_x, s.render.resolution_y = (640, 360) if PREVIEW else (1280, 720)
    s.render.fps = 30
    s.frame_start, s.frame_end = 1, L
    s.render.image_settings.file_format = "PNG"
    s.view_settings.view_transform = "Standard"
    s.render.use_freestyle = True  # ink outlines, so the 3D sits in the stick-figure world
    s.render.line_thickness_mode = "ABSOLUTE"
    s.render.line_thickness = 1.6 if PREVIEW else 2.6
    s.view_layers[0].use_freestyle = True
    lset = s.view_layers[0].freestyle_settings.linesets.new("ink")
    lset.linestyle = lset.linestyle or bpy.data.linestyles.new("ink")
    lset.select_by_visibility, lset.select_by_edge_types = True, True
    lset.select_silhouette, lset.select_border, lset.select_crease = True, True, False
    lset.linestyle.color = lin(INK)[:3]
    labels = bpy.data.collections.new("labels")  # text stays clean: no outlines on the lettering
    s.collection.children.link(labels)
    lset.select_by_collection, lset.collection, lset.collection_negation = True, labels, "EXCLUSIVE"
    w = bpy.data.worlds.new("paper")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = lin(PAPER)
    w.node_tree.nodes["Background"].inputs["Strength"].default_value = 1.0
    s.world = w
    bpy.ops.object.light_add(type="AREA", location=(-3, -5, 5))
    bpy.context.object.data.energy = 900
    bpy.context.object.data.size = 5
    bpy.context.object.rotation_euler = (math.radians(50), 0, math.radians(-30))
    bpy.ops.object.light_add(type="AREA", location=(4, -3, -1))
    bpy.context.object.data.energy = 250
    bpy.context.object.data.size = 4
    bpy.context.object.rotation_euler = (math.radians(100), 0, math.radians(50))
    bpy.ops.object.camera_add(location=cam_from)
    cam = bpy.context.object
    s.camera = cam
    cam.data.lens = 50
    target = bpy.data.objects.new("target", None)
    s.collection.objects.link(target)
    c = cam.constraints.new("TRACK_TO")
    c.target, c.track_axis, c.up_axis = target, "TRACK_NEGATIVE_Z", "UP_Y"
    cam.location = cam_from
    cam.keyframe_insert("location", frame=1)
    cam.location = cam_to
    cam.keyframe_insert("location", frame=L)
    return s, target


def text(body, loc, size, mat, show_at):
    bpy.ops.object.text_add(location=loc, rotation=(math.radians(90), 0, 0))
    t = bpy.context.object
    t.data.body = body
    t.data.size = size
    t.data.align_x = "CENTER"
    t.data.extrude = 0.02
    t.data.materials.append(mat)
    for c in list(t.users_collection):
        c.objects.unlink(t)
    bpy.data.collections["labels"].objects.link(t)
    t.scale = (0, 0, 0)
    t.keyframe_insert("scale", frame=max(1, show_at - 1))
    t.scale = (1, 1, 1)
    t.keyframe_insert("scale", frame=show_at + 8)
    return t


# ─────────────── enzyme ───────────────

def enzyme():
    s, _ = setup((0, -7.6, 0.7), (0, -7.0, 0.45))
    random.seed(3)
    body = bpy.data.objects.new("enzyme", None)
    s.collection.objects.link(body)
    teal = material("teal", TEAL, rough=0.35)
    n = 52
    for i in range(n):  # a lumpy protein-like blob of spheres (fibonacci points with noise)
        y = 1 - 2 * (i + 0.5) / n
        r, th = math.sqrt(1 - y * y), math.pi * (3 - math.sqrt(5)) * i
        d = 1.25 * (1 + random.uniform(-0.12, 0.12))
        sphere(f"res{i}", (math.cos(th) * r * d, y * d, math.sin(th) * r * d * 0.85), random.uniform(0.3, 0.44), teal, body, 16)
    site = material("site", "#9A948B", rough=0.3)
    ps = site.node_tree.nodes["Principled BSDF"]
    SITE = Vector((0.35, -1.3, 0.25))
    sphere("site", SITE, 0.4, site, body)
    SW = B["mutation"]
    key(ps.inputs["Base Color"], SW, lin("#9A948B"))
    key(ps.inputs["Base Color"], SW + 6, lin(AMBER))
    key(ps.inputs["Emission Strength"], SW, 0.0)
    key(ps.inputs["Emission Strength"], SW + 3, 5.0)
    key(ps.inputs["Emission Strength"], SW + 16, 0.8)
    ps.inputs["Emission Color"].default_value = lin(AMBER)
    FAST = B["forty"]
    for f in range(1, L + 1, 3):  # slow sway, then a busy shiver once it is fast
        k = 0.25 if f < FAST else 1.0
        body.rotation_euler = (0.08 * math.sin(f / 40) * k, 0, math.radians(18) * math.sin(f / 60) + 0.05 * math.sin(f / 5) * (k - 0.25))
        body.keyframe_insert("rotation_euler", frame=f)
    amber, red = material("carbon", AMBER, emit=0.2), material("oxygen", RED, emit=0.1)
    spawns = [(f, 46) for f in range(8, FAST, 52)] + [(f, 14) for f in range(FAST, L - 14, 3)]
    for i, (t0, travel) in enumerate(spawns):  # ethanol: two carbons and an oxygen, drifting into the site
        m = bpy.data.objects.new(f"ethanol{i}", None)
        s.collection.objects.link(m)
        for j, (off, mat, r) in enumerate([((-0.13, 0, 0), amber, 0.12), ((0.1, 0, 0.06), amber, 0.12), ((0.25, 0, -0.04), red, 0.1)]):
            sphere(f"e{i}_{j}", off, r, mat, m, 12)
        a = random.uniform(-2.4, -0.7)
        start = Vector((4.2 * math.cos(a) + 1.5, 4.2 * math.sin(a) * 0.8, random.uniform(-1.4, 1.8)))
        m.location, m.scale = start, (0, 0, 0)
        m.keyframe_insert("location", frame=t0)
        m.keyframe_insert("scale", frame=t0)
        m.scale = (1, 1, 1)
        m.keyframe_insert("scale", frame=t0 + 5)
        m.location = SITE + Vector((0.2, -0.3, 0))
        m.keyframe_insert("location", frame=t0 + travel)
        m.keyframe_insert("scale", frame=t0 + travel)
        m.scale = (0, 0, 0)
        m.keyframe_insert("scale", frame=t0 + travel + 3)
    return s


# ─────────────── brain ───────────────

def bez(p0, p1, p2, t):
    return (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t * t * p2


def brain():
    s, target = setup((0.3, -10.0, 0.3), (0.35, -9.1, 0.1))
    target.location = (0.3, 0, -0.25)
    tissue = material("tissue", "#D99A94", alpha=0.26, rough=0.5)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.6, location=(0, 0, 0.35), segments=48, ring_count=24)
    cortex = bpy.context.object
    cortex.scale = (1.3, 1.0, 0.85)
    bpy.ops.object.shade_smooth()
    cortex.data.materials.append(tissue)
    sphere("cerebellum", (-1.55, 0, -0.75), 0.62, tissue)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.3, depth=1.4, location=(-0.75, 0, -1.2), rotation=(0, math.radians(18), 0))
    bpy.context.object.data.materials.append(tissue)
    # the wanting pathway: VTA (midbrain) arching forward to the nucleus accumbens
    P0, P1, P2 = Vector((-0.55, 0, -0.65)), Vector((0.15, 0, -0.95)), Vector((0.95, 0, -0.15))
    cd = bpy.data.curves.new("wanting", "CURVE")
    cd.dimensions = "3D"
    sp = cd.splines.new("BEZIER")
    sp.bezier_points.add(1)
    for bp, co, h in zip(sp.bezier_points, (P0, P2), ((P1 - P0) * 0.66, (P2 - P1) * 0.66)):
        bp.co, bp.handle_left, bp.handle_right = co, co - h, co + h
    path = bpy.data.objects.new("wanting", cd)
    s.collection.objects.link(path)
    want = material("wantmat", AMBER, emit=0.0)
    cd.materials.append(want)
    pw = want.node_tree.nodes["Principled BSDF"]
    W0, doses = B["wanting"], B["doses"]
    cd.bevel_depth = 0.0
    cd.keyframe_insert("bevel_depth", frame=max(1, W0 - 1))
    cd.bevel_depth = 0.035
    cd.keyframe_insert("bevel_depth", frame=W0 + 10)
    key(pw.inputs["Emission Strength"], W0, 0.0)
    key(pw.inputs["Emission Strength"], W0 + 10, 1.0)
    for k, d in enumerate(doses):  # every dose: a flash, then a brighter, thicker resting glow
        key(pw.inputs["Emission Strength"], d, 1.0 + 1.2 * k)
        key(pw.inputs["Emission Strength"], d + 3, 8.0 + k)
        key(pw.inputs["Emission Strength"], d + 12, 1.0 + 1.2 * (k + 1))
        cd.bevel_depth = 0.035 + 0.012 * k
        cd.keyframe_insert("bevel_depth", frame=d)
        cd.bevel_depth = 0.035 + 0.012 * (k + 1)
        cd.keyframe_insert("bevel_depth", frame=d + 8)
    # liking: three small hotspots that light once and then stay exactly the same
    like = material("likemat", TEAL, emit=0.0)
    pl = like.node_tree.nodes["Principled BSDF"]
    for i, loc in enumerate([(1.05, -0.15, -0.02), (0.72, -0.12, -0.38), (1.22, -0.1, -0.3)]):
        sphere(f"hot{i}", loc, 0.09, like)
    key(pl.inputs["Emission Strength"], B["liking"], 0.0)
    key(pl.inputs["Emission Strength"], B["liking"] + 6, 4.0)
    key(pl.inputs["Emission Strength"], B["liking"] + 20, 1.0)
    key(pl.inputs["Emission Strength"], B["flat"], 1.0)
    key(pl.inputs["Emission Strength"], B["flat"] + 20, 0.7)
    # dopamine: particles running along the pathway, more and faster with each dose
    dop = material("dopamine", AMBER, emit=2.0)
    D0 = B["dopamine"]
    for i in range(16):
        o = sphere(f"da{i}", P0, 0.045, dop, None, 10)
        o.scale = (0, 0, 0)
        o.keyframe_insert("scale", frame=1)
        o.keyframe_insert("scale", frame=max(2, D0 - 1))
        for f in range(D0, L + 1, 2):
            k = sum(f >= d for d in doses)
            active = i < 6 + 2 * k
            speed = 0.012 + 0.004 * k
            t = ((f - D0) * speed + i / 16) % 1
            o.location = bez(P0, P1, P2, t) + Vector((0, -0.05, 0))
            o.scale = (1, 1, 1) if active else (0, 0, 0)
            o.keyframe_insert("location", frame=f)
            o.keyframe_insert("scale", frame=f)
    text("LIKING", (1.45, -2.3, 0.35), 0.28, material("liketxt", TEAL, emit=0.3), B["liking"])
    text("WANTING", (0.35, -2.3, -1.05), 0.28, material("wanttxt", "#C77F06", emit=0.3), W0)
    return s


s = {"enzyme": enzyme, "brain": brain}[SHOT]()
os.makedirs(OUT, exist_ok=True)
for f in PREVIEW or []:
    s.frame_set(f)
    s.render.filepath = os.path.join(os.path.abspath(OUT), f"preview_{f:04d}.png")
    bpy.ops.render.render(write_still=True)
if not PREVIEW:
    s.render.filepath = os.path.join(os.path.abspath(OUT), "")
    bpy.ops.render.render(animation=True)
