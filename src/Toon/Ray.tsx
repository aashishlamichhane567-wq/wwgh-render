import React from "react";

/**
 * Ray, illustrated (not a stick figure). Flat vector, cel-shaded, rigged in code:
 * two-bone IK arms with elbows, head that turns in 2.5D (features slide, hair counter-slides),
 * eyes with lids + pupils (look-at, blinks), brows and mouth driven by numbers so expressions blend.
 * Origin = hip centre; y up is negative. Light comes from the upper right (the lamp).
 */

/** Outline colour is switchable so the same rig can render as flat cartoon (dark ink) or clay (soft seams). */
const INK = { v: "#141826" };
/** Clay mode: each body part gets the per-object "inflate" filter (defined in Toon/Clay ClayDefs). */
export const CLAYR = { on: false };
const inflate = () => (CLAYR.on ? "url(#inflate)" : undefined);
export const setInk = (c?: string) => {
  INK.v = c ?? "#141826";
};

export const P = {
  get ink() {
    return INK.v;
  },
  skin: "#F2B48F",
  skinShade: "#D88E6E",
  hair: "#231A22",
  hood: "#1E9C93",
  hoodShade: "#14716C",
  hoodLight: "#4CC9BC",
  white: "#FFFFFF",
  rim: "#FFC27A",
};

export type Pose = {
  lean?: number; // deg, whole upper body about the hip
  breathe?: number; // 0..1 phase amplitude already applied by caller
  headTilt?: number; // deg
  turn?: number; // -1..1, 2.5D head turn (positive = towards screen right)
  nod?: number; // px head drop
  lookX?: number; // -1..1 pupils
  lookY?: number;
  lid?: number; // 0 open .. 1 closed (upper lid)
  brow?: number; // -1 angry .. 0 neutral .. 1 worried
  browLift?: number; // px, surprise
  mouth?: number; // -1 frown .. 0 flat .. 1 smile
  open?: number; // 0..1 mouth open
  handL?: [number, number]; // IK targets in hip space
  handR?: [number, number];
  grip?: number; // 0..1 right hand squash
  legs?: boolean; // draw legs (off for counter-height shots)
  footL?: [number, number]; // IK targets in hip space (y down)
  footR?: [number, number];
  kneeL?: number; // bend sign for each knee (+1/-1)
  kneeR?: number;
  shoeL?: "shoe" | "sock";
  shoeR?: "shoe" | "sock";
  back?: boolean; // seen from behind: no face, hair covers the head
};

const THIGH = 122;
const SHIN = 118;


/** Two-bone IK by the law of cosines. bend = +1 elbow bends one way, -1 the other. */
export const ik = (sx: number, sy: number, tx: number, ty: number, bend: number, UPPER = 118, LOWER = 112) => {
  let dx = tx - sx;
  let dy = ty - sy;
  let d = Math.hypot(dx, dy);
  const max = UPPER + LOWER - 0.5;
  if (d > max) {
    dx *= max / d;
    dy *= max / d;
    d = max;
  }
  const a = Math.atan2(dy, dx);
  const cos = (UPPER * UPPER + d * d - LOWER * LOWER) / (2 * UPPER * d);
  const b = Math.acos(Math.max(-1, Math.min(1, cos)));
  const ea = a + bend * b;
  return { ex: sx + UPPER * Math.cos(ea), ey: sy + UPPER * Math.sin(ea), hx: sx + dx, hy: sy + dy };
};

/** A limb drawn as a fat outlined stroke: ink pass, then colour pass, then a light edge. */
export const Limb: React.FC<{ pts: [number, number][]; w: number; fill: string; light?: string }> = ({ pts, w, fill, light }) => {
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none" filter={inflate()}>
      <path d={d} stroke={P.ink} strokeWidth={w + 10} />
      <path d={d} stroke={fill} strokeWidth={w} />
      {light ? <path d={d} stroke={light} strokeWidth={w * 0.28} transform={`translate(${w * 0.22} ${-w * 0.12})`} opacity={0.55} /> : null}
    </g>
  );
};

export const Hand: React.FC<{ x: number; y: number; r: number; grip?: number; rot?: number }> = ({ x, y, r, grip = 0, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${1 + 0.12 * grip} ${1 - 0.18 * grip})`} filter={inflate()}>
    <ellipse rx={r + 5} ry={r * 0.9 + 5} fill={P.ink} />
    <ellipse rx={r} ry={r * 0.9} fill={P.skin} />
    <ellipse cx={-r * 0.35} cy={r * 0.25} rx={r * 0.55} ry={r * 0.45} fill={P.skinShade} opacity={0.55} />
    <ellipse cx={r * 0.55} cy={-r * 0.5} rx={r * 0.38} ry={r * 0.3} fill={P.ink} />
    <ellipse cx={r * 0.55} cy={-r * 0.5} rx={r * 0.38 - 5} ry={r * 0.3 - 5} fill={P.skin} />
  </g>
);

const Eye: React.FC<{ x: number; y: number; p: Pose; side: number; id: string }> = ({ x, y, p, side, id }) => {
  const rx = 21;
  const ry = 25;
  const lid = Math.min(1, Math.max(0, p.lid ?? 0));
  const lidY = -ry + 2 * ry * lid;
  // worried brows tilt the lid's inner corner up, angry ones down
  const tilt = (p.brow ?? 0) * 7 * -side;
  if (lid > 0.82) {
    // closed: a soft lash curve reads far better than a fully-lidded eyeball
    return (
      <g transform={`translate(${x} ${y + 6})`}>
        <path d={`M${-rx} ${-2 + tilt * 0.4} Q0 ${12} ${rx} ${-2 - tilt * 0.4}`} stroke="#3A2226" strokeWidth={7} fill="none" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      <clipPath id={id}>
        <ellipse rx={rx} ry={ry} />
      </clipPath>
      <ellipse rx={rx + 5} ry={ry + 5} fill={P.ink} />
      <ellipse rx={rx} ry={ry} fill={P.white} />
      <g clipPath={`url(#${id})`}>
        <circle cx={(p.lookX ?? 0) * 10} cy={(p.lookY ?? 0) * 10 + 3} r={12} fill="#1A1416" />
        <circle cx={(p.lookX ?? 0) * 10 + 4} cy={(p.lookY ?? 0) * 10 - 2} r={4} fill={P.white} />
        <path d={`M${-rx - 4} ${-ry - 6} L${rx + 4} ${-ry - 6} L${rx + 4} ${lidY - tilt} L${-rx - 4} ${lidY + tilt} Z`} fill={P.skinShade} />
        <path d={`M${-rx - 4} ${lidY + tilt} L${rx + 4} ${lidY - tilt}`} stroke="#3A2226" strokeWidth={5} />
      </g>
    </g>
  );
};

export const Ray: React.FC<{ x: number; y: number; s?: number; pose: Pose; uid?: string }> = ({ x, y, s = 1, pose: p, uid = "ray" }) => {
  const turn = p.turn ?? 0;
  const breathe = p.breathe ?? 0;
  const shoulderY = -250 - 4 * breathe;
  const sL: [number, number] = [-92, shoulderY + 14];
  const sR: [number, number] = [92, shoulderY + 14];
  const hL = p.handL ?? [-112, 2];
  const hR = p.handR ?? [112, 2];
  const aL = ik(sL[0], sL[1], hL[0], hL[1], 1);
  const aR = ik(sR[0], sR[1], hR[0], hR[1], -1);
  const headX = turn * 10;
  const headY = -392 + (p.nod ?? 0) - 3 * breathe;
  const fx = turn * 30; // face features slide across the head
  const brow = p.brow ?? 0;
  const lift = p.browLift ?? 0;
  const mouth = p.mouth ?? 0;
  const open = p.open ?? 0;
  const id = (k: string) => `${uid}-${k}`;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {p.legs
        ? ([[-1, p.footL ?? [-58, 236], p.kneeL ?? 1, p.shoeL ?? "shoe"], [1, p.footR ?? [58, 236], p.kneeR ?? -1, p.shoeR ?? "shoe"]] as const).map(([side, ft, kb, shoe]) => {
            const hipX = 52 * side;
            const L = ik(hipX, 0, ft[0], ft[1], kb, THIGH, SHIN);
            return (
              <g key={side}>
                <Limb pts={[[hipX, -6], [L.ex, L.ey], [L.hx, L.hy]]} w={50} fill={side < 0 ? "#1C2A4A" : "#24365C"} />
                {shoe === "shoe" ? (
                  <g transform={`translate(${L.hx} ${L.hy + 14})`} filter={inflate()}>
                    <path d="M-34 6 Q-36 -22 -6 -22 Q16 -22 26 -8 Q44 -4 44 8 L44 14 L-34 14 Z" fill="#E4572E" stroke={P.ink} strokeWidth={6} strokeLinejoin="round" />
                    <rect x={-36} y={8} width={82} height={10} rx={5} fill="#F4F1E8" stroke={P.ink} strokeWidth={5} />
                  </g>
                ) : (
                  <g transform={`translate(${L.hx} ${L.hy + 14})`} filter={inflate()}>
                    <path d="M-30 8 Q-30 -20 -4 -20 Q18 -18 24 -4 Q40 0 40 10 L40 14 L-30 14 Z" fill="#D9DCE3" stroke={P.ink} strokeWidth={6} strokeLinejoin="round" />
                  </g>
                )}
              </g>
            );
          })
        : null}
      <g transform={`rotate(${p.lean ?? 0})`}>
        {/* back arm */}
        <Limb pts={[sL, [aL.ex, aL.ey], [aL.hx, aL.hy]]} w={44} fill={P.hoodShade} />
        <Hand x={aL.hx} y={aL.hy} r={20} rot={-20} />
        {/* torso: hoodie */}
        <g transform={`translate(0 ${-2 * breathe}) scale(1 ${1 + 0.012 * breathe})`} filter={inflate()}>
          <path
            d={`M-112 10 C-124 -90 -120 -190 -96 ${shoulderY + 6} Q0 ${shoulderY - 30} 96 ${shoulderY + 6} C120 -190 124 -90 112 10 Q0 30 -112 10 Z`}
            fill={P.hood}
            stroke={P.ink}
            strokeWidth={7}
            strokeLinejoin="round"
          />
          {/* cel shadow on the side away from the lamp */}
          <path d={`M-112 10 C-124 -90 -120 -190 -96 ${shoulderY + 6} Q-70 ${shoulderY - 14} -52 ${shoulderY - 18} C-80 -160 -78 -60 -60 18 Q-90 16 -112 10 Z`} fill={P.hoodShade} />
          {/* rim light from the lamp */}
          <path d={`M100 -40 C110 -120 108 -190 92 ${shoulderY + 10}`} stroke={P.rim} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.85} />
          {/* pocket + drawstrings */}
          <path d="M-62 -40 Q0 -54 62 -40 L52 0 Q0 8 -52 0 Z" fill={P.hoodShade} stroke={P.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d={`M-22 ${shoulderY + 22} q${-3 + 3 * Math.sin(breathe * 3)} 50 -6 92`} stroke="#EDEDE6" strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d={`M22 ${shoulderY + 22} q${3 - 3 * Math.sin(breathe * 3)} 50 6 92`} stroke="#EDEDE6" strokeWidth={6} fill="none" strokeLinecap="round" />
          {/* hood collar behind the neck */}
          <path d={`M-70 ${shoulderY - 6} Q0 ${shoulderY + 34} 70 ${shoulderY - 6}`} stroke={P.ink} strokeWidth={30} fill="none" strokeLinecap="round" />
          <path d={`M-70 ${shoulderY - 6} Q0 ${shoulderY + 34} 70 ${shoulderY - 6}`} stroke={P.hoodShade} strokeWidth={20} fill="none" strokeLinecap="round" />
        </g>
        {/* neck */}
        <rect x={-24 + headX * 0.4} y={shoulderY - 40} width={48} height={50} rx={14} fill={P.skinShade} stroke={P.ink} strokeWidth={6} />
        {/* head */}
        <g transform={`translate(${headX} ${headY}) rotate(${p.headTilt ?? 0})`} filter={inflate()}>
          <clipPath id={id("head")}>
            <ellipse rx={118} ry={126} />
          </clipPath>
          {/* back hair mass (counter-slides on a turn) */}
          <path d={`M${-128 - fx * 0.3} -10 C${-140 - fx * 0.3} -150 ${120 - fx * 0.3} -170 ${128 - fx * 0.3} -20 L${120 - fx * 0.3} 30 L${-120 - fx * 0.3} 30 Z`} fill={P.hair} stroke={P.ink} strokeWidth={7} />
          {/* ears */}
          <ellipse cx={-116 + fx * 0.6} cy={8} rx={20} ry={28} fill={P.skin} stroke={P.ink} strokeWidth={6} opacity={turn > 0.6 ? 0 : 1} />
          <ellipse cx={116 + fx * 0.6} cy={8} rx={20} ry={28} fill={P.skin} stroke={P.ink} strokeWidth={6} opacity={turn < -0.6 ? 0 : 1} />
          <ellipse rx={118} ry={126} fill={P.skin} stroke={P.ink} strokeWidth={7} />
          <g clipPath={`url(#${id("head")})`}>
            {/* cel shadow crescent (left) + warm rim (right) */}
            <ellipse cx={-150} cy={10} rx={110} ry={150} fill={P.skinShade} opacity={0.8} />
            <ellipse cx={180} cy={-10} rx={80} ry={150} fill={P.rim} opacity={0.22} />
            {/* blush */}
            <ellipse cx={-62 + fx} cy={42} rx={22} ry={12} fill="#E8826B" opacity={0.45} />
            <ellipse cx={62 + fx} cy={42} rx={22} ry={12} fill="#E8826B" opacity={0.45} />
          </g>
          {p.back ? <ellipse rx={122} ry={130} fill={P.hair} stroke={P.ink} strokeWidth={7} /> : null}
          {p.back ? null : <>
          {/* eyes */}
          <Eye x={-42 + fx} y={-6} p={p} side={-1} id={id("eL")} />
          <Eye x={42 + fx} y={-6} p={p} side={1} id={id("eR")} />
          {/* brows: worried = inner ends up */}
          {[-1, 1].map((side) => {
            const cx = 42 * side + fx;
            const by = -52 - lift;
            const inner = by + brow * 10 * -1;
            const outer = by - brow * -4;
            return (
              <path
                key={side}
                d={`M${cx - 26 * side} ${outer} Q${cx} ${Math.min(inner, outer) - 8} ${cx + 22 * -side * -1} ${inner}`}
                stroke={P.hair}
                strokeWidth={11}
                strokeLinecap="round"
                fill="none"
                transform={side === 1 ? undefined : undefined}
              />
            );
          })}
          {/* nose */}
          <path d={`M${6 + fx * 1.1} 14 q12 16 -4 22`} stroke={P.skinShade} strokeWidth={6} fill="none" strokeLinecap="round" />
          {/* mouth: curve + open amount */}
          <g transform={`translate(${fx * 0.95} 62)`}>
            {open > 0.05 ? (
              <path d={`M-22 0 Q0 ${-6 * mouth} 22 0 Q0 ${8 + 30 * open + 8 * mouth} -22 0 Z`} fill="#5A1E22" stroke={P.ink} strokeWidth={6} strokeLinejoin="round" />
            ) : (
              <path d={`M-24 ${-4 * mouth} Q0 ${14 * mouth} 24 ${-4 * mouth}`} stroke="#3A2226" strokeWidth={7} fill="none" strokeLinecap="round" />
            )}
          </g>
          </>}
          {/* fringe on top, moves with the turn */}
          <path
            d={`M${-118 + fx * 0.5} -40 C${-110 + fx * 0.5} -150 ${110 + fx * 0.5} -160 ${122 + fx * 0.5} -50 C${80 + fx} -96 ${30 + fx} -70 ${10 + fx} -96 C${-10 + fx} -64 ${-60 + fx} -84 ${-118 + fx * 0.5} -40 Z`}
            fill={P.hair}
            stroke={P.ink}
            strokeWidth={7}
            strokeLinejoin="round"
          />
          <path d={`M${40 + fx} -128 q30 6 44 34`} stroke="#4A3A48" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.8} />
        </g>
        {/* front arm (the reaching one) */}
        <Limb pts={[sR, [aR.ex, aR.ey], [aR.hx, aR.hy]]} w={46} fill={P.hood} light={P.hoodLight} />
        <Hand x={aR.hx} y={aR.hy} r={21} grip={p.grip} rot={20} />
      </g>
    </g>
  );
};
