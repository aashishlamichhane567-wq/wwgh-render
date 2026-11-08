// Materials copied from Lemo-Opuscar styles/glass-product/demo/product.js (MIT, lemomo-ai/lemo-opuscar)
import * as THREE from 'three';
// —— Materials ——
export const AURA_A = new THREE.Color('#62dcff');   // main light-pattern colour: ice blue
export const AURA_B = new THREE.Color('#a98bff');   // peak: pale violet

export function glass(o = {}) {
  return new THREE.MeshPhysicalMaterial(Object.assign({
    color: '#ffffff', metalness: 0, roughness: .015, transmission: 1, thickness: 3, ior: 1.52,
    dispersion: 5, attenuationColor: new THREE.Color('#f3f8fb'), attenuationDistance: 160,
    specularIntensity: 1, envMapIntensity: 1.25,
  }, o));
}
export const frosted = (o = {}) => glass(Object.assign({ color: '#eef2f5', transmission: .82, roughness: .4, thickness: 7, dispersion: 1.5, envMapIntensity: 1.1 }, o));
export const metal = (color, rough, o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color, metalness: 1, roughness: rough, envMapIntensity: 1.2 }, o));

// Procedural textures (canvas)
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
// Brushed metal: fine concentric lines (driver diaphragm, battery cover)
const brushed = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
  let s = 3; const R = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 900; i++) { const r = R() * w * .7; g.strokeStyle = `rgba(${R() < .5 ? 255 : 0},${R() < .5 ? 255 : 0},${R() < .5 ? 255 : 0},${.05 + R() * .08})`; g.lineWidth = .6 + R(); g.beginPath(); g.arc(w / 2, h / 2, r, 0, 7); g.stroke(); }
}, false);
// PCB: graphite base + gold traces + pads
const pcbTex = canvasTex(1024, 1024, (g, w, h) => {
  g.fillStyle = '#15181c'; g.fillRect(0, 0, w, h);
  let s = 11; const R = () => (s = (s * 16807) % 2147483647) / 2147483647;
  g.strokeStyle = '#c9a25a'; g.lineCap = 'round';
  for (let i = 0; i < 70; i++) {
    let x = w / 2 + (R() - .5) * w * .8, y = h / 2 + (R() - .5) * h * .8; g.lineWidth = 3 + R() * 5; g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < 4; k++) { const d = 40 + R() * 160, a = Math.floor(R() * 8) * Math.PI / 4; x += Math.cos(a) * d; y += Math.sin(a) * d; g.lineTo(x, y); }
    g.stroke(); g.fillStyle = '#d8b46a'; g.beginPath(); g.arc(x, y, 7 + R() * 5, 0, 7); g.fill();
  }
  g.strokeStyle = 'rgba(201,162,90,.8)'; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, h / 2, w * .46, 0, 7); g.stroke();
});
const pcbRough = canvasTex(4, 4, (g) => { g.fillStyle = '#777'; g.fillRect(0, 0, 4, 4); }, false);

// Light-guide material: dark polished acrylic + controllable light pulses (flowing along uv.x)
// pulses: [{p, w, a, h}] p=position (0..1) w=width a=intensity h=hue mix; wrap=true means a ring joined end to end
const WHITE = canvasTex(2, 2, (g) => { g.fillStyle = '#fff'; g.fillRect(0, 0, 2, 2); });
export function guideMat(wrap) {
  const m = new THREE.MeshPhysicalMaterial({ color: '#15181b', roughness: .08, metalness: 0, clearcoat: 1, clearcoatRoughness: .05, emissive: '#ffffff', emissiveMap: WHITE, envMapIntensity: 1.4 });
  const U = { uP: { value: Array.from({ length: 8 }, () => new THREE.Vector4(0, .1, 0, 0)) }, uBase: { value: .02 }, uA: { value: AURA_A }, uB: { value: AURA_B }, uWrap: { value: wrap ? 1 : 0 } };
  m.userData.U = U;
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      uniform vec4 uP[8]; uniform float uBase, uWrap; uniform vec3 uA, uB;`)
      .replace('#include <emissivemap_fragment>', `{
        float x = vEmissiveMapUv.x; vec3 acc = uA * uBase;
        for (int i = 0; i < 8; i++) { vec4 P = uP[i]; if (P.z <= 0.) continue;
          float d = x - P.x; if (uWrap > .5) d = fract(d + .5) - .5;
          // comet-shaped pulse: sign of P.y = direction of travel; narrow Gaussian head, exponential tail behind (length = 4× width)
          float w = abs(P.y), s = sign(P.y + 1e-6), a = d * s;
          float head = exp(-a * a / (w * w * .25)), tail = a < 0. ? exp(a / (w * 4.)) * .55 : 0.;
          float k = max(head, tail);
          acc += (mix(uA, uB, P.w + (1. - head) * .25) * k + vec3(head * head * head * .35)) * P.z; }
        totalEmissiveRadiance = acc; }`);
  };
  m.customProgramCacheKey = () => 'guide' + (wrap ? 1 : 0);
  return m;
}
export function setPulses(mat, list, base = .02) {
  const U = mat.userData.U; U.uBase.value = base;
  for (let i = 0; i < 8; i++) { const p = list[i]; U.uP.value[i].set(p ? p.p : 0, p ? p.w : .1, p ? p.a : 0, p ? p.h : 0); }
}

// ——— Glass Mind (based on Glass Product Render, MIT, lemomo-ai/lemo-opuscar) ———
// A fictional glass bust: clear glass head, an opaque graphite brain inside, neural pathways as light guides.
const lathe = (pts, seg = 128) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
let seed = 7; const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// Head built from a sculpted profile: at each height a cross-section with its own width, front depth and back depth,
// plus centre-line features (brow, nose, lips, chin) that narrow toward the middle of the face
const TAB = (rows) => y => { for (let i = 0; i < rows.length - 1; i++) { const [y0, a] = rows[i], [y1, b] = rows[i + 1];
  if (y <= y0 && y >= y1) { const u = (y0 - y) / (y0 - y1); return a + (b - a) * (1 - Math.cos(u * Math.PI)) / 2; } } return 0; };
const WX0 = TAB([[6, 6.6], [4, 7.1], [0, 6.9], [-3, 6.3], [-6, 5.0], [-8.4, 3.7]]);
const ZF0 = TAB([[6, 7.3], [4, 7.9], [1, 7.5], [-2, 7.3], [-5, 6.8], [-7.5, 5.9], [-8.4, 5.0]]);
const ZB0 = TAB([[6, 8.6], [4, 9.6], [0, 9.4], [-3, 8.0], [-6, 5.6], [-8.4, 4.0]]);
// round dome above y = 6 (crown) and a short rounded underside below y = -8.4 (into the neck)
const dome = f => y => y > 6 ? f(6) * Math.sqrt(Math.max(0, 1 - ((y - 6) / 4.3) ** 2)) : y < -8.4 ? f(-8.4) * Math.sqrt(Math.max(0, 1 - ((y + 8.4) / 1.9) ** 2)) : f(y);
const WX = dome(WX0), ZF = dome(ZF0), ZB = dome(ZB0);
const gs = (y, m, s) => Math.exp(-(((y - m) / s) ** 2));
function nose(y) { if (y > 1.4 || y < -2.7) return 0; return y > -2.0 ? 3.1 * Math.pow((1.4 - y) / 3.4, 1.35) : 3.1 * (y + 2.7) / .7; }
function headGeo() {
  const g = new THREE.SphereGeometry(1, 240, 180), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const y = v.y * 10.3, rh = Math.hypot(v.x, v.z), a = Math.atan2(v.x, v.z), c = Math.cos(a);
    let x = Math.sin(a) * WX(y), z;
    if (c > 0) {
      const f = .95 * gs(y, 2.5, .8) * c ** 6 + nose(y) * c ** 26 + (1.0 * gs(y, -4.2, .5) + .8 * gs(y, -5.1, .45)) * c ** 12
              + 1.5 * gs(y, -7.0, 1.0) * c ** 6 - .9 * gs(y, .8, .8) * (Math.exp(-(((a - .42) / .2) ** 2)) + Math.exp(-(((a + .42) / .2) ** 2)));
      z = c * ZF(y) + f;
    } else z = c * ZB(y);
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals(); return g;
}
// Brain hemisphere: an ellipsoid with folded gyri (sulci = dark creases between ridges)
const BR = { rx: 3.15, ry: 4.3, rz: 7.0, cx: 3.3, cy: 3.4, cz: -.6 };
function foldAt(x, y, z) {
  const f = Math.sin(3.1 * x + 2.2 * Math.sin(1.9 * z) + 1.4 * Math.sin(1.6 * y)) * Math.sin(2.4 * z + 1.6 * Math.sin(1.8 * x + y));
  return .3 * Math.pow(Math.abs(f), .55);
}
function hemiGeo(s) {
  const g = new THREE.SphereGeometry(1, 200, 140), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    let x = v.x * BR.rx, y = v.y * BR.ry, z = v.z * BR.rz;
    if (x * s < 0) x *= .45;                         // flat medial face
    if (y < 0) y *= .72;                             // flatter underside
    y += .9 * Math.exp(-(((z + 1.5) / 2.6) ** 2)) * (v.y < 0 ? -1 : 0) * Math.max(0, x * s) / BR.rx;  // temporal lobe
    const d = foldAt(x + s * 9, y, z);
    const n = new THREE.Vector3(x / BR.rx ** 2, y / BR.ry ** 2, z / BR.rz ** 2).normalize();
    p.setXYZ(i, x + n.x * d + s * BR.cx, y + n.y * d + BR.cy, z + n.z * d + BR.cz);
  }
  g.computeVertexNormals(); return g;
}
// A pathway: a smooth random walk over the brain surface, lifted just above the folds
function pathOn(s, th0, ph0) {
  let th = th0 ?? R() * Math.PI * 2, ph = ph0 ?? .3 + R() * 2.4, dth = (R() - .5) * .25, dph = (R() - .5) * .15; const pts = [];
  for (let i = 0; i < 34; i++) {
    th += dth; ph = Math.min(2.6, Math.max(.35, ph + dph)); dth += (R() - .5) * .05; dph += (R() - .5) * .05;
    let x = Math.sin(ph) * Math.cos(th) * BR.rx, y = Math.cos(ph) * BR.ry, z = Math.sin(ph) * Math.sin(th) * BR.rz;
    if (x * s < 0) x *= .45; if (y < 0) y *= .72;
    const n = new THREE.Vector3(x / BR.rx ** 2, y / BR.ry ** 2, z / BR.rz ** 2).normalize(), k = .42;
    pts.push(new THREE.Vector3(x + n.x * k + s * BR.cx, y + n.y * k + BR.cy, z + n.z * k + BR.cz));
  }
  return new THREE.CatmullRomCurve3(pts);
}

export function makeMind() {
  const root = new THREE.Group();
  const head = new THREE.Mesh(headGeo(), glass({ thickness: 1.4, side: THREE.DoubleSide, dispersion: 3, attenuationColor: new THREE.Color('#eef6fb'), attenuationDistance: 220 }));
  root.add(head);
  const neck = new THREE.Mesh(lathe([[0, -16.5], [6.4, -16.5], [5.2, -14.8], [4.5, -11.5], [4.3, -7.5], [0, -7.5]], 128), glass({ thickness: 1.6, side: THREE.DoubleSide }));
  root.add(neck);
  // Plinth: frosted glass, glowing softly from a disc inside
  const plinth = new THREE.Mesh(lathe([[0, -21], [9.5, -21], [10, -20.4], [10, -17.1], [9.4, -16.5], [0, -16.5]], 160), frosted({ thickness: 12, side: THREE.DoubleSide, roughness: .42, transmission: .9 }));
  root.add(plinth);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(6.4, 96), new THREE.MeshBasicMaterial({ color: new THREE.Color('#dff3ff').multiplyScalar(.9) }));
  disc.rotation.x = -Math.PI / 2; disc.position.y = -20.2; root.add(disc);
  const band = new THREE.Mesh(new THREE.TorusGeometry(10.02, .26, 16, 200), metal('#d4d7db', .14)); band.rotation.x = Math.PI / 2; band.position.y = -17; root.add(band);
  // Brain: graphite satin, catches the strip lights in its folds
  const brainMat = new THREE.MeshPhysicalMaterial({ color: '#2a2f36', metalness: .55, roughness: .32, clearcoat: .7, clearcoatRoughness: .2, envMapIntensity: 1.5 });
  const brain = new THREE.Group(); [-1, 1].forEach(s => brain.add(new THREE.Mesh(hemiGeo(s), brainMat))); root.add(brain);
  // Brain stem in chrome
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.9, .6, 5, 48), metal('#c9ced4', .18)); stem.position.set(0, -.8, -2.2); stem.rotation.x = -.3; root.add(stem);
  // Neural pathways (light guides)
  const paths = [];
  for (let k = 0; k < 22; k++) { const s = k % 2 ? 1 : -1, c = pathOn(s), m = guideMat(false);
    brain.add(new THREE.Mesh(new THREE.TubeGeometry(c, 160, .1, 8), m)); paths.push({ m, ph: R(), sp: .35 + R() * .5 }); }
  // The misfire: one pathway drawn three times, a hair apart; each copy carries one channel of the light
  seed = 31; const gc = pathOn(1, -.5, 1.25), glitch = [];
  [['#ff4d6a', [.1, .32, 0]], ['#5dffa6', [0, 0, 0]], ['#6a7dff', [-.1, -.32, .1]]].forEach(([col, off]) => {
    const m = guideMat(false); m.userData.U.uA.value = new THREE.Color(col); m.userData.U.uB.value = new THREE.Color(col);
    const t = new THREE.Mesh(new THREE.TubeGeometry(gc, 160, .09, 8), m); t.position.set(...off); brain.add(t); glitch.push(m); });
  const glow = new THREE.PointLight(AURA_A.clone(), 0, 50, 2); glow.position.set(0, 4, 2); root.add(glow);
  root.traverse(o => { if (o.isMesh) o.frustumCulled = false; });
  return { root, head, brain, paths, glitch, glow };
}
// Neural activity at time t: comet pulses travel each pathway; the misfire splits into three channels that drift apart
export function fire(mind, t, level = 1, mis = 0) {
  for (const P of mind.paths) { const x = (t * P.sp + P.ph) % 1.4 - .2;
    setPulses(P.m, [{ p: x, w: .07, a: 7 * level, h: (P.ph * 2) % 1 }, { p: x - .55, w: .05, a: 4 * level, h: .9 }], .03 * level); }
  mind.glitch.forEach((m, i) => setPulses(m, [{ p: .5 + (i - 1) * .05 * mis, w: .14, a: 14 * mis, h: 0 }], .015));
  mind.glow.intensity = 10 * level;
}
