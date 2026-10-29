import React from "react";
import { AbsoluteFill } from "remotion";
import { FACES, Person } from "./cast";
import { C, FONT } from "./kit";
import { MapView, at, reg } from "./map";

/** YouTube thumbnail (1280x720): the series' split "then | today" map with a Viking and a Soviet cosmonaut. */
export const Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 640, height: 720, overflow: "hidden" }}>
      <div style={{ width: 1280, height: 720, transform: "translateX(-320px)" }}>
        <MapView cam={at([36, 54], 2.5)} year="900" regions={[reg(900, "Kyivan Rus", C.red)]} />
      </div>
    </div>
    <div style={{ position: "absolute", left: 640, top: 0, width: 640, height: 720, overflow: "hidden" }}>
      <div style={{ width: 1280, height: 720, transform: "translateX(-320px)" }}>
        <MapView cam={at([100, 60], 0.72)} year="1994" regions={[reg(1994, "Russia", C.red)]} />
      </div>
    </div>
    <div style={{ position: "absolute", left: 636, top: 0, width: 8, height: 720, background: "#FFFFFF" }} />
    {[["862", 320], ["TODAY", 960]].map(([t, x]) => (
      <div key={t} style={{ position: "absolute", left: (x as number) - 200, width: 400, top: 40, textAlign: "center" }}>
        <span style={{ background: C.ink, color: "#FFFFFF", fontFamily: FONT, fontWeight: 900, fontSize: 92, padding: "0 26px" }}>{t}</span>
      </div>
    ))}
    <svg viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0 }}>
      <Person who="viking" x={150} ground={800} f={0} s={2.1} face={FACES.smug} />
      <Person who="gagarin" x={1150} ground={800} f={0} s={2.1} face={FACES.shocked} />
      <text x={640} y={660} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={150} fill="#FFFFFF" stroke={C.ink} strokeWidth={22} paintOrder="stroke" strokeLinejoin="round">HOW?!</text>
    </svg>
  </AbsoluteFill>
);
