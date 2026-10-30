import React from "react";
import { C, FONT, R, T, mix } from "./kit";
import { rnd, torn } from "../Puppet/paper";

/**
 * Set pieces for the Russia episode, in world units of a 1920x1080 View.
 * Things that stand on the ground take (x, ground); floating things take a centre (x, y). `k` scales, `t` 0..1 enters.
 */

const S = { stroke: C.ink, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const G: React.FC<{ x: number; y: number; k?: number; t?: number; rot?: number; op?: number; children: React.ReactNode }> = ({ x, y, k = 1, t = 1, rot = 0, op = 1, children }) =>
  t <= 0 || op <= 0 ? null : <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k * t})`} opacity={op}>{children}</g>;

/** Viking longship, origin at the waterline centre, prow to the right. */
export const Longship: React.FC<{ x: number; y: number; k?: number; f: number; sail?: string; flip?: boolean }> = ({ x, y, k = 1, f, sail = C.red, flip }) => (
  <g transform={`translate(${x} ${y + 4 * Math.sin(f / 9)}) scale(${flip ? -k : k} ${k}) rotate(${1.5 * Math.sin(f / 11)})`}>
    <path d="M-260 -30 Q-150 40 0 40 Q150 40 260 -30 L230 -10 Q120 10 0 10 Q-120 10 -230 -10 Z" fill={R.wood} {...S} />
    <path d="M260 -30 Q290 -70 270 -110 Q300 -90 290 -50" fill="none" {...S} />
    <path d="M-260 -30 Q-290 -70 -270 -100" fill="none" {...S} />
    <line x1={0} y1={10} x2={0} y2={-260} {...S} />
    <path d="M-110 -240 L110 -240 Q130 -150 110 -60 L-110 -60 Q-90 -150 -110 -240 Z" fill={sail} {...S} />
    {[-80, 0, 80].map((dx) => <path key={dx} d={`M${dx} -240 L${dx} -60`} stroke="#FFFFFF" strokeWidth={14} opacity={0.6} />)}
    {[-180, -120, -60, 60, 120, 180].map((dx) => <circle key={dx} cx={dx} cy={-6} r={18} fill={R.gold} {...S} strokeWidth={4} />)}
  </g>
);

/** Water band from y down. */
export const Water: React.FC<{ y: number; f: number; color?: string }> = ({ y, f, color = R.sea }) => (
  <>
    <rect x={-1200} y={y} width={4400} height={1400} fill={color} />
    {Array.from({ length: 14 }, (_, i) => (
      <path key={i} d={`M${-200 + i * 170 + 30 * Math.sin(f / 13 + i)} ${y + 40 + (i % 3) * 60} q30 -14 60 0 q30 14 60 0`} fill="none" stroke="#FFFFFF" strokeWidth={5} opacity={0.7} />
    ))}
    <line x1={-1200} y1={y} x2={3200} y2={y} stroke={C.ink} strokeWidth={5} />
  </>
);

/** Wooden hut. */
export const Hut: React.FC<{ x: number; ground: number; k?: number; fire?: number; f?: number }> = ({ x, ground, k = 1, fire = 0, f = 0 }) => (
  <G x={x} y={ground} k={k}>
    <rect x={-90} y={-130} width={180} height={130} fill={R.wood} {...S} />
    {[-100, -74, -48, -22].map((y) => <line key={y} x1={-90} y1={y} x2={90} y2={y} stroke={C.ink} strokeWidth={3} opacity={0.5} />)}
    <path d="M-120 -120 L0 -220 L120 -120 Z" fill="#7A5230" {...S} />
    <rect x={-24} y={-70} width={48} height={70} fill="#4A3220" {...S} />
    {fire > 0 ? <g transform={`translate(0 -200) scale(${fire * 2})`}>{[-14, 0, 14].map((dx, i) => {
      const h = 34 + Math.sin(f * 0.5 + i * 2.1) * 8 + (i === 1 ? 22 : 0);
      return <path key={i} d={`M${dx - 13} 0 Q${dx - 15} ${-h * 0.6} ${dx} ${-h} Q${dx + 15} ${-h * 0.6} ${dx + 13} 0 Z`} fill={i === 1 ? R.amber : C.red} stroke={C.ink} strokeWidth={3} />;
    })}</g> : null}
  </G>
);

/** Pine tree. */
export const Pine: React.FC<{ x: number; ground: number; k?: number; snow?: number }> = ({ x, ground, k = 1, snow = 0 }) => (
  <G x={x} y={ground} k={k}>
    <rect x={-10} y={-50} width={20} height={50} fill={R.wood} {...S} strokeWidth={4} />
    {[0, 1, 2].map((i) => <path key={i} d={`M${-80 + i * 18} ${-50 - i * 70} L0 ${-160 - i * 70} L${80 - i * 18} ${-50 - i * 70} Z`} fill="#4F7A52" {...S} strokeWidth={5} />)}
    {snow > 0 ? [0, 1, 2].map((i) => <path key={i} d={`M${-40 + i * 9} ${-110 - i * 70} L0 ${-160 - i * 70} L${40 - i * 9} ${-110 - i * 70} Z`} fill="#FFFFFF" opacity={snow} />) : null}
  </G>
);

/** Onion-dome church; `domes` 1 or 3, `glow` for the heavenly moment. */
export const Church: React.FC<{ x: number; ground: number; k?: number; domes?: number; color?: string; glow?: number }> = ({ x, ground, k = 1, domes = 1, color = R.gold, glow = 0 }) => {
  const dome = (dx: number, y: number, r: number) => (
    <g key={dx}>
      <rect x={dx - r * 0.6} y={y} width={r * 1.2} height={60} fill="#FFFFFF" {...S} strokeWidth={5} />
      <path d={`M${dx - r} ${y} Q${dx - r} ${y - r * 1.1} ${dx} ${y - r * 1.9} Q${dx + r} ${y - r * 1.1} ${dx + r} ${y} Z`} fill={color} {...S} strokeWidth={5} />
      <path d={`M${dx} ${y - r * 1.9} L${dx} ${y - r * 2.6} M${dx - 14} ${y - r * 2.3} L${dx + 14} ${y - r * 2.3}`} {...S} strokeWidth={5} />
    </g>
  );
  return (
    <G x={x} y={ground} k={k}>
      {glow > 0 ? <circle cx={0} cy={-260} r={340} fill={R.gold} opacity={0.25 * glow} /> : null}
      {glow > 0 ? Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={Math.cos(a) * 200} y1={-260 + Math.sin(a) * 200} x2={Math.cos(a) * (240 + 140 * glow)} y2={-260 + Math.sin(a) * (240 + 140 * glow)} stroke={R.gold} strokeWidth={10} opacity={glow} strokeLinecap="round" />;
      }) : null}
      <rect x={-180} y={-200} width={360} height={200} fill="#FFFFFF" {...S} />
      <path d="M-40 0 L-40 -90 Q0 -130 40 -90 L40 0 Z" fill="#4A3220" {...S} />
      {domes === 1 ? dome(0, -260, 90) : [dome(-120, -240, 50), dome(0, -280, 90), dome(120, -240, 50)]}
    </G>
  );
};

/** Saint Basil's: a cluster of striped, coloured onion domes. */
export const StBasil: React.FC<{ x: number; ground: number; k?: number; t?: number }> = ({ x, ground, k = 1, t = 1 }) => {
  const domes: [number, number, number, string, string][] = [
    [-200, -260, 55, "#2F8A5B", "#F0C24B"], [-100, -330, 62, "#D9473B", "#FFFFFF"], [0, -440, 80, "#E2B13C", "#2F8A5B"],
    [100, -330, 62, "#3E6FB0", "#FFFFFF"], [200, -260, 55, "#D9473B", "#2F8A5B"],
  ];
  return (
    <G x={x} y={ground} k={k} t={t}>
      <rect x={-260} y={-180} width={520} height={180} fill="#C2503F" {...S} />
      {[-180, -60, 60, 180].map((dx) => <path key={dx} d={`M${dx - 30} 0 L${dx - 30} -70 Q${dx} -110 ${dx + 30} -70 L${dx + 30} 0`} fill="#7A2C22" {...S} strokeWidth={4} />)}
      {domes.map(([dx, y, r, a, b], i) => (
        <g key={i}>
          <rect x={dx - r * 0.55} y={y} width={r * 1.1} height={-y - 170} fill="#E8D8B8" {...S} strokeWidth={5} />
          <path d={`M${dx - r} ${y} Q${dx - r} ${y - r * 1.1} ${dx} ${y - r * 1.9} Q${dx + r} ${y - r * 1.1} ${dx + r} ${y} Z`} fill={a} {...S} strokeWidth={5} />
          {[-0.5, 0, 0.5].map((u) => <path key={u} d={`M${dx + u * r * 1.6} ${y} Q${dx + u * r * 1.2} ${y - r * 1.1} ${dx} ${y - r * 1.9}`} fill="none" stroke={b} strokeWidth={8} />)}
          <path d={`M${dx} ${y - r * 1.9} L${dx} ${y - r * 2.5}`} {...S} strokeWidth={5} />
        </g>
      ))}
    </G>
  );
};

/** Kremlin wall with towers; `flag` colour over the main tower (null = none). */
export const Kremlin: React.FC<{ x: number; ground: number; k?: number; flag?: string | null; flagT?: number; f?: number; snow?: number }> = ({ x, ground, k = 1, flag = null, flagT = 1, f = 0, snow = 0 }) => (
  <G x={x} y={ground} k={k}>
    <rect x={-420} y={-140} width={840} height={140} fill="#B5463A" {...S} />
    {Array.from({ length: 17 }, (_, i) => <path key={i} d={`M${-410 + i * 50} -140 l10 -26 l10 26`} fill="#B5463A" {...S} strokeWidth={4} />)}
    {[-360, 360].map((dx) => <g key={dx}><rect x={dx - 40} y={-260} width={80} height={260} fill="#B5463A" {...S} /><path d={`M${dx - 50} -260 L${dx} -340 L${dx + 50} -260 Z`} fill="#2F6B4A" {...S} /></g>)}
    <rect x={-60} y={-380} width={120} height={380} fill="#B5463A" {...S} />
    <circle cx={0} cy={-300} r={30} fill="#FFFFFF" {...S} strokeWidth={4} />
    <path d="M-70 -380 L0 -500 L70 -380 Z" fill="#2F6B4A" {...S} />
    {flag ? (
      <g>
        <line x1={0} y1={-500} x2={0} y2={-620} {...S} strokeWidth={5} />
        <path d={`M0 ${-620 + 90 * (1 - flagT)} q50 ${-10 + 6 * Math.sin(f / 5)} 100 0 l0 54 q-50 ${10 - 6 * Math.sin(f / 5)} -100 0 Z`} fill={flag} {...S} strokeWidth={4} />
      </g>
    ) : null}
    {snow > 0 ? <rect x={-420} y={-146} width={840} height={12} fill="#FFFFFF" opacity={snow} /> : null}
  </G>
);

/** Mongol tent (ger) with a throne in front. */
export const Yurt: React.FC<{ x: number; ground: number; k?: number }> = ({ x, ground, k = 1 }) => (
  <G x={x} y={ground} k={k}>
    <path d="M-260 0 L-260 -170 Q0 -330 260 -170 L260 0 Z" fill="#F1E6CF" {...S} />
    <path d="M-260 -170 Q0 -250 260 -170" fill="none" stroke={C.red} strokeWidth={14} />
    <path d="M-60 0 L-60 -120 L60 -120 L60 0 Z" fill={C.red} {...S} />
  </G>
);
export const Throne: React.FC<{ x: number; ground: number; k?: number }> = ({ x, ground, k = 1 }) => (
  <G x={x} y={ground} k={k}>
    <path d="M-70 0 L-70 -240 Q0 -290 70 -240 L70 0 M-90 -110 L90 -110" fill={R.gold} {...S} />
    <rect x={-90} y={-120} width={180} height={24} fill={R.gold} {...S} />
  </G>
);

/** A scroll with text (the yarlik, a letter, a decree). */
export const Scroll: React.FC<{ x: number; y: number; k?: number; t?: number; lines: string[]; stamp?: number; rot?: number }> = ({ x, y, k = 1, t = 1, lines, stamp = 0, rot = 0 }) => (
  <G x={x} y={y} k={k} t={t} rot={rot}>
    <rect x={-170} y={-120} width={340} height={240} fill="#F3E3BC" {...S} />
    <rect x={-190} y={-140} width={380} height={30} rx={15} fill="#E3CC98" {...S} strokeWidth={5} />
    <rect x={-190} y={110} width={380} height={30} rx={15} fill="#E3CC98" {...S} strokeWidth={5} />
    {lines.map((l, i) => <text key={i} x={0} y={-50 + i * 50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.ink}>{l}</text>)}
    {stamp > 0 ? <g transform={`translate(100 70) rotate(-14) scale(${stamp})`}><circle r={40} fill="none" stroke={C.red} strokeWidth={7} /><text y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.red}>OK</text></g> : null}
  </G>
);

/** Money bag with a sign. */
export const MoneyBag: React.FC<{ x: number; y: number; k?: number; t?: number; sign?: string }> = ({ x, y, k = 1, t = 1, sign = "$" }) => (
  <G x={x} y={y} k={k} t={t}>
    <path d="M-40 -70 L40 -70 L20 -50 Q100 -10 80 50 Q60 90 0 90 Q-60 90 -80 50 Q-100 -10 -20 -50 Z" fill="#C9A15A" {...S} />
    <path d="M-30 -52 L30 -52" {...S} />
    <text x={0} y={40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill={C.ink}>{sign}</text>
  </G>
);
export const Coin: React.FC<{ x: number; y: number; k?: number; t?: number }> = ({ x, y, k = 1, t = 1 }) => (
  <G x={x} y={y} k={k} t={t}><circle r={24} fill={R.gold} {...S} strokeWidth={4} /><circle r={14} fill="none" stroke={C.ink} strokeWidth={3} opacity={0.5} /></G>
);

/** Mug (of mead), for Vladimir. */
export const Mug: React.FC<{ x: number; y: number; k?: number; t?: number; rot?: number; foam?: number }> = ({ x, y, k = 1, t = 1, rot = 0, foam = 1 }) => (
  <G x={x} y={y} k={k} t={t} rot={rot}>
    <path d="M30 -40 Q70 -40 70 0 Q70 40 30 40" fill="none" {...S} strokeWidth={10} />
    <rect x={-40} y={-60} width={80} height={120} rx={8} fill={R.amber} {...S} />
    {foam > 0 ? <path d="M-46 -60 Q-40 -86 -16 -76 Q0 -96 20 -78 Q44 -88 46 -60 Z" fill="#FFFFFF" {...S} strokeWidth={4} /> : null}
  </G>
);

/** Choice board with ticks: rows of [label, state] where state 0 = blank, 1 = tick, -1 = cross. */
export const Menu: React.FC<{ x: number; y: number; k?: number; t?: number; title: string; rows: [string, number][] }> = ({ x, y, k = 1, t = 1, title, rows }) => (
  <G x={x} y={y} k={k} t={t}>
    <rect x={-300} y={-60} width={600} height={110 + rows.length * 90} rx={14} fill="#2F3A33" {...S} />
    <text x={0} y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill="#F3E9D2">{title}</text>
    {rows.map(([l, st], i) => (
      <g key={l} transform={`translate(0 ${100 + i * 90})`}>
        <rect x={-250} y={-36} width={56} height={56} rx={6} fill="none" stroke="#F3E9D2" strokeWidth={5} />
        {st === 1 ? <path d="M-240 -10 L-222 10 L-190 -34" fill="none" stroke="#7CD992" strokeWidth={10} strokeLinecap="round" /> : null}
        {st === -1 ? <path d="M-240 -28 L-204 12 M-204 -28 L-240 12" fill="none" stroke="#FF6B5B" strokeWidth={9} strokeLinecap="round" /> : null}
        <text x={-160} y={8} fontFamily={FONT} fontWeight={800} fontSize={44} fill="#F3E9D2">{l}</text>
      </g>
    ))}
  </G>
);

/** Round "no" sign over any child. */
export const NoSign: React.FC<{ x: number; y: number; k?: number; t?: number; children?: React.ReactNode }> = ({ x, y, k = 1, t = 1, children }) => (
  <G x={x} y={y} k={k} t={t}>
    {children}
    <circle r={90} fill="none" stroke={C.red} strokeWidth={16} />
    <line x1={-64} y1={-64} x2={64} y2={64} stroke={C.red} strokeWidth={16} />
  </G>
);

/** Double-headed eagle: two crowned heads looking outward, spread feathered wings, red shield. */
export const Eagle: React.FC<{ x: number; y: number; k?: number; t?: number }> = ({ x, y, k = 1, t = 1 }) => {
  const wing = "M-30 -10 L-110 -120 L-128 -92 L-150 -128 L-162 -84 L-196 -112 L-198 -60 L-236 -74 L-220 -24 L-250 -20 L-206 16 L-120 24 L-40 30 Z";
  const head = (sg: number) => (
    <g key={sg} transform={`scale(${sg} 1)`}>
      <path d="M-14 -40 Q-30 -90 -62 -112" fill="none" stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
      <path d="M-14 -40 Q-30 -90 -62 -112" fill="none" stroke={R.gold} strokeWidth={12} strokeLinecap="round" />
      <circle cx={-72} cy={-122} r={24} fill={R.gold} {...S} strokeWidth={5} />
      <path d="M-94 -128 L-124 -118 L-96 -108 Z" fill={C.red} {...S} strokeWidth={4} />
      <circle cx={-78} cy={-128} r={4} fill={C.ink} />
      <path d="M-90 -146 L-90 -166 L-80 -156 L-72 -170 L-64 -156 L-54 -166 L-54 -146 Z" fill={R.gold} {...S} strokeWidth={4} />
    </g>
  );
  return (
    <G x={x} y={y} k={k} t={t}>
      <path d={wing} fill={R.gold} {...S} />
      <path d={wing} fill={R.gold} {...S} transform="scale(-1 1)" />
      <path d="M-34 80 L-58 150 L-20 128 L0 156 L20 128 L58 150 L34 80 Z" fill={R.gold} {...S} />
      {head(1)}{head(-1)}
      <ellipse cx={0} cy={20} rx={46} ry={72} fill={R.gold} {...S} />
      <path d="M-30 -14 L30 -14 L30 40 Q0 66 -30 40 Z" fill={C.red} {...S} strokeWidth={5} />
      <path d="M-58 150 L-64 172 M58 150 L64 172" {...S} strokeWidth={5} />
    </G>
  );
};

/** Ruined / standing column, for the three Romes. */
export const Column: React.FC<{ x: number; ground: number; h?: number; broken?: number; label: string; color?: string }> = ({ x, ground, h = 380, broken = 0, label, color = "#FFFFFF" }) => (
  <g>
    <rect x={x - 60} y={ground - 30} width={120} height={30} fill={color} {...S} />
    <path d={`M${x - 40} ${ground - 30} L${x - 40} ${ground - h * (1 - 0.6 * broken)} L${x - 10} ${ground - h * (1 - 0.6 * broken) + 30 * broken} L${x + 10} ${ground - h * (1 - 0.6 * broken) - 20 * broken} L${x + 40} ${ground - h * (1 - 0.6 * broken)} L${x + 40} ${ground - 30} Z`} fill={color} {...S} />
    {broken > 0 ? <rect x={x + 50} y={ground - 46} width={110} height={44} rx={6} fill={color} {...S} transform={`rotate(${8 * broken} ${x + 100} ${ground})`} /> : null}
    {broken < 0.5 ? <rect x={x - 70} y={ground - h - 30} width={140} height={34} fill={color} {...S} /> : null}
    <T x={x} y={ground + 70} size={44}>{label}</T>
  </g>
);

/** Chessboard on a table, with a few pieces. */
export const Chess: React.FC<{ x: number; ground: number; k?: number; pieces?: number; tip?: number }> = ({ x, ground, k = 1, pieces = 1, tip = 0 }) => (
  <G x={x} y={ground} k={k}>
    <path d="M-150 -170 L150 -170 M-120 -170 L-120 0 M120 -170 L120 0" {...S} strokeWidth={9} />
    <g transform="translate(0 -190) scale(1 0.5)">
      {Array.from({ length: 16 }, (_, i) => <rect key={i} x={-140 + (i % 4) * 70} y={-140 + Math.floor(i / 4) * 70} width={70} height={70} fill={(i + Math.floor(i / 4)) % 2 ? C.ink : "#FFFFFF"} />)}
      <rect x={-140} y={-140} width={280} height={280} fill="none" stroke={C.ink} strokeWidth={6} />
    </g>
    {Array.from({ length: Math.round(6 * pieces) }, (_, i) => (
      <g key={i} transform={`translate(${-100 + i * 40} ${-220 + (i % 2) * 30}) rotate(${i === 3 ? 80 * tip : 0})`}>
        <path d="M-10 0 L-8 -30 Q0 -44 8 -30 L10 0 Z" fill={i % 2 ? C.ink : "#FFFFFF"} {...S} strokeWidth={3} />
      </g>
    ))}
  </G>
);

/** Cannon, barrel aimed by `aim` degrees up; `smoke` 0..1 after firing. */
export const Cannon: React.FC<{ x: number; ground: number; k?: number; aim?: number; flip?: boolean }> = ({ x, ground, k = 1, aim = 20, flip }) => (
  <G x={x} y={ground} k={k}>
    <g transform={flip ? "scale(-1 1)" : undefined}>
      <g transform={`rotate(${-aim} -20 -60)`}><rect x={-60} y={-84} width={210} height={50} rx={22} fill="#3A3A3A" {...S} /></g>
      <circle cx={-20} cy={-40} r={40} fill={R.wood} {...S} />
      <circle cx={-20} cy={-40} r={10} fill={C.ink} />
    </g>
  </G>
);

/** Puff cloud. */
export const Puff: React.FC<{ x: number; y: number; k?: number; op?: number; color?: string }> = ({ x, y, k = 1, op = 1, color = "#D8D2C6" }) => (
  <G x={x} y={y} k={k} op={op}>
    <path d="M-80 20 q-30 -50 20 -60 q20 -40 60 -16 q40 -30 70 10 q40 4 20 50 Z" fill={color} {...S} strokeWidth={5} />
  </G>
);

/** Ruler beside a figure (for Peter's height). */
export const Ruler: React.FC<{ x: number; ground: number; h: number; t?: number; label: string }> = ({ x, ground, h, t = 1, label }) =>
  t <= 0 ? null : (
    <g opacity={t}>
      <line x1={x} y1={ground} x2={x} y2={ground - h * t} stroke={C.red} strokeWidth={8} />
      <line x1={x - 24} y1={ground - h * t} x2={x + 24} y2={ground - h * t} stroke={C.red} strokeWidth={8} />
      <line x1={x - 24} y1={ground} x2={x + 24} y2={ground} stroke={C.red} strokeWidth={8} />
      <T x={x + 34} y={ground - (h * t) / 2 + 18} size={54} color={C.red} anchor="start">{label}</T>
    </g>
  );

/** Windmill with turning sails. */
export const Windmill: React.FC<{ x: number; ground: number; k?: number; f: number }> = ({ x, ground, k = 1, f }) => (
  <G x={x} y={ground} k={k}>
    <path d="M-70 0 L-50 -260 L50 -260 L70 0 Z" fill="#C9A27A" {...S} />
    <path d="M-60 -260 L0 -320 L60 -260 Z" fill="#7A5230" {...S} />
    <g transform={`translate(0 -270) rotate(${f * 2})`}>
      {[0, 90, 180, 270].map((a) => <rect key={a} x={-14} y={-200} width={28} height={190} fill="#FFFFFF" {...S} strokeWidth={4} transform={`rotate(${a})`} />)}
      <circle r={14} fill={C.ink} />
    </g>
  </G>
);

/** Sailing ship (Peter's navy, the Baltic fleet). `sink` 0..1 tilts and lowers it. */
export const Ship: React.FC<{ x: number; y: number; k?: number; f: number; flag?: string; sink?: number; steam?: boolean; flip?: boolean }> = ({ x, y, k = 1, f, flag = "#FFFFFF", sink = 0, steam, flip }) => (
  <g transform={`translate(${x} ${y + 3 * Math.sin(f / 10) + 160 * sink * k}) scale(${flip ? -k : k} ${k}) rotate(${1.5 * Math.sin(f / 12) + 25 * sink})`} opacity={1 - Math.max(0, sink - 0.7) / 0.3}>
    <path d="M-220 -40 L220 -40 L180 40 L-180 40 Z" fill={steam ? "#5B5F66" : R.wood} {...S} />
    {steam ? (
      <>
        <rect x={-120} y={-110} width={220} height={70} fill="#8A9097" {...S} />
        {[-60, 20].map((dx) => <rect key={dx} x={dx} y={-200} width={40} height={90} fill="#3A3A3A" {...S} />)}
        <line x1={-180} y1={-40} x2={-180} y2={-200} {...S} />
        <path d={`M-180 -200 l60 6 l0 34 l-60 -6 Z`} fill={flag} {...S} strokeWidth={4} />
      </>
    ) : (
      <>
        {[-90, 60].map((dx) => (
          <g key={dx}>
            <line x1={dx} y1={-40} x2={dx} y2={-320} {...S} />
            <path d={`M${dx - 80} -300 Q${dx} -270 ${dx + 80} -300 L${dx + 70} -170 Q${dx} -150 ${dx - 70} -170 Z`} fill="#FFFFFF" {...S} strokeWidth={5} />
          </g>
        ))}
        <path d={`M60 -320 l70 8 l0 36 l-70 -8 Z`} fill={flag} {...S} strokeWidth={4} />
      </>
    )}
  </g>
);

/** Little fishing boat. */
export const Boat: React.FC<{ x: number; y: number; k?: number; f: number }> = ({ x, y, k = 1, f }) => (
  <g transform={`translate(${x} ${y + 4 * Math.sin(f / 7 + x)}) scale(${k})`}>
    <path d="M-90 -20 L90 -20 L70 20 L-70 20 Z" fill="#C9A27A" {...S} strokeWidth={5} />
    <line x1={0} y1={-20} x2={0} y2={-120} {...S} strokeWidth={5} />
    <path d="M4 -116 L70 -36 L4 -36 Z" fill="#F3E9D2" {...S} strokeWidth={4} />
  </g>
);

/** City skyline (Saint Petersburg: spire + palace). `rise` 0..1 lifts it out of the swamp. */
export const Petersburg: React.FC<{ x: number; ground: number; k?: number; rise: number }> = ({ x, ground, k = 1, rise }) => (
  <G x={x} y={ground + 400 * (1 - rise)} k={k}>
    <rect x={-380} y={-150} width={500} height={150} fill="#7FB6A8" {...S} />
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-360 + i * 54} y={-120} width={26} height={44} fill="#FFFFFF" {...S} strokeWidth={3} />)}
    <rect x={160} y={-260} width={90} height={260} fill="#F1E6CF" {...S} />
    <path d="M160 -260 L205 -320 L250 -260 Z" fill={R.gold} {...S} />
    <path d="M205 -320 L205 -560" stroke={R.gold} strokeWidth={14} strokeLinecap="round" />
    <path d="M205 -560 L205 -600" {...S} strokeWidth={4} />
  </G>
);

/** Swamp: reeds and murky water. */
export const Swamp: React.FC<{ y: number; f: number; op?: number }> = ({ y, f, op = 1 }) => (
  <g opacity={op}>
    <rect x={-1200} y={y} width={4400} height={1400} fill="#8A9A6A" opacity={0.6} />
    {Array.from({ length: 22 }, (_, i) => (
      <path key={i} d={`M${-100 + i * 100} ${y + 10} q${6 + 6 * Math.sin(f / 15 + i)} -60 ${-4} -120`} fill="none" stroke="#4F6A3A" strokeWidth={7} strokeLinecap="round" />
    ))}
  </g>
);

/** Snowfall over the frame (screen-ish, world px). */
export const Snow: React.FC<{ f: number; op: number; n?: number }> = ({ f, op, n = 70 }) =>
  op <= 0 ? null : (
    <g opacity={op}>
      {Array.from({ length: n }, (_, i) => {
        const r1 = Math.sin(i * 12.9898) * 43758.5453, rx = r1 - Math.floor(r1);
        const r2 = Math.sin(i * 78.233) * 12543.123, ry = r2 - Math.floor(r2);
        const x = ((rx * 2200 + Math.sin(f / 20 + i) * 30 - f * 2) % 2200 + 2200) % 2200 - 140;
        const y = ((ry * 1200 + f * (3 + (i % 4))) % 1200) - 60;
        return <circle key={i} cx={x} cy={y} r={4 + (i % 4) * 2} fill="#FFFFFF" stroke="#B9C6CC" strokeWidth={1.5} />;
      })}
    </g>
  );

/** Mailbox, empty or with a letter. */
export const Mailbox: React.FC<{ x: number; ground: number; k?: number; letter?: number }> = ({ x, ground, k = 1, letter = 0 }) => (
  <G x={x} y={ground} k={k}>
    <line x1={0} y1={0} x2={0} y2={-160} {...S} strokeWidth={10} />
    <path d="M-80 -160 L-80 -240 Q0 -300 80 -240 L80 -160 Z" fill="#3E6FB0" {...S} />
    <rect x={-50} y={-230} width={100} height={14} rx={6} fill={C.ink} />
    {letter > 0 ? <rect x={-40} y={-260 - 40 * letter} width={80} height={52} fill="#FFFFFF" {...S} strokeWidth={4} /> : null}
  </G>
);

/** Price tag. */
export const Tag: React.FC<{ x: number; y: number; k?: number; t?: number; text: string; rot?: number; color?: string }> = ({ x, y, k = 1, t = 1, text, rot = -8, color = "#FFF6D8" }) => (
  <G x={x} y={y} k={k} t={t} rot={rot}>
    <path d={`M-40 -50 L${text.length * 30 + 40} -50 L${text.length * 30 + 40} 50 L-40 50 L-90 0 Z`} fill={color} {...S} />
    <circle cx={-50} cy={0} r={10} fill={C.bg} {...S} strokeWidth={4} />
    <text x={text.length * 15} y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={58} fill={C.ink}>{text}</text>
  </G>
);

/** Oil derrick, gushing with `gush`. */
export const Derrick: React.FC<{ x: number; ground: number; k?: number; gush?: number; f?: number }> = ({ x, ground, k = 1, gush = 0, f = 0 }) => (
  <G x={x} y={ground} k={k}>
    <path d="M-80 0 L0 -300 L80 0 M-60 -80 L60 -80 M-40 -160 L40 -160 M-20 -240 L20 -240 M-60 -80 L40 -160 M60 -80 L-40 -160" fill="none" {...S} />
    {gush > 0 ? (
      <g transform={`translate(0 -300) scale(${gush})`}>
        <path d={`M-12 0 Q-40 -170 -150 -130 Q-70 -230 0 ${-280 - 12 * Math.sin(f / 3)} Q70 -230 150 -130 Q40 -170 12 0 Z`} fill="#1E1A16" {...S} strokeWidth={4} />
        {[-110, -60, 60, 110].map((dx, i) => <circle key={dx} cx={dx} cy={-110 + ((f * 4 + i * 20) % 90)} r={10} fill="#1E1A16" />)}
      </g>
    ) : null}
  </G>
);

/** Gold nugget. */
export const Nugget: React.FC<{ x: number; y: number; k?: number; t?: number }> = ({ x, y, k = 1, t = 1 }) => (
  <G x={x} y={y} k={k} t={t}>
    <path d="M-50 10 L-30 -30 L10 -40 L50 -14 L44 26 L0 40 L-40 34 Z" fill={R.gold} {...S} />
    <path d="M-20 -10 L0 -24 M10 0 L30 -6" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" />
  </G>
);

/** Bomb with a lit fuse. */
export const Bomb: React.FC<{ x: number; y: number; k?: number; t?: number; f: number }> = ({ x, y, k = 1, t = 1, f }) => (
  <G x={x} y={y} k={k} t={t}>
    <circle r={60} fill={C.ink} />
    <rect x={-20} y={-80} width={40} height={30} fill={C.ink} />
    <path d="M0 -80 Q20 -120 50 -110" fill="none" stroke={R.wood} strokeWidth={6} />
    <circle cx={50 + 4 * Math.sin(f)} cy={-110} r={10 + 4 * Math.sin(f * 1.7)} fill={R.amber} />
  </G>
);

/** Tombstone with a line of text. */
export const Grave: React.FC<{ x: number; ground: number; k?: number; t?: number; text?: string }> = ({ x, ground, k = 1, t = 1, text = "RIP" }) => (
  <G x={x} y={ground} k={k} t={t}>
    <path d="M-90 0 L-90 -170 Q0 -260 90 -170 L90 0 Z" fill="#B9B4AA" {...S} />
    <text x={0} y={-110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={C.ink}>{text}</text>
  </G>
);

/** Prison bars over a rect. */
export const Bars: React.FC<{ x: number; y: number; w: number; h: number; t?: number }> = ({ x, y, w, h, t = 1 }) =>
  t <= 0 ? null : (
    <g opacity={t}>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={C.ink} strokeWidth={10} />
      {Array.from({ length: Math.floor(w / 60) }, (_, i) => <line key={i} x1={x + 30 + i * 60} y1={y} x2={x + 30 + i * 60} y2={y + h * t} stroke={C.ink} strokeWidth={10} />)}
    </g>
  );

/** Boxcar (Lenin's sealed train); `x` moves it. */
export const Train: React.FC<{ x: number; ground: number; k?: number; f: number; label?: string }> = ({ x, ground, k = 1, f, label = "SEALED" }) => (
  <G x={x} y={ground} k={k}>
    <rect x={-620} y={-210} width={300} height={150} fill="#5B4636" {...S} />
    <rect x={-300} y={-210} width={420} height={170} fill="#6A5240" {...S} />
    <rect x={-180} y={-180} width={170} height={80} fill="#3A2A20" {...S} strokeWidth={4} />
    <text x={-95} y={-130} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#F3E9D2">{label}</text>
    <rect x={140} y={-260} width={200} height={220} fill="#2E2E2E" {...S} />
    <rect x={180} y={-340} width={50} height={80} fill="#2E2E2E" {...S} />
    {[-560, -380, -240, 40, 200, 290].map((dx, i) => <g key={i} transform={`translate(${dx} -20) rotate(${f * 12})`}><circle r={34} fill="#3A3A3A" {...S} strokeWidth={5} /><line x1={-30} y1={0} x2={30} y2={0} stroke="#888" strokeWidth={4} /></g>)}
    {[0, 1, 2].map((i) => <circle key={i} cx={205 - 30 * i - (f % 20) * 2} cy={-370 - 40 * i - (f % 20) * 2} r={22 + 10 * i} fill="#D8D2C6" opacity={0.8 - 0.2 * i} {...S} strokeWidth={3} />)}
  </G>
);

/** Calendar page with a month and a big cross if `crossed`. */
export const Month: React.FC<{ x: number; y: number; k?: number; t?: number; name: string; crossed?: number; color?: string }> = ({ x, y, k = 1, t = 1, name, crossed = 0, color = C.red }) => (
  <G x={x} y={y} k={k} t={t}>
    <rect x={-170} y={-170} width={340} height={340} rx={16} fill="#FFFFFF" {...S} />
    <rect x={-170} y={-170} width={340} height={90} rx={16} fill={color} {...S} />
    <text x={0} y={-110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#FFFFFF">{name}</text>
    {Array.from({ length: 20 }, (_, i) => <rect key={i} x={-140 + (i % 5) * 58} y={-60 + Math.floor(i / 5) * 54} width={40} height={36} fill="#E8E2D6" />)}
    {crossed > 0 ? <path d={`M-150 -150 L${-150 + 300 * crossed} ${-150 + 300 * crossed} M150 -150 L${150 - 300 * Math.max(0, crossed * 2 - 1)} ${-150 + 300 * Math.max(0, crossed * 2 - 1)}`} stroke={C.red} strokeWidth={22} strokeLinecap="round" /> : null}
  </G>
);

/** Glass case on a plinth (the mausoleum). */
export const GlassCase: React.FC<{ x: number; ground: number; k?: number; children?: React.ReactNode }> = ({ x, ground, k = 1, children }) => (
  <G x={x} y={ground} k={k}>
    <rect x={-300} y={-120} width={600} height={120} fill="#5A2E2A" {...S} />
    {children}
    <rect x={-280} y={-330} width={560} height={210} fill="#CFE6EE" opacity={0.35} {...S} />
    <line x1={-240} y1={-300} x2={-160} y2={-150} stroke="#FFFFFF" strokeWidth={10} opacity={0.7} />
  </G>
);

/** Photo frame: children are the people; the frame clips them. */
export const Photo: React.FC<{ x: number; y: number; w: number; h: number; k?: number; t?: number; children: React.ReactNode }> = ({ x, y, w, h, k = 1, t = 1, children }) => (
  <G x={x} y={y} k={k} t={t}>
    <rect x={-w / 2 - 24} y={-h / 2 - 24} width={w + 48} height={h + 48} fill="#FFFFFF" {...S} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#D9D2C2" stroke={C.ink} strokeWidth={3} />
    <clipPath id="photo-clip"><rect x={-w / 2} y={-h / 2} width={w} height={h} /></clipPath>
    <g clipPath="url(#photo-clip)" style={{ filter: "grayscale(1)" }}>{children}</g>
  </G>
);

/** Rocket on the pad, lifting by `lift` (0..1 of a flight) with flames. */
export const Rocket: React.FC<{ x: number; ground: number; k?: number; lift: number; f: number }> = ({ x, ground, k = 1, lift, f }) => (
  <G x={x} y={ground - 1400 * lift * lift} k={k}>
    {lift > 0 || f % 2 === 0 ? (
      <path d={`M-50 0 Q0 ${160 + 30 * Math.sin(f)} 50 0 Z`} fill={R.amber} {...S} strokeWidth={4} opacity={lift > 0 ? 1 : 0} />
    ) : null}
    <path d="M-50 0 L-50 -380 Q0 -520 50 -380 L50 0 Z" fill="#F1F1F1" {...S} />
    <path d="M-50 -60 L-110 30 L-50 0 Z M50 -60 L110 30 L50 0 Z" fill={C.red} {...S} />
    <circle cx={0} cy={-300} r={22} fill="#9CC9E8" {...S} strokeWidth={4} />
    <text x={0} y={-180} textAnchor="middle" fontFamily="Arial" fontWeight={900} fontSize={34} fill={C.red} transform="rotate(-90 0 -180)">СССР</text>
  </G>
);

/** Sputnik: ball with four antennas. */
export const Sputnik: React.FC<{ x: number; y: number; k?: number; t?: number; rot?: number }> = ({ x, y, k = 1, t = 1, rot = 0 }) => (
  <G x={x} y={y} k={k} t={t} rot={rot}>
    {[150, 165, 195, 210].map((a) => <line key={a} x1={0} y1={0} x2={Math.cos((a * Math.PI) / 180) * 260} y2={Math.sin((a * Math.PI) / 180) * 260} stroke={C.ink} strokeWidth={5} />)}
    <circle r={60} fill="#D9DDE1" {...S} />
    <path d="M-40 -30 Q-10 -50 20 -40" stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" />
  </G>
);

/** Earth disc with a few rounded continents drifting by `spin`. */
export const Globe: React.FC<{ x: number; y: number; r: number; spin?: number }> = ({ x, y, r, spin = 0 }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#7FB6D6" {...S} />
    <clipPath id="globe-clip"><circle cx={x} cy={y} r={r} /></clipPath>
    <g clipPath="url(#globe-clip)">
      {[[-0.5, -0.35, 0.55, 0.32], [0.35, -0.15, 0.45, 0.5], [-0.2, 0.45, 0.35, 0.22], [0.75, 0.55, 0.3, 0.2]].map(([u, v, a, b], i) => {
        const px = x + ((((u + spin * 2 + 1.5) % 3) + 3) % 3 - 1.5) * r;
        return <ellipse key={i} cx={px} cy={y + v * r} rx={a * r} ry={b * r} fill="#9CC48A" stroke={C.ink} strokeWidth={4} transform={`rotate(${-20 + i * 25} ${px} ${y + v * r})`} />;
      })}
    </g>
    <circle cx={x} cy={y} r={r} fill="none" {...S} />
  </g>
);

/** Small dog (Laika) in a round helmet. */
export const Laika: React.FC<{ x: number; y: number; k?: number; t?: number; f: number }> = ({ x, y, k = 1, t = 1, f }) => (
  <G x={x} y={y} k={k} t={t}>
    <ellipse cx={0} cy={40} rx={90} ry={50} fill="#FFFFFF" {...S} />
    <path d={`M80 30 q40 ${-20 + 15 * Math.sin(f / 3)} 50 -40`} fill="none" {...S} strokeWidth={8} />
    <circle cx={-70} cy={-30} r={52} fill="#FFFFFF" {...S} />
    <path d="M-110 -70 L-100 -120 L-80 -78 Z M-40 -76 L-30 -122 L-20 -70 Z" fill="#C49A6C" {...S} strokeWidth={4} />
    <circle cx={-88} cy={-34} r={6} fill={C.ink} /><circle cx={-56} cy={-34} r={6} fill={C.ink} />
    <ellipse cx={-72} cy={-12} rx={10} ry={7} fill={C.ink} />
    <circle cx={-70} cy={-30} r={78} fill="#9CC9E8" opacity={0.2} stroke={C.ink} strokeWidth={5} />
  </G>
);

/** Tank, facing right. */
export const Tank: React.FC<{ x: number; ground: number; k?: number; f?: number; flip?: boolean; color?: string }> = ({ x, ground, k = 1, f = 0, flip, color = "#5E6B47" }) => (
  <G x={x} y={ground} k={k}>
    <g transform={flip ? "scale(-1 1)" : undefined}>
      <rect x={-220} y={-80} width={440} height={80} rx={40} fill="#3A3A3A" {...S} />
      {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={-180 + i * 60} cy={-40} r={24} fill="#6A6A6A" {...S} strokeWidth={4} transform={`rotate(${f * 8} ${-180 + i * 60} -40)`} />)}
      <path d="M-200 -80 L-170 -150 L170 -150 L200 -80 Z" fill={color} {...S} />
      <path d="M-100 -150 L-80 -220 L80 -220 L100 -150 Z" fill={color} {...S} />
      <rect x={80} y={-200} width={240} height={30} fill={color} {...S} />
    </g>
  </G>
);

/** Brick wall with `fall` 0..1 knocking a gap. */
export const Wall: React.FC<{ x: number; ground: number; w: number; h: number; fall?: number }> = ({ x, ground, w, h, fall = 0 }) => (
  <g>
    {Array.from({ length: Math.ceil(h / 50) }, (_, r) =>
      Array.from({ length: Math.ceil(w / 120) + 1 }, (_, c) => {
        const bx = x - w / 2 + c * 120 - (r % 2) * 60, by = ground - (r + 1) * 50;
        const mid = Math.abs(bx + 60 - x) < w * 0.22;
        const drop = mid ? fall * (240 + ((r * 7 + c * 13) % 5) * 60) : 0;
        if (bx < x - w / 2 - 60 || bx > x + w / 2) return null;
        return <rect key={`${r}-${c}`} x={bx + (mid ? fall * ((c % 3) - 1) * 50 : 0)} y={Math.min(ground - 50, by + drop)} width={120} height={50} fill="#C8C1B4" stroke={C.ink} strokeWidth={4}
          transform={mid && fall > 0 ? `rotate(${fall * ((r + c) % 2 ? 20 : -15)} ${bx + 60} ${by + 25})` : undefined} />;
      }),
    )}
  </g>
);

/** Old TV set; children drawn on the screen (screen centre at 0,0, 360x240). */
export const TVSet: React.FC<{ x: number; y: number; k?: number; t?: number; children?: React.ReactNode }> = ({ x, y, k = 1, t = 1, children }) => (
  <G x={x} y={y} k={k} t={t}>
    <rect x={-240} y={-180} width={480} height={340} rx={30} fill="#7A5230" {...S} />
    <rect x={-190} y={-140} width={380} height={260} rx={20} fill="#1E2A2E" {...S} />
    <clipPath id="tv-clip"><rect x={-190} y={-140} width={380} height={260} rx={20} /></clipPath>
    <g clipPath="url(#tv-clip)">{children}</g>
    <path d="M-60 -180 L-120 -280 M60 -180 L120 -280" {...S} />
    <path d="M-120 160 L-140 210 M120 160 L140 210" {...S} />
  </G>
);

/** Pizza slice. */
export const Pizza: React.FC<{ x: number; y: number; k?: number; t?: number; rot?: number }> = ({ x, y, k = 1, t = 1, rot = 0 }) => (
  <G x={x} y={y} k={k} t={t} rot={rot}>
    <path d="M0 120 L-80 -100 Q0 -130 80 -100 Z" fill="#F3C25B" {...S} />
    <path d="M-80 -100 Q0 -130 80 -100 L74 -84 Q0 -112 -74 -84 Z" fill="#C98A3A" {...S} strokeWidth={4} />
    {[[-20, -50], [24, -30], [-6, 10], [10, 60]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={14} fill={C.red} {...S} strokeWidth={3} />)}
  </G>
);

/** Factory with a smokestack. */
export const Factory: React.FC<{ x: number; ground: number; k?: number; t?: number; f?: number; tag?: string }> = ({ x, ground, k = 1, t = 1, f = 0, tag }) => (
  <G x={x} y={ground} k={k} t={t}>
    <path d="M-160 0 L-160 -140 L-100 -190 L-100 -140 L-40 -190 L-40 -140 L20 -190 L20 -140 L160 -140 L160 0 Z" fill="#C9C2B4" {...S} />
    <rect x={90} y={-320} width={44} height={180} fill="#8A7F70" {...S} />
    {[0, 1].map((i) => <circle key={i} cx={112 + 10 * i + ((f / 2) % 20)} cy={-350 - 40 * i - ((f / 2) % 20)} r={20 + 10 * i} fill="#D8D2C6" opacity={0.7} {...S} strokeWidth={3} />)}
    {tag ? <T x={0} y={-60} size={44}>{tag}</T> : null}
  </G>
);

/** Store shelves, `stock` 0..1. */
export const Shelves: React.FC<{ x: number; ground: number; k?: number; stock: number }> = ({ x, ground, k = 1, stock }) => (
  <G x={x} y={ground} k={k}>
    <rect x={-260} y={-420} width={520} height={420} fill="#E8DFCE" {...S} />
    {[0, 1, 2].map((r) => (
      <g key={r}>
        <line x1={-260} y1={-300 + r * 130} x2={260} y2={-300 + r * 130} {...S} />
        {Array.from({ length: 8 }, (_, i) => (i + r * 3) % 8 < 8 * stock ? <rect key={i} x={-240 + i * 62} y={-360 + r * 130} width={40} height={60} fill={[C.red, R.blue, R.gold][(i + r) % 3]} stroke={C.ink} strokeWidth={3} /> : null)}
      </g>
    ))}
  </G>
);

/** Reactor building with a radiation sign. */
export const Reactor: React.FC<{ x: number; ground: number; k?: number; glow?: number; f?: number }> = ({ x, ground, k = 1, glow = 0, f = 0 }) => (
  <G x={x} y={ground} k={k}>
    {glow > 0 ? <ellipse cx={0} cy={-220} rx={260 + 20 * Math.sin(f / 4)} ry={200} fill="#B6E34A" opacity={0.3 * glow} /> : null}
    <rect x={-240} y={-240} width={480} height={240} fill="#D9D3C6" {...S} />
    <rect x={120} y={-460} width={60} height={220} fill="#E8E2D6" {...S} />
    {[0, 1, 2].map((i) => <rect key={i} x={120} y={-440 + i * 60} width={60} height={16} fill={C.red} />)}
    <g transform="translate(-60 -130)">
      <circle r={70} fill="#F5D33B" {...S} />
      {[0, 120, 240].map((a) => <path key={a} d="M0 0 L-24 -56 A60 60 0 0 1 24 -56 Z" fill={C.ink} transform={`rotate(${a})`} />)}
      <circle r={12} fill={C.ink} />
    </g>
  </G>
);

/** Fur pelt (sable) bundle icon. */
export const Fur: React.FC<{ x: number; y: number; k?: number; t?: number }> = ({ x, y, k = 1, t = 1 }) => (
  <G x={x} y={y} k={k} t={t}><path d="M-70 -20 Q-40 -50 0 -40 Q40 -50 70 -20 Q60 30 0 40 Q-60 30 -70 -20 Z" fill="#7A5230" {...S} /><path d="M70 -20 Q100 0 110 40" fill="none" {...S} strokeWidth={14} stroke="#5A3A20" /></G>
);
export const HoneyPot: React.FC<{ x: number; y: number; k?: number; t?: number }> = ({ x, y, k = 1, t = 1 }) => (
  <G x={x} y={y} k={k} t={t}><path d="M-50 -40 Q-70 40 -30 50 L30 50 Q70 40 50 -40 Z" fill={R.amber} {...S} /><rect x={-56} y={-56} width={112} height={22} rx={8} fill="#C9A15A" {...S} strokeWidth={4} /></G>
);
export const Chain: React.FC<{ x: number; y: number; k?: number; t?: number; broken?: number }> = ({ x, y, k = 1, t = 1, broken = 0 }) => (
  <G x={x} y={y} k={k} t={t}>
    {[-90, -30, 30, 90].map((dx, i) => (
      <ellipse key={dx} cx={dx + (i < 2 ? -1 : 1) * 40 * broken} cy={(i < 2 ? -1 : 1) * 20 * broken} rx={36} ry={20} fill="none" stroke="#6A6A6A" strokeWidth={12} transform={i % 2 ? `rotate(0)` : undefined} />
    ))}
  </G>
);

/** Flag on a pole: stripes top to bottom. */
export const Flag: React.FC<{ x: number; ground: number; k?: number; t?: number; stripes: string[]; f: number; h?: number }> = ({ x, ground, k = 1, t = 1, stripes, f, h = 320 }) => (
  <G x={x} y={ground} k={k} t={t}>
    <line x1={0} y1={0} x2={0} y2={-h} {...S} />
    {stripes.map((c, i) => (
      <path key={i} d={`M0 ${-h + i * (90 / stripes.length)} q60 ${-8 + 6 * Math.sin(f / 6)} 130 0 l0 ${90 / stripes.length} q-70 ${8 - 6 * Math.sin(f / 6)} -130 0 Z`} fill={c} stroke={C.ink} strokeWidth={2} />
    ))}
    <rect x={0} y={-h} width={130} height={90} fill="none" stroke={C.ink} strokeWidth={4} />
  </G>
);

/** Thin wheat field for the famine; `wilt` 0..1. */
export const Wheat: React.FC<{ x0: number; x1: number; ground: number; wilt: number }> = ({ x0, x1, ground, wilt }) => (
  <g>
    {Array.from({ length: Math.floor((x1 - x0) / 40) }, (_, i) => {
      const x = x0 + i * 40;
      const tip = mix(-120, -40, wilt);
      return <path key={i} d={`M${x} ${ground} Q${x + 10 * wilt} ${ground - 60} ${x + 40 * wilt} ${ground + tip}`} fill="none" stroke={mix(0, 1, wilt) > 0.5 ? "#9A8A5A" : "#C9A23A"} strokeWidth={6} strokeLinecap="round" />;
    })}
  </g>
);

/** Barbed wire fence line. */
export const Barbed: React.FC<{ x0: number; x1: number; ground: number; h?: number }> = ({ x0, x1, ground, h = 220 }) => (
  <g>
    {Array.from({ length: Math.floor((x1 - x0) / 220) + 1 }, (_, i) => <line key={i} x1={x0 + i * 220} y1={ground} x2={x0 + i * 220} y2={ground - h} {...S} strokeWidth={9} />)}
    {[0.3, 0.6, 0.9].map((u) => (
      <g key={u}>
        <line x1={x0} y1={ground - h * u} x2={x1} y2={ground - h * u} stroke={C.ink} strokeWidth={3} />
        {Array.from({ length: Math.floor((x1 - x0) / 40) }, (_, i) => <path key={i} d={`M${x0 + i * 40 + 20} ${ground - h * u - 8} l8 16 M${x0 + i * 40 + 28} ${ground - h * u - 8} l-8 16`} stroke={C.ink} strokeWidth={3} />)}
      </g>
    ))}
  </g>
);

/** Torn-paper speech bubble with hand lettering; `tail` -1 points down-left, 1 down-right. */
export const Say: React.FC<{ x: number; y: number; t: number; text: string; size?: number; tail?: number; color?: string }> = ({ x, y, t, text, size = 46, tail = -1, color = C.ink }) => {
  if (t <= 0) return null;
  const lines = text.split("\n");
  const w = Math.max(...lines.map((l) => l.length)) * size * 0.58 + 80;
  const h = lines.length * size * 1.15 + 50;
  const seed = text.length * 7 + Math.round(x);
  return (
    <g transform={`translate(${x} ${y}) rotate(${(rnd(seed) - 0.5) * 5}) scale(${t})`}>
      <g filter="url(#cut)">
        <path d={torn(-w / 2, -h / 2, w, h, seed, 5, 18)} fill="#FBF4E2" stroke="#2A1E14" strokeWidth={3} />
        <path d={`M${tail * w * 0.1} ${h / 2 - 8} L${tail * w * 0.3} ${h / 2 + 56} L${tail * w * 0.3} ${h / 2 - 8} Z`} fill="#FBF4E2" stroke="#2A1E14" strokeWidth={3} strokeLinejoin="round" />
      </g>
      <rect x={Math.min(tail * w * 0.1, tail * w * 0.3) + 3} y={h / 2 - 14} width={Math.abs(w * 0.2) - 6} height={12} fill="#FBF4E2" />
      {lines.map((l, i) => (
        <text key={i} x={0} y={-h / 2 + 22 + size * 0.95 + i * size * 1.15} textAnchor="middle" fontFamily="Kalam" fontSize={size * 1.05} fill={color === C.ink ? "#2A1E14" : color}>{l}</text>
      ))}
    </g>
  );
};

/** Staff (sceptre stick). Origin at the hand; angle in degrees. */
export const Staff: React.FC<{ x: number; y: number; rot: number; k?: number }> = ({ x, y, rot, k = 1 }) => (
  <G x={x} y={y} k={k} rot={rot}><line x1={0} y1={-60} x2={0} y2={220} stroke="#4A3220" strokeWidth={12} strokeLinecap="round" /><circle cx={0} cy={-66} r={14} fill={R.gold} {...S} strokeWidth={4} /></G>
);

/** Dog head + broom: the oprichnik's emblems. */
export const DogHead: React.FC<{ x: number; y: number; k?: number; t?: number; sniff?: number }> = ({ x, y, k = 1, t = 1, sniff = 0 }) => (
  <G x={x} y={y} k={k} t={t}>
    <path d={`M-50 -30 Q0 -70 50 -30 L90 ${-10 + 4 * Math.sin(sniff)} Q100 20 60 20 L-40 30 Q-70 10 -50 -30 Z`} fill="#3A3A3A" {...S} />
    <path d="M-40 -40 L-60 -90 L-14 -54 Z" fill="#3A3A3A" {...S} strokeWidth={4} />
    <circle cx={10} cy={-20} r={7} fill="#FFFFFF" /><circle cx={92} cy={-4 + 4 * Math.sin(sniff)} r={10} fill={C.ink} />
  </G>
);
export const Broom: React.FC<{ x: number; y: number; k?: number; rot?: number }> = ({ x, y, k = 1, rot = 0 }) => (
  <G x={x} y={y} k={k} rot={rot}>
    <line x1={0} y1={-200} x2={0} y2={40} stroke={R.wood} strokeWidth={12} strokeLinecap="round" />
    <path d="M-50 120 L-24 30 L24 30 L50 120 Z" fill="#D9B86A" {...S} strokeWidth={5} />
  </G>
);

/** Scissors, `open` 0..1. */
export const Scissors: React.FC<{ x: number; y: number; k?: number; open: number; rot?: number }> = ({ x, y, k = 1, open, rot = 0 }) => (
  <G x={x} y={y} k={k} rot={rot}>
    {[1, -1].map((sg) => (
      <g key={sg} transform={`rotate(${sg * 18 * open})`}>
        <path d={`M0 0 L140 ${sg * 8} L0 ${sg * 18} Z`} fill="#D9DDE1" {...S} strokeWidth={4} />
        <circle cx={-50} cy={sg * 22} r={22} fill="none" stroke={C.red} strokeWidth={10} />
      </g>
    ))}
  </G>
);

/** Bread loaf. */
export const Bread: React.FC<{ x: number; y: number; k?: number; t?: number }> = ({ x, y, k = 1, t = 1 }) => (
  <G x={x} y={y} k={k} t={t}><ellipse rx={70} ry={36} fill="#D9A55A" {...S} />{[-30, 0, 30].map((dx) => <path key={dx} d={`M${dx - 10} -20 L${dx + 10} 0`} stroke={C.ink} strokeWidth={4} />)}</G>
);

/** Heart. */
export const Heart: React.FC<{ x: number; y: number; k?: number; t?: number }> = ({ x, y, k = 1, t = 1 }) => (
  <G x={x} y={y} k={k} t={t}><path d="M0 40 C-80 -10 -50 -76 0 -38 C50 -76 80 -10 0 40 Z" fill={C.red} {...S} strokeWidth={4} /></G>
);

/** Clock face with hands turning `turns`. */
export const ClockFace: React.FC<{ x: number; y: number; k?: number; t?: number; turns: number; label?: string }> = ({ x, y, k = 1, t = 1, turns, label }) => (
  <G x={x} y={y} k={k} t={t}>
    <circle r={60} fill="#FFFFFF" {...S} />
    <line x1={0} y1={0} x2={Math.sin(turns * Math.PI * 2) * 44} y2={-Math.cos(turns * Math.PI * 2) * 44} {...S} strokeWidth={5} />
    <line x1={0} y1={0} x2={Math.sin((turns / 12) * Math.PI * 2) * 28} y2={-Math.cos((turns / 12) * Math.PI * 2) * 28} {...S} strokeWidth={7} />
    {label ? <text y={100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink}>{label}</text> : null}
  </G>
);
