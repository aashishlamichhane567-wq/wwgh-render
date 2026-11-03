import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { usePaperFonts } from "../Puppet/paper";
import { Pal } from "../Disc/Pal";
import { FACES, blendFace } from "../Hangry/Stickman";
import { INKCOL } from "../Disc/hook";

/**
 * Thumbnails for "You Already Beat the Average Viewer", drawn in the video's own look so the click matches what plays.
 * Frames 0-9 = A "the cliff" (the bar snaps at 0:20, the crowd falls, Pal teeters on the edge),
 * frames 10-19 = B "the stare" (Pal's suspicious face, the 0:19 timer about to tick). Rendered through history.yml, then frames 5 and 15 are pulled.
 * Rules (stickman-thumbnail-format): <=3 words that the narrator says, one hero in full colour, everyone else greyed, bottom-right clear for the badge.
 */

const INK = "#1F1A15", RED = "#D2452F", TEAL = "#2E8C83", GREY = "#8E8678";
const ln = { stroke: INK, strokeWidth: 7, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

// v2: dark/saturated grounds so they stand out in YouTube's white feed (the beige v1 melted into it), bigger heroes, real tension
const NAVY = "#141B2B", NAVY2 = "#2F3B52";

const Words: React.FC<{ a: string; b: string; box: string; x?: number; y?: number; size?: number }> = ({ a, b, box, x = 70, y = 60, size = 160 }) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: "Oswald", fontWeight: 700, lineHeight: 0.95, textTransform: "uppercase" }}>
    <div style={{ fontSize: size, color: "#FFF8EC", textShadow: `8px 8px 0 ${INK}` }}>{a}</div>
    <div style={{ display: "inline-block", marginTop: 16, fontSize: size * 1.1, color: "#FFF8EC", background: box, padding: "4px 28px 14px", transform: "rotate(-2deg)", border: `7px solid ${INK}`, boxShadow: `12px 12px 0 ${INK}` }}>{b}</div>
  </div>
);

/** A "the cliff" v3: the bar snaps at 0:20 mid-frame; Pal windmills on the edge, one viewer dangles from it, the rest fall.
 *  The gap sits left of x 1650 so YouTube's duration badge (bottom-right) never covers the gag. */
const Cliff: React.FC = () => {
  const barY = 720, edge = 1250, gap = 330, s = 2.25;
  const px = edge - 95, py = barY - 108 * s;
  // the dangler's raised left hand (arm angle 145, clear of his head; rig hand at 37|45) grips the broken edge
  const ds = 1.2, dx = edge + 8 - (37 - 100) * ds, dy = barY + 44 - (45 - 160) * ds;
  const panic = { ...FACES.shocked, browTilt: -16, browY: 28, eyeOpen: 1.7, mouthOpen: 1, mouthCurve: -5, lookX: 0.85, lookY: 0.9 };
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="ga" cx="0.62" cy="0.55" r="0.75"><stop offset="0" stopColor={NAVY2} /><stop offset="1" stopColor={NAVY} /></radialGradient>
        <linearGradient id="pit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.6} /></linearGradient>
        <filter id="glow" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="20" /></filter>
      </defs>
      <rect width={1920} height={1080} fill="url(#ga)" />
      <rect x={edge - 20} y={barY + 40} width={gap + 40} height={420} fill="url(#pit)" />
      <rect x={-40} y={barY} width={edge + 40} height={64} fill={RED} filter="url(#glow)" opacity={0.85} />
      <path d={`M-40 ${barY} H${edge} l-16 20 l24 14 l-18 30 H-40 Z`} fill={RED} {...ln} />
      <path d={`M${edge + gap} ${barY + 4} l20 18 l-22 16 l16 26 H1960 V${barY + 4} Z`} fill="#6B6E78" {...ln} />
      {/* falling viewers with speed streaks */}
      {([[edge + 200, barY + 300, 55, 1.05], [edge + 90, barY + 400, -140, 0.9]] as const).map(([x, y, rot, sc], i) => (
        <g key={i}>
          {[-30, 0, 30].map((o) => <line key={o} x1={x + o} y1={y - 200 * sc} x2={x + o} y2={y - 120 * sc} stroke="#8E95A8" strokeWidth={6} strokeLinecap="round" opacity={0.6} />)}
          <g transform={`rotate(${rot} ${x} ${y})`}><Pal x={x} y={y} scale={sc} frame={i * 7} ink={INK} skin="#C9C4BA" shirt={GREY} armL={165} armR={-160} legL={40} legR={-30} face={FACES.shocked} bob={0} /></g>
        </g>
      ))}
      {[[edge + 60, barY + 120, 30], [edge + 240, barY + 160, -25]].map(([x, y, r], i) => <rect key={i} x={x} y={y} width={36} height={22} fill={i ? "#6B6E78" : RED} {...ln} strokeWidth={5} transform={`rotate(${r} ${x} ${y})`} />)}
      {/* the one hanging on */}
      <Pal x={dx} y={dy} scale={ds} frame={2} ink={INK} skin="#C9C4BA" shirt={GREY} armL={145} armR={-35} legL={14} legR={-20} face={{ ...FACES.shocked, lookY: -0.9, lookX: -0.3 }} bob={0} />
      <circle cx={edge - 120} cy={barY + 32} r={50} fill={RED} {...ln} />
      <circle cx={edge - 134} cy={barY + 18} r={13} fill="#FFB3A6" />
      {/* Pal: leaning over the drop, arms windmilling, sweat flying */}
      <g transform={`rotate(-4 ${px} ${barY})`}>
        <Pal x={px} y={py} scale={s} frame={3} ink={INK} skin={INKCOL.skin} shirt={TEAL} lean={14} armL={125} armR={-150} legL={2} legR={-48} face={panic} bob={0} />
      </g>
      {[[-1, 150], [1, 210]].map(([d, r], i) => <path key={i} d={`M${px + 60 + d * r} ${py - 200} a ${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${d * 60} 90`} fill="none" stroke="#FFF8EC" strokeWidth={8} strokeLinecap="round" opacity={0.7} />)}
      {[[px + 170, py - 330, 20], [px + 205, py - 270, 35], [px - 90, py - 320, -25]].map(([x, y, r], i) => (
        <path key={i} d="M0 -26 Q16 0 0 12 Q-16 0 0 -26 Z" transform={`translate(${x} ${y}) rotate(${r}) scale(1.4)`} fill="#8FD3FF" {...ln} strokeWidth={3} />
      ))}
    </svg>
  );
};

/** B "the stare": red ground, a huge suspicious Pal, the clock one second from the drop-off beside his face. */
const Stare: React.FC = () => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
    <defs>
      <radialGradient id="gb" cx="0.7" cy="0.45" r="0.8"><stop offset="0" stopColor="#E8603F" /><stop offset="1" stopColor="#9E2A1B" /></radialGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#gb)" />
    <Pal x={1420} y={1240} scale={6.8} frame={0} ink={INK} skin={INKCOL.skin} shirt={TEAL} armL={20} armR={-20} legL={6} legR={-6}
      face={blendFace(FACES.annoyed, FACES.smug, 0.5, { lookX: -0.25, lookY: 0.05, eyeOpen: 0.75 })} bob={0} />
    <g transform="translate(540 600) rotate(-5)">
      <rect x={0} y={0} width={500} height={210} rx={36} fill={NAVY} {...ln} strokeWidth={9} />
      <circle cx={70} cy={105} r={34} fill={RED} />
      <text x={290} y={155} fontSize={150} textAnchor="middle" style={{ fontFamily: "Oswald", fontWeight: 700 }} fill="#FFF8EC">0:19</text>
    </g>
  </svg>
);

export const AttnThumb: React.FC = () => {
  usePaperFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {/* history.yml loudnorms the audio; pure silence makes it fail, so a near-silent tick */}
      <Audio src={staticFile("sfx/tick.wav")} volume={0.05} />
      {f < 10 ? <><Cliff /><Words a="most quit" b="at 0:20" box={RED} /></> : <><Stare /><Words a="can you" b="finish it?" box={NAVY} size={145} /></>}
    </AbsoluteFill>
  );
};
