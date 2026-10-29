import React from "react";
import { blendFace, FACES, type Face } from "../Hangry/Stickman";
import { walk } from "../Hangry/actions";
import { Fig } from "../Hangry2/kit";
import { C, R } from "./kit";

/**
 * Costumes for the stick-figure rig, in rig units: head centre (100, 58), r 32; shoulders y 108, hips 190, feet 262.
 * `hat` turns with the head, `back` sits behind the body. Keep them silhouettes: one shape says who it is.
 */

const S = { stroke: C.ink, strokeWidth: 5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const Beard: React.FC<{ color: string; long?: number; w?: number }> = ({ color, long = 1, w = 1 }) => (
  <path d={`M${100 - 26 * w} 70 Q${100 - 24 * w} ${96 + 20 * long} 100 ${100 + 40 * long} Q${100 + 24 * w} ${96 + 20 * long} ${100 + 26 * w} 70 Q100 ${80} ${100 - 26 * w} 70 Z`} fill={color} {...S} />
);
const Moustache: React.FC<{ color?: string; big?: number }> = ({ color = C.ink, big = 1 }) => (
  <path d={`M${100 - 16 * big} ${68 + 4 * big} Q100 ${58} ${100 + 16 * big} ${68 + 4 * big} Q100 ${66} ${100 - 16 * big} ${68 + 4 * big} Z`} fill={color} stroke={color} strokeWidth={3} strokeLinejoin="round" />
);
const Crown: React.FC<{ y?: number; k?: number; tilt?: number }> = ({ y = 30, k = 1, tilt = 0 }) => (
  <g transform={`rotate(${tilt} 100 ${y}) translate(100 ${y}) scale(${k}) translate(-100 -30)`}>
    <path d="M72 32 L70 4 L86 18 L100 -2 L114 18 L130 4 L128 32 Z" fill={R.gold} {...S} />
    <circle cx={100} cy={20} r={4} fill={C.red} />
  </g>
);

export const COSTUME = {
  plain: {},
  tribe: { hat: <path d="M70 34 Q100 4 130 34 Q100 26 70 34 Z" fill="#B88A5A" {...S} /> },
  viking: {
    hat: (
      <>
        <path d="M72 66 Q74 96 100 108 Q126 96 128 66 Q100 80 72 66 Z" fill="#C8762E" {...S} />
        <path d="M70 34 L52 22 Q44 -2 56 -10 Q56 12 74 24 Z M130 34 L148 22 Q156 -2 144 -10 Q144 12 126 24 Z" fill="#EDE3C8" {...S} />
        <path d="M66 44 A34 34 0 0 1 134 44 Z" fill={R.steel} {...S} />
        <rect x={96} y={42} width={8} height={22} fill={R.steel} {...S} strokeWidth={3} />
      </>
    ),
  },
  prince: { hat: (<><Beard color="#7A5230" long={0.6} /><Crown /></>) },
  monomakh: {
    hat: (
      <>
        <path d="M72 30 Q72 -6 100 -8 Q128 -6 128 30 Z" fill={R.gold} {...S} />
        <path d="M86 28 Q86 4 100 -6 M114 28 Q114 4 100 -6" fill="none" stroke={C.ink} strokeWidth={3} />
        <path d="M100 -8 L100 -30 M90 -22 L110 -22" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        <rect x={66} y={24} width={68} height={16} rx={8} fill={R.fur} {...S} />
      </>
    ),
  },
  khan: {
    hat: (
      <>
        <path d="M88 70 Q78 76 72 98 M112 70 Q122 76 128 98" fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        <path d="M64 36 Q100 -40 136 36 Z" fill={R.steel} {...S} />
        <path d="M100 -16 L100 -40" stroke={C.ink} strokeWidth={5} />
        <circle cx={100} cy={-42} r={6} fill={C.red} stroke={C.ink} strokeWidth={3} />
        <rect x={60} y={28} width={80} height={14} rx={7} fill={R.fur} {...S} />
      </>
    ),
  },
  mongol: {
    hat: (<><path d="M66 38 Q100 -24 134 38 Z" fill={R.steel} {...S} /><rect x={62} y={30} width={76} height={12} rx={6} fill={R.fur} {...S} /></>),
  },
  boyar: {
    hat: (<><Beard color="#5A3E2B" long={1.2} /><path d="M72 32 L76 -34 L124 -34 L128 32 Z" fill={R.fur} {...S} /></>),
  },
  ivan: {
    hat: (
      <>
        <path d="M76 70 Q86 92 100 144 Q114 92 124 70 Q100 84 76 70 Z" fill="#3B2A1E" {...S} />
        <path d="M72 30 Q72 -6 100 -8 Q128 -6 128 30 Z" fill={R.gold} {...S} />
        <path d="M100 -8 L100 -30 M90 -22 L110 -22" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        <rect x={66} y={24} width={68} height={16} rx={8} fill={R.fur} {...S} />
      </>
    ),
    back: <path d="M100 100 L40 250 L160 250 Z" fill="#7B2C26" {...S} />,
  },
  cossack: {
    hat: (<><path d="M80 66 Q72 72 70 90 M120 66 Q128 72 130 90" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" /><Moustache big={1.2} /><path d="M70 32 L74 -14 L126 -14 L130 32 Z" fill="#2E2A26" {...S} /><path d="M76 -14 L124 -14 L118 -2 L82 -2 Z" fill={C.red} {...S} strokeWidth={3} /></>),
  },
  merchant: { hat: (<><Beard color="#8A6A3A" long={0.9} /><path d="M70 34 Q70 0 100 -2 Q130 0 130 34 Z" fill={R.fur} {...S} /></>) },
  dmitry: {
    hat: (
      <>
        <Crown tilt={-12} />
        <circle cx={88} cy={56} r={10} fill="none" stroke={C.ink} strokeWidth={4} />
        <circle cx={112} cy={56} r={10} fill="none" stroke={C.ink} strokeWidth={4} />
        <path d="M98 56 L102 56 M100 58 Q92 72 100 74" fill="none" stroke={C.ink} strokeWidth={4} />
        <Moustache big={1.1} />
      </>
    ),
  },
  boyarShaved: { hat: <path d="M72 32 L76 -34 L124 -34 L128 32 Z" fill={R.fur} {...S} /> },
  pugachev: {
    hat: (
      <>
        <path d="M80 66 Q72 72 70 90 M120 66 Q128 72 130 90" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        <circle cx={88} cy={56} r={10} fill="none" stroke={C.ink} strokeWidth={4} />
        <circle cx={112} cy={56} r={10} fill="none" stroke={C.ink} strokeWidth={4} />
        <Moustache big={1.2} />
        <Crown tilt={16} />
      </>
    ),
  },
  butcher: { hat: <Beard color="#8A6A3A" long={0.7} />, back: <rect x={78} y={110} width={44} height={100} rx={6} fill="#FFFFFF" {...S} /> },
  knight: { hat: (<><Beard color="#6A4A2A" long={0.5} /><path d="M66 46 Q66 6 100 2 Q134 6 134 46 Z" fill={R.steel} {...S} /><path d="M100 2 L100 -16" stroke={C.ink} strokeWidth={5} /></>) },
  michael: { hat: <Crown y={48} k={1.5} /> },
  peter: {
    hat: (
      <>
        <path d="M88 66 Q94 62 100 65 Q106 62 112 66" fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        <path d="M66 34 Q66 20 76 14 Q72 30 70 50 Z M134 34 Q134 20 124 14 Q128 30 130 50 Z" fill="#3B2A1E" {...S} />
        <path d="M56 32 Q100 -10 144 32 Q100 18 56 32 Z" fill="#1F1F1F" {...S} />
      </>
    ),
    back: <path d="M100 104 L64 232 L136 232 Z" fill="#2F5B3A" {...S} />,
  },
  peterDisguise: {
    hat: (
      <>
        <circle cx={88} cy={56} r={10} fill="none" stroke={C.ink} strokeWidth={4} />
        <circle cx={112} cy={56} r={10} fill="none" stroke={C.ink} strokeWidth={4} />
        <Moustache big={1.2} />
        <path d="M66 36 Q100 6 134 36 L140 40 Q100 30 66 40 Z" fill="#6B5B4B" {...S} />
      </>
    ),
  },
  swede: { hat: (<path d="M56 32 Q100 -10 144 32 Q100 18 56 32 Z" fill={R.blue} {...S} />), back: <path d="M100 104 L64 232 L136 232 Z" fill={R.blue} {...S} /> },
  peter3: {
    hat: (<><Crown tilt={14} y={26} /></>),
    back: <path d="M100 104 L64 232 L136 232 Z" fill="#2F4F8F" {...S} />,
  },
  catherine: {
    hat: (
      <>
        <path d="M64 50 Q60 10 100 8 Q140 10 136 50 Q132 30 100 28 Q68 30 64 50 Z" fill="#E9E4DA" {...S} />
        <circle cx={100} cy={4} r={14} fill="#E9E4DA" {...S} />
        <Crown y={2} k={0.8} />
      </>
    ),
    back: <path d="M100 104 Q70 150 30 254 L170 254 Q130 150 100 104 Z" fill="#6C8CC7" {...S} />,
  },
  guard: { hat: (<><Moustache /><path d="M70 34 L74 -10 Q100 -24 126 -10 L130 34 Z" fill="#2E2A26" {...S} /></>), back: <rect x={82} y={108} width={36} height={86} fill="#2F5B3A" {...S} /> },
  napoleon: {
    hat: (<><path d="M44 30 Q100 -34 156 30 Q100 12 44 30 Z" fill="#1F1F1F" {...S} /><circle cx={126} cy={14} r={7} fill={C.red} stroke="#FFFFFF" strokeWidth={4} /></>),
    back: <path d="M100 104 L66 230 L134 230 Z" fill="#2F4F8F" {...S} />,
  },
  frenchSoldier: { hat: <path d="M72 34 L76 -6 L124 -6 L128 34 Z" fill="#1F1F1F" {...S} />, back: <rect x={82} y={108} width={36} height={86} fill="#2F4F8F" {...S} /> },
  landlord: { hat: (<><Moustache /><rect x={72} y={-20} width={56} height={50} fill="#1F1F1F" {...S} /><rect x={60} y={26} width={80} height={10} fill="#1F1F1F" {...S} /></>) },
  serf: { hat: (<><Beard color="#9A7A4A" long={0.6} /><path d="M70 34 Q100 10 130 34 Q100 28 70 34 Z" fill="#B49A70" {...S} /></>) },
  alexander2: {
    hat: (<><path d="M70 50 Q66 80 84 84 L86 64 Z M130 50 Q134 80 116 84 L114 64 Z" fill="#7A5A3A" {...S} /><Moustache color="#7A5A3A" big={1.2} /><path d="M70 34 Q100 18 130 34" fill="none" stroke={C.ink} strokeWidth={5} /></>),
    back: <rect x={80} y={108} width={40} height={86} fill="#E9E4DA" {...S} />,
  },
  american: { hat: (<><rect x={74} y={-24} width={52} height={54} fill="#1F1F1F" {...S} /><rect x={62} y={26} width={76} height={10} fill="#1F1F1F" {...S} /><rect x={74} y={16} width={52} height={8} fill={C.red} /></>) },
  uncleSam: { hat: (<><rect x={74} y={-30} width={52} height={60} fill="#FFFFFF" {...S} /><rect x={74} y={-30} width={52} height={14} fill={R.blue} /><rect x={62} y={26} width={76} height={10} fill={R.blue} {...S} /><Beard color="#FFFFFF" long={0.5} w={0.6} /></>) },
  nicholas: {
    hat: (<><path d="M74 66 Q80 96 100 98 Q120 96 126 66 Q100 76 74 66 Z" fill="#7A5A3A" {...S} /><Moustache color="#7A5A3A" /><Crown /></>),
    back: <rect x={80} y={108} width={40} height={86} fill="#E9E4DA" {...S} />,
  },
  admiral: { hat: (<><Beard color="#9A9A9A" long={0.5} /><path d="M66 34 Q100 4 134 34 Z" fill="#1F2A44" {...S} /><rect x={64} y={30} width={72} height={8} fill="#1F1F1F" /></>), back: <rect x={80} y={108} width={40} height={86} fill="#1F2A44" {...S} /> },
  rasputin: {
    hat: (
      <>
        <path d="M68 40 Q60 90 70 120 L80 118 Q74 80 78 46 Z M132 40 Q140 90 130 120 L120 118 Q126 80 122 46 Z" fill="#2B1F17" {...S} />
        <path d="M74 66 Q82 100 100 132 Q118 100 126 66 Q100 80 74 66 Z" fill="#2B1F17" {...S} />
        <path d="M68 40 Q100 10 132 40 Q100 30 68 40 Z" fill="#2B1F17" {...S} />
      </>
    ),
    back: <path d="M100 100 L52 252 L148 252 Z" fill="#2B2620" {...S} />,
  },
  worker: { hat: <path d="M66 34 Q100 8 134 34 L142 40 Q100 30 66 38 Z" fill="#5B5B5B" {...S} /> },
  lenin: {
    hat: (
      <>
        <path d="M88 76 Q100 104 112 76 Q100 82 88 76 Z" fill="#7A4A2A" {...S} strokeWidth={3} />
        <Moustache color="#7A4A2A" big={0.9} />
        <path d="M66 36 Q100 4 134 36 L144 42 Q100 32 66 40 Z" fill="#3A3A3A" {...S} />
      </>
    ),
  },
  red: {
    hat: (<><path d="M66 46 Q66 4 100 -18 Q134 4 134 46 Z" fill="#6B6B4B" {...S} /><path d="M100 4 L104 16 L116 16 L106 23 L110 35 L100 28 L90 35 L94 23 L84 16 L96 16 Z" fill={C.red} /></>),
  },
  white: { hat: (<><Moustache /><path d="M66 34 Q100 14 134 34 L134 40 L66 40 Z" fill="#FFFFFF" {...S} /><rect x={62} y={38} width={76} height={8} fill="#1F1F1F" /></>) },
  stalin: {
    hat: (<><path d="M80 68 Q100 56 120 68 Q100 76 80 68 Z" fill="#2B1F17" stroke="#2B1F17" strokeWidth={6} strokeLinejoin="round" /><path d="M66 40 Q66 18 100 14 Q134 18 134 40 Q120 24 100 26 Q80 24 66 40 Z" fill="#2B1F17" {...S} /></>),
    back: <rect x={80} y={108} width={40} height={86} fill="#8A8F6A" {...S} />,
  },
  soldier: { hat: (<><path d="M64 44 Q66 4 100 2 Q134 4 136 44 Z" fill="#5E6B47" {...S} /><path d="M100 14 L103 22 L111 22 L105 27 L107 35 L100 30 L93 35 L95 27 L89 22 L97 22 Z" fill={C.red} /></>) },
  german: { hat: (<path d="M62 48 Q62 2 100 0 Q138 2 138 48 L144 54 L56 54 Z" fill="#6E7378" {...S} />) },
  gagarin: {
    hat: (
      <>
        <circle cx={100} cy={56} r={48} fill="#9CC9E8" opacity={0.18} />
        <circle cx={100} cy={56} r={48} fill="none" stroke="#FFFFFF" strokeWidth={12} />
        <circle cx={100} cy={56} r={54} fill="none" stroke={C.ink} strokeWidth={5} />
        <circle cx={100} cy={56} r={42} fill="none" stroke={C.ink} strokeWidth={3} />
        <text x={100} y={8} textAnchor="middle" fontFamily="Arial" fontWeight={900} fontSize={18} fill={C.red}>СССР</text>
      </>
    ),
    back: <rect x={74} y={104} width={52} height={100} rx={16} fill="#E86A3A" {...S} />,
  },
  ushanka: { hat: (<><path d="M64 44 Q64 0 100 -2 Q136 0 136 44 Z" fill={R.fur} {...S} /><rect x={58} y={40} width={16} height={36} rx={6} fill={R.fur} {...S} /><rect x={126} y={40} width={16} height={36} rx={6} fill={R.fur} {...S} /><path d="M100 10 L103 18 L111 18 L105 23 L107 31 L100 26 L93 31 L95 23 L89 18 L97 18 Z" fill={C.red} /></>) },
  brezhnev: { hat: (<><path d="M78 44 Q90 36 98 44 M102 44 Q110 36 122 44" fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="round" /><path d="M66 40 Q66 18 100 16 Q134 18 134 40 Q120 28 100 30 Q80 28 66 40 Z" fill="#3A3A3A" {...S} /></>), back: <rect x={80} y={108} width={40} height={86} fill="#3A3F4A" {...S} /> },
  gorby: {
    hat: (<path d="M78 32 Q70 22 82 18 Q92 12 98 22 Q104 30 94 36 Q84 40 78 32 Z" fill="#B5503F" opacity={0.85} />),
    back: <rect x={80} y={108} width={40} height={86} fill="#3A3F4A" {...S} />,
  },
  yeltsin: { hat: (<path d="M66 40 Q62 12 100 8 Q138 12 134 40 Q120 22 100 24 Q80 22 66 40 Z" fill="#E8E8E8" {...S} />), back: <rect x={80} y={108} width={40} height={86} fill="#3A3F4A" {...S} /> },
  suit: { back: <rect x={80} y={108} width={40} height={86} fill="#3A3F4A" {...S} /> },
  oligarch: { hat: (<><rect x={74} y={-20} width={52} height={50} fill="#1F1F1F" {...S} /><rect x={62} y={26} width={76} height={10} fill="#1F1F1F" {...S} /></>), back: <rect x={80} y={108} width={40} height={86} fill="#1F1F1F" {...S} /> },
  priest: { hat: (<><Beard color="#3A3A3A" long={1.1} /><rect x={72} y={-10} width={56} height={42} fill="#1F1F1F" {...S} /></>), back: <path d="M100 100 L56 254 L144 254 Z" fill="#1F1F1F" {...S} /> },
  oprichnik: {
    hat: (<><Beard color="#2B1F17" long={0.8} /><path d="M66 40 Q66 6 100 4 Q134 6 134 40 Z" fill="#1F1F1F" {...S} /></>),
    back: <path d="M100 100 L46 254 L154 254 Z" fill="#1F1F1F" {...S} />,
  },
} satisfies Record<string, { hat?: React.ReactNode; back?: React.ReactNode }>;
export type Who = keyof typeof COSTUME;

export type PersonProps = {
  who: Who; x: number; ground: number; f: number; s?: number; face?: Face; flip?: boolean;
  armL?: number; armR?: number; legL?: number; legR?: number; lean?: number; headTilt?: number; walking?: boolean; speed?: number;
  op?: number; ko?: boolean;
};

/** A costumed figure standing on `ground`. Walking overrides the limbs with the walk cycle. */
export const Person: React.FC<PersonProps> = ({ who, x, ground, f, s = 1.4, face = FACES.neutral, flip, walking, speed = 0.18, op = 1, ko, ...pose }) => {
  const c = COSTUME[who] as { hat?: React.ReactNode; back?: React.ReactNode };
  if (op <= 0) return null;
  return (
    <g opacity={op}>
      <Fig x={x} ground={ground} scale={s} frame={f} bob={walking ? 0 : 1.2} flip={flip} hat={c.hat} back={c.back}
        face={ko ? { ...FACES.sad, eyeOpen: 0.05, mouthOpen: 0.3 } : face} {...(walking ? walk(f, speed, 1) : pose)} />
    </g>
  );
};

export { FACES, blendFace };
