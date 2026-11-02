import React from "react";
import { AbsoluteFill } from "remotion";
import { usePaperFonts } from "../Puppet/paper";
import { FACES } from "../Hangry/Stickman";
import { strain } from "../Hangry/actions";
import { Pal } from "./Pal";
import { Brain, INKY } from "./hook";

/**
 * Thumbnails for "You Don't Have a Discipline Problem", 1280x720, in the PsychToons thumbnail pattern: plain cream ground,
 * one heavy black headline across the top with ONE word in red, a single white ink figure centred, and one visual metaphor.
 * A = the brain holding him back by the shirt as he reaches for the work, "YOU'RE NOT LAZY";
 * B = straining to shove an EFFORT boulder, "STOP FORCING IT".
 */
const LN = "#1E1914", RED = "#D7262B", BG = "#F4F1EA";
const Head: React.FC<{ parts: [string, boolean][] }> = ({ parts }) => (
  <text x={640} y={128} textAnchor="middle" fontFamily="Liberation Sans, Arial, sans-serif" fontWeight={700} fontSize={104} letterSpacing={-2}>
    {parts.map(([t, red], i) => <tspan key={i} fill={red ? RED : LN}>{t}</tspan>)}
  </text>
);

export const DiscThumb: React.FC<{ v?: "A" | "B" }> = ({ v = "A" }) => {
  usePaperFonts();
  const L = { ...INKY, seam: LN, sw: 6 };
  const fig = { ink: LN, skin: "#FFFFFF", shirt: "#FFFFFF", frame: 7, bob: 0 };
  return (
    <AbsoluteFill style={{ background: BG }}>
      <svg viewBox="0 0 1280 720" width="100%" height="100%">
        <rect width={1280} height={720} fill={BG} />
        {v === "A" ? (
          <g>
            <Head parts={[["YOU'RE ", false], ["NOT", true], [" LAZY", false]]} />
            {/* the work he reaches for */}
            <g transform="translate(1040 500) rotate(6)">
              <rect x={-120} y={-85} width={240} height={170} fill="#FFFFFF" stroke={LN} strokeWidth={5} />
              <line x1={0} y1={-85} x2={0} y2={85} stroke={LN} strokeWidth={4} />
              {[0, 1, 2].map((i) => <line key={i} x1={-100} y1={-40 + i * 34} x2={-24} y2={-40 + i * 34} stroke={LN} strokeWidth={4} />)}
            </g>
            {/* the brain behind him, gripping his shirt */}
            <g transform="translate(300 440) scale(0.62)">
              <Brain L={L} x={0} y={0} tilt={-4} hand={[520, -10]} lid={0.35} frown={1} />
            </g>
            <Pal x={640} y={480} scale={1.75} face={FACES.worried} armL={-70} armR={-95} legL={24} legR={-28} lean={14} {...fig} />
            {[[880, 300], [905, 345], [880, 390]].map(([x, y], i) => <line key={i} x1={x} y1={y} x2={x! + 40} y2={y! + (i - 1) * 14} stroke={LN} strokeWidth={5} strokeLinecap="round" />)}
          </g>
        ) : (
          <g>
            <Head parts={[["STOP ", false], ["FORCING", true], [" IT", false]]} />
            <line x1={150} y1={655} x2={1130} y2={655} stroke={LN} strokeWidth={5} strokeLinecap="round" />
            <circle cx={835} cy={505} r={150} fill="#8D877E" stroke={LN} strokeWidth={6} />
            <text x={835} y={530} textAnchor="middle" fontFamily="Liberation Sans, Arial, sans-serif" fontWeight={700} fontSize={64} fill="#FFFFFF">EFFORT</text>
            <g transform="translate(520 470) scale(-1 1) translate(-520 -470)">
              <Pal x={520} y={470} scale={1.75} face={FACES.angry} {...strain(7, 1)} {...fig} />
            </g>
            {[[420, 260], [380, 310], [400, 365]].map(([x, y], i) => <path key={i} d={`M${x} ${y} q-14 24 0 32 q14 -8 0 -32 Z`} fill="#8FC7E8" stroke={LN} strokeWidth={3} />)}
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
