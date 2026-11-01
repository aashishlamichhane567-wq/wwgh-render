import React from "react";
import { AbsoluteFill, Audio, Sequence, getStaticFiles, staticFile, useCurrentFrame } from "remotion";
import { INK, PaperDefs, PaperTexture, torn, usePaperFonts } from "../Puppet/paper";
import { ClayDefs, boilSeed, onTwos } from "../Toon/Clay";
import { ez, mix, pop, span } from "../Russia/kit";
import { Captions, w } from "./overlays";
import { SCENES } from "./timing";

/**
 * Style test for the discipline episode's hook ("The 40-Second Window"): the same shots, keyed to the same spoken
 * words, drawn twice — scene "paper" in the Russia paper-theatre look, scene "clay" through the Morning Nine clay
 * material (Toon/Clay, poses on twos). Only the look changes, so the two halves compare like for like.
 */

type Look = { clay: boolean; seam: string; sw: number; fx: string; sheet: (x: number, y: number, w: number, h: number, seed: number) => string };
const rr = (x: number, y: number, w: number, h: number) => {
  const r = Math.min(28, w / 2, h / 2);
  return `M${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} H${x + r} Q${x},${y + h} ${x},${y + h - r} V${y + r} Q${x},${y} ${x + r},${y} Z`;
};
const PAPER: Look = { clay: false, seam: INK, sw: 3, fx: "url(#cut)", sheet: (x, y, w, h, s) => torn(x, y, w, h, s, 5, 16) };
const CLAY: Look = { clay: true, seam: "rgba(30,18,16,0.28)", sw: 6, fx: "url(#inflateS)", sheet: (x, y, w, h) => rr(x, y, w, h) };

const COL = {
  wall: "#24305A", wallLo: "#1A2344", floor: "#141B33", wood: "#7A5236", woodD: "#5C3B26", clock: "#26232C", red: "#FF4436",
  skin: "#F2B48F", skinD: "#D88E6E", hair: "#231A22", hood: "#1E9C93", blanket: "#3E6FB0", pillow: "#E9E4D6",
  brain: "#F29BB0", brainD: "#C9637F", visor: "#2E9E6B", room: "#0F2A33", cyan: "#5FE3E0", moon: "#F3F1DE", paper: "#F3E6C4",
};

type P = { L: Look; f: number; W: (word: string, n?: number) => number };
const st = (L: Look) => ({ stroke: L.seam, strokeWidth: L.sw, strokeLinejoin: "round" as const, filter: L.fx });

const Sheet: React.FC<{ L: Look; x: number; y: number; w: number; h: number; fill: string; seed?: number }> = ({ L, x, y, w, h, fill, seed = 1 }) => (
  <path d={L.sheet(x, y, w, h, seed)} fill={fill} {...st(L)} />
);

const Tag: React.FC<{ L: Look; x: number; y: number; t: number; text: string; size?: number; fill?: string; color?: string; rot?: number }> = ({
  L, x, y, t, text, size = 64, fill = COL.paper, color = INK, rot = -3,
}) => {
  if (t <= 0) return null;
  const w = text.length * size * 0.56 + 70, h = size * 1.45;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${t})`}>
      <Sheet L={L} x={-w / 2} y={-h / 2} w={w} h={h} fill={fill} seed={11} />
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

/** Bedside alarm clock; `ring` 0..1 shakes it and flashes the ring marks. */
const Clock: React.FC<{ L: Look; x: number; y: number; k?: number; f: number; ring: number }> = ({ L, x, y, k = 1, f, ring }) => (
  <g transform={`translate(${x + Math.sin(f * 2.1) * 9 * ring} ${y}) rotate(${Math.sin(f * 1.7) * 3 * ring}) scale(${k})`}>
    {ring > 0
      ? [-1, 1].flatMap((s) => [0, 1].map((i) => (
          <path key={`${s}${i}`} d={`M${s * (300 + i * 44)} -90 Q${s * (345 + i * 44)} 0 ${s * (300 + i * 44)} 90`} stroke={COL.red} strokeWidth={12}
            fill="none" strokeLinecap="round" opacity={ring * (0.5 + 0.5 * Math.sin(f * 1.3 + i * 2))} />
        )))
      : null}
    <Sheet L={L} x={-210} y={150} w={60} h={40} fill={COL.clock} seed={4} />
    <Sheet L={L} x={150} y={150} w={60} h={40} fill={COL.clock} seed={5} />
    <Sheet L={L} x={-260} y={-160} w={520} h={320} fill={COL.clock} seed={7} />
    <rect x={-215} y={-115} width={430} height={230} rx={14} fill="#0A0606" />
    <text x={0} y={72} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={210} fill={COL.red}
      style={{ filter: "drop-shadow(0 0 16px rgba(255,60,40,0.85))" }}>6:00</text>
  </g>
);

/* ─────────── shot 1: the clock in the dark ─────────── */
const ShotClock: React.FC<P> = ({ L, f, W }) => {
  const on = ez(f, 4, 34);
  const ring = f >= W("alarm") ? 1 : 0;
  return (
    <g transform={`translate(960 600) scale(${mix(1, 1.08, ez(f, 0, W("eyes")))}) translate(-960 -600)`}>
      <rect x={-200} y={-200} width={2320} height={1480} fill={COL.wallLo} />
      <defs>
        <radialGradient id={`glow${+L.clay}`}>
          <stop offset="0" stopColor={COL.red} stopOpacity={0.35} />
          <stop offset="1" stopColor={COL.red} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={960} cy={560} rx={760} ry={460} fill={`url(#glow${+L.clay})`} opacity={on * (1 + 0.25 * ring * Math.sin(f * 1.3))} />
      <Sheet L={L} x={360} y={770} w={1200} h={420} fill={COL.woodD} seed={3} />
      <g opacity={on}><Clock L={L} x={960} y={600} f={f} ring={ring} /></g>
      <Tag L={L} x={960} y={230} t={span(f, W("forty"), W("alarm"))} text="40 SECONDS" />
    </g>
  );
};

/* ─────────── shot 2: eyes open, then the dive into the pupil ─────────── */
const Eye: React.FC<{ L: Look; x: number; y: number; open: number; id: string }> = ({ L, x, y, open, id }) => (
  <g>
    <defs><clipPath id={id}><ellipse cx={x} cy={y} rx={200} ry={118} /></clipPath></defs>
    <ellipse cx={x} cy={y} rx={200} ry={118} fill="#F4EFE6" {...st(L)} />
    <g clipPath={`url(#${id})`}>
      <circle cx={x} cy={y + 6} r={88} fill="#6B4328" />
      <circle cx={x} cy={y + 6} r={46} fill="#080505" />
      <circle cx={x - 26} cy={y - 20} r={14} fill="#FFFFFF" />
      <rect x={x - 220} y={y - 140} width={440} height={22 + 236 * (1 - open)} fill={COL.skin} />
      <line x1={x - 210} y1={y - 118 + 236 * (1 - open)} x2={x + 210} y2={y - 118 + 236 * (1 - open)} stroke={L.clay ? COL.skinD : INK} strokeWidth={L.clay ? 10 : 5} />
    </g>
    <path d={`M${x - 210} ${y - 150} Q${x} ${y - 230} ${x + 210} ${y - 150}`} stroke={COL.skinD} strokeWidth={10} fill="none" strokeLinecap="round" />
  </g>
);

const ShotEyes: React.FC<P> = ({ L, f, W }) => {
  const open = ez(f, W("open") - 8, W("open") + 4);
  const dive = ez(f, W("before") - 6, W("before") + 8);
  const s = mix(1, 11, dive * dive);
  return (
    <g transform={`translate(1280 566) scale(${s}) translate(-1280 -566)`}>
      <rect x={-200} y={-200} width={2320} height={1480} fill={COL.skin} />
      <Eye L={L} x={640} y={560} open={open} id={`eL${+L.clay}`} />
      <Eye L={L} x={1280} y={560} open={open} id={`eR${+L.clay}`} />
      <rect x={-200} y={-200} width={2320} height={1480} fill="#0B1030" opacity={0.42} />
      <rect x={-200} y={-200} width={900} height={1480} fill={COL.red} opacity={0.12 + 0.05 * Math.sin(f * 1.3)} />
    </g>
  );
};

/* ─────────── shot 3: the brain's control room ─────────── */
const Brain: React.FC<{ L: Look; x: number; y: number; tilt: number; hand: [number, number]; lid: number; frown: number }> = ({ L, x, y, tilt, hand, lid, frown }) => (
  <g transform={`translate(${x} ${y})`}>
    {[-1, 1].map((s) => (
      <g key={s}>
        <path d={`M${s * 60} 160 L${s * 70} 300`} stroke={COL.brainD} strokeWidth={26} strokeLinecap="round" />
        <ellipse cx={s * 82} cy={306} rx={46} ry={20} fill={COL.brainD} {...st(L)} />
      </g>
    ))}
    <path d="M-200 40 Q-260 110 -250 190" stroke={COL.brainD} strokeWidth={24} fill="none" strokeLinecap="round" />
    <path d={`M200 40 Q${(200 + hand[0]) / 2 + 40} ${(40 + hand[1]) / 2 - 30} ${hand[0]} ${hand[1]}`} stroke={COL.brainD} strokeWidth={24} fill="none" strokeLinecap="round" />
    <circle cx={hand[0]} cy={hand[1]} r={26} fill={COL.brainD} {...st(L)} />
    <g transform={`rotate(${tilt})`}>
      <ellipse cx={0} cy={0} rx={236} ry={196} fill={COL.brain} {...st(L)} />
      {["M-170 -60 Q-120 -110 -60 -80 Q-10 -130 50 -90", "M-190 40 Q-150 0 -110 30", "M120 -120 Q170 -90 160 -30 Q200 0 180 60", "M-40 130 Q10 100 60 140 Q110 110 150 140", "M-150 110 Q-120 150 -80 130"].map((d, i) => (
        <path key={i} d={d} stroke={COL.brainD} strokeWidth={8} fill="none" strokeLinecap="round" />
      ))}
      {/* accountant's eyeshade: the brain is the one running the numbers */}
      <path d="M-210 -100 Q0 -190 210 -100 L250 -60 Q0 -120 -250 -60 Z" fill={COL.visor} opacity={0.92} {...st(L)} />
      {[-72, 72].map((ex, i) => (
        <g key={i}>
          <ellipse cx={ex} cy={10} rx={44} ry={38} fill="#FFFFFF" {...st(L)} />
          <circle cx={ex} cy={18} r={17} fill="#1A1010" />
          <rect x={ex - 48} y={-30} width={96} height={40 + 40 * lid} fill={COL.brain} />
          <path d={`M${ex - 44} ${10 + 40 * lid - 30 + 10} L${ex + 44} ${10 + 40 * lid - 30 + 10}`} stroke={COL.brainD} strokeWidth={6} />
          <path d={`M${ex - 34} 62 Q${ex} 76 ${ex + 34} 62`} stroke={COL.brainD} strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
      ))}
      <path d={`M-42 112 Q0 ${112 - 18 * frown} 42 112`} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
    </g>
  </g>
);

const ShotBrain: React.FC<P & { t0: number }> = ({ L, f, W, t0 }) => {
  const iris = ez(f, t0, t0 + 14);
  const slam = W("for");
  const shake = span(f, W("decision"), slam + 2, 4) * Math.sin(f * 0.9) * 9;
  const raise = ez(f, slam - 12, slam - 4), down = ez(f, slam - 3, slam);
  const hand: [number, number] = [mix(mix(250, 330, raise), 410, down), mix(mix(190, -90, raise), 175, down)];
  const press = f >= slam ? 1 - ez(f, slam + 6, slam + 16) : 0;
  const flash = f >= slam ? 1 - ez(f, slam, slam + 12) : 0;
  const panel = ez(f, W("numbers") - 14, W("numbers") + 2);
  const aborted = f >= slam ? 1 : 0;
  const drop = pop(f, W("project"), 10);
  return (
    <g>
      <defs><clipPath id={`iris${+L.clay}`}><circle cx={960} cy={540} r={iris * 1150} /></clipPath></defs>
      <rect width={1920} height={1080} fill="#000" />
      <g clipPath={`url(#iris${+L.clay})`}>
        <rect width={1920} height={1080} fill={COL.room} />
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={i} x={60 + (i % 7) * 270} y={70 + Math.floor(i / 7) * 150} width={220} height={110} rx={10} fill="#16404C"
            opacity={0.5 + 0.3 * Math.sin(f / 9 + i)} />
        ))}
        <rect y={820} width={1920} height={260} fill="#0A1C24" />
        {/* console + ABORT button */}
        <Sheet L={L} x={800} y={760} w={360} h={200} fill="#2C4A55" seed={9} />
        <ellipse cx={970} cy={770 + 10 * press} rx={84} ry={34 - 12 * press} fill={COL.red} {...st(L)} />
        <text x={980} y={890} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={48} fill="#FFFFFF">ABORT</text>
        <Brain L={L} x={560} y={580} tilt={shake} hand={hand} lid={0.55} frown={span(f, W("decision"), 9999, 6)} />
        {/* the hologram it pulls down */}
        <g transform={`translate(1040 120) scale(1 ${panel})`} opacity={panel > 0 ? 1 : 0}>
          <rect width={800} height={600} rx={18} fill={aborted ? COL.red : COL.cyan} opacity={0.16} />
          <rect width={800} height={600} rx={18} fill="none" stroke={aborted ? COL.red : COL.cyan} strokeWidth={5} />
          <text x={400} y={70} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={44} fill={COL.cyan} letterSpacing={4}>TODAY</text>
          <g transform={`translate(140 300) scale(${pop(f, W("cold"), 9)})`}>
            <rect x={-100} y={-30} width={200} height={34} fill="#CFEFFA" {...st(L)} />
            {[-80, -40, 0, 40, 80].map((x, i) => <path key={i} d={`M${x - 14} 4 L${x} ${50 + (i % 2) * 26} L${x + 14} 4 Z`} fill="#CFEFFA" />)}
            <text y={150} textAnchor="middle" fontFamily="Oswald" fontWeight={600} fontSize={36} fill={COL.cyan}>COLD FLOOR</text>
          </g>
          <g transform={`translate(400 300) scale(${pop(f, W("long"), 9)})`}>
            <circle cx={-110} cy={0} r={26} fill="#FFD36B" />
            <rect x={-80} y={-8} width={160} height={16} rx={8} fill={COL.cyan} />
            <circle cx={110} cy={0} r={24} fill={COL.moon} />
            <text y={150} textAnchor="middle" fontFamily="Oswald" fontWeight={600} fontSize={36} fill={COL.cyan}>LONG DAY</text>
          </g>
          <g transform={`translate(650 ${300 - 260 * (1 - drop)})`} opacity={drop > 0 ? 1 : 0}>
            <path d="M-110 -50 H90 Q130 -50 150 -20 H70 L50 10 H30 L44 60 H-64 L-50 10 H-70 L-90 -20 Z" fill="#4A505A" {...st(L)} />
            <text y={-12} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={30} fill="#FFFFFF">PROJECT</text>
          </g>
          <text x={650} y={450} textAnchor="middle" fontFamily="Oswald" fontWeight={600} fontSize={36} fill={COL.cyan} opacity={drop}>THE PROJECT</text>
          {aborted ? <text x={400} y={560} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={70} fill={COL.red} transform={`rotate(-6 400 560)`}>ABORTED</text> : null}
        </g>
        <rect width={1920} height={1080} fill={COL.red} opacity={flash * 0.35} />
      </g>
    </g>
  );
};

/* ─────────── shots 4–5: the bedroom ─────────── */
const Bedroom: React.FC<{ L: Look; f: number; ring: number; arm: [number, number] | null; eyes: number }> = ({ L, f, ring, arm, eyes }) => (
  <g>
    <rect x={-300} y={-300} width={2520} height={1680} fill={COL.wall} />
    <Sheet L={L} x={260} y={160} w={340} h={300} fill="#0E1730" seed={21} />
    <circle cx={500} cy={250} r={40} fill={COL.moon} />
    <rect x={-300} y={880} width={2520} height={500} fill={COL.floor} />
    <Sheet L={L} x={160} y={440} w={110} h={450} fill={COL.wood} seed={22} />
    <Sheet L={L} x={160} y={720} w={1300} h={110} fill={COL.pillow} seed={23} />
    <Sheet L={L} x={180} y={820} w={1260} h={70} fill={COL.woodD} seed={24} />
    <ellipse cx={420} cy={690} rx={150} ry={52} fill="#FFFFFF" {...st(L)} />
    {/* head on the pillow, Ray's colours */}
    <g transform="translate(450 620) rotate(-78)">
      <circle r={84} fill={COL.skin} {...st(L)} />
      <path d="M-84 -10 Q-80 -96 0 -96 Q84 -96 84 -10 Q40 -60 -84 -10 Z" fill={COL.hair} />
      {[-30, 30].map((ex, i) => (
        eyes > 0.5
          ? <g key={i}><circle cx={ex} cy={10} r={11} fill="#FFFFFF" /><circle cx={ex} cy={12} r={6} fill="#1A1010" /><line x1={ex - 13} y1={4} x2={ex + 13} y2={4} stroke={COL.skinD} strokeWidth={6} /></g>
          : <path key={i} d={`M${ex - 14} 10 Q${ex} 20 ${ex + 14} 10`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      ))}
    </g>
    {arm ? (
      <g>
        <path d={`M640 690 Q${(640 + arm[0]) / 2} ${Math.min(arm[1], 690) - 90} ${arm[0]} ${arm[1]}`} stroke={COL.hood} strokeWidth={56} fill="none" strokeLinecap="round" />
        <circle cx={arm[0]} cy={arm[1]} r={36} fill={COL.skin} {...st(L)} />
      </g>
    ) : null}
    <path d="M520 700 Q600 560 820 600 Q1040 540 1200 620 Q1380 600 1450 720 L1450 830 L520 830 Z" fill={COL.blanket} {...st(L)} />
    <path d="M620 650 Q760 610 900 640" stroke="#5C88C4" strokeWidth={10} fill="none" strokeLinecap="round" />
    <Sheet L={L} x={1500} y={640} w={320} h={250} fill={COL.wood} seed={25} />
    <Clock L={L} x={1660} y={560} k={0.36} f={f} ring={ring} />
  </g>
);

const ShotBed: React.FC<P> = ({ L, f, W }) => {
  const slam = W("alarm", 1);
  const reach = ez(f, W("reaches") - 4, W("reaches") + 14);
  const back = ez(f, W("tell"), W("tell") + 16);
  const hit = f >= slam - 3 ? ez(f, slam - 3, slam) : 0;
  const arm: [number, number] | null = reach > 0 && back < 1
    ? [mix(mix(700, 1660, reach), 700, back), mix(mix(700, 470, reach), 700, back) + 60 * hit * (1 - back)]
    : null;
  return (
    <g transform={`translate(960 600) scale(${mix(1, 1.05, ez(f, W("hand"), W("forty", 1)))}) translate(-960 -600)`}>
      <Bedroom L={L} f={f} ring={f < slam ? 1 : 0} arm={arm} eyes={f < slam ? 1 : 0} />
      <Tag L={L} x={1660} y={400} t={span(f, slam + 2, W("tell") + 20)} text="SNOOZE" size={44} />
      <g transform={`translate(640 330) scale(${span(f, W("later"), W("forty", 1) - 4)})`}>
        {[[-40, 150, 14], [-10, 110, 22]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={COL.paper} {...st(L)} />)}
        <Sheet L={L} x={-170} y={-70} w={340} h={130} fill={COL.paper} seed={31} />
        <text y={24} textAnchor="middle" fontFamily="Kalam" fontSize={64} fill={INK}>later.</text>
      </g>
    </g>
  );
};

const ShotAsleep: React.FC<P> = ({ L, f, W }) => {
  const a = W("forty", 1);
  return (
    <g>
      <g transform={`translate(700 640) scale(${mix(1.3, 1.42, ez(f, a, a + 400))}) translate(-700 -640)`}>
        <Bedroom L={L} f={f} ring={0} arm={null} eyes={0} />
      </g>
      <rect width={1920} height={1080} fill="#050818" opacity={0.38} />
      {[0, 1, 2].map((i) => {
        const p = ((f - a) / 50 + i / 3) % 1;
        return f < a ? null : (
          <text key={i} x={760 + p * 160} y={460 - p * 260} fontFamily="Kalam" fontSize={60 + 30 * p} fill={COL.moon} opacity={Math.sin(p * Math.PI)}>z</text>
        );
      })}
      <Tag L={L} x={1320} y={220} t={pop(f, W("fight"), 9)} text="ROUND 1" size={70} />
      <g opacity={f >= W("awake") ? 1 : 0} transform={`translate(1420 300) rotate(-12) scale(${mix(2.2, 1, ez(f, W("awake"), W("awake") + 5))})`}>
        <rect x={-150} y={-62} width={300} height={124} rx={10} fill="none" stroke={COL.red} strokeWidth={10} />
        <text y={34} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={96} fill={COL.red}>LOST</text>
      </g>
    </g>
  );
};

const Hook: React.FC<{ scene: string }> = ({ scene }) => {
  const raw = useCurrentFrame();
  const L = scene === "clay" ? CLAY : PAPER;
  const f = L.clay ? onTwos(raw) : raw;
  const W = (word: string, n = 0) => w(scene, word, n);
  const p: P = { L, f, W };
  const cutBrain = W("before") + 8;
  const shot =
    f < W("eyes") - 4 ? <ShotClock {...p} />
    : f < cutBrain ? <ShotEyes {...p} />
    : f < W("hand") - 2 ? <ShotBrain {...p} t0={cutBrain} />
    : f < W("forty", 1) - 4 ? <ShotBed {...p} />
    : <ShotAsleep {...p} />;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {L.clay ? <ClayDefs seed={boilSeed(raw)} /> : null}
        <g filter={L.clay ? "url(#clay)" : undefined}>{shot}</g>
        <Tag L={L} x={250} y={80} t={span(raw, 6, 110)} text={L.clay ? "B  ·  CLAY" : "A  ·  PAPER THEATRE"} size={40} rot={-2} />
      </svg>
      {L.clay ? null : <PaperTexture op={0.35} />}
    </AbsoluteFill>
  );
};

type Fx = "beep" | "thud" | "whoosh" | "whoosh_low" | "pop" | "ding" | "sting" | "clock";
/** [word, occurrence, effect, volume, frame offset] — keyed to the voice like the animation. */
const CUES: [string, number, Fx, number, number?][] = [
  ["There", 0, "clock", 0.15, -20], ["eyes", 0, "thud", 0.35], ["before", 0, "whoosh_low", 0.45, -4], ["cold", 0, "pop", 0.3], ["long", 0, "pop", 0.3],
  ["project", 0, "thud", 0.4, 8], ["for", 0, "thud", 0.55], ["for", 0, "sting", 0.3, 2], ["reaches", 0, "whoosh", 0.25], ["alarm", 1, "thud", 0.5],
  ["later.", 0, "pop", 0.3], ["fight", 0, "ding", 0.45], ["awake", 0, "thud", 0.45],
];

const Sound: React.FC<{ scene: string; dur: number }> = ({ scene, dur }) => {
  const from = w(scene, "alarm"), to = w(scene, "alarm", 1);
  const beeps = Array.from({ length: Math.max(0, Math.ceil((to - from) / 15)) }, (_, i) => from + i * 15);
  return (
    <>
      <Audio src={staticFile("music/elegy.mp3")} volume={(fr) => 0.07 * Math.min(1, fr / 45, Math.max(0, (dur - fr) / 30))} />
      {beeps.map((at) => (
        <Sequence key={`b${at}`} from={at} durationInFrames={12}><Audio src={staticFile("sfx/beep.wav")} volume={0.16} /></Sequence>
      ))}
      {CUES.map(([word, n, fx, vol, off = 0], i) => (
        <Sequence key={i} from={Math.max(0, w(scene, word, n) + off)}><Audio src={staticFile(`sfx/${fx}.wav`)} volume={vol * 0.7} /></Sequence>
      ))}
    </>
  );
};

const has = (src: string) => getStaticFiles().some((s) => s.name === src);

export const DiscVideo: React.FC = () => {
  usePaperFonts();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}><PaperDefs /></svg>
      {Object.entries(SCENES).map(([key, sc]) => (
        <Sequence key={key} from={sc.start} durationInFrames={sc.dur} name={key}>
          <Hook scene={key} />
          <Captions scene={key} paper={key === "paper"} />
          {has(`vo_disc/${key}.wav`) ? <Sequence from={sc.lead}><Audio src={staticFile(`vo_disc/${key}.wav`)} /></Sequence> : null}
          <Sound scene={key} dur={sc.dur} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
