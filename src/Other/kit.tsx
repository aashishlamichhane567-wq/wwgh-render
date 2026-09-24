import React from "react";
import { FACES, Stickman, type StickmanProps } from "../Hangry/Stickman";
import { ramp } from "../Hangry/actions";

/** Flat light theme: pure white ground, black ink, three accents with fixed meanings. */
export const C = {
  bg: "#FFFFFF",
  ink: "#111111",
  red: "#E3242B", // fear, threat, division, bias
  gold: "#F4A300", // belonging, the in-group
  blue: "#1F7BFF", // awareness, the pause
};

/** Smoothstep 0..1 between frames a and b. */
export const ez = (f: number, a: number, b: number) => {
  const t = ramp(f, a, b);
  return t * t * (3 - 2 * t);
};
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
/** Deterministic 0..1 noise, so every render draws the same crowd. */
export const rnd = (i: number) => {
  const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
};
/** Sum of a per-frame speed over [0, f) — walk phase and scrolling that ease in/out without jumps. */
export const integrate = (f: number, speed: (k: number) => number) => {
  let s = 0;
  for (let k = 0; k < f; k++) s += speed(k);
  return s;
};

/** Full-frame SVG with a camera that centres world point (x, y) at scale s. */
export const View: React.FC<{ x?: number; y?: number; s?: number; children: React.ReactNode }> = ({
  x = 960,
  y = 540,
  s = 1,
  children,
}) => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
    <g transform={`translate(${960 - s * x} ${540 - s * y}) scale(${s})`}>{children}</g>
  </svg>
);

type FigProps = StickmanProps & {
  /** Place by feet instead of centre. */
  ground?: number;
  halo?: string;
  haloOp?: number;
  /** Mirror to face/walk left. */
  flip?: boolean;
  /** Chest dot colour (the coin-flip group marker). */
  dot?: string;
};

/** Stick figure with a face (neutral unless `face` is passed). Feet sit 102 rig units below centre, so `ground` is exact. */
export const Fig: React.FC<FigProps> = ({ ground, halo, haloOp = 1, flip, dot, ...p }) => {
  const s = p.scale ?? 1;
  const x = p.x ?? 0;
  const y = ground !== undefined ? ground - 102 * s : (p.y ?? 0);
  const op = p.opacity ?? 1;
  return (
    <g transform={flip ? `translate(${2 * x} 0) scale(-1 1)` : undefined}>
      {halo && haloOp > 0 ? (
        <Stickman bob={0} {...p} face={undefined} faceless y={y} color={halo} stroke={17} dashed={false} opacity={haloOp * op} />
      ) : null}
      <Stickman bob={0} color={C.ink} {...p} face={p.face ?? FACES.neutral} faceless={false} y={y} />
      {dot ? <circle cx={x} cy={y - 35 * s} r={10 * s} fill={dot} opacity={op} /> : null}
    </g>
  );
};

export const CROWD_S = 0.42;
export const CROWD_CX = 630;
/** 6 rows x 24, back row first so nearer rows draw on top. */
export const CROWD = Array.from({ length: 6 * 24 }, (_, i) => {
  const row = Math.floor(i / 24);
  const col = i % 24;
  return {
    x: 110 + col * 45.2 + (row % 2) * 22 + (rnd(i) - 0.5) * 14,
    ground: 540 + row * 44 + (rnd(i + 99) - 0.5) * 8,
  };
});

/**
 * The crowd. A faceless head can't visibly turn, so "looking" is a lean plus a small hop
 * rippling left to right. `linkAt` ripples arms out to link with neighbours (right to left).
 * Each figure draws over a white knockout so overlapping rows stay legible.
 */
export const Crowd: React.FC<{ f: number; turnAt?: number; linkAt?: number; spread?: number; skip?: number }> = ({
  f,
  turnAt,
  linkAt,
  spread = 0,
  skip,
}) => (
  <g>
    {CROWD.map((c, i) => {
      if (i === skip) return null;
      const x = CROWD_CX + (c.x - CROWD_CX) * (1 + 0.14 * spread);
      const d = ((c.x - 110) / 1100) * 20;
      const turn = turnAt === undefined ? 0 : ez(f, turnAt + d, turnAt + d + 8);
      const hop = turnAt === undefined ? 0 : Math.sin(Math.PI * ramp(f, turnAt + d, turnAt + d + 8)) * 5;
      const l = ((1200 - c.x) / 1100) * 30;
      const link = linkAt === undefined ? 0 : ez(f, linkAt + l, linkAt + l + 10);
      const pose = {
        lean: 7 * turn,
        armL: mix(25, 82, link),
        armR: mix(-25, -82, link),
        frame: f + i * 7,
        bob: 1,
      };
      return (
        <g key={i}>
          <Fig x={x} ground={c.ground - hop} scale={CROWD_S} color={C.bg} stroke={17} {...pose} />
          <Fig x={x} ground={c.ground - hop} scale={CROWD_S} {...pose} />
        </g>
      );
    })}
  </g>
);

const head = (x: number, y: number, deg: number, w: number) => {
  const r = (deg * Math.PI) / 180;
  const dx = Math.cos(r);
  const dy = Math.sin(r);
  return `${x + dx * 2.2 * w},${y + dy * 2.2 * w} ${x - dy * 1.5 * w},${y + dx * 1.5 * w} ${x + dy * 1.5 * w},${y - dx * 1.5 * w}`;
};

/** Straight arrow that draws on from (x1,y1) as t goes 0..1. */
export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; t: number; w?: number; color?: string; op?: number }> = ({
  x1,
  y1,
  x2,
  y2,
  t,
  w = 5,
  color = C.red,
  op = 1,
}) => {
  if (t <= 0 || op <= 0) return null;
  const x = mix(x1, x2, t);
  const y = mix(y1, y2, t);
  const a = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <g opacity={op}>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <polygon points={head(x, y, a, w)} fill={color} />
    </g>
  );
};

/** Three clockwise arcs with arrowheads — the bias feedback loop. */
export const Loop: React.FC<{ cx: number; cy: number; r: number; w: number; ang: number; t?: number; op?: number }> = ({
  cx,
  cy,
  r,
  w,
  ang,
  t = 1,
  op = 1,
}) => {
  if (t <= 0 || op <= 0) return null;
  const P = (a: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)] as const;
  return (
    <g opacity={op} transform={`rotate(${ang} ${cx} ${cy})`}>
      {[0, 120, 240].map((a0) => {
        const a1 = a0 + 96 * t;
        const [x0, y0] = P(a0);
        const [x1, y1] = P(a1);
        return (
          <g key={a0}>
            <path d={`M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`} stroke={C.red} strokeWidth={w} fill="none" strokeLinecap="round" />
            <polygon points={head(x1, y1, a1 + 90, w)} fill={C.red} opacity={ramp(t * 100, 15, 35)} />
          </g>
        );
      })}
    </g>
  );
};

/** Screen-space speed lines for whip pans and rewinds. dir -1 streams left, 1 right. */
export const Streaks: React.FC<{ f: number; op: number; dir?: number }> = ({ f, op, dir = -1 }) =>
  op <= 0 ? null : (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      {Array.from({ length: 16 }, (_, i) => {
        const y = 60 + rnd(i + 7) * 960;
        const len = 220 + rnd(i + 3) * 420;
        const x = ((((rnd(i) * 2600 + dir * f * 110) % 2600) + 2600) % 2600) - 400;
        return <line key={i} x1={x} y1={y} x2={x + len} y2={y} stroke={C.ink} strokeWidth={3} strokeLinecap="round" opacity={op * 0.55} />;
      })}
    </svg>
  );

/** Scrolling ground marks under walkers walking in place, so the camera reads as tracking. */
export const Ticks: React.FC<{ y: number; off: number; op?: number }> = ({ y, off, op = 1 }) => (
  <g opacity={op}>
    <line x1={-400} y1={y} x2={2400} y2={y} stroke={C.ink} strokeWidth={5} />
    {Array.from({ length: 20 }, (_, i) => {
      const x = ((((i * 130 - off) % 2600) + 2600) % 2600) - 340;
      return <line key={i} x1={x} y1={y + 18} x2={x + 46} y2={y + 18} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />;
    })}
  </g>
);

const INK = { stroke: C.ink, strokeWidth: 6, fill: "none", strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export const Icon: React.FC<{ x: number; y: number; k?: number; op?: number; rot?: number; children: React.ReactNode }> = ({
  x,
  y,
  k = 1,
  op = 1,
  rot = 0,
  children,
}) =>
  op <= 0 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`} opacity={op}>
      {children}
    </g>
  );

/** Campfire, origin at ground centre. */
export const Fire: React.FC<{ f: number }> = ({ f }) => (
  <>
    <line x1={-36} y1={-4} x2={36} y2={-16} {...INK} />
    <line x1={-36} y1={-16} x2={36} y2={-4} {...INK} />
    {[-15, 0, 15].map((dx, i) => {
      const h = 44 + Math.sin(f * 0.55 + i * 2.1) * 9 + (i === 1 ? 24 : 0);
      const tip = dx + Math.sin(f * 0.4 + i) * 5;
      return <path key={i} d={`M${dx - 13} -14 Q${dx - 15} ${-14 - h * 0.6} ${tip} ${-14 - h} Q${dx + 15} ${-14 - h * 0.6} ${dx + 13} -14 Z`} fill={C.gold} />;
    })}
  </>
);
export const Tent = () => <path d="M-64 0 L0 -96 L64 0 Z M-20 0 L0 -40 L20 0" {...INK} />;
export const Basket = () => (
  <>
    <path d="M-42 -42 L42 -42 L32 0 L-32 0 Z M-30 -42 Q0 -86 30 -42" {...INK} />
    {[-20, 0, 20].map((dx) => (
      <circle key={dx} cx={dx} cy={-52} r={11} {...INK} />
    ))}
  </>
);
export const House = () => <path d="M-30 18 L-30 -12 L0 -38 L30 -12 L30 18 Z M-8 18 L-8 0 L8 0 L8 18" {...INK} />;
export const Heart = () => <path d="M0 24 C-46 -6 -30 -44 0 -22 C30 -44 46 -6 0 24 Z" fill={C.gold} />;
export const Star = () => (
  <polygon
    points={Array.from({ length: 10 }, (_, i) => {
      const r = i % 2 ? 14 : 34;
      const a = (i * 36 - 90) * (Math.PI / 180);
      return `${r * Math.cos(a)},${r * Math.sin(a)}`;
    }).join(" ")}
    {...INK}
  />
);
export const Trio = () => (
  <>
    {[-26, 0, 26].map((x) => (
      <Fig key={x} x={x} ground={30} scale={0.24} stroke={16} />
    ))}
  </>
);
export const Bubble: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <circle r={66} fill={C.bg} stroke={C.ink} strokeWidth={5} />
    {children}
  </>
);
