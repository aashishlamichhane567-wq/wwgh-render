import React from "react";
import { AbsoluteFill } from "remotion";
import { FACES, Person } from "./cast";
import { C } from "./kit";
import { INK, PaperDefs, PaperLabel, PaperTexture, torn, usePaperFonts } from "../Puppet/paper";
import { MapView, at, reg } from "./map";

/** One half of the thumbnail: a full 1920x1080 map scaled to 720 high and cropped to 640 wide. */
const Half: React.FC<{ left: number; children: React.ReactNode }> = ({ left, children }) => (
  <div style={{ position: "absolute", left, top: 0, width: 640, height: 720, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: -320, top: 0, width: 1920, height: 1080, transform: "scale(0.6667)", transformOrigin: "0 0" }}>{children}</div>
  </div>
);

/** YouTube thumbnail (1280x720): the series' split "then | today" satellite map with a paper Viking and a paper cosmonaut. */
export const Thumb: React.FC = () => {
  usePaperFonts();
  return (
  <AbsoluteFill style={{ background: INK }}>
    <Half left={0}><MapView cam={at([34, 54], 2.4)} year="900" regions={[reg(900, "Kyivan Rus", C.red)]} /></Half>
    <Half left={640}><MapView cam={at([100, 60], 0.72)} year="1994" regions={[reg(1994, "Russia", C.red)]} /></Half>
    <svg viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0 }}>
      <PaperDefs />
      <path d={torn(628, -20, 24, 760, 4, 4, 30)} fill="#F3E6C4" filter="url(#cut)" />
      <PaperLabel x={320} y={90} t={1} text="862" size={84} rot={-4} seed={3} />
      <PaperLabel x={960} y={90} t={1} text="TODAY" size={84} rot={3} seed={8} />
      <Person who="viking" x={150} ground={800} f={0} s={2.1} face={FACES.smug} />
      <Person who="gagarin" x={1150} ground={800} f={0} s={2.1} face={FACES.shocked} />
      <g transform="translate(640 600) rotate(-3)">
        <path d={torn(-250, -95, 500, 170, 21, 8, 22)} fill={C.red} stroke={INK} strokeWidth={3} filter="url(#cut)" />
        <text x={0} y={52} textAnchor="middle" fontFamily="Ruslan" fontSize={150} fill="#F3E6C4">HOW?!</text>
      </g>
    </svg>
    <PaperTexture op={0.25} />
  </AbsoluteFill>
  );
};
