import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FACES, Person } from "./cast";
import { C } from "./kit";
import { INK, PaperDefs, PaperLabel, PaperTexture, torn, usePaperFonts } from "../Puppet/paper";
import { MapView, at, reg } from "./map";

/**
 * YouTube thumbnails (1280x720), three variants for YouTube's Test & Compare. Each follows a pattern that already works
 * in the niche: one or two big expressive faces, 1–3 words, a saturated red country on a dark satellite map, and nothing
 * in the bottom-right corner (YouTube's timestamp covers it). Everything must still read at 320 px wide.
 *   A  "then vs today" split: tiny 862 Rus vs today's Russia, a shocked Viking, HOW?!
 *   B  map-channel style: the whole red country, a giant shocked Viking face, "VIKINGS DID THIS?"
 *   C  the cast lineup: Viking, Mongol, Tsar, Soviet in torn cards over the red map, "1,100 YEARS"
 */

const YELLOW = "#FFD23F";
const CREAM = "#F3E6C4";
const HOT = "#E5301C"; // more saturated than the video's map red, for small-size pop

/** A full 1920x1080 map scaled to the thumbnail's height, cropped to `w` wide, offset by `dx` source pixels. */
const MapCrop: React.FC<{ left: number; w: number; dx?: number; children: React.ReactNode }> = ({ left, w, dx = 0, children }) => (
  <div style={{ position: "absolute", left, top: 0, width: w, height: 720, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: -dx * 0.6667, top: 0, width: 1920, height: 1080, transform: "scale(0.6667)", transformOrigin: "0 0" }}>{children}</div>
  </div>
);

/** Darkens the frame edges so the red country and the faces pop. */
const Vignette: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(10,6,4,0.65) 100%)" }} />
);

/** Big headline: cream or yellow display letters with a thick ink outline, on an optional torn red strip. */
const Headline: React.FC<{ x: number; y: number; text: string; size: number; rot?: number; strip?: boolean; color?: string; w?: number; oswald?: boolean }> = ({
  x, y, text, size, rot = -3, strip = true, color = CREAM, w, oswald,
}) => {
  const width = w ?? text.length * size * (oswald ? 0.5 : 0.62) + 80;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {strip ? <path d={torn(-width / 2, -size * 0.72, width, size * 1.2, 21, 8, 22)} fill={C.red} stroke={INK} strokeWidth={4} filter="url(#cut)" /> : null}
      <text x={0} y={size * (oswald ? 0.36 : 0.3)} textAnchor="middle" fontFamily={oswald ? "Oswald" : "Ruslan"} fontWeight={oswald ? 700 : undefined}
        fontSize={size} fill={color} stroke={INK} strokeWidth={strip ? 0 : size * 0.12}
        paintOrder="stroke" strokeLinejoin="round">{text}</text>
    </g>
  );
};

const ThumbA: React.FC = () => (
  <>
    <MapCrop left={0} w={500} dx={710}><MapView cam={at([34, 54], 2.4)} year="900" regions={[reg(900, "Kyivan Rus", HOT)]} /></MapCrop>
    <MapCrop left={500} w={780} dx={560}><MapView cam={at([96, 60], 0.66)} year="1994" regions={[reg(1994, "Russia", HOT)]} /></MapCrop>
    <Vignette />
    <svg viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0 }}>
      <PaperDefs />
      <path d={torn(492, -20, 18, 760, 4, 4, 30)} fill={CREAM} filter="url(#cut)" />
      <PaperLabel x={250} y={74} t={1} text="862" size={78} rot={-4} seed={3} />
      <PaperLabel x={890} y={74} t={1} text="TODAY" size={78} rot={3} seed={8} />
      {/* arrow from the tiny state to the giant one */}
      <path d="M300 250 C 430 160, 560 160, 690 230" fill="none" stroke={YELLOW} strokeWidth={22} strokeLinecap="round" filter="url(#cut)" />
      <path d="M655 180 L 735 242 L 645 275 Z" fill={YELLOW} filter="url(#cut)" />
      <Person who="viking" x={560} ground={1180} f={0} s={4.6} face={FACES.shocked} />
      <Headline x={960} y={500} text="HOW?!" size={150} rot={-4} />
    </svg>
  </>
);

const ThumbB: React.FC = () => (
  <>
    <MapCrop left={0} w={1280}><MapView cam={at([98, 58], 0.62)} year="1994" regions={[reg(1994, "Russia", HOT)]} /></MapCrop>
    <Vignette />
    <svg viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0 }}>
      <PaperDefs />
      <Person who="viking" x={250} ground={1150} f={0} s={5.6} face={FACES.shocked} />
      <Headline x={830} y={150} text="VIKINGS" size={130} rot={-3} strip={false} color={YELLOW} />
      <Headline x={860} y={300} text="DID THIS?" size={120} rot={-3} />
    </svg>
  </>
);

const CARD: [string, string, keyof typeof FACES][] = [["viking", "VIKINGS", "smug"], ["khan", "MONGOLS", "angry"], ["ivan", "TSARS", "annoyed"], ["stalin", "SOVIETS", "smug"]];

const ThumbC: React.FC = () => (
  <>
    <MapCrop left={0} w={1280}><MapView cam={at([98, 58], 0.62)} year="1994" regions={[reg(1994, "Russia", HOT)]} /></MapCrop>
    <Vignette />
    <svg viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0 }}>
      <PaperDefs />
      {CARD.map(([who, label, face], i) => {
        const x = 165 + i * 300, rot = [-5, 3, -3, 5][i]!;
        return (
          <g key={who} transform={`rotate(${rot} ${x} 300)`}>
            <path d={torn(x - 130, 110, 260, 330, 40 + i, 6, 18)} fill={CREAM} stroke={INK} strokeWidth={3} filter="url(#cut)" />
            <clipPath id={`card${i}`}><rect x={x - 122} y={118} width={244} height={260} /></clipPath>
            <g clipPath={`url(#card${i})`}>
              <rect x={x - 122} y={118} width={244} height={260} fill={["#9FB7C9", "#D9B46A", "#C98B6B", "#B8B2A6"][i]} />
              <Person who={who as never} x={x} ground={610} f={0} s={2.0} face={FACES[face]} />
            </g>
            <text x={x} y={418} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={44} fill={C.red}>{label}</text>
          </g>
        );
      })}
      <Headline x={560} y={590} text="1,100 YEARS" size={118} rot={-2} />
    </svg>
  </>
);

/**
 * v2 (after a viewer-eye review: B's "this" was unreadable, the puppets read as a kids' show, Ruslan's Y looks like a
 * typo). D and E put the episode's best-looking frames, the Flow paper-craft shots, full bleed under one odd fact.
 * F redoes A's "small became huge" on ONE map scale, so the contrast is real.
 */
const Frame: React.FC<{ src: string }> = ({ src }) => (
  <>
    <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: 1280, height: 720 }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,6,4,0.55) 0%, rgba(10,6,4,0) 45%)" }} />
  </>
);

const ThumbD: React.FC = () => (
  <>
    <Frame src="thumbsrc/vikings.png" />
    <svg viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0 }}>
      <PaperDefs />
      <Headline x={330} y={105} text="THEY INVITED" size={84} rot={-3} oswald />
      <Headline x={340} y={260} text="VIKINGS?!" size={150} rot={-3} strip={false} color={YELLOW} oswald />
    </svg>
  </>
);

const ThumbE: React.FC = () => (
  <>
    <Frame src="thumbsrc/moscow_fire.png" />
    <svg viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0 }}>
      <PaperDefs />
      <Headline x={640} y={95} text="RUSSIA BURNED" size={84} rot={-2} oswald />
      <Headline x={640} y={245} text="MOSCOW?!" size={150} rot={-2} strip={false} color={YELLOW} oswald />
    </svg>
  </>
);

const ThumbF: React.FC = () => (
  <>
    <MapCrop left={0} w={1280}>
      <MapView cam={at([90, 57], 0.62)} year="1994" regions={[reg(1994, "Russia", "#8A2A1E"), reg(900, "Kyivan Rus", YELLOW)]} />
    </MapCrop>
    <Vignette />
    <svg viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0 }}>
      <PaperDefs />
      <PaperLabel x={190} y={250} t={1} text="862" size={70} rot={-4} seed={3} />
      <path d="M215 300 L 300 370" stroke={YELLOW} strokeWidth={16} strokeLinecap="round" filter="url(#cut)" />
      <PaperLabel x={830} y={150} t={1} text="TODAY" size={70} rot={3} seed={8} />
      <Headline x={300} y={610} text="HOW?!" size={150} rot={-4} oswald />
    </svg>
  </>
);

const VARIANTS = { A: ThumbA, B: ThumbB, C: ThumbC, D: ThumbD, E: ThumbE, F: ThumbF };

export const Thumb: React.FC<{ v?: keyof typeof VARIANTS }> = ({ v = "A" }) => {
  usePaperFonts();
  const V = VARIANTS[v];
  return (
    <AbsoluteFill style={{ background: INK }}>
      <V />
      <PaperTexture op={0.18} />
    </AbsoluteFill>
  );
};
