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

/** A "the cliff": the progress bar snaps off at 0:20; the grey crowd falls into the gap, Pal teeters on the edge looking down. */
const Cliff: React.FC = () => {
  const barY = 640, edge = 1180, gap = 380;
  const fallers: [number, number, number, number][] = [[edge + 90, barY + 170, -35, 1.35], [edge + 270, barY + 250, 70, 1.2], [edge + 150, barY + 360, -125, 1.05], [edge + 320, barY + 400, 25, 0.95]];
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="ga" cx="0.6" cy="0.62" r="0.7"><stop offset="0" stopColor={NAVY2} /><stop offset="1" stopColor={NAVY} /></radialGradient>
        <linearGradient id="pit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.75} /></linearGradient>
        <filter id="glow" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="18" /></filter>
      </defs>
      <rect width={1920} height={1080} fill="url(#ga)" />
      {/* the watched part glows red right up to the break */}
      <rect x={-40} y={barY} width={edge + 40} height={64} fill={RED} filter="url(#glow)" opacity={0.8} />
      <path d={`M-40 ${barY} H${edge} l-18 22 l26 14 l-20 28 H-40 Z`} fill={RED} {...ln} />
      <path d={`M${edge + gap} ${barY + 6} l22 18 l-24 16 l18 24 H1960 V${barY + 6} Z`} fill="#6B6E78" {...ln} />
      {/* crumbs of the bar falling */}
      {[[edge + 40, barY + 110, 30], [edge + 160, barY + 200, -20], [edge + 290, barY + 90, 50]].map(([x, y, r], i) => <rect key={i} x={x} y={y} width={34} height={22} fill={i ? "#6B6E78" : RED} {...ln} strokeWidth={5} transform={`rotate(${r} ${x} ${y})`} />)}
      {fallers.map(([x, y, rot, sc], i) => (
        <g key={i} transform={`rotate(${rot} ${x} ${y})`} opacity={1 - i * 0.08}>
          <Pal x={x} y={y} scale={sc} frame={i * 7} ink={INK} skin="#C9C4BA" shirt={GREY} armL={160} armR={-160} legL={35} legR={-35} face={FACES.shocked} bob={0} />
        </g>
      ))}
      <rect x={edge - 10} y={barY + 300} width={gap + 20} height={200} fill="url(#pit)" />
      {/* the playhead, stopped at the edge */}
      <circle cx={edge - 30} cy={barY + 32} r={52} fill={RED} {...ln} />
      <circle cx={edge - 44} cy={barY + 18} r={14} fill="#FFB3A6" />
      {/* Pal teeters over the drop: leaning in, arms out, eyes on the fall */}
      <Pal x={edge - 190} y={barY - 108 * 2.2} scale={2.2} frame={3} ink={INK} skin={INKCOL.skin} shirt={TEAL} lean={10} armL={70} armR={-115} legL={4} legR={-14}
        face={blendFace(FACES.worried, FACES.shocked, 0.85, { lookX: 0.9, lookY: 0.8 })} bob={0} />
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
