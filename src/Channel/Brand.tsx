import React from "react";
import { AbsoluteFill } from "remotion";
import { FACES, Person, type Who } from "../Russia/cast";
import { C } from "../Russia/kit";
import { MapView, at, reg } from "../Russia/map";
import { INK, PaperDefs, PaperLabel, PaperTexture, torn, usePaperFonts } from "../Puppet/paper";

/**
 * Cognalyst channel art in the episodes' paper-theatre look.
 *   Banner 2560x1440: phones show only the centre 1546x423 (x 507-2053, y 508-931), desktop the full-width band at that
 *   height, TVs everything. So title, tagline and puppets all live in the safe box; the map just fills the rest.
 *   AvatarA (Viking mascot) / AvatarB ("C" monogram), 800x800, shown as a circle as small as 36 px.
 */

const HOT = "#E5301C";
const YELLOW = "#FFD23F";
const CREAM = "#F3E6C4";
const NATIONS: [string, string][] = [["Russia", HOT], ["China", YELLOW], ["Kazakhstan", "#3FA7A0"], ["Mongolia", "#E8892E"],
  ["Ukraine", "#6C8CC7"], ["Poland", "#C25A8A"], ["Finland", "#8FBF5A"], ["Uzbekistan", "#B07ACB"], ["Turkmenistan", "#D9B46A"]];

const Title: React.FC<{ x: number; y: number; size: number }> = ({ x, y, size }) => {
  const w = 8.6 * size * 0.62 + 90;
  return (
    <g transform={`translate(${x} ${y}) rotate(-2)`}>
      <path d={torn(-w / 2, -size * 0.74, w, size * 1.22, 17, 9, 24)} fill={C.red} stroke={INK} strokeWidth={5} filter="url(#cut)" />
      {/* Oswald, not Ruslan: Ruslan's Y reads as a Cyrillic letter, and the channel name must read at a glance */}
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily="Oswald" fontWeight={700} letterSpacing={size * 0.06} fontSize={size} fill={CREAM}>COGNALYST</text>
    </g>
  );
};

const CAST: [Who, keyof typeof FACES, number][] = [["viking", "smug", 590], ["khan", "angry", 705], ["napoleon", "annoyed", 1855], ["gagarin", "happy", 1970]];

export const Banner: React.FC = () => {
  usePaperFonts();
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: "absolute", width: 1920, height: 1080, transform: "scale(1.3333)", transformOrigin: "0 0" }}>
        <MapView cam={at([92, 47], 0.92)} year="1994" regions={NATIONS.map(([n, c]) => reg(1994, n, c))} />
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.15) 30%, rgba(10,6,4,0.7) 100%)" }} />
      <svg viewBox="0 0 2560 1440" style={{ position: "absolute", inset: 0 }}>
        <PaperDefs />
        {CAST.map(([who, face, x], i) => (
          <Person key={who} who={who} x={x} ground={922} f={0} s={1.3} face={FACES[face]} flip={i >= 2} />
        ))}
        <Title x={1280} y={655} size={130} />
        <PaperLabel x={1280} y={800} t={1} text="THE ENTIRE HISTORY OF EVERY COUNTRY" size={50} rot={1} seed={5} />
        <PaperLabel x={1280} y={880} t={1} text="NEW EPISODE EVERY WEEK" size={40} rot={-1.5} seed={9} color={C.red} />
      </svg>
      <PaperTexture op={0.18} />
    </AbsoluteFill>
  );
};

/** A: the shocked Viking from the thumbnails as the channel's mascot. B: a cut-paper "C". */
export const Avatar: React.FC<{ v?: "A" | "B" }> = ({ v = "A" }) => {
  usePaperFonts();
  return (
    <AbsoluteFill style={{ background: v === "A" ? YELLOW : INK }}>
      <svg viewBox="0 0 800 800" style={{ position: "absolute", inset: 0 }}>
        <PaperDefs />
        {v === "A" ? (
          <Person who="viking" x={400} ground={1700} f={0} s={8} face={FACES.shocked} />
        ) : (
          <>
            <path d={torn(110, 110, 580, 580, 23, 10, 26)} fill={C.red} stroke={INK} strokeWidth={8} filter="url(#cut)" />
            <text x={400} y={575} textAnchor="middle" fontFamily="Ruslan" fontSize={500} fill={CREAM}>C</text>
          </>
        )}
      </svg>
      <PaperTexture op={0.15} />
    </AbsoluteFill>
  );
};
