import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { usePaperFonts } from "../Puppet/paper";
import { Pal } from "../Disc/Pal";
import { FACES, blendFace } from "../Hangry/Stickman";
import { INKCOL } from "../Disc/hook";

/**
 * Thumbnails for "You Already Beat the Average Viewer", drawn in the video's own look so the click matches what plays.
 * Frames 0-9 = A "the road" (crowd falling off the bar at 0:20, Pal alone at the playhead),
 * frames 10-19 = B "the stare" (Pal's face, the 0:19 timer about to tick). Rendered through history.yml, then frames 5 and 15 are pulled.
 * Rules (stickman-thumbnail-format): <=3 words that the narrator says, one hero in full colour, everyone else greyed, bottom-right clear for the badge.
 */

const INK = "#1F1A15", RED = "#D2452F", GOLD = "#E3A22B", TEAL = "#2E8C83", WALL = "#EED9B4", GREY = "#8E8678";
const ln = { stroke: INK, strokeWidth: 7, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const Words: React.FC<{ a: string; b: string; x?: number; y?: number; size?: number }> = ({ a, b, x = 70, y = 70, size = 150 }) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: "Oswald", fontWeight: 700, lineHeight: 0.95, textTransform: "uppercase" }}>
    <div style={{ fontSize: size, color: INK, textShadow: "6px 6px 0 rgba(31,26,21,0.18)" }}>{a}</div>
    <div style={{ display: "inline-block", marginTop: 14, fontSize: size * 1.05, color: "#FFF8EC", background: RED, padding: "4px 26px 12px", transform: "rotate(-2deg)", boxShadow: `10px 10px 0 ${INK}` }}>{b}</div>
  </div>
);

const Bg: React.FC = () => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
    <defs>
      <radialGradient id="tv" cx="0.62" cy="0.55" r="0.75"><stop offset="0.5" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#2A1A0C" stopOpacity={0.45} /></radialGradient>
    </defs>
    <rect width={1920} height={1080} fill={WALL} />
    <rect width={1920} height={1080} fill="url(#tv)" />
  </svg>
);

const Road: React.FC = () => {
  const barY = 800, x0 = 60, w = 1800, ph = x0 + w * 0.237 + 380; // the bar is cropped so 0:20 sits right of centre
  const fallers: [number, number, number][] = [[ph - 300, barY + 120, -50], [ph - 120, barY + 210, 70], [ph + 220, barY + 160, -110], [ph + 420, barY + 260, 30]];
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
      <rect x={-20} y={barY} width={1960} height={48} rx={24} fill="#B9AE97" {...ln} />
      <rect x={-20} y={barY} width={ph + 20} height={48} rx={24} fill={RED} {...ln} />
      <line x1={ph} y1={barY} x2={ph} y2={barY - 420} stroke={INK} strokeWidth={10} />
      <path d={`M${ph} ${barY - 420} L${ph + 260} ${barY - 372} L${ph} ${barY - 324} Z`} fill={GOLD} {...ln} />
      <text x={ph + 98} y={barY - 356} fontSize={56} textAnchor="middle" style={{ fontFamily: "Oswald", fontWeight: 700 }} fill={INK}>0:20</text>
      {fallers.map(([x, y, rot], i) => (
        <g key={i} transform={`rotate(${rot} ${x} ${y})`}>
          <Pal x={x} y={y} scale={1.15} frame={i * 7} ink={INK} skin="#E6E0D6" shirt={GREY} armL={150} armR={-150} legL={30} legR={-30} face={FACES.shocked} bob={0} />
        </g>
      ))}
      <ellipse cx={ph - 120} cy={barY + 6} rx={150} ry={30} fill="#FFF3C4" opacity={0.7} />
      <Pal x={ph - 120} y={barY - 230} scale={2.1} frame={3} ink={INK} skin={INKCOL.skin} shirt={TEAL} armL={30} armR={-150} legL={8} legR={-8}
        face={blendFace(FACES.happy, FACES.smug, 0.8, { lookX: 0, lookY: 0 })} bob={0} />
      <circle cx={ph} cy={barY + 24} r={42} fill={RED} {...ln} />
    </svg>
  );
};

const Stare: React.FC = () => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
    {/* the stare: a huge face looking straight at you, the clock one second from the drop-off */}
    <Pal x={1350} y={1180} scale={6.4} frame={0} ink={INK} skin={INKCOL.skin} shirt={TEAL} armL={20} armR={-20} legL={6} legR={-6}
      face={blendFace(FACES.neutral, FACES.smug, 0.55, { lookX: -0.15, lookY: 0, eyeOpen: 1.1 })} bob={0} />
    <g transform="translate(1180 120) rotate(4)">
      <rect x={0} y={0} width={420} height={170} rx={30} fill="#2F3B52" {...ln} />
      <text x={210} y={124} fontSize={120} textAnchor="middle" style={{ fontFamily: "Oswald", fontWeight: 700 }} fill="#FFF8EC">0:19</text>
    </g>
  </svg>
);

export const AttnThumb: React.FC = () => {
  usePaperFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Bg />
      {/* history.yml loudnorms the audio; pure silence makes it fail, so a near-silent tick */}
      <Audio src={staticFile("sfx/tick.wav")} volume={0.05} />
      {f < 10 ? <><Road /><Words a="most quit" b="at 0:20" /></> : <><Stare /><Words a="can you" b="finish it?" size={140} /></>}
    </AbsoluteFill>
  );
};
