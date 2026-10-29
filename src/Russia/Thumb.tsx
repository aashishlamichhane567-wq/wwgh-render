import React from "react";
import { AbsoluteFill } from "remotion";
import { FACES, Person } from "./cast";
import { C, FONT } from "./kit";
import { MapView, at, reg } from "./map";

/** One half of the thumbnail: a full 1920x1080 map scaled to 720 high and cropped to 640 wide. */
const Half: React.FC<{ left: number; children: React.ReactNode }> = ({ left, children }) => (
  <div style={{ position: "absolute", left, top: 0, width: 640, height: 720, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: -320, top: 0, width: 1920, height: 1080, transform: "scale(0.6667)", transformOrigin: "0 0" }}>{children}</div>
  </div>
);

/** YouTube thumbnail (1280x720): the series' split "then | today" satellite map with a Viking and a Soviet cosmonaut. */
export const Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: C.ink }}>
    <Half left={0}><MapView cam={at([34, 54], 2.4)} year="900" regions={[reg(900, "Kyivan Rus", C.red)]} /></Half>
    <Half left={640}><MapView cam={at([100, 60], 0.72)} year="1994" regions={[reg(1994, "Russia", C.red)]} /></Half>
    <div style={{ position: "absolute", left: 636, top: 0, width: 8, height: 720, background: "#FFFFFF" }} />
    {[["862", 320], ["TODAY", 960]].map(([t, x]) => (
      <div key={t} style={{ position: "absolute", left: (x as number) - 200, width: 400, top: 40, textAlign: "center" }}>
        <span style={{ background: C.ink, color: "#FFFFFF", fontFamily: FONT, fontWeight: 900, fontSize: 92, padding: "0 26px" }}>{t}</span>
      </div>
    ))}
    <svg viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id="thumbOutline" x="-10%" y="-10%" width="120%" height="120%">
          <feMorphology in="SourceAlpha" operator="dilate" radius={6} result="d" />
          <feFlood floodColor="#FFFFFF" />
          <feComposite in2="d" operator="in" result="o" />
          <feMerge><feMergeNode in="o" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g filter="url(#thumbOutline)">
        <Person who="viking" x={150} ground={800} f={0} s={2.1} face={FACES.smug} />
        <Person who="gagarin" x={1150} ground={800} f={0} s={2.1} face={FACES.shocked} />
      </g>
      <text x={640} y={660} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={150} fill="#FFFFFF" stroke={C.ink} strokeWidth={22} paintOrder="stroke" strokeLinejoin="round">HOW?!</text>
    </svg>
  </AbsoluteFill>
);
