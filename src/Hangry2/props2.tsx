import React from "react";
import { C, FONT, INK } from "./kit";

/**
 * Set pieces for the scenes in scenes2.tsx. Every scene needs a place (visual rule 3 in
 * explainer-video-craft/references/audience-lessons.md), so these are rooms and objects, not decoration.
 * All drawn in world units of the 1920x1080 View; `t` props are 0..1 entrances.
 */

/** Text with a paper outline so it reads over line art. */
export const T: React.FC<{
  x: number; y: number; size?: number; color?: string; weight?: number; anchor?: "start" | "middle" | "end";
  op?: number; rot?: number; children: React.ReactNode;
}> = ({ x, y, size = 48, color = C.ink, weight = 900, anchor = "middle", op = 1, rot = 0, children }) =>
  op <= 0 ? null : (
    <text x={x} y={y} fontFamily={FONT} fontWeight={weight} fontSize={size} fill={color} textAnchor={anchor} opacity={op}
      stroke={C.bg} strokeWidth={size * 0.14} paintOrder="stroke" strokeLinejoin="round"
      transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}>
      {children}
    </text>
  );

/** Speech bubble (or thought bubble) centred on x,y. `tail` -1 points down-left, 1 down-right. */
export const Bubble: React.FC<{ x: number; y: number; w: number; h: number; t: number; tail?: number; think?: boolean; children?: React.ReactNode }> = ({
  x, y, w, h, t, tail = -1, think, children,
}) =>
  t <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${t})`}>
      {think ? (
        <>
          <circle cx={tail * w * 0.3} cy={h / 2 + 26} r={13} fill={C.bg} stroke={C.ink} strokeWidth={5} />
          <circle cx={tail * w * 0.38} cy={h / 2 + 56} r={8} fill={C.bg} stroke={C.ink} strokeWidth={4} />
        </>
      ) : (
        <path d={`M${tail * w * 0.06} ${h / 2 - 6} L${tail * w * 0.34} ${h / 2 + 46} L${tail * w * 0.24} ${h / 2 - 6}`} fill={C.bg} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      )}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={think ? h / 2 : 26} fill={C.bg} stroke={C.ink} strokeWidth={6} />
      {think ? null : <line x1={tail * w * 0.06 + tail * 4} y1={h / 2} x2={tail * w * 0.24 - tail * 4} y2={h / 2} stroke={C.bg} strokeWidth={9} />}
      {children}
    </g>
  );

/** Name card on a lanyard-free stand: who said it, on screen, because the VO names them. */
export const NameCard: React.FC<{ x: number; y: number; name: string; t: number; color?: string }> = ({ x, y, name, t, color = C.ink }) =>
  t <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${t})`}>
      <rect x={-name.length * 14 - 24} y={-34} width={name.length * 28 + 48} height={62} rx={14} fill={C.bg} stroke={color} strokeWidth={5} />
      <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={color}>
        {name}
      </text>
    </g>
  );

/** White lab coat, drawn BEHIND a figure placed by `ground` at scale s, so arms and torso sit on top. */
export const Coat: React.FC<{ x: number; ground: number; s: number }> = ({ x, ground, s }) => (
  <path
    d={`M${x - 20 * s} ${ground - 158 * s} L${x + 20 * s} ${ground - 158 * s} L${x + 36 * s} ${ground - 40 * s} L${x - 36 * s} ${ground - 40 * s} Z`}
    fill="#FFFFFF" stroke={C.ink} strokeWidth={5} strokeLinejoin="round"
  />
);

/** Diner booth: night window, hanging lamp, wall line. The table front is drawn separately, over the figures. */
export const DinerRoom: React.FC<{ f: number }> = ({ f }) => (
  <>
    <line x1={-600} y1={250} x2={2600} y2={250} stroke={C.ink} strokeWidth={4} opacity={0.3} />
    <rect x={640} y={300} width={640} height={250} rx={18} fill="#E9E1D0" stroke={C.ink} strokeWidth={7} />
    <line x1={960} y1={300} x2={960} y2={550} stroke={C.ink} strokeWidth={7} />
    <path d="M1180 350 a26 26 0 1 0 22 42 a20 20 0 1 1 -22 -42 Z" fill={C.ink} />
    {[[700, 350], [760, 420], [860, 360], [1040, 460], [1100, 340]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={3 + (i % 2)} fill={C.ink} opacity={0.35 + 0.3 * Math.sin(f / 9 + i)} />
    ))}
    <line x1={960} y1={-200} x2={960} y2={170} stroke={C.ink} strokeWidth={5} />
    <path d="M900 230 Q960 150 1020 230 Z" fill={C.amber} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <ellipse cx={960} cy={240} rx={120} ry={16} fill={C.amber} opacity={0.18} />
    {/* booth backs behind the two seats */}
    <path d="M560 740 L560 520 Q560 480 600 480 L900 480" fill="none" stroke={C.ink} strokeWidth={7} />
    <path d="M1360 740 L1360 520 Q1360 480 1320 480 L1020 480" fill="none" stroke={C.ink} strokeWidth={7} />
  </>
);

/** Table front, drawn over seated figures so it hides their legs. */
export const TableFront: React.FC<{ y: number; x0?: number; x1?: number }> = ({ y, x0 = 520, x1 = 1400 }) => (
  <>
    <rect x={x0} y={y} width={x1 - x0} height={40} rx={8} fill={C.bg} stroke={C.ink} strokeWidth={7} />
    <path d={`M${x0 + 60} ${y + 40} L${x0 + 60} ${y + 320} M${x1 - 60} ${y + 40} L${x1 - 60} ${y + 320}`} stroke={C.ink} strokeWidth={9} />
    <rect x={x0 - 200} y={y + 40} width={x1 - x0 + 400} height={400} fill={C.bg} opacity={0.9} />
  </>
);

/** Fries carton on a plate. `eaten` 0..1 empties it. */
export const Fries: React.FC<{ x: number; y: number; t: number; eaten?: number }> = ({ x, y, t, eaten = 0 }) =>
  t <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${t})`}>
      <ellipse cx={0} cy={0} rx={110} ry={18} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
      {Array.from({ length: 9 }, (_, i) => {
        if (i / 9 < eaten) return null;
        const dx = (i - 4) * 11;
        return <rect key={i} x={dx - 5} y={-96 - (i % 3) * 12} width={10} height={70} rx={3} fill={C.amber} stroke={C.ink} strokeWidth={3} transform={`rotate(${(i - 4) * 4} ${dx} -20)`} />;
      })}
      <path d="M-48 -54 L48 -54 L36 -4 L-36 -4 Z" fill={C.red} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );

/** Cutaway lab room drawn on stroke by stroke; `t` 0..1. A one-way mirror window on the left wall. */
export const LabRoom: React.FC<{ t: number }> = ({ t }) => {
  const L = 3000;
  return (
    <g fill="none" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round">
      <path d="M380 820 L380 300 L1540 300 L1540 820 M200 900 L380 820 L1540 820 L1720 900" strokeDasharray={L} strokeDashoffset={L * (1 - t)} />
      <rect x={440} y={380} width={260} height={170} rx={10} strokeDasharray={900} strokeDashoffset={900 * (1 - Math.max(0, t * 1.6 - 0.6))} fill={t > 0.8 ? "#2A2622" : "none"} fillOpacity={0.12} />
    </g>
  );
};

/** Old CRT television; children are drawn inside the screen (screen box 0..400 x 0..280, origin top-left). */
export const TV: React.FC<{ x: number; y: number; k?: number; children?: React.ReactNode }> = ({ x, y, k = 1, children }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <path d="M140 -70 L200 0 L260 -70" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
    <rect x={-40} y={0} width={480} height={340} rx={36} fill={C.bg} stroke={C.ink} strokeWidth={9} />
    <rect x={0} y={30} width={400} height={280} rx={20} fill="#1E2A33" stroke={C.ink} strokeWidth={7} />
    <svg x={0} y={30} width={400} height={280} viewBox="0 0 400 280">{children}</svg>
    <path d="M60 340 L30 400 M380 340 L410 400" stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
  </g>
);

/** A generic chocolate bar (no brand marks). */
export const CandyBar: React.FC<{ x: number; y: number; k?: number; rot?: number }> = ({ x, y, k = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`}>
    <rect x={-110} y={-34} width={220} height={68} rx={12} fill="#7A4A2A" stroke={C.ink} strokeWidth={6} />
    <path d="M-110 -34 L-130 -44 L-130 44 L-110 34 M110 -34 L130 -44 L130 44 L110 34" fill={C.bg} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-60} y={-18} width={120} height={36} rx={8} fill={C.amber} />
  </g>
);

/** Fuel gauge labelled SUGAR. v 0..1 (empty..full); the needle goes red below 0.25. */
export const Gauge: React.FC<{ x: number; y: number; v: number; k?: number; label?: string }> = ({ x, y, v, k = 1, label = "SUGAR" }) => {
  const a = Math.PI * (1 - v);
  const hot = v < 0.25;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <path d="M-120 0 A120 120 0 0 1 120 0 Z" fill={C.bg} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
      <path d="M-96 -8 A96 96 0 0 1 -66 -70" fill="none" stroke={C.red} strokeWidth={14} />
      <text x={-86} y={-26} fontFamily={FONT} fontWeight={900} fontSize={28} fill={C.red}>E</text>
      <text x={70} y={-26} fontFamily={FONT} fontWeight={900} fontSize={28} fill={C.ink}>F</text>
      <line x1={0} y1={0} x2={Math.cos(a) * 92} y2={-Math.sin(a) * 92} stroke={hot ? C.red : C.ink} strokeWidth={9} strokeLinecap="round" />
      <circle r={14} fill={C.ink} />
      <text x={0} y={52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.amber}>{label}</text>
    </g>
  );
};

/** Cooking pot on a hob. `lid` 0..1 lifts the lid; `boil` 0..1 drives bubbles and steam. */
export const Pot: React.FC<{ x: number; y: number; lid: number; boil: number; f: number; hot?: boolean }> = ({ x, y, lid, boil, f, hot }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: 5 }, (_, i) => {
      const p = ((f * 0.04 + i / 5) % 1) * boil;
      return <path key={i} d={`M${-60 + i * 30} ${-90 - p * 160} q14 -22 0 -44`} fill="none" stroke={hot ? C.red : C.grey} strokeWidth={6} strokeLinecap="round" opacity={boil * (1 - p)} />;
    })}
    <path d="M-120 -80 L120 -80 L104 40 L-104 40 Z" fill={C.bg} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
    <path d="M-120 -60 L-150 -60 M120 -60 L150 -60" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
    <g transform={`translate(0 ${-80 - lid * 260}) rotate(${lid * 38})`}>
      <path d="M-128 0 Q0 -40 128 0 Z" fill={C.bg} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
      <rect x={-16} y={-44} width={32} height={20} rx={6} fill={C.ink} />
    </g>
    <rect x={-160} y={40} width={320} height={26} rx={8} fill={C.ink} />
  </g>
);

/** Labelled vertical bar that grows to `v` (0..1) of `h`. */
export const Bar: React.FC<{ x: number; base: number; v: number; h?: number; w?: number; color: string; label: string }> = ({
  x, base, v, h = 420, w = 150, color, label,
}) => (
  <g>
    <rect x={x - w / 2} y={base - h * v} width={w} height={Math.max(0, h * v)} rx={10} fill={color} stroke={C.ink} strokeWidth={6} />
    <text x={x} y={base + 62} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={C.ink}>{label}</text>
  </g>
);

/** Voodoo doll: burlap body, button eyes, stitched mouth; `pins` of 51 stuck in (deterministic spots). */
export const Doll: React.FC<{ x: number; y: number; k?: number; pins: number; f?: number }> = ({ x, y, k = 1, pins }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <path d="M-30 -100 L30 -100 L96 -40 L70 -20 L40 -50 L44 60 L80 150 L46 164 L0 80 L-46 164 L-80 150 L-44 60 L-40 -50 L-70 -20 L-96 -40 Z"
      fill="#C9A66B" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={0} cy={-150} r={62} fill="#C9A66B" stroke={C.ink} strokeWidth={6} />
    <circle cx={-22} cy={-160} r={9} fill={C.ink} />
    <circle cx={22} cy={-160} r={9} fill={C.ink} />
    <path d="M-22 -122 L22 -122 M-14 -130 L-14 -114 M0 -130 L0 -114 M14 -130 L14 -114" stroke={C.ink} strokeWidth={4} />
    {Array.from({ length: Math.round(pins) }, (_, i) => {
      const px = Math.sin(i * 2.39) * 44, py = -180 + ((i * 37) % 300);
      const ang = (i * 67) % 360, r = (ang * Math.PI) / 180;
      const ex = px + Math.cos(r) * 48, ey = py + Math.sin(r) * 48;
      return (
        <g key={i}>
          <line x1={px} y1={py} x2={ex} y2={ey} stroke={C.ink} strokeWidth={3.5} />
          <circle cx={ex} cy={ey} r={7} fill={i % 3 ? C.red : C.amber} stroke={C.ink} strokeWidth={2.5} />
        </g>
      );
    })}
  </g>
);

/** Bed seen from the side, a moon window above. */
export const Bedroom: React.FC = () => (
  <>
    <line x1={-600} y1={260} x2={2600} y2={260} stroke={C.ink} strokeWidth={4} opacity={0.3} />
    <rect x={1260} y={330} width={260} height={220} rx={14} fill="#E9E1D0" stroke={C.ink} strokeWidth={7} />
    <path d="M1440 380 a24 24 0 1 0 20 38 a18 18 0 1 1 -20 -38 Z" fill={C.ink} />
    <path d="M300 820 L300 600 M300 700 L1180 700 L1180 820 M300 640 L1180 640" stroke={C.ink} strokeWidth={9} fill="none" />
    <rect x={330} y={600} width={220} height={60} rx={26} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
    <path d="M1180 640 L1180 560" stroke={C.ink} strokeWidth={9} />
    <line x1={-600} y1={820} x2={2600} y2={820} stroke={C.ink} strokeWidth={6} />
  </>
);

/** Handheld glucose meter with a reading. */
export const Meter: React.FC<{ x: number; y: number; k?: number; value: string; t: number }> = ({ x, y, k = 1, value, t }) =>
  t <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${k * t})`}>
      <rect x={-60} y={-100} width={120} height={200} rx={24} fill={C.bg} stroke={C.ink} strokeWidth={7} />
      <rect x={-42} y={-78} width={84} height={70} rx={8} fill="#DDEBD8" stroke={C.ink} strokeWidth={5} />
      <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.ink}>{value}</text>
      <rect x={-12} y={100} width={24} height={60} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />
      <circle cx={0} cy={40} r={20} fill="none" stroke={C.ink} strokeWidth={5} />
    </g>
  );

/** Tear-off calendar showing `day`. */
export const Calendar: React.FC<{ x: number; y: number; day: number; k?: number; label?: string }> = ({ x, y, day, k = 1, label = "DAY" }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <rect x={-90} y={-100} width={180} height={200} rx={14} fill="#FFFFFF" stroke={C.ink} strokeWidth={7} />
    <rect x={-90} y={-100} width={180} height={52} rx={14} fill={C.red} stroke={C.ink} strokeWidth={7} />
    <text x={0} y={-62} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#FFFFFF">{label}</text>
    <text x={0} y={60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={C.ink}>{Math.max(1, Math.round(day))}</text>
  </g>
);

/** Over-ear headphones sitting on a head centred at (x, y) of radius r. */
export const Headphones: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g>
    <path d={`M${x - r * 1.05} ${y} A${r * 1.1} ${r * 1.2} 0 0 1 ${x + r * 1.05} ${y}`} fill="none" stroke={C.ink} strokeWidth={r * 0.18} />
    <rect x={x - r * 1.3} y={y - r * 0.35} width={r * 0.45} height={r * 0.8} rx={r * 0.18} fill={C.ink} />
    <rect x={x + r * 0.85} y={y - r * 0.35} width={r * 0.45} height={r * 0.8} rx={r * 0.18} fill={C.ink} />
  </g>
);

/** Sound waves radiating from (x, y) toward +x; `amp` 0..1 = loudness. */
export const Waves: React.FC<{ x: number; y: number; amp: number; f: number; dir?: number; color?: string }> = ({ x, y, amp, f, dir = 1, color = C.red }) => (
  <g opacity={Math.min(1, amp * 1.5)}>
    {[0, 1, 2, 3].map((i) => {
      const p = ((f * 0.06 + i / 4) % 1);
      const r = 30 + p * 170;
      return (
        <path key={i} d={`M${x + dir * r * 0.5} ${y - r * 0.7} Q${x + dir * r} ${y} ${x + dir * r * 0.5} ${y + r * 0.7}`}
          fill="none" stroke={color} strokeWidth={6 + 10 * amp} strokeLinecap="round" opacity={1 - p} />
      );
    })}
  </g>
);

/** Balance scale; `tilt` in degrees (0 = level). Children [left, right] hang in the pans. */
export const Scale: React.FC<{ x: number; y: number; tilt: number; left: React.ReactNode; right: React.ReactNode }> = ({ x, y, tilt, left, right }) => {
  const r = (tilt * Math.PI) / 180, L = 300;
  const lx = x - Math.cos(r) * L, ly = y - 260 - Math.sin(r) * L, rx = x + Math.cos(r) * L, ry = y - 260 + Math.sin(r) * L;
  return (
    <g>
      <path d={`M${x} ${y} L${x} ${y - 260} M${x - 120} ${y} L${x + 120} ${y}`} stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      {[[lx, ly, left], [rx, ry, right]].map(([px, py, c], i) => (
        <g key={i}>
          <path d={`M${px as number} ${py as number} L${(px as number) - 80} ${(py as number) + 120} M${px as number} ${py as number} L${(px as number) + 80} ${(py as number) + 120}`} stroke={C.ink} strokeWidth={4} />
          <path d={`M${(px as number) - 100} ${(py as number) + 120} Q${px as number} ${(py as number) + 180} ${(px as number) + 100} ${(py as number) + 120} Z`} fill={C.bg} stroke={C.ink} strokeWidth={7} />
          <g transform={`translate(${px as number} ${(py as number) + 116})`}>{c as React.ReactNode}</g>
        </g>
      ))}
    </g>
  );
};

/** Small lab building with a flask sign. */
export const LabIcon: React.FC<{ x: number; y: number; t: number; k?: number }> = ({ x, y, t, k = 1 }) =>
  t <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${k * t})`}>
      <path d="M-50 0 L-50 -70 L0 -100 L50 -70 L50 0 Z" fill={C.bg} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M-8 -64 L-8 -46 L-22 -18 L22 -18 L8 -46 L8 -64 Z" fill={C.teal} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
    </g>
  );

/** Smartphone; children drawn in the screen (0..180 x 0..320, origin top-left). */
export const Phone: React.FC<{ x: number; y: number; k?: number; rot?: number; children?: React.ReactNode }> = ({ x, y, k = 1, rot = 0, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`}>
    <rect x={-104} y={-190} width={208} height={380} rx={30} fill={C.ink} />
    <svg x={-90} y={-160} width={180} height={320} viewBox="0 0 180 320">
      <rect width={180} height={320} fill="#FFFFFF" />
      {children}
    </svg>
  </g>
);

/** Burger. */
export const Burger: React.FC<{ x: number; y: number; k?: number; rot?: number }> = ({ x, y, k = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`}>
    <path d="M-70 -10 Q0 -90 70 -10 Z" fill={C.amber} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-76} y={-10} width={152} height={14} rx={6} fill={C.teal} stroke={C.ink} strokeWidth={5} />
    <rect x={-72} y={4} width={144} height={22} rx={8} fill="#7A4A2A" stroke={C.ink} strokeWidth={5} />
    <path d="M-70 26 L70 26 Q66 50 0 50 Q-66 50 -70 26 Z" fill={C.amber} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
  </g>
);

/** Couch + floor lamp, for "you" at home. */
export const LivingRoom: React.FC<{ lamp?: number }> = ({ lamp = 1 }) => (
  <>
    <line x1={-600} y1={820} x2={2600} y2={820} stroke={C.ink} strokeWidth={6} />
    <path d="M260 820 L260 640 Q260 600 300 600 L760 600 Q800 600 800 640 L800 820" fill={C.bg} stroke={C.ink} strokeWidth={8} />
    <rect x={230} y={690} width={600} height={70} rx={24} fill="#E9E1D0" stroke={C.ink} strokeWidth={8} />
    <path d="M140 820 L140 400 M90 400 L190 400 L160 330 L120 330 Z" stroke={C.ink} strokeWidth={7} fill={C.amber} fillOpacity={lamp} strokeLinejoin="round" />
    <ellipse cx={140} cy={430} rx={150} ry={40} fill={C.amber} opacity={0.15 * lamp} />
  </>
);

/** Lightbulb idea icon; t pops it, glow pulses. */
export const Bulb: React.FC<{ x: number; y: number; t: number; f: number }> = ({ x, y, t, f }) =>
  t <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${t})`}>
      <circle r={70 + 6 * Math.sin(f / 4)} fill={C.amber} opacity={0.25} />
      <path d="M-34 10 A44 44 0 1 1 34 10 L22 34 L-22 34 Z" fill={C.amber} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M-20 46 L20 46 M-16 58 L16 58" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
    </g>
  );

/** Park backdrop: skyline, lamp post, bench. */
export const Park: React.FC = () => (
  <>
    <path d="M-400 520 L-400 380 L-250 380 L-250 440 L-100 440 L-100 300 L60 300 L60 460 L260 460 L260 350 L420 350 L420 480 L600 480 L600 400 L760 400 L760 520"
      transform="translate(700 0)" fill="none" stroke={C.ink} strokeWidth={5} opacity={0.3} />
    <line x1={-600} y1={820} x2={2600} y2={820} stroke={C.ink} strokeWidth={6} />
    <path d="M1700 820 L1700 420 M1660 420 L1740 420" stroke={C.ink} strokeWidth={8} />
    <circle cx={1700} cy={400} r={22} fill={C.amber} stroke={C.ink} strokeWidth={5} />
  </>
);

/** Rear-view mirror frame; children drawn inside (clipped ellipse-ish rect, centre 0,0, 360x150). */
export const Mirror: React.FC<{ x: number; y: number; k?: number; children?: React.ReactNode }> = ({ x, y, k = 1, children }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <line x1={0} y1={-200} x2={0} y2={-80} stroke={C.ink} strokeWidth={14} />
    <clipPath id="mirrorClip"><rect x={-180} y={-75} width={360} height={150} rx={60} /></clipPath>
    <rect x={-180} y={-75} width={360} height={150} rx={60} fill="#DCE6EA" />
    <g clipPath="url(#mirrorClip)">{children}</g>
    <rect x={-180} y={-75} width={360} height={150} rx={60} fill="none" stroke={C.ink} strokeWidth={12} />
  </g>
);

export { INK };
