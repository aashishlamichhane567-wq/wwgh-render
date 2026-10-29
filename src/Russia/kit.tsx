import React from "react";
import { AbsoluteFill } from "remotion";
import { ramp } from "../Hangry/actions";
import { C, FONT, ez, mix, snap } from "../Hangry2/kit";
import { T } from "../Hangry2/props2";

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

/** Black year box, top left: the series' signature. Rolls between years when `to` is given. */
export const YearBadge: React.FC<{ f: number; at: number; year: number; to?: number; roll?: [number, number]; until?: number; x?: number; y?: number }> = ({
  f, at, year, to, roll, until, x = 70, y = 70,
}) => {
  const t = pop(f, at, 8) * (until === undefined ? 1 : 1 - ez(f, until - 8, until));
  if (t <= 0) return null;
  const v = to === undefined || !roll ? year : mix(year, to, ez(f, roll[0], roll[1]));
  const label = v < 0 ? `${Math.round(-v)} BC` : `${Math.round(v)}`;
  const w = 64 + label.length * 52;
  return (
    <Screen>
      <g transform={`translate(${x} ${y}) scale(${t})`}>
        <rect x={0} y={0} width={w} height={116} fill={C.ink} rx={6} />
        <text x={w / 2} y={88} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={88} fill="#FFFFFF">{label}</text>
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

/** Full-frame title card: a black band with white type and a red underline. */
export const TitleCard: React.FC<{ f: number; at: number; until: number; lines: string[]; sub?: string; color?: string }> = ({ f, at, until, lines, sub, color = C.red }) => {
  const t = pop(f, at, 10) * (1 - ez(f, until - 8, until));
  if (t <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: Math.min(1, t * 1.4) }}>
      <div style={{ transform: `scale(${0.85 + 0.15 * t})`, textAlign: "center", fontFamily: FONT }}>
        {lines.map((l, i) => (
          <div key={i}><div style={{ display: "inline-block", background: C.ink, color: "#FFFFFF", fontWeight: 900, fontSize: 110, lineHeight: 1.05, padding: "6px 34px", margin: "8px 0" }}>
            {l}
          </div></div>
        ))}
        <div style={{ height: 14, background: color, width: `${80 * ez(f, at + 4, at + 18)}%`, margin: "10px auto 0" }} />
        {sub ? <div style={{ marginTop: 18, fontWeight: 800, fontSize: 48, color: C.ink, background: "rgba(246,241,231,0.9)", display: "inline-block", padding: "2px 18px", borderRadius: 10 }}>{sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

/** A small framed card in screen space (top right), e.g. a running tally. */
export const Tally: React.FC<{ f: number; at: number; until: number; title: string; n: number; addAt?: number; color?: string; x?: number; y?: number }> = ({
  f, at, until, title, n, addAt, color = C.red, x = 1480, y = 70,
}) => {
  const t = span(f, at, until);
  if (t <= 0) return null;
  const shown = addAt !== undefined && f < addAt ? n - 1 : n;
  const bump = addAt !== undefined ? 1 + 0.25 * Math.sin(Math.PI * ramp(f, addAt, addAt + 10)) : 1;
  return (
    <Screen>
      <g transform={`translate(${x} ${y}) scale(${t})`}>
        <rect x={0} y={0} width={380} height={170} rx={16} fill={C.bg} stroke={C.ink} strokeWidth={6} />
        <text x={190} y={52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.ink}>{title}</text>
        <g transform={`translate(190 128) scale(${bump})`}>
          {Array.from({ length: shown }, (_, i) => (
            <line key={i} x1={-((shown - 1) * 26) / 2 + i * 26} y1={-36} x2={-((shown - 1) * 26) / 2 + i * 26} y2={30} stroke={color} strokeWidth={12} strokeLinecap="round" />
          ))}
        </g>
      </g>
    </Screen>
  );
};

/** Plain stage: paper ground line and an optional sky tint, in world space of a 1920x1080 View. */
export const GROUND = 840;
export const Ground: React.FC<{ tint?: string; y?: number; color?: string }> = ({ tint, y = GROUND, color }) => (
  <>
    {tint ? <rect x={-1200} y={-800} width={4400} height={y + 800} fill={tint} opacity={0.35} /> : null}
    {color ? <rect x={-1200} y={y} width={4400} height={1400} fill={color} opacity={0.35} /> : null}
    <line x1={-1200} y1={y} x2={3200} y2={y} stroke={C.ink} strokeWidth={6} />
  </>
);

/** Screen-space top punch line, used sparingly for the joke that needs to land in text. */
export const Punch: React.FC<{ f: number; at: number; until: number; children: React.ReactNode; color?: string; y?: number }> = ({ f, at, until, children, color = C.ink, y = 60 }) => {
  const t = span(f, at, until);
  if (t <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: y }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 66, color, transform: `scale(${0.86 + 0.14 * t})`, opacity: t,
        background: "rgba(246,241,231,0.92)", border: `5px solid ${C.ink}`, borderRadius: 22, padding: "8px 36px" }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};
