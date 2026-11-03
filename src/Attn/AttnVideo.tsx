import React from "react";
import { AbsoluteFill, Audio, Sequence, getStaticFiles, spring, staticFile, useCurrentFrame } from "remotion";
import { usePaperFonts } from "../Puppet/paper";
import { blendFace, FACES, type Face } from "../Hangry/Stickman";
import { Pal } from "../Disc/Pal";
import { INKCOL, Ink } from "../Disc/hook";
import { Captions, w } from "./overlays";
import { SCENES, TOTAL_FRAMES } from "./timing";

/**
 * "You Already Beat the Average Viewer" (1:26, 16:9): a hand-drawn YouTube watch page whose playhead runs in real time.
 * A crowd of tiny viewers walks with the playhead and most of them drop off at 23.7% (0:20), the exact frame the narrator
 * says "twenty seconds"; the desk viewer gets caught drifting, wired, and his brain jumps ship; the algorithm is a
 * puppeteer robot the viewer finally outsmarts; the last five seconds are the autoplay countdown, so the runtime the
 * hook claims is true. Every event is keyed to a spoken word (Fish voice, public/vo_attn).
 */

type Scene = keyof typeof SCENES;
const T = (s: Scene, word: string, n = 0) => SCENES[s].start + w(s, word, n);
const cl = (t: number) => Math.min(1, Math.max(0, t));
const ez = (f: number, a: number, b: number) => { const t = cl((f - a) / (b - a)); return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2; };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0 before `at`, then a springy 0 -> 1 with a little overshoot (pop-ins, eye darts). */
const pop = (f: number, at: number, damping = 11) => (f < at ? 0 : spring({ frame: f - at, fps: 30, config: { damping, mass: 0.55 } }));

// v3 contrast pass: darker ink, a warmer wall, and Pal is always bold teal (one colour, one meaning: you).
const INK = "#1F1A15", RED = "#D2452F", GOLD = "#E3A22B", TEAL = "#2E8C83", SAGE = "#7E8B5A", PAPER = INKCOL.paper;
const WALL = "#EED9B4", WALL_LO = "#E3C99C", FLOOR = "#B8895A", PLAYER = "#2F3B52";
const ln = { stroke: INK, strokeWidth: 5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const TXT = { fontFamily: "Kalam", fill: INK } as const;

// ─────────────── camera: eased moves between word-keyed framings ───────────────
type K = [number, number, number, number, boolean?]; // [frame, centre x, centre y, zoom, hard cut]
const camV = (f: number, keys: K[]) => {
  let [, x, y, z] = keys[0];
  for (const [at, nx, ny, nz, cut] of keys.slice(1)) {
    if (f < at) break;
    const t = cut ? 1 : ez(f, at, at + 20);
    x = mix(x, nx, t); y = mix(y, ny, t); z = mix(z, nz, t);
  }
  return [x, y, z * (1 + 0.012 * Math.sin(f / 70))]; // the camera is never perfectly still
};
const camAt = (x: number, y: number, z: number) => `translate(960 540) scale(${z}) translate(${-x} ${-y})`;
const cam = (f: number, keys: K[]) => { const [x, y, z] = camV(f, keys); return camAt(x, y, z); };

// ─────────────── the watch page ───────────────
const PL = { x: 100, y: 180, w: 1200, h: 675 }; // player
const BAR = { x: 140, y: 812, w: 1120 };
const AVG = 0.237;
const RUN = TOTAL_FRAMES;
const headX = (f: number) => BAR.x + BAR.w * cl(f / RUN);
const LEAVE = Math.round(RUN * AVG); // 23.7% of 1:26 = 0:20.4

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const Thumb: React.FC<{ x: number; y: number; i: number; f: number; glow?: number; s?: number }> = ({ x, y, i, f, glow = 0, s = 1 }) => {
  const hue = ["#E3A4A0", "#97A894", "#D9A441", "#8E9AAE", "#C8553D", "#7E8B5A", "#B9716E", "#4E7F7A"][i % 8];
  const wig = glow * Math.sin(f / 3 + i) * 3;
  return (
    <g transform={`translate(${x} ${y}) rotate(${wig}) scale(${s * (1 + glow * 0.06)})`}>
      {glow > 0 ? <rect x={-14} y={-14} width={248} height={152} rx={22} fill={GOLD} opacity={0.35 * glow} /> : null}
      <rect x={0} y={0} width={220} height={124} rx={14} fill={hue} {...ln} />
      <circle cx={110} cy={62} r={22} fill={PAPER} {...ln} strokeWidth={3} />
      <path d="M103 50 L122 62 L103 74 Z" fill={INK} />
    </g>
  );
};

const Robot: React.FC<{ f: number; x: number; y: number }> = ({ f, x, y }) => {
  const beat = T("end", "outsmarted"), dizzy = ez(f, beat, beat + 10);
  const look = Math.sin(f / 18) * 14 * (1 - dizzy);
  return (
    <g transform={`translate(${x} ${y + Math.sin(f / 16) * 6})`}>
      <line x1={0} y1={-110} x2={0} y2={-160 + dizzy * 30} {...ln} />
      <circle cx={dizzy * 18} cy={-166 + dizzy * 34} r={12} fill={RED} {...ln} />
      <rect x={-190} y={-110} width={380} height={210} rx={46} fill="#D2CBB6" {...ln} strokeWidth={5} />
      <circle cx={0} cy={-8} r={64} fill={PAPER} {...ln} strokeWidth={5} />
      {dizzy < 0.5 ? (
        <g><circle cx={look} cy={-8} r={30} fill={RED} {...ln} /><circle cx={look + 8} cy={-16} r={9} fill={PAPER} /></g>
      ) : (
        <path d={Array.from({ length: 40 }, (_, k) => { const a = k / 3 + f / 4, r = k * 1.4; return `${k ? "L" : "M"}${Math.cos(a) * r} ${-8 + Math.sin(a) * r}`; }).join(" ")} fill="none" {...ln} strokeWidth={3} />
      )}
      {dizzy > 0.5 ? [0, 1, 2].map((k) => { const g = (f - beat + k * 9) % 36; return <circle key={k} cx={-150 + k * 140 + Math.sin(g / 5) * 10} cy={-120 - g * 3} r={14 + g * 0.6} fill="#BDB3A2" opacity={cl(1 - g / 36)} {...ln} strokeWidth={2} />; }) : null}
    </g>
  );
};

const Gear: React.FC<{ x: number; y: number; r: number; a: number }> = ({ x, y, r, a }) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    {Array.from({ length: 10 }, (_, k) => <rect key={k} x={-r * 0.12} y={-r - r * 0.18} width={r * 0.24} height={r * 0.3} fill="#BDB3A2" {...ln} transform={`rotate(${k * 36})`} />)}
    <circle r={r} fill="#CFC6B0" {...ln} strokeWidth={5} />
    <circle r={r * 0.3} fill={PAPER} {...ln} />
  </g>
);

const Cursor: React.FC<{ x: number; y: number; click: number }> = ({ x, y, click }) => (
  <g transform={`translate(${x} ${y}) scale(${1.5 - 0.15 * click})`}>
    <path d="M0 0 L0 44 L11 33 L19 52 L27 48 L19 30 L34 30 Z" fill={PAPER} {...ln} strokeWidth={3} />
  </g>
);

const Page: React.FC<{ f: number }> = ({ f }) => {
  const sec = Math.floor((f + 1) / 30);
  const caught = SCENES.caught.start, inCaught = f >= caught && f < SCENES.wired.start;
  const mini = inCaught ? ez(f, T("caught", "shrank"), T("caught", "shrank") + 18) : 0;
  const pl = { x: mix(PL.x, 1380, mini), y: mix(PL.y, 780, mini), s: mix(1, 0.36, mini) };
  const fill = ez(f, T("hook", "23.7%"), T("hook", "23.7%") + 24);
  const mark = pop(f, T("hook", "23.7%"));
  const recIn = inCaught ? ez(f, T("caught", "recommended"), T("caught", "recommended") + 8) * (1 - ez(f, T("caught", "skimming"), T("caught", "skimming") + 10)) : 0;
  const tabs = inCaught ? Math.min(4, Math.max(0, Math.floor((f - T("caught", "another")) / 5) + 1)) : 0;
  const typed = inCaught ? "next distraction...".slice(0, Math.max(0, Math.floor((f - T("caught", "searching")) / 2))) : "";
  const truth = f >= SCENES.truth.start && f < SCENES.end.start, tug = truth ? Math.max(0, Math.sin((f - T("truth", "built")) / 4)) * ez(f, T("truth", "built"), T("truth", "built") + 6) : 0;
  const upNext = f >= T("end", "feed.") + 20;
  const left = Math.max(0, Math.ceil((RUN - f) / 30));
  const keys: K[] = [
    [0, 700, 517, 1.55], [T("hook", "26") - 6, 700, 480, 1.95], [T("hook", "One"), 960, 540, 1, true], [T("hook", "23.7%") - 10, 520, 790, 1.7],
    [T("math", "For"), 560, 770, 1.45], [T("math", "20") - 4, 420, 790, 2.1], [T("math", "outlasted"), 560, 720, 1.5], [T("math", "tune"), 380, 800, 1.9],
    [T("caught", "Were"), 960, 540, 1, true], [T("caught", "recommended"), 1585, 520, 1.45], [T("caught", "skimming"), 620, 1260, 1.25], [T("caught", "another"), 560, 190, 1.6],
    [T("caught", "shrank"), 960, 540, 1], [T("caught", "searching"), 960, 300, 1.45],
    [SCENES.truth.start, 960, 420, 0.62, true], [T("truth", "built"), 960, 300, 0.78],
    [SCENES.end.start, 560, 770, 1.45, true], [T("end", "outsmarted"), 900, 360, 0.72], [T("end", "feed.") + 20, 700, 517, 1.15, true], [T("end", "feed.") + 60, 700, 517, 1.35],
  ];
  const cur = inCaught ? (() => {
    const pts: [number, number, number][] = [[caught, 700, 520], [T("caught", "recommended"), 1500, 420], [T("caught", "comment"), 560, 1180], [T("caught", "another"), 640, 72], [T("caught", "shrank"), 1260, 820], [T("caught", "searching"), 980, 128]];
    let [, x, y] = pts[0];
    for (const [at, nx, ny] of pts.slice(1)) { const t = ez(f, at - 14, at); x = mix(x, nx, t); y = mix(y, ny, t); }
    const click = Math.max(...pts.slice(1).map(([at]) => (f >= at && f < at + 6 ? 1 : 0)));
    return { x, y, click };
  })() : null;
  return (
    <g transform={cam(f, keys)}>
      <rect x={-1200} y={-900} width={4400} height={3600} fill={WALL} />
      {truth || f >= SCENES.end.start ? (
        <g>
          <Gear x={-120} y={-80} r={170} a={f * 0.9} />
          <Gear x={2060} y={60} r={210} a={-f * 0.7} />
          <Gear x={1980} y={1160} r={140} a={f * 1.1} />
          <g transform="translate(960 -230) scale(1.7) translate(-960 0)"><Robot f={f} x={960} y={0} /></g>
          {truth ? [0, 1, 2, 3].map((k) => <line key={k} x1={960 - 270 + k * 180} y1={-60} x2={1450 + (k % 2) * 110} y2={210 + k * 160 + tug * 24} stroke={INK} strokeWidth={2.5} strokeDasharray="2 10" />) : null}
        </g>
      ) : null}
      {/* browser window */}
      <rect x={60} y={20} width={1800} height={1580} rx={30} fill={PAPER} {...ln} strokeWidth={5} />
      <line x1={60} y1={150} x2={1860} y2={150} {...ln} />
      {[0, 1, 2, 3, 4].map((k) => k > tabs ? null : (
        <g key={k} transform={`translate(${90 + k * 250} 36) scale(${k === 0 ? 1 : pop(f, T("caught", "another") + (k - 1) * 5)})`}>
          <path d="M0 50 L18 0 H212 L230 50" fill={k === tabs ? PAPER : "#E6E0CF"} {...ln} strokeWidth={3} />
          <rect x={30} y={14} width={22} height={22} rx={5} fill={k ? ["#97A894", "#E3A4A0", GOLD, "#8E9AAE"][k - 1] : RED} {...ln} strokeWidth={2} />
          <text x={64} y={34} fontSize={26} {...TXT}>{k ? ["Feed", "Shop", "Memes", "News"][k - 1] : "YouTube"}</text>
        </g>
      ))}
      <rect x={560} y={100} width={800} height={44} rx={22} fill="#FBF8F0" {...ln} strokeWidth={3} />
      <text x={590} y={132} fontSize={28} {...TXT} fill={typed ? INK : "#A89F8A"}>{typed || "Search"}</text>
      {/* sidebar */}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <Thumb x={1340} y={180 + i * 165} i={i} f={f} glow={recIn} />
          <rect x={1580} y={196 + i * 165} width={200} height={16} rx={8} fill="#CFC6B0" />
          <rect x={1580} y={228 + i * 165} width={150} height={14} rx={7} fill="#E6E0CF" />
        </g>
      ))}
      {/* title + comments */}
      <text x={110} y={910} fontSize={40} {...TXT}>You Already Beat the Average Viewer</text>
      <circle cx={135} cy={970} r={26} fill={SAGE} {...ln} strokeWidth={3} />
      <text x={175} y={982} fontSize={30} {...TXT}>Cognalyst</text>
      <text x={110} y={1080} fontSize={32} {...TXT}>Comments</text>
      {[0, 1, 2, 3].map((k) => (
        <g key={k} transform={`translate(110 ${1120 + k * 110})`}>
          <circle cx={26} cy={26} r={24} fill={["#E3A4A0", "#97A894", GOLD, "#8E9AAE"][k]} {...ln} strokeWidth={3} />
          <rect x={70} y={8} width={[420, 560, 360, 480][k]} height={16} rx={8} fill="#CFC6B0" />
          <rect x={70} y={38} width={[300, 380, 260, 340][k]} height={14} rx={7} fill="#E6E0CF" />
        </g>
      ))}
      {/* player */}
      <g transform={`translate(${pl.x} ${pl.y}) scale(${pl.s}) translate(${-PL.x} ${-PL.y})`}>
        <rect x={PL.x} y={PL.y} width={PL.w} height={PL.h} rx={22} fill={PLAYER} {...ln} strokeWidth={5} />
        <text x={PL.x + PL.w / 2} y={PL.y + 380} fontSize={150} textAnchor="middle" {...TXT} fill={PAPER} opacity={upNext ? 0 : 1}>{clock(sec)} / 1:26</text>
        {f >= T("hook", "26") && f < T("hook", "One") ? (
          <ellipse cx={PL.x + PL.w / 2 + 230} cy={PL.y + 330} rx={190 * ez(f, T("hook", "26"), T("hook", "26") + 10)} ry={100} fill="none" stroke={RED} strokeWidth={8} />
        ) : null}
        <rect x={BAR.x} y={BAR.y} width={BAR.w} height={14} rx={7} fill="#6B6560" />
        <rect x={BAR.x} y={BAR.y} width={BAR.w * AVG * fill} height={14} rx={7} fill={GOLD} />
        <rect x={BAR.x} y={BAR.y} width={headX(f) - BAR.x} height={14} rx={7} fill={RED} />
        <circle cx={headX(f)} cy={BAR.y + 7} r={14} fill={RED} {...ln} strokeWidth={3} />
        {mark > 0 ? (
          <g transform={`translate(${BAR.x + BAR.w * AVG} ${BAR.y + 7}) scale(${mark})`}>
            <line x1={0} y1={-70} x2={0} y2={24} stroke={GOLD} strokeWidth={6} />
            <path d="M0 -70 L44 -58 L0 -46 Z" fill={GOLD} {...ln} strokeWidth={2} />
            <text x={56} y={-40} fontSize={64} {...TXT} fill={GOLD} stroke={INK} strokeWidth={2}>23.7%</text>
          </g>
        ) : null}
        {upNext ? (
          <g opacity={ez(f, T("end", "feed.") + 20, T("end", "feed.") + 30)}>
            <rect x={PL.x} y={PL.y} width={PL.w} height={PL.h - 90} rx={22} fill="#2B2620" opacity={0.75} />
            <text x={PL.x + PL.w / 2} y={PL.y + 150} fontSize={46} textAnchor="middle" {...TXT} fill="#BDB3A2">Up next in {left}</text>
            <text x={PL.x + PL.w / 2} y={PL.y + 225} fontSize={56} textAnchor="middle" {...TXT} fill={PAPER}>Your Feed</text>
            <circle cx={PL.x + PL.w / 2} cy={PL.y + 380} r={78} fill="none" stroke="#6B6560" strokeWidth={10} />
            <circle cx={PL.x + PL.w / 2} cy={PL.y + 380} r={78} fill="none" stroke={PAPER} strokeWidth={10} strokeDasharray={`${490 * cl((f - T("end", "feed.") - 20) / (RUN - T("end", "feed.") - 20))} 490`} transform={`rotate(-90 ${PL.x + PL.w / 2} ${PL.y + 380})`} />
            <path d={`M${PL.x + PL.w / 2 - 22} ${PL.y + 345} L${PL.x + PL.w / 2 + 34} ${PL.y + 380} L${PL.x + PL.w / 2 - 22} ${PL.y + 415} Z`} fill={PAPER} />
            <rect x={PL.x + PL.w / 2 - 90} y={PL.y + 480} width={180} height={56} rx={28} fill="none" stroke="#BDB3A2" strokeWidth={4} />
            <text x={PL.x + PL.w / 2} y={PL.y + 520} fontSize={32} textAnchor="middle" {...TXT} fill="#BDB3A2">Cancel</text>
          </g>
        ) : null}
      </g>
      {cur ? <Cursor x={cur.x} y={cur.y} click={cur.click} /> : null}
    </g>
  );
};

// ─────────────── the road: the progress bar as a street the viewers walk in real time ───────────────
const SPD = 2.4; // world px per frame
const headW = (f: number) => 300 + f * SPD;
const ROAD_Y = 760;
const FLAG_X = headW(LEAVE);
const WS = 0.95; // walker scale
const WALK_Y = ROAD_Y - 108 * WS; // Pal's feet sit 108 rig units below its centre
/** Rig-space hand position for Pal: arm pivot (79|121, 106), 74 long, rotated by `a` degrees. */
const palHand = (x: number, y: number, s: number, side: -1 | 1, a: number) => {
  const r = (a * Math.PI) / 180, sx = side < 0 ? 79 : 121;
  return [x + (sx - 74 * Math.sin(r) - 100) * s, y + (106 + 74 * Math.cos(r) - 160) * s] as const;
};

type Gag = "poof" | "hook" | "sleep" | "cat" | "phone";
// each viewer quits their own way: one early, four right at the 23.7% mark
const QUIT: [Gag, number, string][] = [["hook", LEAVE, RED], ["sleep", LEAVE + 8, GOLD], ["cat", LEAVE + 16, "#8E9AAE"], ["phone", LEAVE + 24, "#B9716E"], ["poof", T("hook", "sticks"), SAGE]];

const CatCard: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g transform={`translate(${x} ${y}) rotate(${Math.sin(f / 6) * 6})`}>
    <rect x={-80} y={-48} width={160} height={96} rx={12} fill="#FBF8F0" {...ln} />
    <path d="M-30 -2 L-26 -30 L-12 -14 Q0 -18 12 -14 L26 -30 L30 -2 Q30 26 0 26 Q-30 26 -30 -2 Z" fill={GOLD} {...ln} strokeWidth={3} />
    <circle cx={-10} cy={0} r={3.5} fill={INK} /><circle cx={10} cy={0} r={3.5} fill={INK} />
    <path d="M-4 10 L0 14 L4 10" fill="none" {...ln} strokeWidth={2.5} />
  </g>
);

const Quitter: React.FC<{ f: number; i: number }> = ({ f, i }) => {
  const [gag, at, shirt] = QUIT[i - 1];
  const g = f - at;
  const walking = g < 0;
  const x = headW(Math.min(f, at)) - 70 - i * 135;
  const sw = walking ? Math.sin(f / 3.2 + i * 1.7) * 26 : 0;
  let dx = 0, dy = 0, rot = 0, sc = 1, op = 1, face: Face = FACES.happy, armR = -20 + sw, lookY = 0;
  const extra: React.ReactNode[] = [];
  if (!walking) {
    if (gag === "poof") {
      sc = 1 - ez(f, at, at + 8); op = sc;
      [0, 1, 2, 3, 4].forEach((k) => { const a = (k / 5) * Math.PI * 2, r = 30 + g * 6; extra.push(<circle key={k} cx={x + Math.cos(a) * r} cy={WALK_Y - 40 + Math.sin(a) * r} r={Math.max(1, 30 - g)} fill="#D9D2BF" {...ln} strokeWidth={3} opacity={cl(1 - g / 20)} />); });
      if (g > 20) return null;
    } else if (gag === "hook") {
      const drop = ez(f, at - 14, at), yank = g > 6 ? (g - 6) ** 2 * 4 : 0;
      face = FACES.shocked; dy = -yank;
      const top = WALK_Y - 150 * WS;
      extra.push(<g key="hook" transform={`translate(${x + 10} ${mix(-500, top, drop) - yank})`}>
        <line x1={0} y1={-1200} x2={0} y2={0} stroke={INK} strokeWidth={6} />
        <path d="M0 0 L0 30 Q0 70 -34 62 Q-54 52 -44 30" fill="none" stroke={RED} strokeWidth={14} strokeLinecap="round" />
      </g>);
      if (yank > 1400) return null;
    } else if (gag === "sleep") {
      rot = -82 * ez(f, at + 6, at + 16); face = { ...FACES.neutral, eyeOpen: 0.06, mouthCurve: 0 };
      [0, 1, 2].forEach((k) => { const t = ((g + k * 14) % 42) / 42; extra.push(<text key={k} x={x - 70 + t * 60} y={WALK_Y - 40 - t * 140} fontSize={36 + t * 30} {...TXT} opacity={g > 10 ? 1 - t : 0}>z</text>); });
    } else if (gag === "cat") {
      face = blendFace(FACES.happy, FACES.laugh, 0.6, { lookX: 0.8, lookY: 0.6 });
      const hop = g > 10 ? g - 10 : 0;
      dx = -hop * 5; dy = hop > 0 ? -60 * Math.sin(Math.min(hop, 10) / 10 * Math.PI) + Math.max(0, hop - 10) ** 1.8 : 0; rot = -hop * 4;
      extra.push(<CatCard key="cat" x={x - 160 - g * 5} y={mix(-200, WALK_Y + 60 + g * 6, ez(f, at - 24, at))} f={f} />);
      if (dy > 900) return null;
    } else if (gag === "phone") {
      face = { ...FACES.neutral, eyeOpen: 0.8 }; lookY = 0.9; armR = -150;
      const [hx2, hy2] = palHand(x, WALK_Y, WS, 1, -150);
      extra.push(<g key="ph"><rect x={hx2 - 16} y={hy2 - 46} width={32} height={54} rx={6} fill={PLAYER} {...ln} strokeWidth={3} />
        <ellipse cx={hx2} cy={hy2 - 40} rx={60} ry={40} fill="#8FB7C9" opacity={0.25 + 0.1 * Math.sin(f / 4)} /></g>);
    }
  }
  return (
    <g>
      <g transform={`translate(${x + dx} ${ROAD_Y + dy}) rotate(${rot}) scale(${sc}) translate(${-x} ${-ROAD_Y})`} opacity={op}>
        <Pal x={x} y={WALK_Y} scale={WS} frame={f + i * 23} ink={INK} skin={INKCOL.skin} shirt={shirt} bob={walking ? 1 : 0}
          armL={20 + sw} armR={armR} legL={sw * 0.8} legR={-sw * 0.8} face={{ ...face, lookY: face.lookY + lookY }} />
      </g>
      {extra}
    </g>
  );
};

const Tumbleweed: React.FC<{ x: number; y: number; a: number }> = ({ x, y, a }) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    {Array.from({ length: 9 }, (_, k) => <ellipse key={k} rx={56} ry={22} transform={`rotate(${k * 20})`} fill="none" stroke="#8C6A47" strokeWidth={4} />)}
  </g>
);

const Road: React.FC<{ f: number }> = ({ f }) => {
  const end = f >= SCENES.end.start;
  const hx = headW(f);
  const flagIn = pop(f, T("hook", "23.7%"));
  const twenty = f >= T("math", "20");
  const out = T("math", "outlasted"), tune = T("math", "tune");
  // camera keys are offsets from the playhead, so the world scrolls with the video
  const [ox, cy, z] = camV(f, end
    ? [[SCENES.end.start, -60, 520, 1.5], [T("end", "way"), -60, 470, 1.9]]
    : [[T("hook", "average"), -250, 560, 1], [T("hook", "23.7%"), -60, 600, 1.12], [T("math", "For"), -220, 560, 1], [LEAVE - 12, -300, 560, 1.18],
      [out - 4, -60, 470, 2.2], [T("math", "It"), -560, 560, 0.85]]);
  const pal: Face = !end && f >= out ? blendFace(FACES.happy, FACES.smug, 0.7, { lookX: 0, lookY: 0 }) : FACES.happy;
  const pump = f >= out && !end ? pop(f, out + 4, 8) * (1 - ez(f, out + 40, out + 52)) : 0;
  const sw = Math.sin(f / 3.2) * 26;
  const crown = end ? pop(f, T("end", "way"), 9) : 0;
  return (
    <g transform={camAt(hx + ox, cy, z)}>
      <rect x={hx - 3000} y={-900} width={6000} height={3600} fill={WALL} />
      {/* framed thumbnails on the wall: the rest of the internet, waiting */}
      {Array.from({ length: 22 }, (_, k) => <g key={k} opacity={0.55}><Thumb x={200 + k * 300} y={330 + (k % 2) * 90} i={k} f={f} s={0.8} /></g>)}
      <rect x={hx - 3000} y={ROAD_Y + 40} width={6000} height={1800} fill={FLOOR} />
      {/* the bar itself: watched part red, the rest grey, ticks every 10 s */}
      <rect x={300} y={ROAD_Y} width={RUN * SPD} height={40} rx={20} fill="#B9AE97" {...ln} />
      <rect x={300} y={ROAD_Y} width={f * SPD} height={40} rx={20} fill={RED} {...ln} />
      {Array.from({ length: 9 }, (_, k) => <line key={k} x1={headW(k * 300)} y1={ROAD_Y + 8} x2={headW(k * 300)} y2={ROAD_Y + 32} stroke={PAPER} strokeWidth={4} opacity={0.6} />)}
      {flagIn > 0 ? (
        <g transform={`translate(${FLAG_X} ${ROAD_Y}) scale(${flagIn})`}>
          <line x1={0} y1={0} x2={0} y2={-330} stroke={INK} strokeWidth={8} />
          <path d="M0 -330 L230 -290 L0 -250 Z" fill={GOLD} {...ln} />
          <text x={84} y={-278} fontSize={44} textAnchor="middle" {...TXT}>{twenty ? "0:20" : "23.7%"}</text>
        </g>
      ) : null}
      {f >= tune && !end ? <Tumbleweed x={hx + 540 - (f - tune) * 16} y={ROAD_Y - 50 - Math.abs(Math.sin((f - tune) / 5)) * 50} a={-(f - tune) * 14} /> : null}
      {end ? null : [5, 4, 3, 2, 1].map((i) => <Quitter key={i} f={f} i={i} />)}
      {end ? <ellipse cx={hx - 70} cy={ROAD_Y + 10} rx={170} ry={36} fill="#FFF3C4" opacity={0.6} /> : null}
      <Pal x={hx - 70} y={WALK_Y} scale={WS} frame={f} ink={INK} skin={INKCOL.skin} shirt={TEAL} armL={20 + sw} armR={pump > 0 ? mix(-20 + sw, -165, pump) : -20 + sw}
        legL={sw * 0.8} legR={-sw * 0.8} face={pal} />
      {crown > 0 ? <path transform={`translate(${hx - 70} ${WALK_Y - 166 * WS}) scale(${crown * 2.4})`} d="M-12 0 L-12 -12 L-5 -5 L0 -14 L5 -5 L12 -12 L12 0 Z" fill={GOLD} {...ln} strokeWidth={1.5} /> : null}
      <circle cx={hx} cy={ROAD_Y + 20} r={30} fill={RED} {...ln} />
    </g>
  );
};

// ─────────────── the algorithm pulling the strings ───────────────
const Puppet: React.FC<{ f: number }> = ({ f }) => {
  const cut = T("end", "outsmarted"), snipped = f >= cut;
  const fall = snipped ? ez(f, cut, cut + 14) : 0;
  const tug = snipped ? 0 : Math.sin(f / 5), tug2 = snipped ? 0 : Math.sin(f / 5 + 1.7);
  const s = 1.8, px = 960, py = 690 + 30 * fall - 24 * Math.sin(Math.min(1, fall) * Math.PI);
  const aL = snipped ? 25 : 70 + 45 * tug, aR = snipped ? -25 : -70 - 45 * tug2;
  const hL = palHand(px, py, s, -1, aL), hR = palHand(px, py, s, 1, aR), head = [px, py - 147 * s] as const;
  const barY = 330 + 18 * tug;
  const strings: [number, readonly [number, number]][] = [[640, hL], [960, head], [1280, hR]];
  const face = snipped ? blendFace(FACES.shocked, FACES.smug, ez(f, cut + 10, cut + 24)) : blendFace(FACES.worried, FACES.confused, 0.5 + 0.5 * tug);
  return (
    <g transform={cam(f, [[SCENES.truth.start, 960, 520, 0.9], [T("truth", "exploit"), 960, 560, 1.05], [cut - 6, 960, 560, 1.05, true], [cut + 20, 960, 600, 1.2]])}>
      <rect x={-1200} y={-900} width={4400} height={3600} fill={WALL_LO} />
      <Gear x={180} y={120} r={170} a={f * 0.9} />
      <Gear x={1760} y={200} r={210} a={-f * 0.7} />
      <rect x={-1200} y={900} width={4400} height={1800} fill={FLOOR} />
      <g transform="translate(960 70) scale(1.1) translate(-960 0)"><Robot f={f} x={960} y={0} /></g>
      {/* the control bar the robot works */}
      <rect x={600} y={barY - 14} width={720} height={28} rx={12} fill={INKCOL.wood} {...ln} />
      {strings.map(([x1, [x2, y2]], k) => snipped
        ? <path key={k} d={`M${x1} ${barY + 10} q 12 ${120 + fall * 60} ${-10 + k * 6} ${200 + fall * 160}`} fill="none" stroke={INK} strokeWidth={3} opacity={1 - fall * 0.6} />
        : <line key={k} x1={x1} y1={barY + 10} x2={x2} y2={y2} stroke={INK} strokeWidth={3} />)}
      <Pal x={px} y={py} scale={s} frame={f} ink={INK} skin={INKCOL.skin} shirt={TEAL} armL={aL} armR={aR} legL={snipped ? 6 : 14 * tug} legR={snipped ? -6 : -14 * tug2} headTilt={snipped ? 0 : 8 * tug} face={face} bob={0} />
      {f >= cut - 10 && f < cut + 30 ? (() => {
        const open = f < cut ? 30 * ez(f, cut - 10, cut - 2) : 30 * (1 - ez(f, cut, cut + 3));
        return (
          <g transform={`translate(${hR[0] + 10} ${hR[1] - 80}) rotate(-30)`}>
            {[1, -1].map((d) => <g key={d} transform={`rotate(${d * open})`}><path d="M0 0 L90 -8 L0 8 Z" fill="#D2CBB6" {...ln} strokeWidth={3} /><circle cx={-26} cy={d * 14} r={14} fill="none" stroke={RED} strokeWidth={7} /></g>)}
          </g>
        );
      })() : null}
    </g>
  );
};

// ─────────────── the viewer at his desk ───────────────
const Laptop: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-170 0 L-150 -190 H150 L170 0 Z" fill="#8E9AAE" {...ln} strokeWidth={5} />
    <circle cx={0} cy={-100} r={20} fill="#D2CBB6" opacity={0.6 + 0.2 * Math.sin(f / 9)} />
    <rect x={-210} y={0} width={420} height={18} rx={8} fill="#6B6560" {...ln} strokeWidth={4} />
  </g>
);

const Brain: React.FC<{ x: number; y: number; s: number; legs?: number; rot?: number }> = ({ x, y, s, legs = 0, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {legs > 0 ? <g><path d={`M-14 24 L${-22 - legs * 10} ${48}`} {...ln} /><path d={`M14 24 L${22 + legs * 10} ${48}`} {...ln} /></g> : null}
    <path d="M-44 6 C-56 -30 -20 -52 0 -40 C20 -54 58 -32 46 4 C58 30 20 44 0 34 C-22 46 -58 32 -44 6 Z" fill="#E3A4A0" {...ln} strokeWidth={4} />
    <path d="M0 -36 C-8 -10 8 6 0 30 M-30 -14 C-18 -6 -24 8 -12 14 M28 -16 C18 -4 26 8 14 16" fill="none" stroke="#B9716E" strokeWidth={3.5} strokeLinecap="round" />
  </g>
);

const Desk: React.FC<{ f: number }> = ({ f }) => {
  const wired = f >= SCENES.wired.start && f < SCENES.truth.start;
  const atEnd = f >= SCENES.end.start;
  // gaze + face per beat; the eyes lead, the head follows a few frames later
  let face: Face = FACES.neutral, look = 0, lookY = 0, armL = 20, armR = -20, tilt = 0;
  if (f < SCENES.math.start) {
    const sh = pop(f, T("hook", "much,"), 8) * (1 - ez(f, T("hook", "but"), T("hook", "but") + 8));
    armL = 20 + 55 * sh; armR = -20 - 55 * sh; tilt = -8 * sh;
    face = f >= T("hook", "lose") ? blendFace(FACES.smug, FACES.worried, ez(f, T("hook", "lose"), T("hook", "lose") + 12)) : f >= T("hook", "lifetime") ? FACES.smug : FACES.neutral;
    look = sh * 0.6;
  } else if (f < T("caught", "Maybe")) {
    // caught: hands up under a spotlight, then the guilty side-glance
    const up = pop(f, T("caught", "Be") + 2, 9) * (1 - ez(f, T("caught", "second."), T("caught", "second.") + 10));
    armL = mix(20, 160, up); armR = mix(-20, -160, up);
    face = blendFace(FACES.shocked, FACES.worried, ez(f, T("caught", "yourself"), T("caught", "second.")), { lookX: 0, lookY: 0, eyeOpen: 1.25 });
    look = f >= T("caught", "second.") ? 0.7 : 0;
  } else if (f < SCENES.wired.start) {
    const press = pop(f, T("caught", "shrank") - 6, 10) * (1 - ez(f, T("caught", "searching") - 8, T("caught", "searching")));
    const torch = pop(f, T("caught", "searching") - 4, 12);
    armL = mix(20, 120, press); armR = mix(-20, -120, press);
    if (torch > 0) armR = mix(-20, -105 + 16 * Math.sin((f - T("caught", "searching")) / 9), torch);
    face = torch > 0 ? blendFace(FACES.neutral, FACES.happy, 0.4, { lookX: 0.9 * Math.sin((f - T("caught", "searching")) / 9), lookY: -0.4 }) : blendFace(FACES.neutral, FACES.annoyed, press);
  } else if (wired) {
    const relief = ez(f, T("wired", "bad."), T("wired", "bad.") + 10);
    face = blendFace(FACES.worried, FACES.happy, relief);
    const hits = ["quick", "hits", "stimulation."].map((wd) => pop(f, T("wired", wd), 8) * (1 - ez(f, T("wired", wd) + 8, T("wired", wd) + 16)));
    if (Math.max(...hits) > 0.3) face = blendFace(face, FACES.laugh, Math.max(...hits));
    const dart = pop(f, T("wired", "interesting"), 8);
    look = dart; tilt = 9 * pop(f, T("wired", "interesting") + 4, 10);
    if (f >= T("wired", "jump")) face = blendFace(FACES.confused, FACES.neutral, 0.4, { eyeOpen: 0.55, lookX: 0.4, mouthCurve: 0 });
  } else if (atEnd) {
    face = FACES.happy;
    const wave = pop(f, T("end", "Now,"), 9);
    armR = mix(-20, -150 + Math.sin(f / 3) * 22, wave);
    look = -0.2;
    lookY = f >= T("end", "feed.") ? 0.6 : 0;
  }
  if (!(wired && f >= T("wired", "jump"))) face = { ...face, lookX: face.lookX + look, lookY: face.lookY + lookY }; // after the jump the eyes stay blank
  const brainOut = wired ? ez(f, T("wired", "brain"), T("wired", "jump") + 6) : 0;
  const bx = mix(960, 1520, brainOut), by = mix(250, 300, brainOut) - Math.sin(brainOut * Math.PI) * 220;
  const card = wired ? pop(f, T("wired", "As")) : 0;
  const keys: K[] = [
    [SCENES.hook.start, 960, 560, 1], [T("hook", "lifetime"), 960, 430, 1.35],
    [SCENES.caught.start, 960, 360, 1.6, true], [T("caught", "Be") + 4, 960, 380, 2.0], [T("caught", "second."), 1000, 330, 2.5],
    [T("caught", "Maybe"), 960, 420, 1.15, true], [T("caught", "searching"), 960, 400, 0.95],
    [SCENES.wired.start, 960, 450, 1.35, true], [T("wired", "We've"), 960, 420, 1.2], [T("wired", "As"), 1180, 420, 1.15], [T("wired", "jump"), 1250, 380, 1.3],
    [SCENES.end.start, 960, 480, 1.25, true],
  ];
  const caughtNow = f >= SCENES.caught.start && f < T("caught", "Maybe");
  const vign = caughtNow ? ez(f, T("caught", "Be"), T("caught", "Be") + 6) : 0;
  const siren = caughtNow && f < T("caught", "second.") + 10 ? (Math.floor(f / 6) % 2 ? RED : "#3D6FD1") : null;
  const inMaybe = f >= T("caught", "Maybe") && f < SCENES.wired.start;
  const shrink = inMaybe ? ez(f, T("caught", "shrank"), T("caught", "shrank") + 12) : 0;
  const torchT = inMaybe ? pop(f, T("caught", "searching") - 4, 12) : 0;
  const torchHand = palHand(960, 560, 2.3, 1, -105 + 16 * Math.sin((f - T("caught", "searching")) / 9));
  const beamX = 960 + 760 * Math.sin((f - T("caught", "searching")) / 9);
  const wire = (k: number) => `M${930 + k * 30} 250 C${700 + k * 120} ${120 - k * 40} ${560 + k * 200} 520 ${900 + k * 60} 580`;
  return (
    <g transform={cam(f, keys)}>
      <rect x={-1200} y={-900} width={4400} height={3600} fill={WALL} />
      <rect x={-1200} y={800} width={4400} height={1800} fill={FLOOR} />
      <rect x={220} y={170} width={330} height={250} rx={10} fill="#E6E0CF" {...ln} strokeWidth={5} />
      <line x1={385} y1={170} x2={385} y2={420} {...ln} /><line x1={220} y1={295} x2={550} y2={295} {...ln} />
      <rect x={1420} y={260} width={300} height={16} fill={INKCOL.wood} {...ln} strokeWidth={3} />
      {[0, 1, 2, 3, 4].map((k) => <rect key={k} x={1440 + k * 44} y={180 - (k % 2) * 16} width={34} height={80 + (k % 2) * 16} fill={["#C8553D", "#7E8B5A", "#D9A441", "#8E9AAE", "#B9716E"][k]} {...ln} strokeWidth={3} />)}
      {wired ? [0, 1, 2].map((k) => {
        const on = ez(f, T("wired", "wired") + k * 4, T("wired", "wired") + k * 4 + 14);
        return on > 0 ? <path key={k} d={wire(k)} fill="none" stroke={[RED, TEAL, GOLD][k]} strokeWidth={6} strokeDasharray={`${900 * on} 900`} strokeLinecap="round" /> : null;
      }) : null}
      <Pal x={960} y={560} scale={2.3} frame={f} ink={INK} skin={INKCOL.skin} shirt={TEAL} face={face} armL={armL} armR={armR} legL={80} legR={-80} headTilt={tilt} bob={1.2} />
      {brainOut > 0 ? <g>
        <Brain x={bx} y={by} s={1.3} legs={Math.sin(brainOut * Math.PI)} rot={brainOut * 360} />
        {/* jumping ship: the brain wears a life ring */}
        <circle cx={bx} cy={by + 10} r={58} fill="none" stroke={RED} strokeWidth={16} />
        <circle cx={bx} cy={by + 10} r={58} fill="none" stroke={PAPER} strokeWidth={16} strokeDasharray="22 69" />
      </g> : null}
      {inMaybe && shrink < 1 && f >= T("caught", "Maybe") ? (
        // the player he is about to crush, floating over the laptop
        <g transform={`translate(960 330) scale(${mix(1, 0.08, shrink)} ${mix(1, 0.08, shrink ** 0.6)})`} opacity={pop(f, T("caught", "Maybe"))}>
          <rect x={-330} y={-190} width={660} height={380} rx={22} fill={PLAYER} {...ln} />
          <path d="M-30 -50 L50 0 L-30 50 Z" fill={PAPER} />
          <rect x={-290} y={140} width={580} height={12} rx={6} fill="#6B6560" /><rect x={-290} y={140} width={200} height={12} rx={6} fill={RED} />
        </g>
      ) : null}
      {inMaybe && shrink >= 1 ? <rect x={1080 - 18} y={600 - 12} width={36} height={22} rx={4} fill={PLAYER} {...ln} strokeWidth={3} /> : null}
      {torchT > 0 ? <g>
        {/* flashlight sweep: wall thumbnails light up as the beam finds them */}
        {[220, 640, 1280, 1700].map((x, k) => <Thumb key={k} x={x - 110} y={120} i={k + 3} f={f} glow={cl(1 - Math.abs(beamX - x) / 180) * torchT} />)}
        <path d={`M${torchHand[0]} ${torchHand[1]} L${beamX - 170} 60 L${beamX + 170} 60 Z`} fill="#FFF3C4" opacity={0.45 * torchT} />
        <rect x={torchHand[0] - 14} y={torchHand[1] - 34} width={28} height={50} rx={6} fill={INK} transform={`rotate(${(beamX - 960) / 30} ${torchHand[0]} ${torchHand[1]})`} />
      </g> : null}
      <ellipse cx={960} cy={360} rx={260} ry={220} fill="#8FB7C9" opacity={0.12 + 0.05 * Math.sin(f / 6)} />
      <rect x={300} y={720} width={1320} height={70} rx={12} fill={INKCOL.wood} {...ln} strokeWidth={5} />
      <rect x={360} y={790} width={30} height={200} fill={INKCOL.woodD} {...ln} /><rect x={1530} y={790} width={30} height={200} fill={INKCOL.woodD} {...ln} />
      <Laptop x={960} y={720} f={f} />
      {f < SCENES.math.start && f >= T("hook", "lose") ? (() => {
        const lvl = 1 - ez(f, T("hook", "lose"), T("hook", "days.") + 10);
        return (
          <g transform={`translate(1160 120) scale(${pop(f, T("hook", "lose"))})`}>
            <rect x={0} y={0} width={150} height={70} rx={12} fill={PAPER} {...ln} /><rect x={150} y={22} width={14} height={26} fill={INK} />
            <rect x={10} y={10} width={130 * lvl} height={50} rx={6} fill={lvl > 0.3 ? SAGE : RED} />
                      </g>
        );
      })() : null}
      {wired ? ["quick", "hits", "stimulation."].map((wd, k) => {
        const t = cl((f - T("wired", wd)) / 14);
        if (t <= 0 || t >= 1) return null;
        const u = 1 - t, a = [930 + k * 30, 250], c1 = [700 + k * 120, 120 - k * 40], c2 = [560 + k * 200, 520], b = [900 + k * 60, 580];
        // spark runs from the laptop up the wire into the head
        const p = (i: number) => u * u * u * b[i] + 3 * u * u * t * c2[i] + 3 * u * t * t * c1[i] + t * t * t * a[i];
        return <g key={wd} transform={`translate(${p(0)} ${p(1)})`}><path d="M0 -26 L8 -6 L26 0 L8 6 L0 26 L-8 6 L-26 0 L-8 -6 Z" fill={GOLD} {...ln} strokeWidth={2} /></g>;
      }) : null}
      {card > 0 ? <g transform={`translate(${1520 - 110} ${300 - 62 + Math.sin(f / 8) * 8})`}><Thumb x={0} y={0} i={2} f={f} glow={1} s={card} /></g> : null}
      {vign > 0 ? <rect x={-1200} y={-900} width={4400} height={3600} fill="url(#attnSpot)" opacity={vign} /> : null}
      {siren ? <rect x={-1200} y={-900} width={4400} height={3600} fill={siren} opacity={0.16} /> : null}
    </g>
  );
};

/** "Almost everyone does it": five viewers, five laptops, the same glance. */
const Everyone: React.FC<{ f: number }> = ({ f }) => {
  const at = T("wired", "everyone");
  return (
    <g transform={cam(f, [[SCENES.wired.start, 960, 560, 1.12], [at, 960, 540, 1]])}>
      <rect x={-1200} y={-900} width={4400} height={3600} fill={WALL} />
      {[0, 1, 2, 3, 4].map((k) => {
        const x = 230 + k * 365, d = pop(f, at + k * 3, 9);
        return (
          <g key={k} opacity={pop(f, SCENES.wired.start + k * 2)}>
            <Pal x={x} y={600} frame={f + k * 17} ink={INK} skin={INKCOL.skin} shirt={[SAGE, RED, TEAL, GOLD, "#8E9AAE"][k]} scale={1.25} legL={80} legR={-80}
              face={{ ...FACES.neutral, lookX: d * 0.9, lookY: -0.2 * d }} headTilt={7 * d} />
            <rect x={x - 160} y={700} width={320} height={34} rx={8} fill={INKCOL.wood} {...ln} strokeWidth={4} />
            <Laptop x={x} y={700} s={0.5} f={f + k * 5} />
          </g>
        );
      })}
    </g>
  );
};

/** The feed: an endless phone scroll, the viewer hopping video to video, then glued to the screen. */
const Feed: React.FC<{ f: number }> = ({ f }) => {
  const hopAt = T("truth", "making"), glueAt = T("truth", "so");
  if (f < hopAt) {
    const scroll = (f - SCENES.truth.start) * 9;
    return (
      <g transform={cam(f, [[T("truth", "Their"), 960, 540, 1.25], [T("truth", "attention"), 960, 540, 1]])}>
        <rect x={-1200} y={-900} width={4400} height={3600} fill={WALL_LO} />
        <rect x={700} y={40} width={520} height={1000} rx={60} fill="#3A332C" {...ln} strokeWidth={6} />
        <clipPath id="attnPhone"><rect x={730} y={90} width={460} height={900} rx={30} /></clipPath>
        <g clipPath="url(#attnPhone)">
          <rect x={730} y={90} width={460} height={900} fill={PAPER} />
          {Array.from({ length: 12 }, (_, k) => {
            const y = 110 + ((k * 300 - scroll) % 3600 + 3600) % 3600 - 300;
            return <g key={k}><Thumb x={760} y={y} i={k} f={f} s={1.82} /></g>;
          })}
        </g>
        <Robot f={f} x={960} y={-60} />
      </g>
    );
  }
  if (f < glueAt) {
    const hop = (f - hopAt) / 11, i = Math.min(5, Math.floor(hop)), t = Math.min(1, hop - i) * (hop >= 6 ? 0 : 1);
    const x0 = 260 + i * 280 + 110, x = hop >= 6 ? 260 + 5 * 280 + 110 : mix(x0, x0 + 280, t);
    const air = Math.sin(t * Math.PI), squash = t < 0.12 ? 1 - 0.18 * (1 - t / 0.12) : 1;
    return (
      <g transform={cam(f, [[hopAt, 960, 560, 1]])}>
        <rect x={-1200} y={-900} width={4400} height={3600} fill={WALL} />
        {Array.from({ length: 7 }, (_, k) => <Thumb key={k} x={260 + k * 280} y={700 + Math.sin(f / 10 + k) * 6} i={k} f={f} glow={k === i + (t > 0.5 ? 1 : 0) ? 1 : 0} />)}
        <g transform={`translate(${x} ${700 - 172 * squash - air * 170}) scale(1 ${squash})`}>
          <Pal x={0} y={0} scale={1.05} frame={f} ink={INK} skin={INKCOL.skin} shirt={TEAL} face={FACES.happy} armL={20 + air * 110} armR={-20 - air * 110} legL={air * 30} legR={-air * 30} lean={air * 8} />
        </g>
      </g>
    );
  }
  // glued: Pal leans into a giant phone, his face stuck to it with bubble gum that stretches every time he pulls away
  const g = f - glueAt, pull = Math.max(0, Math.sin((g - 8) / 8)) * ez(f, glueAt + 8, glueAt + 16);
  const s = 2.0, px = 900, py = 600, lean = mix(24, 2, pull);
  const r = (lean * Math.PI) / 180;
  const hx = px + (140 * Math.sin(r)) * s, hy = py + (194 - 140 * Math.cos(r) - 160) * s; // head centre after the lean
  const face = blendFace(FACES.worried, FACES.shocked, pull, { lookX: 0.8, lookY: 0 });
  return (
    <g transform={cam(f, [[glueAt, 1040, 520, 1.15], [T("truth", "glued"), 1060, 480, 1.4]])}>
      <rect x={-1200} y={-900} width={4400} height={3600} fill={WALL_LO} />
      <rect x={-1200} y={880} width={4400} height={1800} fill={FLOOR} />
      <rect x={1180} y={60} width={460} height={900} rx={56} fill={PLAYER} {...ln} strokeWidth={6} />
      <rect x={1206} y={110} width={408} height={800} rx={30} fill="#8FB7C9" />
      {Array.from({ length: 4 }, (_, k) => <g key={k}><Thumb x={1300} y={150 + ((k * 210 + g * 6) % 840)} i={k} f={f} s={1} /></g>)}
      <Pal x={px} y={py} scale={s} frame={f} ink={INK} skin={INKCOL.skin} shirt={TEAL} face={face} lean={lean} armL={40 + 60 * pull} armR={-60} bob={0} />
      {[-26, 0, 26, 50].map((dy, k) => {
        const x1 = hx + 38 * s, x2 = 1210, y1 = hy + dy, sag = 20 + 50 * pull;
        return <path key={k} d={`M${x1} ${y1} Q${(x1 + x2) / 2} ${y1 + sag} ${x2} ${y1 + 6}`} fill="none" stroke="#F08FB0" strokeWidth={mix(22, 6, pull) - k * 2} strokeLinecap="round" opacity={0.95} />;
      })}
    </g>
  );
};

const cuts = (): [number, React.FC<{ f: number }>][] => [
  [0, Page], [T("hook", "That"), Desk], [T("hook", "One"), Page], [T("hook", "average"), Road],
  [T("caught", "Be"), Desk], [T("caught", "Were"), Page], [T("caught", "Maybe"), Desk],
  [SCENES.wired.start, Desk], [T("wired", "Almost"), Everyone], [T("wired", "We've"), Desk], [SCENES.truth.start, Puppet], [T("truth", "Their"), Feed],
  [SCENES.end.start, Road], [T("end", "outsmarted") - 6, Puppet], [T("end", "Now,"), Desk], [T("end", "feed.") + 20, Page],
];

const World: React.FC = () => {
  const f = useCurrentFrame();
  const list = cuts();
  const Set = [...list].reverse().find(([at]) => f >= at)![1];
  const cutAt = [...list].reverse().find(([at]) => f >= at)![0];
  const flash = 1 - cl((f - cutAt) / 5); // a two-frame paper flash sells each cut
  return (
    <AbsoluteFill>
      <Ink>
        <defs>
          <radialGradient id="attnVig" cx="50%" cy="40%" r="60%"><stop offset="55%" stopColor="#2B2620" stopOpacity={0} /><stop offset="100%" stopColor="#2B2620" stopOpacity={0.55} /></radialGradient>
          {/* caught: a hard spotlight on Pal, user-space so it sits on him whatever the camera does */}
          <radialGradient id="attnSpot" gradientUnits="userSpaceOnUse" cx={960} cy={420} r={520}><stop offset="0.55" stopColor="#120E0A" stopOpacity={0} /><stop offset="0.62" stopColor="#120E0A" stopOpacity={0.78} /><stop offset="1" stopColor="#120E0A" stopOpacity={0.85} /></radialGradient>
        </defs>
        <Set f={f} />
        {cutAt > 0 ? <rect x={0} y={0} width={1920} height={1080} fill={PAPER} opacity={flash * 0.5} /> : null}
      </Ink>
    </AbsoluteFill>
  );
};

// ─────────────── sound ───────────────
// no noise-based effects (crowd, tear, clock, wind, paper, typing): under the voice they read as static
type Fx = "ding" | "boing" | "sparkle" | "whoosh_low" | "whoosh" | "tick" | "thud" | "pop" | "clang" | "sting" | "splash" | "beep" | "gulp" | "snip";
export const CUES: Record<string, [string, number, Fx, number, number?][]> = {
  hook: [["26", 0, "ding", 0.35], ["much,", 0, "boing", 0.22], ["lifetime", 0, "sparkle", 0.25], ["lose", 0, "whoosh_low", 0.3], ["23.7%", 0, "tick", 0.4]],
  math: [["For", 0, "pop", 0.25], ["20", 0, "thud", 0.5], ["20", 0, "whoosh", 0.3, 6], ["20", 0, "thud", 0.3, 22], ["seconds.", 0, "pop", 0.3, 10], ["tune", 0, "whoosh_low", 0.3], ["outlasted", 0, "ding", 0.3], ["outlasted", 0, "sparkle", 0.3], ["tune", 0, "whoosh", 0.3]],
  caught: [["Be", 0, "sting", 0.4], ["Be", 0, "beep", 0.15, 6], ["recommended", 0, "pop", 0.3], ["skimming", 0, "pop", 0.25], ["tab", 0, "pop", 0.35], ["shrank", 0, "boing", 0.3], ["searching", 0, "tick", 0.3]],
  wired: [["bad.", 0, "ding", 0.25], ["everyone", 0, "whoosh", 0.25], ["wired", 0, "clang", 0.2], ["quick", 0, "pop", 0.3], ["hits", 0, "pop", 0.3], ["stimulation.", 0, "pop", 0.3],
    ["interesting", 0, "sparkle", 0.35], ["brain", 0, "boing", 0.3], ["jump", 0, "splash", 0.35]],
  truth: [["truth", 0, "sting", 0.3], ["built", 0, "clang", 0.15], ["short", 0, "whoosh", 0.25], ["making", 0, "boing", 0.2], ["glued", 0, "gulp", 0.3]],
  end: [["way", 0, "sparkle", 0.3], ["outsmarted", 0, "snip", 0.45], ["outsmarted", 0, "sparkle", 0.35, 8], ["algorithm.", 0, "clang", 0.3], ["feed.", 0, "pop", 0.25]],
};
const has = (src: string) => getStaticFiles().some((s) => s.name === src);

export const AttnVideo: React.FC = () => {
  usePaperFonts();
  const hops = Array.from({ length: 6 }, (_, k) => T("truth", "making") + k * 11);
  const ticks = Array.from({ length: 5 }, (_, k) => RUN - (5 - k) * 30);
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <World />
      {Object.entries(SCENES).map(([key, sc]) => (
        <Sequence key={key} from={sc.start} durationInFrames={sc.dur} name={key}>
          <Captions scene={key} />
          {has(`vo_attn/${key}.wav`) ? <Sequence from={sc.lead}><Audio src={staticFile(`vo_attn/${key}.wav`)} /></Sequence> : null}
          {(CUES[key] ?? []).map(([word, n, fx, vol, off = 0], i) => (
            <Sequence key={i} from={Math.max(0, w(key, word, n) + off)}><Audio src={staticFile(`sfx/${fx}.wav`)} volume={vol} /></Sequence>
          ))}
        </Sequence>
      ))}
      <Sequence from={LEAVE} durationInFrames={60}><Audio src={staticFile("sfx/boing.wav")} volume={0.25} /></Sequence>
      {hops.map((at) => <Sequence key={at} from={at} durationInFrames={20}><Audio src={staticFile("sfx/pop.wav")} volume={0.18} /></Sequence>)}
      {ticks.map((at) => <Sequence key={at} from={at} durationInFrames={20}><Audio src={staticFile("sfx/tick.wav")} volume={0.25} /></Sequence>)}
      <Audio src={staticFile("music/modern.mp3")} loop volume={(fr) => 0.07 * Math.min(1, fr / 20, Math.max(0, (TOTAL_FRAMES - fr) / 20))} />
    </AbsoluteFill>
  );
};
