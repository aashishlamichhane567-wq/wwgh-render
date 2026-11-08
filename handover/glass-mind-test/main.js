// Glass Mind — style frame. Staging and type adapted from Lemo-Opuscar glass-product demo (MIT)
import * as THREE from 'three';
import { makePost } from '/core/three/post.js';
import { seg, ss, lerp } from '/core/lib.js';
import { makeMind, fire, AURA_A } from './mind.js';
import { makeStudio } from './studio.js';

const QS = new URLSearchParams(location.search), W = 1920, H = 1080;
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(+(QS.get('pr') || 2)); renderer.setSize(W, H);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.1;
document.getElementById('stage').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(28, W / H, 1, 3000);
const post = makePost(renderer, scene, camera, W, H, { ssaa: 2, ao: false });
post.bloom.threshold = 1.1; post.bloom.radius = .4;
post.vig.uniforms.amt.value = .3; post.vig.uniforms.contrast.value = .12; post.vig.uniforms.sat.value = 1.0;
const studio = makeStudio(renderer, scene);
studio.floor.position.y = -21;
const mind = makeMind(); scene.add(mind.root);
const V = (x, y, z) => new THREE.Vector3(x, y, z);

function frame(t) {
  mind.root.rotation.y = -.92 + t * .02;
  const az = .18, el = .12, d = 96, look = V(0, -3, 0);
  camera.position.set(Math.sin(az) * Math.cos(el) * d, look.y + Math.sin(el) * d, Math.cos(az) * Math.cos(el) * d);
  camera.lookAt(look); camera.fov = 28; camera.updateProjectionMatrix();
  fire(mind, t, 1, +(QS.get('mis') ?? 1));
  const caz = Math.atan2(camera.position.x, camera.position.z);
  studio.updateEnv({ left: 1.2, right: 1.2, top: 1.1, front: .25, back: 1.6, key: 0, sweep: { x: -.35, I: 3.2, tilt: .3, az: caz + Math.PI }, aura: { I: .9, col: AURA_A } });
  scene.backgroundIntensity = .95; studio.U.uBgI.value = .95;
  post.dof.focus = camera.position.distanceTo(V(0, 3, 2)); post.dof.aper = 140; post.dof.maxCoc = 12;
  post.bloom.strength = .32;
  const U = studio.U; U.uTime.value = t * .6; U.uSpot.value = .05;
  U.uC.value[0].set(0, 0, 15, .22); U.uC.value[1].set(0, 0, 1, 0); U.uC.value[2].set(0, 0, 1, 0);
  for (const wv of U.uWave.value) wv.set(0, 0, 0, 0);
  
}

const ov = document.getElementById('ov'), g = ov.getContext('2d');
await document.fonts.load('200 100px "Inter Tight"'); await document.fonts.load('300 40px "Inter Tight"'); await document.fonts.load('500 20px "Inter Tight"');
function spaced(text, x, y, font, sp) { g.font = font; g.letterSpacing = sp + 'px'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, x + sp / 2, y); g.letterSpacing = '0px'; }
function glintText(text, y, font, sp, gx) {
  g.fillStyle = 'rgba(236,242,248,.92)'; spaced(text, W / 2, y, font, sp);
  g.save(); g.globalCompositeOperation = 'source-atop'; const gr = g.createLinearGradient(gx - 160, 0, gx + 160, 0);
  gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.42, 'rgba(160,230,255,0)'); gr.addColorStop(.5, 'rgba(255,255,255,1)'); gr.addColorStop(.58, 'rgba(200,170,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, y - 120, W, 240); g.restore();
}
function subtitle(text) {
  g.font = '300 40px "Inter Tight"'; g.letterSpacing = '1px';
  const tw = g.measureText(text).width, pw = tw + 96, ph = 76, x = (W - pw) / 2, y = H - 128;
  g.save(); g.beginPath(); g.roundRect(x, y, pw, ph, 38); g.clip(); g.filter = 'blur(18px) brightness(1.25)';
  g.drawImage(renderer.domElement, 0, 0, W, H); g.filter = 'none'; g.fillStyle = 'rgba(210,225,240,.10)'; g.fillRect(x, y, pw, ph); g.restore();
  g.lineWidth = 1.2; g.strokeStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.roundRect(x + .5, y + .5, pw - 1, ph - 1, 38); g.stroke();
  g.strokeStyle = 'rgba(98,220,255,.35)'; g.beginPath(); g.moveTo(x + 40, y + 1.5); g.lineTo(x + pw * .45, y + 1.5); g.stroke();
  g.strokeStyle = 'rgba(169,139,255,.3)'; g.beginPath(); g.moveTo(x + pw * .45, y + 1.5); g.lineTo(x + pw - 40, y + 1.5); g.stroke();
  g.fillStyle = 'rgba(245,248,252,.96)'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, W / 2 + .5, y + ph / 2 + 1); g.letterSpacing = '0px';
}
function hud() {
  g.clearRect(0, 0, W, H);
  if (QS.has('notext')) return;
  g.save(); g.globalAlpha = .75; g.fillStyle = '#cfd8e0'; spaced('CHAPTER 03  ·  THE DOORWAY EFFECT', W / 2, 78, '500 19px "Inter Tight"', 9); g.restore();
  glintText('MISFIRE', 160, '200 118px "Inter Tight"', 58, W * .62);
  subtitle('Walk through a door, and your brain files the last room away.');
}
window.render = t => { frame(t); scene.updateMatrixWorld(); camera.updateMatrixWorld(); studio.reflect(camera); post.composer.render(); hud(t); };
window.DUR = 4; window.EV = []; window.READY = true;
