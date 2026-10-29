import React from "react";
import { FACES, type Face } from "../Hangry/Stickman";
import { Brad, INK, rnd } from "./paper";

export { FACES, type Face };
export { blendFace } from "../Hangry/Stickman";

/**
 * Cut-paper puppet. Feet at (x, ground); about 340 units tall at k = 1. Arms and legs are separate pieces pinned with
 * brass fasteners, so poses are joint angles (same convention as the stick figures: armL + raises the viewer-left arm
 * outwards, armR - raises the viewer-right arm). Faces use the stick figures' Face presets, so expressions blend the
 * same way; `talk` 0..1 opens the mouth for lip flaps.
 */

export type Garment = "tunic" | "mail" | "robe" | "deel" | "coat" | "suit" | "dress";
export type Hat = "none" | "fur" | "helm" | "crown" | "monomakh" | "mongol" | "cap" | "ushanka" | "tricorn" | "bicorne" | "papakha" | "peaked" | "tall";
export type Hair = "none" | "short" | "long" | "bald" | "bun" | "swept";
export type Beard = "none" | "full" | "long" | "pointed" | "goatee" | "short";
export type Tache = "none" | "thin" | "thick" | "walrus";

export type Look = {
  skin: string; garment: Garment; color: string; trim?: string; belt?: string;
  hat?: Hat; hatColor?: string; hair?: Hair; hairColor?: string; beard?: Beard; beardColor?: string; tache?: Tache;
  legs?: string; mark?: boolean; /** Gorbachev's birthmark */
};

export type PuppetProps = {
  look: Look; x: number; ground: number; k?: number; f: number; face?: Face; flip?: boolean;
  armL?: number; armR?: number; legL?: number; legR?: number; lean?: number; headTilt?: number;
  walking?: boolean; talk?: number; holdL?: React.ReactNode; holdR?: React.ReactNode; op?: number; seed?: number;
};

const SH = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Blink every ~3.3 s, phase-shifted per puppet. */
const blink = (f: number) => {
  const p = f % 100;
  return p < 4 ? [1, 0.25, 0.1, 0.5][p]! : 1;
};

const garmentPath = (g: Garment) => {
  switch (g) {
    case "robe": case "deel": case "dress":
      return g === "dress" ? "M-40 -176 Q0 -190 40 -176 Q70 -90 104 -6 Q0 10 -104 -6 Q-70 -90 -40 -176 Z" : "M-50 -174 Q0 -190 50 -174 L76 -6 Q0 6 -76 -6 Z";
    case "coat": case "suit":
      return "M-48 -174 Q0 -188 48 -174 L58 -40 Q0 -30 -58 -40 Z";
    default:
      return "M-48 -172 Q0 -188 48 -172 L60 -38 Q0 -26 -60 -38 Z";
  }
};

const HatShape: React.FC<{ h: Hat; c: string }> = ({ h, c }) => {
  switch (h) {
    case "fur":
      return <><path d="M-42 -282 Q-40 -334 0 -336 Q40 -334 42 -282 Z" fill={c} {...SH} /><path d="M-48 -294 Q0 -304 48 -294 L48 -276 Q0 -286 -48 -276 Z" fill="#7A5A3A" {...SH} /></>;
    case "helm":
      return <><path d="M-42 -276 Q-42 -338 0 -342 Q42 -338 42 -276 Z" fill="#8E969E" {...SH} /><path d="M0 -342 L0 -276 M-40 -300 L40 -300" stroke={INK} strokeWidth={2} opacity={0.6} /><rect x={-5} y={-282} width={10} height={36} fill="#8E969E" {...SH} strokeWidth={2} /></>;
    case "crown":
      return <path d="M-34 -294 L-36 -336 L-18 -314 L0 -344 L18 -314 L36 -336 L34 -294 Z" fill="#E3B341" {...SH} />;
    case "monomakh":
      return (
        <>
          <path d="M-38 -292 Q-38 -352 0 -356 Q38 -352 38 -292 Z" fill="#E3B341" {...SH} />
          {[-22, 0, 22].map((dx) => <path key={dx} d={`M${dx} -292 Q${dx * 0.6} -330 0 -354`} fill="none" stroke="#8A6A1A" strokeWidth={2} />)}
          <circle cx={-16} cy={-322} r={5} fill="#B8352A" /><circle cx={16} cy={-322} r={5} fill="#2F7A4A" />
          <path d="M0 -356 L0 -380 M-10 -370 L10 -370" stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <rect x={-46} y={-302} width={92} height={22} rx={10} fill={c} {...SH} />
        </>
      );
    case "mongol":
      return <><path d="M-44 -280 Q0 -380 44 -280 Z" fill="#9AA3AB" {...SH} /><path d="M0 -358 L0 -384" stroke={INK} strokeWidth={4} /><circle cx={0} cy={-388} r={7} fill="#B8352A" {...SH} strokeWidth={2} /><rect x={-50} y={-292} width={100} height={20} rx={9} fill={c} {...SH} /></>;
    case "cap":
      return <path d="M-42 -282 Q-36 -320 4 -318 Q44 -316 46 -290 L66 -284 Q40 -276 -42 -280 Z" fill={c} {...SH} />;
    case "ushanka":
      return <><path d="M-44 -276 Q-44 -336 0 -338 Q44 -336 44 -276 Z" fill={c} {...SH} /><rect x={-56} y={-282} width={18} height={50} rx={8} fill={c} {...SH} /><rect x={38} y={-282} width={18} height={50} rx={8} fill={c} {...SH} /><path d="M0 -320 l4 9 l10 0 l-8 6 l3 10 l-9 -6 l-9 6 l3 -10 l-8 -6 l10 0 Z" fill="#C8281E" /></>;
    case "tricorn":
      return <path d="M-64 -292 Q0 -350 64 -292 Q0 -308 -64 -292 Z" fill={c} {...SH} />;
    case "bicorne":
      return <><path d="M-78 -290 Q0 -372 78 -290 Q0 -312 -78 -290 Z" fill={c} {...SH} /><circle cx={38} cy={-312} r={9} fill="#C8281E" stroke="#FFFFFF" strokeWidth={4} /></>;
    case "papakha":
      return <><path d="M-40 -286 L-36 -340 L36 -340 L40 -286 Z" fill={c} {...SH} /><path d="M-34 -340 L34 -340 L28 -326 L-28 -326 Z" fill="#B8352A" {...SH} strokeWidth={2} /></>;
    case "peaked":
      return <><path d="M-42 -290 Q-40 -326 0 -330 Q40 -326 42 -290 Z" fill={c} {...SH} /><path d="M-44 -290 Q0 -280 50 -290 L60 -280 Q0 -270 -44 -280 Z" fill={INK} /><circle cx={0} cy={-306} r={6} fill="#C8281E" /></>;
    case "tall":
      return <path d="M-38 -286 L-34 -370 L34 -370 L38 -286 Z" fill={c} {...SH} />;
    default:
      return null;
  }
};

const HairShape: React.FC<{ h: Hair; c: string }> = ({ h, c }) => {
  switch (h) {
    case "short": return <path d="M-42 -258 Q-46 -314 0 -312 Q46 -314 42 -258 Q34 -292 0 -292 Q-34 -292 -42 -258 Z" fill={c} {...SH} />;
    case "long": return <path d="M-44 -200 Q-50 -316 0 -314 Q50 -316 44 -200 L32 -204 Q34 -286 0 -290 Q-34 -286 -32 -204 Z" fill={c} {...SH} />;
    case "swept": return <path d="M-42 -268 Q-40 -318 6 -314 Q46 -310 42 -268 Q20 -300 -42 -268 Z" fill={c} {...SH} />;
    case "bun": return <><path d="M-44 -246 Q-50 -316 0 -314 Q50 -316 44 -246 Q34 -296 0 -296 Q-34 -296 -44 -246 Z" fill={c} {...SH} /><circle cx={0} cy={-322} r={20} fill={c} {...SH} /></>;
    case "bald": return <path d="M-42 -252 Q-46 -270 -36 -276 M42 -252 Q46 -270 36 -276" fill="none" stroke={c} strokeWidth={8} strokeLinecap="round" />;
    default: return null;
  }
};

const BeardShape: React.FC<{ b: Beard; c: string }> = ({ b, c }) => {
  switch (b) {
    case "full": return <path d="M-38 -250 Q-34 -194 0 -184 Q34 -194 38 -250 Q22 -226 0 -226 Q-22 -226 -38 -250 Z" fill={c} {...SH} />;
    case "long": return <path d="M-38 -250 Q-36 -170 0 -140 Q36 -170 38 -250 Q22 -226 0 -226 Q-22 -226 -38 -250 Z" fill={c} {...SH} />;
    case "pointed": return <path d="M-36 -248 Q-28 -200 0 -128 Q28 -200 36 -248 Q22 -226 0 -226 Q-22 -226 -36 -248 Z" fill={c} {...SH} />;
    case "goatee": return <path d="M-12 -222 Q0 -186 12 -222 Q0 -216 -12 -222 Z" fill={c} {...SH} strokeWidth={2} />;
    case "short": return <path d="M-38 -250 Q-30 -206 0 -202 Q30 -206 38 -250 Q22 -228 0 -228 Q-22 -228 -38 -250 Z" fill={c} {...SH} />;
    default: return null;
  }
};

const TacheShape: React.FC<{ t: Tache; c: string }> = ({ t, c }) => {
  switch (t) {
    case "thin": return <path d="M-16 -236 Q0 -244 16 -236 Q0 -240 -16 -236 Z" fill={c} stroke={c} strokeWidth={3} strokeLinejoin="round" />;
    case "thick": return <path d="M-22 -232 Q0 -250 22 -232 Q0 -238 -22 -232 Z" fill={c} stroke={c} strokeWidth={6} strokeLinejoin="round" />;
    case "walrus": return <path d="M-26 -222 Q-20 -250 0 -244 Q20 -250 26 -222 Q0 -236 -26 -222 Z" fill={c} stroke={INK} strokeWidth={2} />;
    default: return null;
  }
};

const FaceMarks: React.FC<{ fc: Face; f: number; talk: number }> = ({ fc, f, talk }) => {
  const open = fc.eyeOpen * (fc.eyeSmile > 0.5 ? 1 : blink(f));
  const px = fc.lookX * 4, py = fc.lookY * 3;
  const eye = (cx: number) =>
    fc.eyeSmile > 0.5 ? (
      <path d={`M${cx - 9} -258 Q${cx} -270 ${cx + 9} -258`} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
    ) : open < 0.18 ? (
      <line x1={cx - 8} y1={-262} x2={cx + 8} y2={-262} stroke={INK} strokeWidth={4} strokeLinecap="round" />
    ) : (
      <>
        <ellipse cx={cx} cy={-262} rx={9.5} ry={8 * Math.min(open, 1.5)} fill="#FFFFFF" stroke={INK} strokeWidth={2.2} />
        <circle cx={cx + px} cy={-262 + py} r={4.2} fill={INK} />
      </>
    );
  const by = -282 + (fc.browY - 36) * 0.9;
  const brow = (cx: number, side: 1 | -1) => (
    <line x1={cx - 10} y1={by - (side === -1 ? fc.browAsym : 0)} x2={cx + 10} y2={by - (side === -1 ? fc.browAsym : 0)} stroke={INK} strokeWidth={5} strokeLinecap="round"
      transform={`rotate(${side * fc.browTilt} ${cx} ${by})`} />
  );
  const M = -234;
  const o = Math.min(1.2, fc.mouthOpen + talk);
  const yl = M - fc.mouthSkew * 3, yr = M + fc.mouthSkew * 3;
  const mouth = o > 0.06 ? (
    <path d={`M-14 ${yl} Q0 ${M + fc.mouthCurve * 0.3 - o * 3} 14 ${yr} Q0 ${M + fc.mouthCurve * 0.6 + o * 18} -14 ${yl} Z`} fill="#5A1E14" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
  ) : (
    <path d={`M-14 ${yl} Q0 ${M + fc.mouthCurve} 14 ${yr}`} fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
  );
  return (
    <>
      <ellipse cx={-24} cy={-242} rx={8} ry={5} fill="#E08A7A" opacity={0.45} />
      <ellipse cx={24} cy={-242} rx={8} ry={5} fill="#E08A7A" opacity={0.45} />
      {eye(-15)}{eye(15)}{brow(-15, 1)}{brow(15, -1)}
      <path d="M2 -258 Q-6 -246 3 -243" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      {mouth}
    </>
  );
};

export const Puppet: React.FC<PuppetProps> = ({
  look, x, ground, k = 1, f, face = FACES.neutral, flip, armL = 12, armR = -12, legL = 4, legR = -4, lean = 0, headTilt = 0,
  walking, talk = 0, holdL, holdR, op = 1, seed = 1,
}) => {
  if (op <= 0) return null;
  const ph = f * 0.2 + seed;
  const swing = walking ? Math.sin(ph) * 24 : 0;
  const hop = walking ? Math.abs(Math.sin(ph)) * 9 : 0;
  const breathe = walking ? 0 : Math.sin(f / 16 + seed) * 1.6;
  const aL = walking ? 10 - swing * 0.6 : armL, aR = walking ? -10 + swing * 0.6 : armR;
  const lL = walking ? swing : legL, lR = walking ? -swing : legR;
  const long = look.garment === "robe" || look.garment === "deel" || look.garment === "dress";
  const sleeve = look.garment === "mail" ? "#9AA3AB" : look.color;
  const arm = (side: 1 | -1, ang: number, hold?: React.ReactNode) => (
    <g transform={`rotate(${ang} ${side * 46} -158)`}>
      <g filter="url(#cutSoft)">
        <path d={`M${side * 46 - 16} -166 Q${side * 46} -178 ${side * 46 + 16} -166 L${side * 46 + 14} -62 Q${side * 46} -48 ${side * 46 - 14} -62 Z`} fill={sleeve} {...SH} />
        {look.trim ? <path d={`M${side * 46 - 14} -76 L${side * 46 + 14} -76 L${side * 46 + 14} -64 L${side * 46 - 14} -64 Z`} fill={look.trim} /> : null}
        <circle cx={side * 46} cy={-52} r={15} fill={look.skin} {...SH} />
      </g>
      {hold ? <g transform={`translate(${side * 46} -52)`}>{hold}</g> : null}
      <Brad x={side * 46} y={-156} r={6} />
    </g>
  );
  const leg = (side: 1 | -1, ang: number) => (
    <g transform={`rotate(${ang} ${side * 22} -46)`} filter="url(#cutSoft)">
      <path d={`M${side * 22 - 12} -50 L${side * 22 + 12} -50 L${side * 22 + 11} -6 L${side * 22 - 11} -6 Z`} fill={look.legs ?? "#4A3A2C"} {...SH} strokeWidth={2.5} />
      <path d={`M${side * 22 - 14 + (side > 0 ? 0 : -8)} 0 L${side * 22 + 14 + (side > 0 ? 8 : 0)} 0 L${side * 22 + 12} -10 L${side * 22 - 12} -10 Z`} fill="#2E241A" />
    </g>
  );
  const g = garmentPath(look.garment);
  return (
    <g transform={`translate(${x} ${ground - hop}) scale(${flip ? -k : k} ${k})`} opacity={op}>
      <g transform={`rotate(${lean} 0 -46)`}>
        {leg(-1, lL)}{leg(1, lR)}
        {arm(-1, aL, holdL)}
        <g transform={`translate(0 ${breathe * 0.4})`} filter="url(#cut)">
          <path d={g} fill={look.garment === "mail" ? "#9AA3AB" : look.color} {...SH} />
          {look.garment === "mail" ? <path d={g} fill="url(#mail)" /> : null}
          {look.trim && !long ? <path d="M-58 -52 Q0 -40 58 -52 L60 -38 Q0 -26 -60 -38 Z" fill={look.trim} /> : null}
          {look.trim && long ? <path d="M-8 -180 L8 -180 L10 -4 L-10 -4 Z" fill={look.trim} /> : null}
          {look.garment === "deel" ? <path d="M-30 -178 Q10 -150 40 -120" fill="none" stroke={look.trim ?? INK} strokeWidth={8} /> : null}
          {look.garment === "suit" || look.garment === "coat" ? (
            <><path d="M-18 -180 L0 -130 L18 -180" fill="none" stroke={INK} strokeWidth={3} />{[-110, -86, -62].map((y) => <circle key={y} cx={0} cy={y} r={3.5} fill={look.trim ?? INK} />)}</>
          ) : null}
          {look.belt ? <><rect x={-54} y={-112} width={108} height={14} fill={look.belt} {...SH} strokeWidth={2} /><rect x={-8} y={-114} width={16} height={18} fill="#C9A23A" {...SH} strokeWidth={2} /></> : null}
          {Array.from({ length: 4 }, (_, i) => <line key={i} x1={-34 + i * 22} y1={-168 + (i % 2) * 6} x2={-38 + i * 24} y2={-124} stroke={INK} strokeWidth={1} opacity={0.15} />)}
        </g>
        {arm(1, aR, holdR)}
        <g transform={`rotate(${headTilt} 0 -196) translate(0 ${breathe})`} filter="url(#cut)">
          {look.hair === "long" ? <HairShape h="long" c={look.hairColor ?? "#5A3A22"} /> : null}
          <path d="M-40 -252 Q-42 -306 0 -310 Q42 -306 40 -252 Q38 -204 0 -200 Q-38 -204 -40 -252 Z" fill={look.skin} {...SH} />
          {look.mark ? <path d="M-30 -292 Q-34 -304 -20 -306 Q-6 -310 -8 -298 Q-10 -286 -24 -288 Z" fill="#B5503F" opacity={0.8} /> : null}
          <BeardShape b={look.beard ?? "none"} c={look.beardColor ?? look.hairColor ?? "#5A3A22"} />
          <FaceMarks fc={face} f={f + Math.floor(rnd(seed) * 60)} talk={talk} />
          <TacheShape t={look.tache ?? "none"} c={look.beardColor ?? look.hairColor ?? INK} />
          {look.hair && look.hair !== "long" ? <HairShape h={look.hair} c={look.hairColor ?? "#5A3A22"} /> : null}
          <HatShape h={look.hat ?? "none"} c={look.hatColor ?? "#6B4A2B"} />
        </g>
      </g>
    </g>
  );
};

/** Lip flap: 0..1 mouth opening while `f` is inside one of the spoken [start, end] word spans. */
export const flap = (f: number, words: [number, number][]) => {
  const on = words.some(([a, b]) => f >= a && f < b);
  return on ? 0.25 + 0.55 * Math.abs(Math.sin(f / 2.2)) : 0;
};
