import React from "react";
import { AbsoluteFill } from "remotion";
import { ramp } from "../Hangry/actions";
import { C, FONT, ez, mix, snap } from "../Hangry2/kit";
import { T } from "../Hangry2/props2";
import { INK, ridge, rnd, torn } from "../Puppet/paper";
import { GROUND_PAPER, useEra } from "./era";

export { C, FONT, ez, mix, snap, ramp, T };

/**
 * Shared pieces for "The Entire History of Russia in 12 Minutes". Accents keep one meaning each:
 * red = Russia / the state, amber = the Mongols and money, teal = the narrator's asides, blue = rivals from the west.
 */
export const R = {
  ...C,
  sea: "#C9DEE4",
  river: "#8DB8C8",
  land: "#F6F1E7",
  gold: "#E2B13C",
  blue: "#3E6FB0",
  purple: "#8C6BB1",
  green: "#6BA368",
  pink: "#D99AA6",
  steel: "#9AA3AB",
  fur: "#6B4A2B",
  wood: "#A0703F",
  night: "#2B3350",
  snow: "#FFFFFF",
};

export type Cam = { x: number; y: number; s: number };
const mixCam = (a: Cam, b: Cam, t: number): Cam => ({ x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), s: mix(a.s, b.s, t) });
/** Camera plan: each [frame, cam] entry is reached AT that frame via a d-frame move. */
export const shots = (f: number, list: [number, Cam][], d = 12): Cam =>
  list.slice(1).reduce((c, [at, n]) => mixCam(c, n, snap(ramp(f, at - d, at))), list[0]![1]);
/** Same, but a slow ease (for map pans), d frames long. */
export const glide = (f: number, list: [number, Cam][], d = 30): Cam =>
  list.slice(1).reduce((c, [at, n]) => mixCam(c, n, ez(f, at - d * 0.3, at + d * 0.7)), list[0]![1]);
export const pop = (f: number, at: number, d = 9) => (f < at ? 0 : snap(ramp(f, at, at + d)));
/** 1 from `a` until `b`, popping in and fading out. */
export const span = (f: number, a: number, b: number, d = 8) => pop(f, a, d) * (1 - ez(f, b - d, b));
export const wob = (f: number, amp: number, speed = 5) => amp * Math.sin(f / speed);

/** Screen-space SVG layer (1920x1080), for overlays that must not move with the camera. */
export const Screen: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
    {children}
  </svg>
);

const fmtNum = (n: number) => Math.round(n).toLocaleString("en-US");

/** Torn-paper year tag, top left: the series' signature. Rolls between years when `to` is given. */
export const YearBadge: React.FC<{ f: number; at: number; year: number; to?: number; roll?: [number, number]; until?: number; x?: number; y?: number }> = ({
  f, at, year, to, roll, until, x = 70, y = 60,
}) => {
  const t = pop(f, at, 8) * (until === undefined ? 1 : 1 - ez(f, until - 8, until));
  if (t <= 0) return null;
  const v = to === undefined || !roll ? year : mix(year, to, ez(f, roll[0], roll[1]));
  const label = v < 0 ? `${Math.round(-v)} BC` : `${Math.round(v)}`;
  const w = 70 + label.length * 46;
  return (
    <Screen>
      <g transform={`translate(${x + w / 2} ${y + 58}) rotate(-3) scale(${t})`} filter="url(#cut)">
        <path d={torn(-w / 2, -58, w, 116, year % 97, 5, 14)} fill="#F3E6C4" stroke={INK} strokeWidth={2} />
        <text x={0} y={30} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={86} fill={INK}>{label}</text>
      </g>
    </Screen>
  );
};

/** Big counting number in world space (map or stage). */
export const Counter: React.FC<{ x: number; y: number; f: number; a: number; b: number; from?: number; to: number; size?: number; color?: string; prefix?: string; suffix?: string; op?: number }> = ({
  x, y, f, a, b, from = 0, to, size = 90, color = C.ink, prefix = "", suffix = "", op = 1,
}) => {
  if (f < a || op <= 0) return null;
  const v = mix(from, to, ez(f, a, b));
  return <T x={x} y={y} size={size} color={color} op={op * pop(f, a)}>{prefix}{fmtNum(v)}{suffix}</T>;
};

/** Full-frame title: ransom-note letters cut from mixed papers, on a torn sheet. */
export const TitleCard: React.FC<{ f: number; at: number; until: number; lines: string[]; sub?: string; color?: string }> = ({ f, at, until, lines, sub }) => {
  const t = pop(f, at, 10) * (1 - ez(f, until - 8, until));
  if (t <= 0) return null;
  const size = Math.min(130, 1500 / Math.max(...lines.map((l) => l.length)) / 0.78);
  const top = 540 - ((lines.length - 1) * size * 1.15) / 2 - (sub ? 40 : 0);
  return (
    <Screen>
      <g opacity={Math.min(1, t * 1.4)}>
        <path d={torn(170, top - size * 0.95, 1580, lines.length * size * 1.15 + size * 0.7 + (sub ? 110 : 0), at % 89, 8, 26)} fill="#F6EDD6" filter="url(#cut)" transform={`translate(0 ${30 * (1 - t)})`} />
        {lines.map((l, j) => l.split("").map((ch, i) => {
          if (ch === " ") return null;
          const lt = pop(f, at + j * 6 + i * 1.2, 8);
          if (lt <= 0) return null;
          const xx = 960 + (i - (l.length - 1) / 2) * size * 0.78, yy = top + j * size * 1.15;
          const bg = ["#FBF4E2", "#F3E6C4", "#E8D9B2", "#B8352A", "#1A1210"][Math.floor(rnd(i + j * 31 + at) * 5)]!;
          const fg = bg === "#B8352A" || bg === "#1A1210" ? "#FBF4E2" : INK;
          return (
            <g key={`${j}-${i}`} transform={`translate(${xx} ${yy}) rotate(${(rnd(i * 7 + j + at) - 0.5) * 12}) scale(${lt})`} filter="url(#cutSoft)">
              <path d={torn(-size * 0.36, -size * 0.62, size * 0.72, size * 0.86, i + j * 17 + at, 3, 10)} fill={bg} stroke={INK} strokeWidth={2} />
              <text x={0} y={size * 0.12} textAnchor="middle" fontFamily={rnd(i * 3 + j + at) < 0.6 ? "Oswald" : "Liberation Serif"} fontWeight={700} fontSize={size * 0.62} fill={fg}>{ch}</text>
            </g>
          );
        }))}
        {sub ? <text x={960} y={top + lines.length * size * 1.15 + 20} textAnchor="middle" fontFamily="Kalam" fontSize={52} fill="#B8352A" opacity={pop(f, at + 14)}>{sub}</text> : null}
      </g>
    </Screen>
  );
};

/** Torn paper name card (who is speaking / where we are). */
export const NameCard: React.FC<{ x: number; y: number; name: string; t: number; color?: string }> = ({ x, y, name, t, color = INK }) => {
  if (t <= 0) return null;
  const w = name.length * 26 + 60;
  return (
    <g transform={`translate(${x} ${y}) rotate(${(rnd(name.length * 13 + x) - 0.5) * 5}) scale(${t})`} filter="url(#cutSoft)">
      <path d={torn(-w / 2, -36, w, 70, name.length + Math.round(x), 4, 14)} fill="#F6EDD6" stroke={INK} strokeWidth={2} />
      <text x={0} y={14} textAnchor="middle" fontFamily="Oswald" fontWeight={600} fontSize={42} fill={color === C.ink ? INK : color}>{name}</text>
    </g>
  );
};

/** A pinned paper card in screen space (top right), e.g. a running tally. */
export const Tally: React.FC<{ f: number; at: number; until: number; title: string; n: number; addAt?: number; color?: string; x?: number; y?: number }> = ({
  f, at, until, title, n, addAt, color = C.red, x = 1480, y = 70,
}) => {
  const t = span(f, at, until);
  if (t <= 0) return null;
  const shown = addAt !== undefined && f < addAt ? n - 1 : n;
  const bump = addAt !== undefined ? 1 + 0.25 * Math.sin(Math.PI * ramp(f, addAt, addAt + 10)) : 1;
  return (
    <Screen>
      <g transform={`translate(${x} ${y}) rotate(2) scale(${t})`}>
        <path d={torn(0, 0, 380, 170, 41, 5, 18)} fill="#F6EDD6" stroke={INK} strokeWidth={2} filter="url(#cut)" />
        <circle cx={190} cy={10} r={9} fill="#C9A23A" stroke={INK} strokeWidth={2} />
        <text x={190} y={58} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={36} fill={INK}>{title}</text>
        <g transform={`translate(190 128) scale(${bump})`}>
          {Array.from({ length: shown }, (_, i) => (
            <line key={i} x1={-((shown - 1) * 26) / 2 + i * 26} y1={-34} x2={-((shown - 1) * 26) / 2 + i * 26 + 4} y2={28} stroke={color} strokeWidth={11} strokeLinecap="round" />
          ))}
        </g>
      </g>
    </Screen>
  );
};

/** Stage ground: a cut-paper strip in the era's colour (the sky is the era backdrop); `tint` washes the scene. */
export const GROUND = 840;
export const Ground: React.FC<{ tint?: string; y?: number; color?: string }> = ({ tint, y = GROUND, color }) => {
  const [top, edge] = GROUND_PAPER[useEra()];
  return (
    <>
      {tint ? <rect x={-1200} y={-800} width={4400} height={y + 800} fill={tint} opacity={0.22} /> : null}
      <path d={ridge(-1200, 3200, y, 5, 3, y + 1400, 30)} fill={color ?? top} />
      <path d={ridge(-1200, 3200, y + 3, 4, 11, y + 12, 30)} fill={edge} opacity={0.6} />
    </>
  );
};

/** Screen-space top punch line on a torn paper strip, used sparingly for the joke that needs to land in text. */
export const Punch: React.FC<{ f: number; at: number; until: number; children: React.ReactNode; color?: string; y?: number }> = ({ f, at, until, children, color = C.ink, y = 60 }) => {
  const t = span(f, at, until);
  if (t <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: y }}>
      <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 64, color: color === C.ink ? INK : color, transform: `scale(${0.86 + 0.14 * t}) rotate(-1.5deg)`, opacity: t,
        background: "#F6EDD6", padding: "6px 40px 10px", filter: "drop-shadow(4px 7px 3px rgba(42,30,18,0.35))",
        clipPath: "polygon(0% 10%, 4% 0%, 20% 7%, 38% 0%, 57% 6%, 76% 0%, 96% 5%, 100% 18%, 98% 86%, 100% 100%, 80% 93%, 61% 100%, 40% 94%, 21% 100%, 3% 93%, 0% 80%)" }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};
