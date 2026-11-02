import React from "react";
import { AbsoluteFill } from "remotion";
import { usePaperFonts } from "../Puppet/paper";
import { FACES } from "../Hangry/Stickman";
import { Pal } from "./Pal";
import { Brain, INKY } from "./hook";

/**
 * Thumbnails for "You Don't Have a Discipline Problem", 1280x720. Niche pattern (PsychToons and co.): one big expressive
 * character on a flat saturated ground, 2-3 capital words in heavy outlined type that complement the title, not repeat it.
 * A = the brain mascot slamming ABORT, "NOT LAZY."; B = the figure crushed under EFFORT, "TRAINED WRONG".
 */
const LN = "#1E1914";
const Word: React.FC<{ x: number; y: number; size: number; fill: string; edge?: string; children: string }> = ({ x, y, size, fill, edge = LN, children }) => (
  <text x={x} y={y} fontFamily="Oswald" fontWeight={700} fontSize={size} fill={fill} stroke={edge} strokeWidth={size * 0.09}
    strokeLinejoin="round" style={{ paintOrder: "stroke" }}>{children}</text>
);

export const DiscThumb: React.FC<{ v?: "A" | "B" }> = ({ v = "A" }) => {
  usePaperFonts();
  const L = { ...INKY, seam: LN, sw: 7 };
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1280 720" width="100%" height="100%">
        {v === "A" ? (
          <g>
            <rect width={1280} height={720} fill="#1F8A84" />
            <circle cx={930} cy={330} r={430} fill="#2BA79E" />
            <g transform="translate(790 300) scale(1.05)">
              {/* console + ABORT, under the slamming hand */}
              <rect x={190} y={200} width={260} height={200} rx={14} fill="#4A4540" stroke={LN} strokeWidth={7} />
              <ellipse cx={320} cy={206} rx={90} ry={24} fill="#E2402C" stroke={LN} strokeWidth={7} />
              <text x={320} y={325} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={58} fill="#FFFFFF">ABORT</text>
              <Brain L={L} x={0} y={0} tilt={-6} hand={[320, 178]} lid={0.45} frown={1} />
              {[[-1, -0.6], [0, -1], [1, -0.6]].map(([dx, dy], i) => (
                <line key={i} x1={320 + dx! * 70} y1={150 + dy! * 50} x2={320 + dx! * 130} y2={150 + dy! * 110} stroke="#FFE14D" strokeWidth={12} strokeLinecap="round" />
              ))}
            </g>
            <Word x={60} y={300} size={170} fill="#FFFFFF">NOT</Word>
            <Word x={52} y={530} size={250} fill="#FFE14D">LAZY.</Word>
          </g>
        ) : (
          <g>
            <rect width={1280} height={720} fill="#F5C33B" />
            <circle cx={940} cy={360} r={420} fill="#FFD866" />
            {/* EFFORT sits on his head and he's given up holding it */}
            <Pal x={940} y={700} scale={3} frame={7} ink={LN} skin="#F7F1E6" shirt="#6F8C4E" face={FACES.sad}
              armL={14} armR={-14} legL={10} legR={-10} lean={4} headTilt={8} bob={0} />
            <g transform="translate(930 128) rotate(-6)">
              <rect x={-300} y={-120} width={600} height={190} rx={14} fill="#77716A" stroke={LN} strokeWidth={9} />
              <text x={0} y={22} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={110} fill="#F1ECE2">EFFORT</text>
            </g>
            {[[-160, 300], [165, 290], [190, 380]].map(([dx, y], i) => (
              <path key={i} d={`M${930 + dx!} ${y} q-16 28 0 38 q16 -10 0 -38 Z`} fill="#8FC7E8" stroke={LN} strokeWidth={4} />
            ))}
            <Word x={50} y={320} size={180} fill="#FFFFFF">TRAINED</Word>
            <Word x={50} y={540} size={210} fill="#E2402C">WRONG</Word>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
