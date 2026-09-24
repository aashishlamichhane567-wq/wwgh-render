import React from "react";
import { C, Fig } from "../Hangry2/kit";
import { T } from "../Hangry2/props2";
import type { Face } from "../Hangry/Stickman";

/**
 * Set pieces for "Why Animals Get Drunk Too". World units of the 1920x1080 View; `t` props are 0..1 entrances.
 * Every scene needs a place (audience-lessons visual rule 3), so most of these are places and animals.
 */

export const FLOOR = 820;
const ink = { stroke: C.ink, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const pops = (t: number, x: number, y: number, k = 1) => `translate(${x} ${y}) scale(${k * t})`;

export const NightWindow: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={0} width={300} height={250} rx={8} fill="#2B3350" stroke={C.ink} strokeWidth={7} />
    <circle cx={210} cy={80} r={34} fill="#F3E7C4" />
    <circle cx={226} cy={70} r={30} fill="#2B3350" />
    {[[60, 60], [110, 150], [250, 180], [160, 40]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={3} fill="#F3E7C4" />)}
    <line x1={150} y1={0} x2={150} y2={250} stroke={C.ink} strokeWidth={6} />
  </g>
);

export const Glass: React.FC<{ fill?: number }> = ({ fill = 1 }) => (
  <g>
    <path d="M-30 -40 L30 -40 L22 40 L-22 40 Z" fill={C.bg} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d={`M${-26 + 4 * (1 - fill)} ${40 - 48 * fill} L${26 - 4 * (1 - fill)} ${40 - 48 * fill} L22 40 L-22 40 Z`} fill={C.amber} opacity={0.85} />
    {fill > 0.3 ? <rect x={-10} y={-2} width={16} height={16} rx={3} fill="#FFFFFF" stroke={C.ink} strokeWidth={3} transform="rotate(18)" /> : null}
  </g>
);

export const Pillow: React.FC = () => (
  <g>
    <rect x={-50} y={-30} width={100} height={60} rx={26} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
    <T x={40} y={-40} size={34} color={C.teal}>z</T>
    <T x={62} y={-66} size={26} color={C.teal}>z</T>
  </g>
);

/** Pen-tailed treeshrew, side view facing right: snout at +x, feather-tipped tail curling up-left. */
export const Treeshrew: React.FC<{ x: number; y: number; k?: number; f: number; lick?: number; flip?: boolean; hop?: number }> = ({ x, y, k = 1, f, lick = 0, flip, hop = 0 }) => (
  <g transform={`translate(${x} ${y - hop}) scale(${flip ? -k : k} ${k})`}>
    <path d={`M-40 0 C-90 ${-10 + 6 * Math.sin(f / 9)} -120 -60 -150 ${-110 + 8 * Math.sin(f / 11)}`} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
    {[0, 1, 2, 3, 4].map((i) => (
      <path key={i} d={`M${-150 + i * 4} ${-110 + i * 10} l-14 -8 M${-150 + i * 4} ${-110 + i * 10} l14 -10`}
        stroke={C.ink} strokeWidth={4} strokeLinecap="round" transform={`translate(0 ${8 * Math.sin(f / 11)})`} />
    ))}
    <ellipse cx={0} cy={0} rx={52} ry={30} fill="#CDB89A" stroke={C.ink} strokeWidth={6} />
    <path d={`M38 -14 Q70 -24 ${92 + 6 * lick} ${-2 + 4 * lick} Q66 14 36 12 Z`} fill="#CDB89A" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={60} cy={-8} r={6} fill={C.ink} />
    <circle cx={62} cy={-10} r={2} fill="#FFFFFF" />
    <path d="M34 -24 q6 -20 18 -6" fill="#CDB89A" stroke={C.ink} strokeWidth={5} />
    <path d="M-30 26 l-6 22 M20 28 l8 20" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
    {lick > 0 ? <path d={`M${92 + 6 * lick} ${-2 + 4 * lick} q10 4 14 12`} stroke={C.red} strokeWidth={4} fill="none" strokeLinecap="round" /> : null}
  </g>
);

/** Bertam palm: trunk, spiky fronds, nectar buds that glow and bubble once they ferment. */
export const Palm: React.FC<{ x: number; ground: number; f: number; ferment?: number; glow?: number }> = ({ x, ground, f, ferment = 0, glow = 1 }) => (
  <g transform={`translate(${x} ${ground})`}>
    <path d="M-30 0 L-18 -330 L18 -330 L30 0 Z" fill="#D8CBB3" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
    {[-150, -115, -70, -30, 30, 70, 115, 150].map((a, i) => {
      const r = (a * Math.PI) / 180, L = 330 - Math.abs(a) * 0.6;
      const ex = Math.sin(r) * L, ey = -330 - Math.cos(r) * L * 0.55;
      return <path key={i} d={`M0 -330 Q${ex * 0.5} ${ey - 60} ${ex} ${ey + 40 * Math.sin(f / 30 + i)}`} fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />;
    })}
    {[[-40, -250], [-8, -270], [26, -246], [-24, -214], [14, -206]].map(([bx, by], i) => (
      <g key={i}>
        <circle cx={bx} cy={by} r={30} fill={C.amber} opacity={0.18 * glow} />
        <ellipse cx={bx} cy={by} rx={15} ry={20} fill="#F7E3A6" stroke={C.ink} strokeWidth={4} />
      </g>
    ))}
    {ferment > 0 ? [0, 1, 2, 3, 4, 5].map((i) => {
      const t = (f / 40 + i / 6) % 1;
      return <circle key={i} cx={-40 + i * 16 + 6 * Math.sin(f / 7 + i)} cy={-230 - t * 120} r={4 + 3 * (i % 2)} fill="none" stroke={C.amber} strokeWidth={3} opacity={ferment * (1 - t)} />;
    }) : null}
  </g>
);

export const Beer: React.FC<{ x: number; y: number; t: number; k?: number }> = ({ x, y, t, k = 1 }) =>
  t <= 0 ? null : (
    <g transform={pops(t, x, y, k)}>
      <path d="M-26 0 L-26 -120 Q-26 -150 -12 -165 L-12 -205 L12 -205 L12 -165 Q26 -150 26 -120 L26 0 Z" fill={C.amber} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <rect x={-26} y={-110} width={52} height={50} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />
      <T x={0} y={-74} size={22}>BEER</T>
    </g>
  );

/** Clock whose red hand sweeps `turns` full circles. */
export const Clock: React.FC<{ x: number; y: number; turns: number; t: number }> = ({ x, y, turns, t }) =>
  t <= 0 ? null : (
    <g transform={pops(t, x, y)}>
      <circle r={70} fill={C.bg} stroke={C.ink} strokeWidth={7} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-58} x2={0} y2={-48} stroke={C.ink} strokeWidth={4} transform={`rotate(${i * 30})`} />)}
      <line x1={0} y1={0} x2={0} y2={-50} stroke={C.red} strokeWidth={7} strokeLinecap="round" transform={`rotate(${turns * 360})`} />
      <line x1={0} y1={0} x2={0} y2={-32} stroke={C.ink} strokeWidth={8} strokeLinecap="round" transform={`rotate(${turns * 30})`} />
      <circle r={7} fill={C.ink} />
    </g>
  );

export const Moon: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <circle cx={x} cy={y} r={60} fill="#F3E7C4" stroke={C.ink} strokeWidth={5} />
    <circle cx={x - 18} cy={y - 10} r={9} fill="#E6D6A8" />
    <circle cx={x + 16} cy={y + 18} r={6} fill="#E6D6A8" />
  </g>
);

/** Night rainforest: faint wash, moon, background palms, ground line. */
export const NightForest: React.FC = () => (
  <>
    <rect x={-800} y={-400} width={3600} height={1900} fill="#2B3350" opacity={0.12} />
    <Moon x={1500} y={200} />
    <line x1={-800} y1={FLOOR} x2={2800} y2={FLOOR} stroke={C.ink} strokeWidth={6} />
    {[180, 380, 1700].map((x, i) => (
      <path key={x} d={`M${x} ${FLOOR} L${x + 10} ${300 + i * 40} M${x + 10} ${360 + i * 40} q-80 -40 -140 20 M${x + 10} ${360 + i * 40} q90 -50 150 10`} fill="none" stroke={C.ink} strokeWidth={6} opacity={0.35} />
    ))}
  </>
);

export const Signpost: React.FC<{ x: number; y: number; text: string; dir: number; color: string; t: number; k?: number }> = ({ x, y, text, dir, color, t, k = 1 }) =>
  t <= 0 ? null : (
    <g transform={pops(t, x, y, k)}>
      <line x1={0} y1={0} x2={0} y2={300} stroke={C.ink} strokeWidth={10} />
      <path d={`M${-dir * 20} -50 L${dir * 200} -50 L${dir * 250} 0 L${dir * 200} 50 L${-dir * 20} 50 Z`} fill={color} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      <T x={dir * 110} y={16} size={50} color="#FFFFFF">{text}</T>
    </g>
  );

export const Chalkboard: React.FC = () => (
  <>
    <rect x={560} y={180} width={1100} height={560} rx={12} fill="#2F4A3E" stroke={C.ink} strokeWidth={9} />
    <line x1={620} y1={690} x2={1600} y2={690} stroke="#EDE6D6" strokeWidth={4} opacity={0.7} />
  </>
);

/** Tweezers plucking one hair, and a meter whose needle swings to red by `v`. */
export const FurTest: React.FC<{ x: number; y: number; t: number; v: number }> = ({ x, y, t, v }) => {
  if (t <= 0) return null;
  const a = Math.PI * (1 - v);
  return (
    <g transform={pops(t, x, y)}>
      <rect x={-150} y={-150} width={300} height={260} rx={22} fill={C.bg} stroke={C.ink} strokeWidth={7} />
      <path d="M-110 30 A110 110 0 0 1 110 30" fill="none" stroke={C.ink} strokeWidth={6} />
      <path d="M50 -58 A110 110 0 0 1 110 30" fill="none" stroke={C.red} strokeWidth={16} />
      <line x1={0} y1={30} x2={Math.cos(a) * 96} y2={30 - Math.sin(a) * 96} stroke={v > 0.75 ? C.red : C.ink} strokeWidth={8} strokeLinecap="round" />
      <circle cx={0} cy={30} r={12} fill={C.ink} />
      <T x={0} y={92} size={30}>ALCOHOL IN FUR</T>
    </g>
  );
};

/** Wild chimp: a brown, hunched stick figure with long arms. */
export const Chimp: React.FC<{ x: number; ground: number; s?: number; f: number; armL?: number; armR?: number; lean?: number; face?: Face }> = ({
  x, ground, s = 1.2, f, armL = 30, armR = -30, lean = 16, face,
}) => (
  <Fig x={x} ground={ground} scale={s} frame={f} bob={1} lean={lean} armL={armL} armR={armR} legL={24} legR={-24} color="#5C4A3A" headFill="#D9BFA0" face={face} />
);

/** Raffia palm with a hanging palm-wine container at the crown. */
export const RaffiaPalm: React.FC<{ x: number; ground: number; f: number }> = ({ x, ground, f }) => (
  <g transform={`translate(${x} ${ground})`}>
    <path d="M-28 0 Q-10 -250 -16 -520 L16 -520 Q10 -250 28 0 Z" fill="#D8CBB3" stroke={C.ink} strokeWidth={7} />
    {[-160, -110, -60, 60, 110, 160].map((a, i) => {
      const r = (a * Math.PI) / 180;
      return <path key={i} d={`M0 -520 Q${Math.sin(r) * 200} ${-640 + 10 * Math.sin(f / 25 + i)} ${Math.sin(r) * 380} ${-520 - Math.cos(r) * 160}`} fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />;
    })}
    <path d="M18 -470 L60 -440" stroke={C.ink} strokeWidth={5} />
    <path d="M40 -440 L100 -440 L92 -360 L48 -360 Z" fill="#E9E1D0" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <rect x={46} y={-420} width={48} height={58} fill={C.amber} opacity={0.6} />
  </g>
);

/** A folded-leaf sponge, dripping when `wet`. */
export const LeafSponge: React.FC<{ x: number; y: number; t: number; wet: number; f: number }> = ({ x, y, t, wet, f }) =>
  t <= 0 ? null : (
    <g transform={pops(t, x, y)}>
      <path d="M-30 -20 Q0 -50 30 -20 Q10 10 -30 -20 Z M-24 -10 Q0 -34 24 -10" fill={C.teal} stroke={C.ink} strokeWidth={5} />
      {wet > 0 ? <circle cx={0} cy={10 + ((f * 3) % 40)} r={6} fill={C.amber} opacity={wet} /> : null}
    </g>
  );

/** Side-view dolphin facing right. */
export const Dolphin: React.FC<{ x: number; y: number; k?: number; rot?: number; flip?: boolean; f: number }> = ({ x, y, k = 1, rot = 0, flip, f }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -k : k} ${k})`}>
    <path d={`M-150 ${10 * Math.sin(f / 8)} Q-120 -10 -80 -20 Q0 -60 90 -20 L150 -6 L96 6 Q20 40 -80 20 Q-120 20 -150 ${10 * Math.sin(f / 8)} Z`} fill="#9FB3C4" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d="M-10 -44 L10 -86 L30 -38" fill="#9FB3C4" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d={`M-150 ${10 * Math.sin(f / 8)} l-30 -30 M-150 ${10 * Math.sin(f / 8)} l-30 28`} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
    <circle cx={80} cy={-14} r={6} fill={C.ink} />
    <path d="M100 0 Q120 6 146 -4" stroke={C.ink} strokeWidth={4} fill="none" />
  </g>
);

/** Puffed-up pufferfish; `puff` 0..1 inflates it. */
export const Puffer: React.FC<{ x: number; y: number; puff: number; toxin?: number }> = ({ x, y, puff, toxin = 0 }) => {
  const r = 30 + 24 * puff;
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return <line key={i} x1={Math.cos(a) * r} y1={Math.sin(a) * r} x2={Math.cos(a) * (r + 14 * puff)} y2={Math.sin(a) * (r + 14 * puff)} stroke={C.ink} strokeWidth={4} />;
      })}
      <circle r={r} fill="#E8D48A" stroke={C.ink} strokeWidth={6} />
      <circle cx={r * 0.45} cy={-r * 0.25} r={6} fill={C.ink} />
      <path d={`M${-r} 0 l-24 -18 l0 36 Z`} fill="#E8D48A" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      {toxin > 0 ? <T x={0} y={-r - 34} size={44} color={C.red} op={toxin}>☠</T> : null}
    </g>
  );
};

export const Sea: React.FC<{ f: number; y?: number }> = ({ f, y = 380 }) => (
  <>
    <rect x={-800} y={y} width={3600} height={1400} fill="#B8CCD8" opacity={0.35} />
    <path d={`M-800 ${y} ${Array.from({ length: 40 }, (_, i) => `q45 ${i % 2 ? 18 : -18} 90 0`).join(" ")}`} transform={`translate(${-((f * 2) % 180)} 0)`} fill="none" stroke={C.ink} strokeWidth={5} />
  </>
);

/** African elephant side view facing right; `sway` rocks it. */
export const Elephant: React.FC<{ x: number; ground: number; k?: number; sway?: number; trunk?: number }> = ({ x, ground, k = 1, sway = 0, trunk = 0 }) => (
  <g transform={`translate(${x} ${ground}) rotate(${sway}) scale(${k})`}>
    {[-120, -50, 60, 120].map((lx) => <rect key={lx} x={lx - 24} y={-150} width={48} height={150} rx={14} fill="#A9A39A" stroke={C.ink} strokeWidth={6} />)}
    <ellipse cx={0} cy={-220} rx={190} ry={120} fill="#A9A39A" stroke={C.ink} strokeWidth={7} />
    <circle cx={200} cy={-260} r={80} fill="#A9A39A" stroke={C.ink} strokeWidth={7} />
    <path d="M150 -300 Q110 -230 160 -190 Q200 -250 190 -300 Z" fill="#9A948B" stroke={C.ink} strokeWidth={6} />
    <path d={`M270 -250 Q300 ${-150 - 40 * trunk} ${280 - 30 * trunk} ${-60 - 120 * trunk}`} fill="none" stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
    <path d={`M270 -250 Q300 ${-150 - 40 * trunk} ${280 - 30 * trunk} ${-60 - 120 * trunk}`} fill="none" stroke="#A9A39A" strokeWidth={12} strokeLinecap="round" />
    <circle cx={240} cy={-280} r={7} fill={C.ink} />
    <path d="M270 -222 q18 10 10 30" stroke="#F4EFE6" strokeWidth={8} fill="none" strokeLinecap="round" />
    <path d="M-190 -230 q-30 30 -20 70" stroke={C.ink} strokeWidth={5} fill="none" />
  </g>
);

export const MarulaTree: React.FC<{ x: number; ground: number }> = ({ x, ground }) => (
  <g transform={`translate(${x} ${ground})`}>
    <path d="M-20 0 L-12 -260 L12 -260 L20 0 Z M0 -200 L-90 -290 M0 -220 L100 -300" fill="#B59A7A" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
    <ellipse cx={0} cy={-330} rx={230} ry={90} fill="#C9D3A5" stroke={C.ink} strokeWidth={7} />
    {[[-120, -300], [-40, -280], [60, -310], [140, -290], [0, -350]].map(([fx, fy], i) => <circle key={i} cx={fx} cy={fy} r={13} fill="#E7C24A" stroke={C.ink} strokeWidth={4} />)}
  </g>
);

/** Beer crates stacked `n` high (can be fractional while it builds). */
export const Crates: React.FC<{ x: number; ground: number; n: number }> = ({ x, ground, n }) => (
  <g>
    {Array.from({ length: Math.ceil(n) }, (_, i) => (
      <g key={i} opacity={Math.min(1, n - i)} transform={`translate(${x + (i % 2) * 10} ${ground - 70 * (i + 1)})`}>
        <rect x={-90} y={0} width={180} height={70} rx={6} fill={C.amber} stroke={C.ink} strokeWidth={5} />
        {[-60, -20, 20, 60].map((bx) => <circle key={bx} cx={bx} cy={-6} r={10} fill="#8A5A1E" stroke={C.ink} strokeWidth={3} />)}
      </g>
    ))}
  </g>
);

/** DNA ladder; rung `broken` glows red and snaps apart by `snap` 0..1. */
export const Dna: React.FC<{ x: number; y: number; t: number; snap: number; f: number }> = ({ x, y, t, snap, f }) =>
  t <= 0 ? null : (
    <g transform={pops(t, x, y)}>
      {Array.from({ length: 11 }, (_, i) => {
        const yy = -250 + i * 50, ph = f / 14 + i * 0.6, dx = Math.sin(ph) * 110;
        const broken = i === 6;
        return (
          <g key={i}>
            {broken ? (
              <>
                <line x1={-dx} y1={yy} x2={-dx * 0.2 - 30 * snap} y2={yy - 20 * snap} stroke={C.red} strokeWidth={10} strokeLinecap="round" />
                <line x1={dx} y1={yy} x2={dx * 0.2 + 30 * snap} y2={yy + 20 * snap} stroke={C.red} strokeWidth={10} strokeLinecap="round" />
              </>
            ) : <line x1={-dx} y1={yy} x2={dx} y2={yy} stroke={C.ink} strokeWidth={6} opacity={0.6} />}
            <circle cx={-dx} cy={yy} r={10} fill={C.teal} stroke={C.ink} strokeWidth={3} />
            <circle cx={dx} cy={yy} r={10} fill={C.amber} stroke={C.ink} strokeWidth={3} />
          </g>
        );
      })}
      <T x={0} y={320} size={34}>ADH7</T>
    </g>
  );

/** Rotting fruit on the ground, bubbling while it ferments. */
export const FallenFruit: React.FC<{ x: number; ground: number; f: number; ferment: number }> = ({ x, ground, f, ferment }) => (
  <g transform={`translate(${x} ${ground})`}>
    {[[-80, 0], [-20, 6], [50, -2], [110, 4]].map(([fx, fy], i) => (
      <g key={i}>
        <ellipse cx={fx} cy={fy - 26} rx={34} ry={28} fill={i % 2 ? "#D7A13A" : "#C4702F"} stroke={C.ink} strokeWidth={5} />
        <path d={`M${fx! - 12} ${fy! - 34} q8 8 20 2`} stroke="#6B4A2A" strokeWidth={4} fill="none" opacity={ferment} />
      </g>
    ))}
    {Array.from({ length: 7 }, (_, i) => {
      const t = (f / 36 + i / 7) % 1;
      return <circle key={i} cx={-90 + i * 32 + 8 * Math.sin(f / 6 + i)} cy={-60 - t * 140} r={5 + (i % 3) * 2} fill="none" stroke={C.amber} strokeWidth={3} opacity={ferment * (1 - t)} />;
    })}
  </g>
);

/** Scent lines drifting up from (x, y). */
export const Scent: React.FC<{ x: number; y: number; t: number; f: number }> = ({ x, y, t, f }) =>
  t <= 0 ? null : (
    <g opacity={t}>
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${x - 30 + i * 30} ${y} q-20 -40 0 -80 q20 -40 0 -80`} fill="none" stroke={C.amber} strokeWidth={6} strokeLinecap="round"
          strokeDasharray="40 30" strokeDashoffset={-f * 2 - i * 20} />
      ))}
    </g>
  );

/** Enzyme as a padlock-like gear that spins `turns` times once the mutation clicks in. */
export const Enzyme: React.FC<{ x: number; y: number; t: number; swap: number; turns: number }> = ({ x, y, t, swap, turns }) =>
  t <= 0 ? null : (
    <g transform={pops(t, x, y)}>
      <g transform={`rotate(${turns * 360})`}>
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-16} y={-150} width={32} height={40} rx={6} fill={C.teal} stroke={C.ink} strokeWidth={5} transform={`rotate(${i * 36})`} />)}
        <circle r={116} fill={C.bg} stroke={C.ink} strokeWidth={8} />
        <circle r={40} fill="none" stroke={C.ink} strokeWidth={6} />
      </g>
      <rect x={-22} y={-116 + 60 * (1 - swap)} width={44} height={44} rx={8} fill={swap > 0.5 ? C.amber : C.grey} stroke={C.ink} strokeWidth={5} opacity={Math.min(1, swap * 2)} />
    </g>
  );

/** Dial with a needle at v (0..1) and a label; for LIKING / WANTING. */
export const Dial: React.FC<{ x: number; y: number; v: number; label: string; color: string; k?: number }> = ({ x, y, v, label, color, k = 1 }) => {
  const a = Math.PI * (1 - Math.max(0, Math.min(1, v)));
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <path d="M-160 0 A160 160 0 0 1 160 0 Z" fill={C.bg} stroke={C.ink} strokeWidth={8} />
      <path d={`M-130 0 A130 130 0 0 1 ${Math.cos(a) * 130} ${-Math.sin(a) * 130}`} fill="none" stroke={color} strokeWidth={22} />
      <line x1={0} y1={0} x2={Math.cos(a) * 120} y2={-Math.sin(a) * 120} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      <circle r={16} fill={C.ink} />
      <T x={0} y={70} size={48} color={color}>{label}</T>
    </g>
  );
};

/** Mood over time: each dose makes a high, followed by a low that deepens. Drawn up to `p` (0..1). */
export const MoodLine: React.FC<{ x: number; y: number; w: number; p: number; doses: number; sink: number }> = ({ x, y, w, p, doses, sink }) => {
  const pts: string[] = [];
  const N = 240;
  for (let i = 0; i <= N * p; i++) {
    const u = i / N, phase = u * doses, k = Math.floor(phase), fr = phase - k;
    const deep = 60 + k * 45 * sink;
    const high = 140 - k * 18;
    const m = fr < 0.25 ? high * Math.sin((fr / 0.25) * Math.PI / 2) : fr < 0.5 ? high * Math.cos(((fr - 0.25) / 0.25) * Math.PI / 2) : -deep * Math.sin(((fr - 0.5) / 0.5) * Math.PI);
    pts.push(`${x + u * w},${y - m - k * 26 * sink}`);
  }
  return <polyline points={pts.join(" ")} fill="none" stroke={C.red} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" />;
};

export const Rat: React.FC<{ x: number; y: number; k?: number; f: number; flip?: boolean }> = ({ x, y, k = 1, f, flip }) => (
  <g transform={`translate(${x} ${y + 2 * Math.sin(f / 4)}) scale(${flip ? -k : k} ${k})`}>
    <path d={`M-40 0 q-40 ${10 * Math.sin(f / 7)} -80 -10`} fill="none" stroke="#C98F8F" strokeWidth={5} strokeLinecap="round" />
    <ellipse cx={0} cy={-18} rx={42} ry={24} fill="#DAD3C8" stroke={C.ink} strokeWidth={5} />
    <path d="M30 -30 L64 -18 L30 -6 Z" fill="#DAD3C8" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={26} cy={-40} r={12} fill="#EBC7C7" stroke={C.ink} strokeWidth={4} />
    <circle cx={46} cy={-22} r={4} fill={C.ink} />
  </g>
);

export const Cage: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill="none" stroke={C.ink} strokeWidth={7} />
    {Array.from({ length: Math.floor(w / 36) }, (_, i) => <line key={i} x1={x + 36 * (i + 1)} y1={y} x2={x + 36 * (i + 1)} y2={y + h} stroke={C.ink} strokeWidth={4} />)}
  </g>
);

/** Drinking bottle whose water level drops by `drained`. */
export const Bottle: React.FC<{ x: number; y: number; drained: number }> = ({ x, y, drained }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-26} y={-140} width={52} height={140} rx={10} fill={C.bg} stroke={C.ink} strokeWidth={5} />
    <rect x={-22} y={-136 + 132 * drained} width={44} height={132 * (1 - drained)} fill={C.amber} opacity={0.55} />
    <path d="M0 0 L0 40" stroke={C.ink} strokeWidth={6} />
  </g>
);

/** Rat Park: a big painted enclosure with trees and wheels. */
export const RatPark: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-420} y={-300} width={840} height={360} rx={20} fill="#DDEBD8" stroke={C.ink} strokeWidth={7} />
    <path d="M-340 60 L-340 -140 M-380 -140 q40 -70 80 0 Z M300 60 L300 -120 M260 -120 q40 -70 80 0 Z" stroke={C.ink} strokeWidth={6} fill="#A9C79B" />
    <circle cx={120} cy={-40} r={60} fill="none" stroke={C.ink} strokeWidth={6} />
    <line x1={120} y1={-40} x2={120 + 55 * Math.cos(f / 6)} y2={-40 + 55 * Math.sin(f / 6)} stroke={C.ink} strokeWidth={5} />
    {[[-220, 40], [-120, 30], [-40, 44], [220, 36], [30, -110]].map(([rx, ry], i) => <Rat key={i} x={rx! + 20 * Math.sin(f / 20 + i)} y={ry!} k={0.7} f={f + i * 5} flip={i % 2 === 0} />)}
  </g>
);

export const PartyIcons: React.FC<{ x: number; y: number; t: number[] }> = ({ x, y, t }) => (
  <g transform={`translate(${x} ${y})`}>
    <g transform={`translate(-300 0) scale(${t[0]})`}><Pillow /></g>
    <g transform={`translate(0 0) scale(${t[1]})`}>
      <path d="M-50 -10 Q0 -60 50 -10 Z" fill="#D7A13A" stroke={C.ink} strokeWidth={6} />
      <rect x={-54} y={-10} width={108} height={18} fill="#6B3A1E" stroke={C.ink} strokeWidth={5} />
      <path d="M-50 8 Q0 40 50 8 Z" fill="#D7A13A" stroke={C.ink} strokeWidth={6} />
    </g>
    <g transform={`translate(300 0) scale(${t[2]})`}>
      <path d="M-40 40 L0 -60 L40 40 Z" fill={C.teal} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={0} cy={-64} r={10} fill={C.amber} stroke={C.ink} strokeWidth={4} />
      <path d="M50 -40 l10 -30 l14 10 M72 -20 l10 -30" {...ink} stroke={C.red} fill="none" />
    </g>
  </g>
);
