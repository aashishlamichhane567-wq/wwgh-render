import React, { useEffect, useState } from "react";
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from "remotion";

/**
 * Paper-theatre kit: every shape is a piece of cut paper with a soft shadow, joints are brass fasteners,
 * and one static texture (public/tex/paper.png, episodes/make_paper_texture.py) is multiplied over the frame.
 */

export const INK = "#2A1E14";
export const PAPER = "#F3E8CF";

const FONTS: [string, string][] = [
  ["Ruslan", "fonts/RuslanDisplay-Regular.ttf"], ["Oswald", "fonts/Oswald-Variable.ttf"], ["Kalam", "fonts/Kalam-Bold.ttf"], ["Fraktur", "fonts/UnifrakturMaguntia-Book.ttf"],
];
/** Blocks rendering until the display fonts are loaded (call once at the top of a composition). */
export const usePaperFonts = () => {
  const [handle] = useState(() => delayRender("paper fonts"));
  useEffect(() => {
    Promise.all(FONTS.map(([n, p]) => new FontFace(n, `url(${staticFile(p)})`).load().then((f) => document.fonts.add(f)))).then(() => continueRender(handle));
  }, [handle]);
};

export const rnd = (i: number) => {
  const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
};

/** Closed path along a rectangle with torn, jittered edges. */
export const torn = (x: number, y: number, w: number, h: number, seed: number, j = 6, step = 18) => {
  const pts: string[] = [];
  const edge = (x0: number, y0: number, x1: number, y1: number, k: number) => {
    const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let i = 0; i < n; i++) {
      const t = i / n, nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny) || 1;
      const d = (rnd(seed + k * 100 + i) - 0.5) * 2 * j;
      pts.push(`${(x0 + (x1 - x0) * t + (nx / l) * d).toFixed(1)},${(y0 + (y1 - y0) * t + (ny / l) * d).toFixed(1)}`);
    }
  };
  edge(x, y, x + w, y, 1); edge(x + w, y, x + w, y + h, 2); edge(x + w, y + h, x, y + h, 3); edge(x, y + h, x, y, 4);
  return `M${pts.join(" L")} Z`;
};

/** A wavy cut top edge, filled down to `bottom` (hills, ground, water). */
export const ridge = (x0: number, x1: number, y: number, amp: number, seed: number, bottom = 1400, step = 40) => {
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += step) pts.push(`${x},${(y + Math.sin(x / 210 + seed) * amp + (rnd(seed + x) - 0.5) * amp * 0.5).toFixed(1)}`);
  return `M${x0},${bottom} L${pts.join(" L")} L${x1},${bottom} Z`;
};

/** Shadow filters; include once per SVG that uses `filter="url(#cut)"` / `url(#cutSoft)`. */
export const PaperDefs: React.FC = () => (
  <defs>
    <filter id="cut" x="-15%" y="-15%" width="140%" height="140%">
      <feDropShadow dx="5" dy="8" stdDeviation="4" floodColor="#2A1E12" floodOpacity="0.38" />
    </filter>
    <filter id="cutSoft" x="-15%" y="-15%" width="140%" height="140%">
      <feDropShadow dx="3" dy="5" stdDeviation="2.5" floodColor="#2A1E12" floodOpacity="0.32" />
    </filter>
    <pattern id="mail" width="12" height="10" patternUnits="userSpaceOnUse">
      <circle cx="6" cy="5" r="3.2" fill="none" stroke="#5E6670" strokeWidth="1.6" />
    </pattern>
    <pattern id="halftone" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
      <circle cx="7" cy="7" r="3.2" fill="#1A1210" opacity="0.35" />
    </pattern>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#E9C866" /><stop offset="0.45" stopColor="#C9A23A" /><stop offset="0.7" stopColor="#E3C25E" /><stop offset="1" stopColor="#A9822A" />
    </linearGradient>
  </defs>
);

/** The paper texture multiplied over everything below it. */
export const PaperTexture: React.FC<{ op?: number }> = ({ op = 0.55 }) => (
  <AbsoluteFill style={{ mixBlendMode: "multiply", opacity: op, pointerEvents: "none" }}>
    <Img src={staticFile("tex/paper.png")} style={{ width: "100%", height: "100%" }} />
  </AbsoluteFill>
);

/** Brass paper fastener (a puppet joint). */
export const Brad: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 7 }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#C9A23A" stroke={INK} strokeWidth={2} />
    <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#F3DE94" />
  </g>
);

/** Torn-paper speech bubble with hand lettering; `t` 0..1 pops it in, tail points down-left (-1) or down-right (1). */
export const PaperBubble: React.FC<{ x: number; y: number; t: number; lines: [string, string?][]; size?: number; tail?: number; w?: number; seed?: number }> = ({
  x, y, t, lines, size = 58, tail = -1, w, seed = 3,
}) => {
  if (t <= 0) return null;
  const width = w ?? Math.max(...lines.map(([s]) => s.length)) * size * 0.56 + 90;
  const h = lines.length * size * 1.15 + 60;
  return (
    <g transform={`translate(${x} ${y}) scale(${t}) rotate(${-2 + 4 * rnd(seed)})`}>
      <g filter="url(#cut)">
        <path d={torn(-width / 2, -h / 2, width, h, seed, 6, 20)} fill="#FBF4E2" stroke={INK} strokeWidth={3} />
        <path d={`M${tail * width * 0.12} ${h / 2 - 8} L${tail * width * 0.3} ${h / 2 + 70} L${tail * width * 0.32} ${h / 2 - 8} Z`} fill="#FBF4E2" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      </g>
      <rect x={tail * width * 0.12 - (tail > 0 ? 0 : width * 0.2)} y={h / 2 - 16} width={width * 0.2} height={14} fill="#FBF4E2" />
      {lines.map(([s, c], i) => (
        <text key={i} x={0} y={-h / 2 + 30 + size * 0.95 + i * size * 1.15} textAnchor="middle" fontFamily="Kalam" fontSize={size} fill={c ?? INK}>{s}</text>
      ))}
    </g>
  );
};

/** Torn paper strip with a label (year tags, place names, name cards). */
export const PaperLabel: React.FC<{ x: number; y: number; t: number; text: string; size?: number; font?: string; color?: string; paper?: string; rot?: number; seed?: number }> = ({
  x, y, t, text, size = 64, font = "Oswald", color = INK, paper = "#F3E6C4", rot = -3, seed = 11,
}) => {
  if (t <= 0) return null;
  const w = text.length * size * 0.56 + 70, h = size * 1.45;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${t})`}>
      <path d={torn(-w / 2, -h / 2, w, h, seed, 5, 14)} fill={paper} stroke={INK} strokeWidth={2} filter="url(#cut)" />
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={size} fill={color}>{text}</text>
    </g>
  );
};
