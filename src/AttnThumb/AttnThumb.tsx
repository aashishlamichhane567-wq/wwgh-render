import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { usePaperFonts } from "../Puppet/paper";

/**
 * Thumbnails for "I Bet You Can't Watch This 86-Second Video", built on the episode's own illustrated stills (public/hybrid),
 * so the click matches what plays. Text and the progress bar are drawn in code: crisp, never AI-mangled.
 * Frames 0-9 = A "the glance" (c1: his eyes slide off the phone, straight at the words MOST QUIT AT 0:20),
 * frames 10-19 = B "the stare" (t4: wide eyes in phone light, STILL HERE?). history.yml renders it; pull frames 5 and 15.
 * Rules: <=3 words, one face carrying the emotion, high contrast, bottom-right left clear for the duration badge.
 */

const RED = "#E5322D", INK = "#0B0F17", CREAM = "#FFF6E8";

const Words: React.FC<{ a: string; b: string; x: number; y: number; size: number }> = ({ a, b, x, y, size }) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: "Oswald", fontWeight: 700, lineHeight: 0.92, textTransform: "uppercase" }}>
    <div style={{ fontSize: size, color: CREAM, textShadow: `0 6px 30px rgba(0,0,0,0.75), 5px 5px 0 ${INK}` }}>{a}</div>
    <div style={{ display: "inline-block", marginTop: 18, fontSize: size * 1.08, color: CREAM, background: RED, padding: "2px 26px 12px", transform: "rotate(-2deg)", boxShadow: "0 14px 40px rgba(0,0,0,0.55)" }}>{b}</div>
  </div>
);

/** YouTube-style progress bar, stopped where the average viewer leaves (23.7%). */
const Bar: React.FC<{ y: number }> = ({ y }) => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
    <defs><filter id="bg" x="-10%" y="-300%" width="120%" height="700%"><feGaussianBlur stdDeviation="10" /></filter></defs>
    <rect x={0} y={y} width={1920} height={16} fill="#FFFFFF" opacity={0.28} />
    <rect x={0} y={y - 4} width={1920 * 0.237} height={24} fill={RED} filter="url(#bg)" opacity={0.9} />
    <rect x={0} y={y} width={1920 * 0.237} height={16} fill={RED} />
    <circle cx={1920 * 0.237} cy={y + 8} r={26} fill={RED} stroke={CREAM} strokeWidth={5} />
  </svg>
);

const Shot: React.FC<{ src: string; left: number; scale: number; shade: string }> = ({ src, left, scale, shade }) => (
  <>
    <Img src={staticFile(src)} style={{ position: "absolute", left, top: (1080 - 1072 * scale) / 2, width: 1920 * scale, height: 1072 * scale }} />
    {/* a soft dark pool behind the words, plus a vignette, so the type reads on any feed */}
    <div style={{ position: "absolute", inset: 0, background: shade }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
  </>
);

export const AttnThumb: React.FC = () => {
  usePaperFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: INK }}>
      {/* history.yml loudnorms the audio; pure silence makes it fail, so a near-silent tick */}
      <Audio src={staticFile("sfx/tick.wav")} volume={0.05} />
      {f < 10 ? (
        <>
          <Shot src="hybrid/c1.webp" left={-300} scale={1.16} shade="linear-gradient(90deg, transparent 45%, rgba(5,8,14,0.8) 78%)" />
          <Words a="most quit" b="at 0:20" x={1180} y={150} size={170} />
        </>
      ) : (
        <>
          <Shot src="hybrid/t4.webp" left={0} scale={1.12} shade="linear-gradient(270deg, transparent 50%, rgba(5,8,14,0.8) 85%)" />
          <Words a="still" b="here?" x={80} y={170} size={190} />
        </>
      )}
      <Bar y={1000} />
    </AbsoluteFill>
  );
};
