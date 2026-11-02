import React from "react";
import { AbsoluteFill } from "remotion";

/**
 * Thumbnails for "You Don't Have a Discipline Problem", 1280x720, in the discipline-niche hit pattern the user picked: black
 * ground, a huge white headline with the punch word(s) in red, one big waist-up figure staring into the lens, cupping a
 * glowing brain at his chest. A = "WILLPOWER IS FAKE" (green glow), B = "YOU'RE NOT LAZY" (red glow).
 */
const INK = "#0B0B0B", SKIN = "#F2E2B6", SHIRT = "#B4552C", HAND = "#3E2417", RED = "#FF3B30";

const Fingers: React.FC<{ m: 1 | -1 }> = ({ m }) => {
  const X = (x: number) => (m === 1 ? x : 1280 - x);
  const fingers = [[[430, 720], [500, 690], [585, 688]], [[500, 690], [560, 640]], [[492, 672], [548, 612]], [[486, 652], [532, 588]], [[482, 632], [512, 572]]];
  const d = (pts: number[][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${X(x!)} ${y}`).join(" ");
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={`M${X(380)} 760 L${X(470)} 700 L${X(520)} 650`} stroke={INK} strokeWidth={96} />
      <path d={`M${X(380)} 760 L${X(470)} 700 L${X(520)} 650`} stroke={HAND} strokeWidth={86} />
      {fingers.map((p, i) => <path key={i} d={d(p)} stroke={INK} strokeWidth={34} />)}
      {fingers.map((p, i) => <path key={`c${i}`} d={d(p)} stroke={HAND} strokeWidth={25} />)}
    </g>
  );
};

export const DiscThumb: React.FC<{ v?: "A" | "B" }> = ({ v = "A" }) => {
  const glow = v === "A" ? "#7CFFB2" : "#FF6B5E", lobe = v === "A" ? "#A8F7CF" : "#FFA79C", fold = v === "A" ? "#2E8B57" : "#B23A2E";
  const head: [string, boolean][] = v === "A" ? [["WILLPOWER IS ", false], ["FAKE", true]] : [["YOU'RE ", false], ["NOT LAZY", true]];
  return (
    <AbsoluteFill style={{ background: INK }}>
      <svg viewBox="0 0 1280 720" width="100%" height="100%">
        <defs>
          <radialGradient id="glow"><stop offset="0" stopColor={glow} stopOpacity={0.95} /><stop offset="0.45" stopColor={glow} stopOpacity={0.35} /><stop offset="1" stopColor={glow} stopOpacity={0} /></radialGradient>
          <radialGradient id="eye"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.35" stopColor={glow} /><stop offset="1" stopColor={glow} stopOpacity={0} /></radialGradient>
          <linearGradient id="under" x1="0" y1="0" x2="0" y2="1"><stop offset="0.35" stopColor={glow} stopOpacity={0} /><stop offset="1" stopColor={glow} stopOpacity={0.55} /></linearGradient>
          <radialGradient id="vig" cx="0.5" cy="0.55" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.8} /></radialGradient>
          <clipPath id="headClip"><ellipse cx={640} cy={300} rx={125} ry={140} /></clipPath>
        </defs>
        <rect width={1280} height={720} fill={INK} />
        {/* torso, neck, head */}
        <path d="M120 720 L215 520 Q260 470 480 455 L800 455 Q1020 470 1065 520 L1160 720 Z" fill={SHIRT} stroke={INK} strokeWidth={6} />
        <path d="M575 400 L575 470 Q640 495 705 470 L705 400 Z" fill="#E1C893" stroke={INK} strokeWidth={6} />
        {[-1, 1].map((s) => <ellipse key={s} cx={640 + s * 122} cy={315} rx={22} ry={38} fill={SKIN} stroke={INK} strokeWidth={6} />)}
        <ellipse cx={640} cy={300} rx={125} ry={140} fill={SKIN} stroke={INK} strokeWidth={6} />
        {/* the brain's light hits the face from below */}
        <rect x={500} y={150} width={280} height={300} fill="url(#under)" clipPath="url(#headClip)" />
        {/* half-lidded, dead-level stare into the lens, eyes lit from inside */}
        {[-1, 1].map((s) => (
          <g key={s}>
            <circle cx={640 + s * 49} cy={299} r={46} fill="url(#eye)" opacity={0.85} />
            <path d={`M${640 + s * 78} 300 Q${640 + s * 50} 284 ${640 + s * 20} 300 Q${640 + s * 50} 312 ${640 + s * 78} 300 Z`} fill={glow} stroke={INK} strokeWidth={4} />
            <circle cx={640 + s * 49} cy={300} r={6} fill="#FFFFFF" />
            <path d={`M${640 + s * 86} 286 Q${640 + s * 52} 276 ${640 + s * 16} 290`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
            <path d={`M${640 + s * 90} 262 L${640 + s * 22} 272`} stroke={INK} strokeWidth={7} strokeLinecap="round" />
          </g>
        ))}
        <path d="M640 312 Q634 344 648 352" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <path d="M610 388 Q640 382 670 388" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        {/* the glowing brain, cupped at the chest */}
        <circle cx={640} cy={600} r={300} fill="url(#glow)" />
        <ellipse cx={640} cy={600} rx={135} ry={98} fill={lobe} stroke={fold} strokeWidth={6} />
        <line x1={640} y1={508} x2={640} y2={694} stroke={fold} strokeWidth={5} />
        {["M560 560 Q590 530 620 556", "M530 610 Q570 590 600 620 Q620 640 600 670", "M575 655 Q600 640 620 660", "M660 556 Q690 530 720 560",
          "M680 620 Q710 590 750 612", "M665 662 Q700 645 725 668", "M545 585 Q560 600 545 625", "M735 585 Q722 605 738 628"].map((d, i) => (
          <path key={i} d={d} fill="none" stroke={fold} strokeWidth={5} strokeLinecap="round" />
        ))}
        {/* arms: sleeves from the shoulders down to the wrists, so the torso reads as a body and not a table */}
        {[1, -1].map((m) => {
          const X = (x: number) => (m === 1 ? x : 1280 - x);
          const d = `M${X(230)} 540 Q${X(250)} 660 ${X(420)} 735`;
          return <g key={m} fill="none" strokeLinecap="round"><path d={d} stroke={INK} strokeWidth={118} /><path d={d} stroke={SHIRT} strokeWidth={106} /></g>;
        })}
        <Fingers m={1} />
        <Fingers m={-1} />
        {/* lightning cracking off the brain */}
        {["M520 560 L470 520 L488 505 L430 455", "M760 560 L810 515 L792 502 L850 450", "M560 505 L540 450 L556 445 L535 395", "M720 505 L742 452 L726 446 L748 398"].map((d, i) => (
          <g key={`z${i}`} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d={d} stroke={glow} strokeWidth={14} opacity={0.6} />
            <path d={d} stroke="#FFFFFF" strokeWidth={5} />
          </g>
        ))}
        {/* hand-drawn red arrow at the brain */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1150 260 Q1110 450 810 590" stroke={INK} strokeWidth={34} />
          <path d="M810 590 L845 530 M810 590 L879 602" stroke={INK} strokeWidth={34} />
          <path d="M1150 260 Q1110 450 810 590" stroke={RED} strokeWidth={22} />
          <path d="M810 590 L845 530 M810 590 L879 602" stroke={RED} strokeWidth={22} />
        </g>
        <rect width={1280} height={720} fill="url(#vig)" />
        <text x={640} y={150} textAnchor="middle" fontFamily="Liberation Sans, Arial, sans-serif" fontWeight={700} fontSize={130}
          textLength={1180} lengthAdjust="spacingAndGlyphs">
          {head.map(([t, red], i) => <tspan key={i} fill={red ? RED : "#FFFFFF"} stroke={red ? RED : "#FFFFFF"} strokeWidth={7} strokeLinejoin="round">{t}</tspan>)}
        </text>
      </svg>
    </AbsoluteFill>
  );
};
