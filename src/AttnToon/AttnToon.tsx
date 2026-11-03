import React from "react";
import { AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { usePaperFonts } from "../Puppet/paper";
import { Hand, P, Ray, type Pose } from "../Toon/Ray";
import { Captions, w } from "../Attn/overlays";

/**
 * Style test for Toon Ray v2 (docs/TOON_STYLE.md): the attention hook (0:00-0:17), same Fish voice and word timings as Attn.
 * Five shots, sizes cycling close/mid/wide: A phone close-up with the real-time 1:26 timecode, B Ray on the sofa shrugging,
 * C a building of viewers losing focus one window at a time, D the progress bar the average viewer falls off at 23.7%,
 * E Ray's close-up turning to the viewer. Every event is keyed to a spoken word.
 */

const W = (word: string, n = 0) => w("hook", word, n);
const cl = (t: number) => Math.min(1, Math.max(0, t));
const ez = (f: number, a: number, b: number) => { const t = cl((f - a) / (b - a)); return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2; };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const sp = (f: number, at: number, damping = 12, mass = 0.7) => (f < at ? 0 : spring({ frame: f - at, fps: 30, config: { damping, mass, stiffness: 120 } }));
const blinkAt = (f: number, times: number[]) => times.reduce((m, b) => Math.max(m, 1 - Math.min(1, Math.abs(f - b) / 3.2)), 0);

const C = { teal: P.hood, amber: "#FFB45E", red: "#E4572E", navy0: "#0E1B33", navy1: "#1A2C48", plum: "#3B2E5A", plumD: "#2A2044", ink: "#0A0F1C", glow: "#A9DDFF" };
const OS = { fontFamily: "Oswald", fontWeight: 600 } as const;

/** camera: centre (x, y) at zoom z; depth < 1 moves less (parallax) */
const camT = (x: number, y: number, z: number, depth = 1) =>
  `translate(960 540) scale(${mix(1, z, depth)}) translate(${-mix(960, x, depth)} ${-mix(540, y, depth)})`;

// ─────────────── shot boundaries (cuts on sentence starts) ───────────────
const B_AT = W("That"), C_AT = W("but"), D_AT = W("One"), E_AT = W("of") + 2;

/* ─────────────── A + D: the phone, held landscape ─────────────── */
const PH = { x: 960, y: 540, w: 1240, h: 640 };
const SCR = { x: PH.x - 590, y: PH.y - 290, w: 1180, h: 580 };
const BAR = { x: SCR.x + 60, y: SCR.y + SCR.h - 70, w: SCR.w - 120 };

const Bokeh: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs>
      <radialGradient id="bk"><stop offset="0" stopColor="#FFC981" stopOpacity={0.5} /><stop offset="1" stopColor="#FFC981" stopOpacity={0} /></radialGradient>
      <radialGradient id="bkc"><stop offset="0" stopColor="#7FB6FF" stopOpacity={0.35} /><stop offset="1" stopColor="#7FB6FF" stopOpacity={0} /></radialGradient>
      <linearGradient id="bgA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0B1426" /><stop offset="1" stopColor="#1A2C48" /></linearGradient>
    </defs>
    <rect x={-600} y={-400} width={3100} height={1900} fill="url(#bgA)" />
    {[[180, 200, 160, "bk"], [1700, 160, 120, "bkc"], [1550, 880, 200, "bk"], [300, 900, 140, "bkc"], [1020, 60, 90, "bkc"], [80, 560, 90, "bk"]].map(([x, y, r, id], i) => (
      <circle key={i} cx={(x as number) + 8 * Math.sin(f / 50 + i)} cy={y as number} r={r as number} fill={`url(#${id})`} />
    ))}
  </g>
);

/** The video playing on the phone: a little sunset scene (moving clouds) so the screen is a picture, not a UI. */
const VideoFrame: React.FC<{ f: number; dim: number }> = ({ f, dim }) => (
  <g>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3B4E8C" /><stop offset="0.6" stopColor="#E88A6A" /><stop offset="1" stopColor="#FFC981" /></linearGradient>
      <clipPath id="scr"><rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} rx={26} /></clipPath>
    </defs>
    <g clipPath="url(#scr)">
      <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} fill="url(#sky)" />
      <circle cx={SCR.x + 760} cy={SCR.y + 360} r={90} fill="#FFE3A3" />
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx={SCR.x + ((i * 420 + f * (1.2 + i * 0.4)) % (SCR.w + 300)) - 150} cy={SCR.y + 110 + i * 60} rx={120 - i * 20} ry={26} fill="#F6E1D2" opacity={0.7} />
      ))}
      <path d={`M${SCR.x} ${SCR.y + 430} L${SCR.x + 260} ${SCR.y + 300} L${SCR.x + 480} ${SCR.y + 410} L${SCR.x + 700} ${SCR.y + 280} L${SCR.x + SCR.w} ${SCR.y + 420} V${SCR.y + SCR.h} H${SCR.x} Z`} fill="#2A2044" />
      <path d={`M${SCR.x} ${SCR.y + 500} Q${SCR.x + 600} ${SCR.y + 440} ${SCR.x + SCR.w} ${SCR.y + 500} V${SCR.y + SCR.h} H${SCR.x} Z`} fill="#16122A" />
      {/* player chrome gradient so the bar reads */}
      <rect x={SCR.x} y={SCR.y + SCR.h - 170} width={SCR.w} height={170} fill="#000" opacity={0.45} />
      <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} fill="#000" opacity={dim} />
    </g>
  </g>
);

const PhoneBody: React.FC = () => (
  <g>
    <rect x={PH.x - PH.w / 2 + 10} y={PH.y - PH.h / 2 + 24} width={PH.w} height={PH.h} rx={70} fill="#000" opacity={0.35} />
    <rect x={PH.x - PH.w / 2} y={PH.y - PH.h / 2} width={PH.w} height={PH.h} rx={70} fill="#10131C" stroke={C.ink} strokeWidth={8} />
    <rect x={PH.x - PH.w / 2 + 10} y={PH.y - PH.h / 2 + 10} width={PH.w - 20} height={PH.h - 20} rx={62} fill="none" stroke="#2E3448" strokeWidth={4} />
    <circle cx={PH.x - PH.w / 2 + 30} cy={PH.y} r={8} fill="#2E3448" />
  </g>
);

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Shot A (close): the phone, timecode running in real time, "1:26" pops amber on "26". */
const ShotA: React.FC<{ f: number }> = ({ f }) => {
  const push = ez(f, 0, B_AT);
  const pop26 = sp(f, W("26"), 9, 0.5);
  const long = sp(f, W("long."), 14);
  const pos = f / 30 / 86;
  const tc = { x: SCR.x + 70, y: SCR.y + SCR.h - 104 };
  return (
    <g>
      <g transform={camT(960, 540, 1.04, 0.4)}><Bokeh f={f} /></g>
      <g transform={camT(mix(960, 830, push) + 30 * long, mix(560, 640, push), mix(1.0, 1.32, push) - 0.06 * long)}>
        <g transform={`rotate(${-4 + 2 * Math.sin(f / 40)} 960 540)`}>
          <PhoneBody />
          <VideoFrame f={f} dim={0} />
          {/* progress bar, real time */}
          <rect x={BAR.x} y={BAR.y} width={BAR.w} height={10} rx={5} fill="#FFFFFF" opacity={0.3} />
          <rect x={BAR.x} y={BAR.y} width={BAR.w * pos} height={10} rx={5} fill={C.red} />
          <circle cx={BAR.x + BAR.w * pos} cy={BAR.y + 5} r={14} fill={C.red} stroke="#fff" strokeWidth={3} />
          <text x={tc.x} y={tc.y} style={{ ...OS, fontSize: 44 }} fill="#F4F1E8">
            {fmt(f / 30)} /{" "}
            <tspan fill={pop26 > 0.01 ? C.amber : "#F4F1E8"} fontSize={44 + 26 * pop26 * Math.max(0, 1 - (f - W("26")) / 40) + 12 * cl(pop26)}>1:26</tspan>
          </text>
          {/* thumbs holding the phone */}
          <Hand x={PH.x - PH.w / 2 + 40} y={PH.y + 170} r={74} rot={-30} />
          <Hand x={PH.x + PH.w / 2 - 40} y={PH.y + 190} r={74} rot={40} grip={0.2 * Math.abs(Math.sin(f / 18))} />
        </g>
      </g>
    </g>
  );
};

/** Shot D (close, pushed into the bar): the average viewer rides the playhead and falls off at 23.7%. */
const ShotD: React.FC<{ f: number }> = ({ f }) => {
  const appear = sp(f, D_AT + 2, 14);
  const ride = ez(f, W("average"), W("about"));
  const p = 0.237 * ride;
  const fall = f - W("23.7%");
  const flagX = BAR.x + BAR.w * 0.237;
  const px = BAR.x + BAR.w * p;
  const grey = sp(f, W("23.7%") + 8, 16);
  const roll = ez(f, W("23.7%"), W("23.7%") + 28);
  const bob = Math.abs(Math.sin(f / 4)) * 10 * (ride > 0 && ride < 1 ? 1 : 0);
  const camZ = mix(1.15, 2.1, ez(f, D_AT, W("average") + 10));
  const camX = mix(960, flagX - 40, ez(f, D_AT, W("average") + 10));
  const camY = mix(560, BAR.y - 120, ez(f, D_AT, W("average") + 10));
  return (
    <g>
      <g transform={camT(960, 540, 1.04, 0.4)}><Bokeh f={f + 300} /></g>
      <g transform={camT(camX, camY, camZ)}>
        <g transform="rotate(-2 960 540)">
          <PhoneBody />
          <VideoFrame f={f + 120} dim={0.35} />
          <rect x={BAR.x} y={BAR.y} width={BAR.w} height={14} rx={7} fill="#FFFFFF" opacity={0.3 - 0.15 * grey} />
          <rect x={BAR.x} y={BAR.y} width={BAR.w * p} height={14} rx={7} fill={C.red} />
          {/* the 23.7% flag */}
          <g transform={`translate(${flagX} ${BAR.y}) scale(${appear})`}>
            <line x1={0} y1={7} x2={0} y2={-70} stroke={C.amber} strokeWidth={5} strokeLinecap="round" />
            <path d="M0 -70 L44 -58 L0 -46 Z" fill={C.amber} />
          </g>
          {/* the average viewer: a tiny Ray-shaped head walking the playhead, then dropping off */}
          {(() => {
            const fy = fall > 0 ? 0.9 * fall * fall : 0; // gravity
            const fx = fall > 0 ? 3 * fall : 0;
            const rot = fall > 0 ? Math.min(160, fall * 9) : 0;
            const op = fall > 40 ? 0 : 1;
            return (
              <g transform={`translate(${px + fx} ${BAR.y - 34 - bob + fy}) rotate(${rot}) scale(${appear})`} opacity={op}>
                <ellipse cx={0} cy={18} rx={20} ry={14} fill="#8A93A8" stroke={C.ink} strokeWidth={4} />
                <circle cx={0} cy={-6} r={20} fill={P.skin} stroke={C.ink} strokeWidth={4} />
                <path d="M-20 -10 Q-16 -30 0 -28 Q16 -30 20 -10 Q8 -18 -20 -10 Z" fill={P.hair} />
                <circle cx={-7} cy={-4} r={3.5} fill={C.ink} />
                <circle cx={7} cy={-4} r={3.5} fill={C.ink} />
                {fall > 0 ? <ellipse cx={0} cy={7} rx={5} ry={6} fill="#5A1E22" /> : <path d="M-6 6 Q0 10 6 6" stroke={C.ink} strokeWidth={3} fill="none" />}
              </g>
            );
          })()}
          {/* the number, once, in amber */}
          <text x={flagX} y={BAR.y - 120} textAnchor="middle" style={{ ...OS, fontSize: 96 }} fill={C.amber} opacity={cl(fall / 4)}
            transform={`translate(${flagX} ${BAR.y - 150}) scale(${0.6 + 0.4 * sp(f, W("23.7%"), 8, 0.5)}) translate(${-flagX} ${-(BAR.y - 150)})`}>
            {(23.7 * roll).toFixed(1)}%
          </text>
        </g>
      </g>
    </g>
  );
};

/* ─────────────── B + E: the living room ─────────────── */
const Room: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs>
      <linearGradient id="wallR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.navy0} /><stop offset="1" stopColor={C.navy1} /></linearGradient>
      <radialGradient id="lampPool"><stop offset="0" stopColor="#FFB35A" stopOpacity={0.45} /><stop offset="1" stopColor="#FFB35A" stopOpacity={0} /></radialGradient>
    </defs>
    <rect x={-600} y={-400} width={3100} height={1900} fill="url(#wallR)" />
    {/* window with a city at night */}
    <g transform="translate(1260 150)">
      <rect x={-12} y={-12} width={484} height={384} rx={16} fill="#0A1222" />
      <rect width={460} height={360} rx={10} fill="#132A52" />
      <circle cx={370} cy={70} r={30} fill="#F3F1DE" />
      {[[20, 200, 70, 160], [100, 150, 60, 210], [170, 230, 80, 130], [260, 170, 70, 190], [340, 220, 100, 140]].map(([x, y, bw, bh], i) => (
        <g key={i}>
          <rect x={x} y={y} width={bw} height={bh} fill="#0C1830" />
          {Array.from({ length: 6 }, (_, j) => (
            <rect key={j} x={x + 10 + (j % 2) * 28} y={y + 16 + Math.floor(j / 2) * 34} width={14} height={16}
              fill="#FFD58A" opacity={(i * 7 + j * 3 + Math.floor(f / 45)) % 5 === 0 ? 0.15 : 0.75} />
          ))}
        </g>
      ))}
      <line x1={230} y1={0} x2={230} y2={360} stroke="#0A1222" strokeWidth={12} />
    </g>
    {/* shelf: books + plant */}
    <g transform="translate(240 300)">
      <rect x={0} y={150} width={420} height={18} rx={6} fill="#24395A" stroke={C.ink} strokeWidth={5} />
      {[[10, 70, "#E4572E"], [50, 90, "#3B4E8C"], [88, 60, "#D9A441"], [122, 84, "#14716C"]].map(([x, h, c], i) => (
        <rect key={i} x={x as number} y={150 - (h as number)} width={34} height={h as number} rx={4} fill={c as string} stroke={C.ink} strokeWidth={4} />
      ))}
      <path d="M300 150 L290 100 L350 100 L340 150 Z" fill="#B9631C" stroke={C.ink} strokeWidth={5} />
      {[-40, -15, 10, 35].map((a, i) => (
        <ellipse key={i} cx={320 + Math.sin((a * Math.PI) / 180) * 40} cy={70 - Math.cos((a * Math.PI) / 180) * 30} rx={14} ry={36}
          transform={`rotate(${a + 2 * Math.sin(f / 40 + i)} ${320} ${100})`} fill="#2E8B57" stroke={C.ink} strokeWidth={4} />
      ))}
    </g>
    {/* floor lamp (the warm practical) */}
    <g transform="translate(140 0)">
      <line x1={0} y1={420} x2={0} y2={1000} stroke={C.ink} strokeWidth={10} />
      <path d="M-90 420 L-50 300 L50 300 L90 420 Z" fill="#E88A2E" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
      <ellipse cx={0} cy={600} rx={360} ry={320} fill="url(#lampPool)" style={{ mixBlendMode: "screen" }} />
    </g>
    <rect x={-600} y={880} width={3100} height={600} fill="#0B1426" />
  </g>
);

const SofaBack: React.FC = () => (
  <g>
    <rect x={430} y={560} width={1060} height={340} rx={60} fill={C.plum} stroke={C.ink} strokeWidth={8} />
    <rect x={460} y={590} width={1000} height={60} rx={30} fill={C.plumD} opacity={0.6} />
  </g>
);
const SofaFront: React.FC = () => (
  <g>
    <rect x={470} y={840} width={980} height={150} rx={40} fill="#4A3A6E" stroke={C.ink} strokeWidth={8} />
    <rect x={360} y={700} width={150} height={320} rx={60} fill={C.plum} stroke={C.ink} strokeWidth={8} />
    <rect x={1410} y={700} width={150} height={320} rx={60} fill={C.plum} stroke={C.ink} strokeWidth={8} />
  </g>
);

/** Cool screen light on the face (the phone is the key light). */
const ScreenGlow: React.FC<{ x: number; y: number; r: number; f: number; k?: number }> = ({ x, y, r, f, k = 1 }) => (
  <g style={{ mixBlendMode: "screen" }}>
    <defs><radialGradient id={`sg${x | 0}`}><stop offset="0" stopColor={C.glow} stopOpacity={0.4 * k} /><stop offset="1" stopColor={C.glow} stopOpacity={0} /></radialGradient></defs>
    <ellipse cx={x} cy={y} rx={r} ry={r * 1.1} fill={`url(#sg${x | 0})`} opacity={0.85 + 0.15 * Math.sin(f / 5)} />
  </g>
);

/** Shot B (mid): Ray on the sofa looks up from the phone and shrugs on "much". */
const ShotB: React.FC<{ f: number }> = ({ f }) => {
  const up = sp(f, B_AT + 6, 14);
  const antic = sp(f, W("much,") - 8, 14) * (1 - sp(f, W("much,") - 2, 14));
  const shrug = sp(f, W("much,") - 2, 9, 0.6);
  const s = 1.25, rx = 960, ry = 930;
  const pose: Pose = {
    breathe: Math.sin(f / 22),
    lean: -2 * antic + 2 * shrug,
    nod: 8 * antic - 10 * shrug,
    headTilt: mix(-4, 2, up) + 9 * shrug,
    turn: mix(0.15, 0, up),
    lookX: mix(0.25, 0, up),
    lookY: mix(0.7, 0, up),
    lid: Math.max(blinkAt(f, [B_AT + 30]), mix(0.35, 0.1, up) + 0.1 * shrug),
    brow: 0.2 * up,
    browLift: 14 * shrug,
    mouth: -0.1 + 0.4 * shrug,
    open: 0.2 * up * (1 - shrug),
    handL: [mix(-124, -230, shrug), mix(-30, -190, shrug)],
    handR: [60, -170],
    grip: 0.3,
  };
  const ph = { x: rx + 60 * s, y: ry - 200 * s };
  return (
    <g>
      <g transform={camT(980, 560, mix(1.0, 1.08, ez(f, B_AT, C_AT)), 0.7)}><Room f={f} /></g>
      <g transform={camT(980, 560, mix(1.0, 1.08, ez(f, B_AT, C_AT)))}>
        <SofaBack />
        <Ray x={rx} y={ry} s={s} pose={pose} uid="rB" />
        {/* phone back + the thumb over it */}
        <g transform={`translate(${ph.x} ${ph.y}) rotate(${-14 + 6 * shrug})`}>
          <rect x={-46} y={-80} width={92} height={160} rx={16} fill="#10131C" stroke={C.ink} strokeWidth={6} />
          <circle cx={-20} cy={-56} r={7} fill="#2E3448" />
        </g>
        <ScreenGlow x={rx} y={ry - 392 * s + 40} r={230} f={f} k={1 - 0.6 * up} />
        <SofaFront />
      </g>
    </g>
  );
};

/** Shot E (close): Ray turns to the viewer, one knowing look on "YouTube video". */
const ShotE: React.FC<{ f: number }> = ({ f }) => {
  const look = sp(f, E_AT + 2, 12);
  const smirk = sp(f, W("video."), 12);
  const s = 2.2, rx = 960, ry = 1560;
  const pose: Pose = {
    breathe: Math.sin(f / 22),
    turn: mix(0.3, 0.08, look),
    headTilt: mix(4, -6, look),
    lookX: mix(0.8, 0, look),
    lookY: mix(0.5, 0, look),
    lid: Math.max(blinkAt(f, [E_AT + 26]), mix(0.3, 0.32, look)),
    brow: -0.25 * smirk,
    browLift: 10 * look - 4 * smirk,
    mouth: 0.1 + 0.5 * smirk,
    handL: [-124, -30],
    handR: [124, -30],
  };
  return (
    <g>
      <g transform={camT(1080, 420, mix(1.15, 1.22, ez(f, E_AT, E_AT + 60)), 0.6)}><Room f={f} /></g>
      <g transform={camT(960, 560, mix(1.0, 1.06, ez(f, E_AT, E_AT + 60)))}>
        <Ray x={rx} y={ry} s={s} pose={pose} uid="rE" />
        <ScreenGlow x={rx} y={ry - 392 * s + 160} r={420} f={f} k={0.7} />
      </g>
    </g>
  );
};

/* ─────────────── C: the building of viewers ─────────────── */
const COLS = 4, ROWS = 3, WW = 300, WH = 230, GX = 60, GY = 70;
const BX = 960 - (COLS * WW + (COLS - 1) * GX) / 2, BY = 150;
const RAY_WIN = 5; // row 1, col 1: Ray's flat
const HOODS = ["#C85A7C", "#7A6BC2", "#D9A441", "#5C7FBF", "#8AA05C", "#B0644A", "#6C8FA0", "#9C5AA0", "#4E9A6E", "#C27A3A", "#5A6BA8"];
const SCREEN = ["#FFD58A", "#9FD8FF", "#FF9A7A", "#B8F0C8", "#E7B8FF"];
// the order windows lose focus in (Ray never does)
const ORDER = [2, 9, 0, 7, 11, 4, 1, 10, 6, 3, 8];

const Viewer: React.FC<{ x: number; y: number; hood: string; f: number; restless: number; i: number; ray?: boolean }> = ({ x, y, hood, f, restless, i, ray }) => {
  const swipes = restless > 0 ? Math.floor((f * (1 + restless * 2.5) + i * 13) / 14) : 0;
  const scr = ray ? C.glow : SCREEN[(swipes + i) % SCREEN.length]!;
  const flick = restless > 0 ? Math.max(0, 1 - (((f * (1 + restless * 2.5) + i * 13) % 14) / 4)) : 0; // thumb flick right after each swipe
  const headT = restless > 0 ? Math.sin(f / (6 - restless * 2) + i) * 8 * restless : Math.sin(f / 30 + i) * 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={WH - 30} rx={120} ry={18} fill="#000" opacity={0.25} />
      <path d={`M-70 ${WH} Q-76 ${WH - 120} -40 ${WH - 140} Q0 ${WH - 156} 40 ${WH - 140} Q76 ${WH - 120} 70 ${WH} Z`} fill={hood} stroke={C.ink} strokeWidth={5} />
      <g transform={`translate(${headT} 0) rotate(${headT * 0.8} 0 ${WH - 190})`}>
        <circle cx={0} cy={WH - 190} r={40} fill={P.skin} stroke={C.ink} strokeWidth={5} />
        <path d={`M-40 ${WH - 196} Q-34 ${WH - 240} 0 ${WH - 236} Q34 ${WH - 240} 40 ${WH - 196} Q20 ${WH - 212} -40 ${WH - 196} Z`} fill={P.hair} />
        <circle cx={-13} cy={WH - 180} r={5} fill={C.ink} />
        <circle cx={13} cy={WH - 180} r={5} fill={C.ink} />
      </g>
      {/* phone + its light on the face */}
      <rect x={-22} y={WH - 130} width={44} height={66} rx={8} fill={scr} stroke={C.ink} strokeWidth={4} />
      <ellipse cx={0} cy={WH - 170} rx={70} ry={80} fill={scr} opacity={0.22} style={{ mixBlendMode: "screen" }} />
      {flick > 0 ? <path d={`M${16} ${WH - 110} q20 -10 34 -34`} stroke="#fff" strokeWidth={5} strokeLinecap="round" fill="none" opacity={flick} /> : null}
    </g>
  );
};

const ShotC: React.FC<{ f: number }> = ({ f }) => {
  const reveal = ez(f, W("lifetime") - 10, W("lifetime") + 40);
  const win = (k: number) => ({ x: BX + (k % COLS) * (WW + GX), y: BY + Math.floor(k / COLS) * (WH + GY) });
  const rw = win(RAY_WIN);
  const z = mix(2.6, 1.0, reveal);
  const cx = mix(rw.x + WW / 2, 960, reveal), cy = mix(rw.y + WH / 2, 520, reveal);
  const start = W("fast");
  return (
    <g>
      <defs>
        <linearGradient id="skyC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#081022" /><stop offset="1" stopColor="#1A2C48" /></linearGradient>
      </defs>
      <g transform={camT(cx, cy, z, 0.5)}>
        <rect x={-600} y={-400} width={3100} height={1900} fill="url(#skyC)" />
        {Array.from({ length: 30 }, (_, i) => (
          <circle key={i} cx={(i * 263) % 2100 - 90} cy={(i * 137) % 420 - 120} r={2 + (i % 3)} fill="#DCE8FF" opacity={0.35 + 0.4 * Math.abs(Math.sin(f / 18 + i))} />
        ))}
      </g>
      <g transform={camT(cx, cy, z)}>
        {/* facade */}
        <rect x={BX - 70} y={BY - 90} width={COLS * WW + (COLS - 1) * GX + 140} height={ROWS * (WH + GY) + 300} rx={12} fill="#22304E" stroke={C.ink} strokeWidth={10} />
        <rect x={BX - 100} y={BY - 110} width={COLS * WW + (COLS - 1) * GX + 200} height={40} rx={8} fill="#2C3D60" stroke={C.ink} strokeWidth={8} />
        {Array.from({ length: COLS * ROWS }, (_, k) => {
          const { x, y } = win(k);
          const isRay = k === RAY_WIN;
          const oi = ORDER.indexOf(k < RAY_WIN ? k : k - 1);
          const at = start + Math.max(0, oi) * 4;
          const restless = isRay ? 0 : cl((f - at) / 12) * (f > W("days.") ? 1 : 0.7);
          return (
            <g key={k}>
              <rect x={x - 8} y={y - 8} width={WW + 16} height={WH + 16} rx={10} fill={C.ink} />
              <clipPath id={`w${k}`}><rect x={x} y={y} width={WW} height={WH} rx={6} /></clipPath>
              <g clipPath={`url(#w${k})`}>
                <rect x={x} y={y} width={WW} height={WH} fill={isRay ? "#2A3F66" : k % 2 ? "#3A2E52" : "#2E3A5E"} />
                <rect x={x + 20} y={y + 20} width={70} height={50} rx={4} fill="#1A2440" opacity={0.7} />
                <Viewer x={x + WW / 2} y={y} hood={isRay ? C.teal : HOODS[k % HOODS.length]!} f={f} restless={restless} i={k} ray={isRay} />
              </g>
              {/* sill */}
              <rect x={x - 14} y={y + WH + 6} width={WW + 28} height={14} rx={5} fill="#2C3D60" stroke={C.ink} strokeWidth={4} />
              {isRay ? <rect x={x - 8} y={y - 8} width={WW + 16} height={WH + 16} rx={10} fill="none" stroke={C.amber} strokeWidth={6} opacity={0.55 + 0.35 * Math.sin(f / 8)} /> : null}
            </g>
          );
        })}
      </g>
    </g>
  );
};

/* ─────────────── grade + assembly ─────────────── */
const Grade: React.FC<{ f: number }> = ({ f }) => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
    <defs>
      <radialGradient id="vig" cx="0.5" cy="0.45" r="0.78"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#02040C" stopOpacity={0.7} /></radialGradient>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(f / 2) % 8} /><feColorMatrix type="saturate" values="0" /></filter>
    </defs>
    <rect width={1920} height={1080} fill="url(#vig)" />
    <rect width={1920} height={1080} filter="url(#grain)" opacity={0.03} />
  </svg>
);

export const AttnToon: React.FC = () => {
  usePaperFonts();
  const f = useCurrentFrame();
  const shot = f < B_AT ? <ShotA f={f} /> : f < C_AT ? <ShotB f={f} /> : f < D_AT ? <ShotC f={f} /> : f < E_AT ? <ShotD f={f} /> : <ShotE f={f} />;
  const fx: [string, number, number][] = [["pop", W("26"), 0.3], ["pop", W("much,"), 0.2], ["sparkle", W("lifetime"), 0.18], ["tick", W("lose"), 0.2], ["tick", W("focus"), 0.2], ["thud", W("23.7%") + 22, 0.35], ["ding", W("23.7%") + 4, 0.2]];
  return (
    <AbsoluteFill style={{ background: "#0B1426" }}>
      <svg viewBox="0 0 1920 1080" style={{ width: "100%", height: "100%" }}>{shot}</svg>
      <Grade f={f} />
      <Captions scene="hook" toon />
      <Sequence from={12}><Audio src={staticFile("vo_attn/hook.wav")} /></Sequence>
      {fx.map(([s, at, v], i) => <Sequence key={i} from={at} durationInFrames={40}><Audio src={staticFile(`sfx/${s}.wav`)} volume={v} /></Sequence>)}
      <Audio src={staticFile("music/modern.mp3")} volume={0.06} />
    </AbsoluteFill>
  );
};
