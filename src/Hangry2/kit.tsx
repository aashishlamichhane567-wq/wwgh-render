import React from "react";
import { AbsoluteFill } from "remotion";
import { FACES, Stickman, type StickmanProps } from "../Hangry/Stickman";
import { Grain } from "../Hangry/Atmosphere";

export { ez, mix, rnd, integrate, View } from "../Other/kit";

/** Paper theme. Accents keep one meaning each for the whole video. */
export const C = {
  bg: "#F6F1E7",
  ink: "#1A1714",
  grey: "#8E877C", // the researcher, background props
  amber: "#F0A018", // hunger
  red: "#E0342B", // hostility
  teal: "#159A8C", // noticing, calm
};

export const FONT = "'Segoe UI', Arial, sans-serif";
export const INK = { stroke: C.ink, strokeWidth: 6, fill: "none", strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export const snap = (t: number) => 1 - Math.pow(1 - t, 5);

type FigProps = StickmanProps & {
  /** Place by feet instead of centre. */
  ground?: number;
  /** Thick coloured outline under the figure: red = hostile, teal = calm. */
  halo?: string;
  haloOp?: number;
  /** Mirror to face left. */
  flip?: boolean;
};

/** Faceless figure on paper. Feet sit 102 rig units below centre, so `ground` is exact. */
export const Fig: React.FC<FigProps> = ({ ground, halo, haloOp = 1, flip, ...p }) => {
  const s = p.scale ?? 1;
  const x = p.x ?? 0;
  const y = ground !== undefined ? ground - 102 * s : (p.y ?? 0);
  const op = p.opacity ?? 1;
  return (
    <g transform={flip ? `translate(${2 * x} 0) scale(-1 1)` : undefined}>
      {halo && haloOp > 0 ? (
        <Stickman bob={0} {...p} face={undefined} faceless y={y} color={halo} stroke={19} headFill={halo} opacity={haloOp * op} />
      ) : null}
      {/* every figure has a face (user decision 2026-09-22); callers animate it via `face` */}
      <Stickman bob={0} color={C.ink} headFill={C.bg} {...p} face={p.face ?? FACES.neutral} faceless={false} y={y} />
    </g>
  );
};

/** Head centre of a figure placed by centre (x, y) at scale s. */
export const headOf = (x: number, y: number, s: number) => ({ x, y: y + (58 - 160) * s, r: 32 * s });

/** Paper ground, soft warm vignette, light grain (higher grain bloats the file). */
export const Paper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    {children}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 80% at 50% 48%, transparent 55%, rgba(80,55,20,0.9) 100%)", opacity: 0.2 }} />
    <Grain opacity={0.02} />
  </AbsoluteFill>
);

/** A hard cut that lands with a short lateral slide. */
export const Slide: React.FC<{ t: number; children: React.ReactNode }> = ({ t, children }) => (
  <AbsoluteFill style={{ background: C.bg, transform: `translateX(${260 * (1 - snap(t))}px)` }}>{children}</AbsoluteFill>
);
