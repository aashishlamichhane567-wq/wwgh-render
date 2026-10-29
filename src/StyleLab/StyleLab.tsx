import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import M from "../Russia/maps.json";
import { proj } from "../Russia/map";

/**
 * Style exploration for the channel's next look: four still frames of the Russia story in candidate styles.
 *   frame 0  paper puppet theatre (cut paper, brass-fastener joints)        — Vikings invited, 862
 *   frame 1  illuminated manuscript (era style for medieval Rus)              — Ivan the Terrible
 *   frame 2  constructivist poster (era style for the Soviet period)          — 1917
 *   frame 3  engraved old map (era style for maps)                            — Kievan Rus
 * Everything is code-drawn SVG, so it animates in the same Remotion pipeline as the stick-figure episodes.
 */

const FONTS: [string, string][] = [
  ["Ruslan", "fonts/RuslanDisplay-Regular.ttf"], ["Oswald", "fonts/Oswald-Variable.ttf"], ["Kalam", "fonts/Kalam-Bold.ttf"], ["Fraktur", "fonts/UnifrakturMaguntia-Book.ttf"],
];
const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all(FONTS.map(([n, p]) => new FontFace(n, `url(${staticFile(p)})`).load().then((f) => document.fonts.add(f)))).then(() => continueRender(handle));
  }, [handle]);
};

const rnd = (i: number) => {
  const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
};
/** Closed polygon along a rect with jittered (torn) edges. */
const torn = (x: number, y: number, w: number, h: number, seed: number, j = 6, step = 18) => {
  const pts: string[] = [];
  const edge = (x0: number, y0: number, x1: number, y1: number, k: number) => {
    const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let i = 0; i < n; i++) {
      const t = i / n, nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny) || 1;
      const d = (rnd(seed + k * 100 + i) - 0.5) * 2 * j;
      pts.push(`${(x0 + (x1 - x0) * t + (nx / l) * d).toFixed(1)},${(y0 + (y1 - y0) * t + (ny / l) * d).toFixed(1)}`);
    }
  };
  edge(x, y, x + w, y, 1); edge(x + w, y, x + w, y + h, 2); edge(x + w, y + h, x, y + h, 3); edge(x, y + h, x, y, 4);
  return `M${pts.join(" L")} Z`;
};
/** A wavy top edge filled downwards (hills, sea). */
const ridge = (x0: number, x1: number, y: number, amp: number, seed: number, bottom = 1200, step = 40) => {
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += step) pts.push(`${x},${(y + Math.sin(x / 210 + seed) * amp + (rnd(seed + x) - 0.5) * amp * 0.5).toFixed(1)}`);
  return `M${x0},${bottom} L${pts.join(" L")} L${x1},${bottom} Z`;
};

const Defs: React.FC = () => (
  <defs>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="4" result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.18  0 0 0 0.55 0" />
    </filter>
    <filter id="fibres" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.09" numOctaves="2" seed="9" result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0.35 0" />
    </filter>
    <filter id="cut" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="5" dy="8" stdDeviation="4" floodColor="#2A1E12" floodOpacity="0.38" />
    </filter>
    <filter id="cutSoft" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="3" dy="5" stdDeviation="3" floodColor="#2A1E12" floodOpacity="0.3" />
    </filter>
    <pattern id="halftone" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
      <circle cx="7" cy="7" r="3.2" fill="#1A1210" opacity="0.35" />
    </pattern>
    <pattern id="mail" width="12" height="10" patternUnits="userSpaceOnUse">
      <circle cx="6" cy="5" r="3.2" fill="none" stroke="#5E6670" strokeWidth="1.6" />
    </pattern>
    <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
      <line x1="0" y1="0" x2="0" y2="10" stroke="#5B4A33" strokeWidth="1.3" opacity="0.55" />
    </pattern>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#E9C866" /><stop offset="0.45" stopColor="#C9A23A" /><stop offset="0.7" stopColor="#E3C25E" /><stop offset="1" stopColor="#A9822A" />
    </linearGradient>
    <radialGradient id="burn" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#5A3A16" stopOpacity="0.55" />
    </radialGradient>
  </defs>
);
const Grain: React.FC<{ op?: number; fibres?: boolean }> = ({ op = 1, fibres }) => (
  <>
    <rect width={1920} height={1080} filter="url(#grain)" opacity={0.5 * op} style={{ mixBlendMode: "multiply" }} />
    {fibres ? <rect width={1920} height={1080} filter="url(#fibres)" opacity={0.6 * op} style={{ mixBlendMode: "multiply" }} /> : null}
  </>
);

/* ─────────────── A. Paper puppet theatre ─────────────── */

const INK = "#2A1E14";
const Brad: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 7 }) => (
  <g><circle cx={x} cy={y} r={r} fill="#C9A23A" stroke={INK} strokeWidth={2} /><circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#F3DE94" /></g>
);
type Look = { tunic: string; trim: string; skin: string; hair: string; beard?: string; hat?: "fur" | "helm"; mail?: boolean };
/** Cut-paper puppet: limbs are separate pieces pinned with brass fasteners (so they can rotate when animated). */
const Puppet: React.FC<{ x: number; y: number; k?: number; look: Look; armL?: number; armR?: number; face?: "happy" | "shock" | "smug" | "argue"; flip?: boolean; seed: number }> = ({
  x, y, k = 1, look, armL = 10, armR = -10, face = "happy", flip, seed,
}) => {
  const arm = (side: 1 | -1, ang: number) => (
    <g transform={`rotate(${ang} ${side * 46} -150)`} filter="url(#cutSoft)">
      <path d={`M${side * 46 - 16} -160 Q${side * 46} -170 ${side * 46 + 16} -160 L${side * 46 + 14} -60 Q${side * 46} -46 ${side * 46 - 14} -60 Z`} fill={look.tunic} stroke={INK} strokeWidth={2.5} />
      <circle cx={side * 46} cy={-52} r={15} fill={look.skin} stroke={INK} strokeWidth={2.5} />
      <Brad x={side * 46} y={-150} r={6} />
    </g>
  );
  const mouth = face === "happy" ? "M-16 -238 Q0 -224 16 -238" : face === "smug" ? "M-14 -236 Q4 -230 16 -242" : face === "argue" ? "M-14 -232 Q0 -246 14 -232 Z" : "M-9 -240 a9 11 0 1 0 18 0 a9 11 0 1 0 -18 0";
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k})`}>
      {/* legs */}
      <g filter="url(#cutSoft)">
        <path d="M-34 -40 L-14 -40 L-16 0 L-38 0 Z" fill="#4A3A2C" stroke={INK} strokeWidth={2.5} />
        <path d="M14 -40 L34 -40 L38 0 L16 0 Z" fill="#4A3A2C" stroke={INK} strokeWidth={2.5} />
        <path d="M-44 0 L-12 0 L-12 -10 L-40 -12 Z M12 0 L46 0 L42 -12 L12 -10 Z" fill="#2E241A" />
      </g>
      {arm(-1, armL)}
      {/* tunic */}
      <g filter="url(#cut)">
        <path d={`M-48 -170 Q0 -186 48 -170 L60 -36 Q0 -24 -60 -36 Z`} fill={look.mail ? "#9AA3AB" : look.tunic} stroke={INK} strokeWidth={3} />
        {look.mail ? <path d="M-48 -170 Q0 -186 48 -170 L60 -36 Q0 -24 -60 -36 Z" fill="url(#mail)" /> : null}
        <path d="M-58 -50 Q0 -38 58 -50 L60 -36 Q0 -24 -60 -36 Z" fill={look.trim} />
        <rect x={-52} y={-108} width={104} height={14} fill="#5A3A22" stroke={INK} strokeWidth={2} />
        <rect x={-8} y={-110} width={16} height={18} fill="#C9A23A" stroke={INK} strokeWidth={2} />
        {Array.from({ length: 5 }, (_, i) => <line key={i} x1={-40 + i * 20} y1={-168 + (i % 2) * 6} x2={-44 + i * 22} y2={-120} stroke={INK} strokeWidth={1} opacity={0.18} />)}
      </g>
      {arm(1, armR)}
      {/* head */}
      <g filter="url(#cut)">
        <path d={`M-38 -250 Q-40 -300 0 -304 Q40 -300 38 -250 Q36 -206 0 -202 Q-36 -206 -38 -250 Z`} fill={look.skin} stroke={INK} strokeWidth={3} />
        {look.beard ? <path d="M-36 -246 Q-30 -196 0 -186 Q30 -196 36 -246 Q20 -226 0 -228 Q-20 -226 -36 -246 Z" fill={look.beard} stroke={INK} strokeWidth={2.5} /> : null}
        <ellipse cx={-22} cy={-240} rx={8} ry={5} fill="#E08A7A" opacity={0.5} />
        <ellipse cx={22} cy={-240} rx={8} ry={5} fill="#E08A7A" opacity={0.5} />
        {face === "shock" ? (
          <><circle cx={-14} cy={-262} r={9} fill="#FFF" stroke={INK} strokeWidth={2} /><circle cx={14} cy={-262} r={9} fill="#FFF" stroke={INK} strokeWidth={2} /><circle cx={-14} cy={-262} r={3.5} fill={INK} /><circle cx={14} cy={-262} r={3.5} fill={INK} /></>
        ) : (
          <><ellipse cx={-14} cy={-262} rx={5} ry={6.5} fill={INK} /><ellipse cx={14} cy={-262} rx={5} ry={6.5} fill={INK} /></>
        )}
        <path d={face === "argue" ? "M-26 -276 L-6 -270 M26 -276 L6 -270" : face === "shock" ? "M-24 -282 L-6 -284 M24 -282 L6 -284" : "M-24 -278 L-6 -280 M24 -278 L6 -280"} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <path d="M0 -258 Q-6 -246 2 -244" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
        <path d={mouth} fill={face === "shock" || face === "argue" ? "#5A1E14" : "none"} stroke={INK} strokeWidth={3} strokeLinecap="round" />
        {look.hat === "fur" ? (
          <><path d="M-40 -280 Q-38 -330 0 -332 Q38 -330 40 -280 Z" fill={look.hair} stroke={INK} strokeWidth={2.5} /><path d={torn(-46, -290, 92, 18, seed, 3, 8)} fill="#7A5A3A" stroke={INK} strokeWidth={2} /></>
        ) : look.hat === "helm" ? (
          <><path d="M-40 -276 Q-40 -334 0 -338 Q40 -334 40 -276 Z" fill="#8E969E" stroke={INK} strokeWidth={3} /><path d="M0 -338 L0 -276 M-38 -298 L38 -298" stroke={INK} strokeWidth={2} opacity={0.6} /><rect x={-5} y={-280} width={10} height={34} fill="#8E969E" stroke={INK} strokeWidth={2} /></>
        ) : (
          <path d="M-40 -262 Q-44 -312 0 -310 Q44 -312 40 -262 Q30 -292 0 -290 Q-30 -292 -40 -262 Z" fill={look.hair} stroke={INK} strokeWidth={2.5} />
        )}
      </g>
    </g>
  );
};

const PaperTheatre: React.FC = () => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
    <Defs />
    <rect width={1920} height={1080} fill="#CFE0DF" />
    <circle cx={1500} cy={210} r={90} fill="#F3D27A" filter="url(#cutSoft)" />
    <path d={ridge(-50, 1970, 560, 50, 1)} fill="#A9BFA3" filter="url(#cut)" />
    <path d={ridge(-50, 1970, 650, 34, 7)} fill="#8DAA86" filter="url(#cut)" />
    {[-30, 90, 200, 1820].map((x, i) => (
      <g key={x} transform={`translate(${x} ${720 + (i % 2) * 20}) scale(${1.1 + (i % 3) * 0.2})`} filter="url(#cut)">
        <rect x={-10} y={-40} width={20} height={44} fill="#6A4A2C" />
        {[0, 1, 2].map((j) => <path key={j} d={`M${-74 + j * 16} ${-30 - j * 62} L0 ${-140 - j * 62} L${74 - j * 16} ${-30 - j * 62} Z`} fill={["#4E7350", "#5B8257", "#679161"][j]} stroke={INK} strokeWidth={2} />)}
      </g>
    ))}
    <g transform="translate(330 800)" filter="url(#cut)">
      <rect x={-110} y={-150} width={220} height={150} fill="#B07A4A" stroke={INK} strokeWidth={3} />
      {[-120, -90, -60, -30].map((y) => <line key={y} x1={-110} y1={y} x2={110} y2={y} stroke={INK} strokeWidth={1.5} opacity={0.35} />)}
      <path d="M-140 -140 L0 -250 L140 -140 Z" fill="#7A4A2A" stroke={INK} strokeWidth={3} />
      <rect x={-26} y={-80} width={52} height={80} fill="#4A2E1A" stroke={INK} strokeWidth={2} />
    </g>
    <path d={ridge(-50, 1970, 800, 6, 3, 1200, 30)} fill="#C2A878" filter="url(#cut)" />
    {/* sea, right side */}
    <path d={`M1080 1200 L1080 ${845} ${Array.from({ length: 22 }, (_, i) => `Q${1100 + i * 40} ${825} ${1120 + i * 40} ${845}`).join(" ")} L2000 1200 Z`} fill="#5C8EA6" filter="url(#cut)" />
    {/* longship */}
    <g transform="translate(1480 860) rotate(-2)">
      <g filter="url(#cut)">
        <line x1={0} y1={-20} x2={0} y2={-420} stroke="#5A3A22" strokeWidth={14} />
        <path d={torn(-170, -400, 340, 260, 31, 5, 22)} fill="#F1E3C6" stroke={INK} strokeWidth={3} />
        {[-130, -50, 30, 110].map((x) => <rect key={x} x={x} y={-398} width={36} height={256} fill="#B8352A" />)}
      </g>
      <Puppet x={-40} y={-30} k={0.95} seed={21} face="smug" armR={-120} look={{ tunic: "#7A2E22", trim: "#C9A23A", skin: "#EBC7A4", hair: "#B8552E", beard: "#C8642E", hat: "helm", mail: true }} />
      <g filter="url(#cut)">
        <path d="M-330 -60 Q-200 40 0 40 Q200 40 330 -60 L300 -30 Q170 10 0 10 Q-170 10 -300 -30 Z" fill="#8A5A34" stroke={INK} strokeWidth={3} />
        <path d="M-330 -60 Q-200 40 0 40 Q200 40 330 -60" fill="none" stroke="#5A3A22" strokeWidth={6} />
        <path d="M330 -60 Q370 -120 350 -170 Q340 -200 365 -205 Q395 -195 380 -160 Q365 -130 345 -110" fill="#8A5A34" stroke={INK} strokeWidth={3} />
        <circle cx={368} cy={-188} r={4} fill={INK} />
      </g>
      {[-240, -160, -80, 80, 160, 240].map((x, i) => (
        <g key={x} filter="url(#cutSoft)"><circle cx={x} cy={-18} r={30} fill={["#C8452D", "#E3B341", "#2F6E8E"][i % 3]} stroke={INK} strokeWidth={3} /><Brad x={x} y={-18} r={8} /></g>
      ))}
    </g>
    <path d={`M1060 1200 L1060 940 ${Array.from({ length: 23 }, (_, i) => `Q${1080 + i * 40} 920 ${1100 + i * 40} 940`).join(" ")} L2000 1200 Z`} fill="#4A7C95" filter="url(#cut)" />
    {/* tribesmen */}
    <Puppet x={620} y={880} k={1.05} seed={5} face="argue" armL={40} armR={-75} look={{ tunic: "#B9822E", trim: "#7A2E22", skin: "#E7C09A", hair: "#6B4A2B", beard: "#6B4A2B", hat: "fur" }} />
    <Puppet x={800} y={895} k={1.05} seed={6} face="argue" armL={70} armR={-30} flip look={{ tunic: "#5E7F4E", trim: "#E3B341", skin: "#DDB08A", hair: "#3A2A1C", hat: "fur" }} />
    <Puppet x={980} y={880} k={1.05} seed={7} face="shock" armL={150} armR={-150} look={{ tunic: "#9A3B2E", trim: "#E8D8B0", skin: "#EBC7A4", hair: "#A0703F", beard: "#A0703F" }} />
    {/* bubble */}
    <g filter="url(#cut)">
      <path d={torn(560, 180, 520, 170, 51, 6, 20)} fill="#FBF4E2" stroke={INK} strokeWidth={3} />
      <path d="M760 345 L720 420 L820 348 Z" fill="#FBF4E2" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    </g>
    <text x={820} y={250} textAnchor="middle" fontFamily="Kalam" fontSize={58} fill={INK}>Come and rule</text>
    <text x={820} y={318} textAnchor="middle" fontFamily="Kalam" fontSize={58} fill="#B8352A">over us!!</text>
    {/* year tag */}
    <g transform="rotate(-4 170 120)" filter="url(#cut)"><path d={torn(70, 60, 220, 110, 77, 5, 14)} fill="#F3E6C4" stroke={INK} strokeWidth={2} /></g>
    <text x={180} y={146} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={84} fill={INK} transform="rotate(-4 170 120)">862</text>
    <Grain fibres />
  </svg>
);

/* ─────────────── B. Illuminated manuscript ─────────────── */

const Manuscript: React.FC = () => {
  const RED = "#9E2A1E", BLUE = "#2E4A86", GOLD = "url(#gold)";
  const lozenges = (x0: number, y0: number, n: number, dx: number, dy: number) => Array.from({ length: n }, (_, i) => (
    <path key={i} d={`M${x0 + i * dx} ${y0 + i * dy - 9} l9 9 l-9 9 l-9 -9 Z`} fill={i % 2 ? RED : BLUE} />
  ));
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
      <Defs />
      <rect width={1920} height={1080} fill="#E8D9B2" />
      <Grain fibres op={1.2} />
      {/* border */}
      <rect x={40} y={36} width={1840} height={1008} fill="none" stroke={RED} strokeWidth={4} />
      <rect x={58} y={54} width={1804} height={972} fill="none" stroke={GOLD} strokeWidth={14} />
      <rect x={76} y={72} width={1768} height={936} fill="none" stroke={BLUE} strokeWidth={3} />
      {lozenges(110, 63, 46, 38, 0)}{lozenges(110, 1017, 46, 38, 0)}
      {[[58, 54], [1862, 54], [58, 1026], [1862, 1026]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}><circle r={26} fill={GOLD} stroke={RED} strokeWidth={4} /><circle r={10} fill={BLUE} /></g>
      ))}
      {/* icon panel */}
      <g transform="translate(130 110)">
        <path d="M0 860 L0 160 Q0 0 330 0 Q660 0 660 160 L660 860 Z" fill={GOLD} stroke={RED} strokeWidth={6} />
        <path d="M0 860 L0 160 Q0 0 330 0 Q660 0 660 160 L660 860 Z" fill="url(#grain)" opacity={0.25} />
        {/* dark aureole: the irony of an icon frame for Ivan */}
        <circle cx={330} cy={250} r={150} fill="none" stroke="#5A1E14" strokeWidth={10} />
        <circle cx={330} cy={250} r={138} fill="none" stroke={RED} strokeWidth={3} strokeDasharray="6 10" />
        {/* robe */}
        <path d="M330 360 Q180 380 140 520 L90 860 L570 860 L520 520 Q480 380 330 360 Z" fill="#6E1A16" stroke="#2A0E0A" strokeWidth={5} />
        <path d="M330 380 L330 860" stroke={GOLD} strokeWidth={36} />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M330 ${410 + i * 50} l12 12 l-12 12 l-12 -12 Z`} fill={RED} />)}
        <path d="M160 600 Q330 640 500 600" fill="none" stroke={GOLD} strokeWidth={14} />
        {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={130 + i * 30} cy={840} r={5} fill={GOLD} />)}
        {/* hands + sceptre */}
        <line x1={470} y1={260} x2={430} y2={820} stroke="#3A220E" strokeWidth={14} strokeLinecap="round" />
        <circle cx={472} cy={244} r={20} fill={GOLD} stroke="#2A0E0A" strokeWidth={4} />
        <ellipse cx={445} cy={560} rx={26} ry={22} fill="#D9B48C" stroke="#2A0E0A" strokeWidth={4} />
        <ellipse cx={230} cy={570} rx={26} ry={22} fill="#D9B48C" stroke="#2A0E0A" strokeWidth={4} />
        {/* face: long, solemn, icon-like */}
        <path d="M330 170 Q262 172 262 262 Q264 340 330 352 Q396 340 398 262 Q398 172 330 170 Z" fill="#D9B48C" stroke="#2A0E0A" strokeWidth={4} />
        <path d="M268 280 Q280 420 330 470 Q380 420 392 280 Q362 316 330 314 Q298 316 268 280 Z" fill="#2B1A10" stroke="#2A0E0A" strokeWidth={3} />
        <path d="M296 300 Q330 290 364 300 Q330 312 296 300 Z" fill="#2B1A10" />
        <path d="M290 240 Q306 230 320 242 M340 242 Q354 230 370 240" fill="none" stroke="#2A0E0A" strokeWidth={6} strokeLinecap="round" />
        <path d="M294 254 Q306 248 318 256 Q306 262 294 254 Z M342 256 Q354 248 366 254 Q354 262 342 256 Z" fill="#FFF" stroke="#2A0E0A" strokeWidth={2.5} />
        <circle cx={307} cy={255} r={4.5} fill="#2A0E0A" /><circle cx={353} cy={255} r={4.5} fill="#2A0E0A" />
        <path d="M330 250 L326 286 Q330 292 336 288" fill="none" stroke="#2A0E0A" strokeWidth={3} />
        {/* Monomakh cap */}
        <path d="M262 200 Q262 110 330 104 Q398 110 398 200 Z" fill={GOLD} stroke="#2A0E0A" strokeWidth={4} />
        {[-40, 0, 40].map((dx) => <path key={dx} d={`M${330 + dx} 200 Q${330 + dx * 0.6} 140 330 106`} fill="none" stroke="#7A5A1A" strokeWidth={3} />)}
        <circle cx={300} cy={160} r={8} fill={RED} /><circle cx={360} cy={160} r={8} fill="#2E7A4A" /><circle cx={330} cy={135} r={8} fill={BLUE} />
        <rect x={250} y={190} width={160} height={30} rx={14} fill="#5A3A22" stroke="#2A0E0A" strokeWidth={4} />
        <path d="M330 104 L330 66 M314 82 L346 82" stroke="#2A0E0A" strokeWidth={7} strokeLinecap="round" />
      </g>
      {/* text column */}
      <g transform="translate(880 150)">
        <rect x={0} y={0} width={190} height={210} fill={GOLD} stroke={RED} strokeWidth={5} />
        <rect x={12} y={12} width={166} height={186} fill={BLUE} />
        {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={40 + (i % 3) * 55} cy={40 + Math.floor(i / 3) * 130} r={7} fill="#E3C25E" />)}
        <text x={95} y={178} textAnchor="middle" fontFamily="Liberation Serif" fontWeight={700} fontSize={190} fill="#F3D27A" stroke={RED} strokeWidth={4}>I</text>
        <text x={220} y={95} fontFamily="Ruslan" fontSize={92} fill={RED}>VAN</text>
        <text x={220} y={190} fontFamily="Ruslan" fontSize={76} fill={INK}>THE TERRIBLE</text>
        <text x={0} y={300} fontFamily="Ruslan" fontSize={46} fill={BLUE}>FIRST TSAR OF ALL RUS · 1547</text>
        {Array.from({ length: 6 }, (_, r) => (
          <path key={r} d={`M0 ${370 + r * 52} ${Array.from({ length: 30 }, (_, i) => `q${8 + rnd(r * 40 + i) * 8} ${(rnd(r * 9 + i) - 0.5) * 10} ${18 + rnd(r * 31 + i) * 10} 0`).join(" ")}`}
            fill="none" stroke="#3A2A1A" strokeWidth={3} opacity={0.55} />
        ))}
        <text x={0} y={720} fontFamily="Fraktur" fontSize={40} fill={RED}>Here beginneth the reign of terror.</text>
      </g>
      {/* marginal drollery: an oprichnik's dog head and broom, and the obligatory snail */}
      <g transform="translate(1500 900) scale(0.9)">
        <path d="M-50 -30 Q0 -70 50 -30 L90 -10 Q100 20 60 20 L-40 30 Q-70 10 -50 -30 Z" fill="#3A3A3A" stroke={INK} strokeWidth={4} />
        <path d="M-40 -40 L-60 -90 L-14 -54 Z" fill="#3A3A3A" stroke={INK} strokeWidth={3} />
        <circle cx={10} cy={-20} r={6} fill="#FFF" />
        <line x1={140} y1={-110} x2={140} y2={40} stroke="#6A4A2C" strokeWidth={9} strokeLinecap="round" />
        <path d="M110 110 L126 40 L154 40 L170 110 Z" fill="#C9A23A" stroke={INK} strokeWidth={4} />
      </g>
      <g transform="translate(1720 960) scale(0.8)">
        <path d="M-60 0 Q-60 -20 -20 -20 L40 -20 Q60 -20 60 0 Z" fill="#9AB06A" stroke={INK} strokeWidth={3} />
        <circle cx={10} cy={-46} r={34} fill="#C9A23A" stroke={INK} strokeWidth={3} />
        <path d="M10 -46 m-20 0 a20 20 0 1 0 20 -20 a12 12 0 1 0 12 12" fill="none" stroke={INK} strokeWidth={3} />
        <path d="M-50 -18 L-66 -46 M-40 -20 L-48 -50" stroke={INK} strokeWidth={3} />
      </g>
      <rect width={1920} height={1080} fill="url(#burn)" />
    </svg>
  );
};

/* ─────────────── C. Constructivist poster ─────────────── */

const Poster: React.FC = () => {
  const RED = "#C8281E", BLACK = "#1A1210", CREAM = "#EFE4CC";
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
      <Defs />
      <rect width={1920} height={1080} fill={CREAM} />
      <path d="M0 0 L1000 0 L700 1080 L0 1080 Z" fill={BLACK} />
      <circle cx={1420} cy={430} r={330} fill={CREAM} stroke={BLACK} strokeWidth={10} />
      <circle cx={1420} cy={430} r={330} fill="url(#halftone)" />
      {/* the red wedge (after El Lissitzky, 1919) */}
      <path d="M-40 980 L1300 420 L1180 360 Z" fill={RED} />
      <path d="M-40 980 L1300 420 L1180 360 Z" fill="url(#halftone)" opacity={0.6} />
      {/* crowd */}
      {Array.from({ length: 34 }, (_, i) => {
        const x = 40 + i * 56 + (i % 2) * 20, y = 1010 + (i % 3) * 18;
        return <g key={i}><circle cx={x} cy={y - 40} r={22} fill={i % 5 === 0 ? RED : BLACK} /><rect x={x - 26} y={y - 20} width={52} height={120} rx={18} fill={i % 5 === 0 ? RED : BLACK} /></g>;
      })}
      {/* tribune + orator silhouette */}
      <path d="M1100 1080 L1180 760 L1500 760 L1460 1080 Z" fill={RED} />
      <path d="M1100 1080 L1180 760 L1500 760 L1460 1080 Z" fill="url(#halftone)" />
      <g fill={BLACK}>
        <path d="M1300 760 L1320 560 Q1330 520 1370 515 L1420 520 Q1450 530 1446 570 L1430 760 Z" />
        <path d="M1330 560 L1180 470 L1168 490 L1320 600 Z" />
        <ellipse cx={1170} cy={472} rx={22} ry={16} />
        <circle cx={1395} cy={470} r={44} />
        <path d="M1352 455 Q1395 410 1442 452 L1450 440 Q1395 392 1344 440 Z" />
        <path d="M1372 498 Q1392 530 1410 500" />
      </g>
      <text x={90} y={390} fontFamily="Oswald" fontWeight={700} fontSize={300} fill={RED} transform="rotate(-12 90 390)">1917</text>
      <text x={150} y={520} fontFamily="Oswald" fontWeight={700} fontSize={84} fill={CREAM} transform="rotate(-12 150 520)">ALL POWER</text>
      <text x={190} y={610} fontFamily="Oswald" fontWeight={700} fontSize={84} fill={CREAM} transform="rotate(-12 190 610)">TO THE SOVIETS</text>
      <text x={1420} y={300} textAnchor="middle" fontFamily="Oswald" fontWeight={600} fontSize={52} fill={BLACK}>ВСЯ ВЛАСТЬ СОВЕТАМ</text>
      <rect x={1600} y={60} width={260} height={60} fill={BLACK} />
      <text x={1730} y={104} textAnchor="middle" fontFamily="Oswald" fontWeight={600} fontSize={40} fill={CREAM}>LENIN</text>
      <Grain op={0.9} />
    </svg>
  );
};

/* ─────────────── D. Engraved old map ─────────────── */

const MAPS = M as unknown as { land: string; lakes: string; rivers: Record<string, string>; years: Record<string, Record<string, string>> };

const OldMap: React.FC = () => {
  const s = 2.3;
  const [cx, cy] = proj([32, 51]);
  const t = `translate(${960 - s * cx} ${540 - s * cy}) scale(${s})`;
  const ink = "#3A2A18";
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
      <Defs />
      <rect width={1920} height={1080} fill="#B9C3AE" />
      <rect width={1920} height={1080} fill="url(#hatch)" opacity={0.8} />
      <g transform={t}>
        {/* coastal echo lines, the engraver's water lining */}
        {[9, 6, 3].map((w, i) => <path key={w} d={MAPS.land} fill="none" stroke={ink} strokeWidth={w / s} opacity={0.12 + i * 0.06} />)}
        <path d={MAPS.land} fill="#EDE0BC" />
        <path d={MAPS.land} fill="none" stroke={ink} strokeWidth={2.2} vectorEffect="non-scaling-stroke" />
        {Object.values(MAPS.rivers).map((d, i) => <path key={i} d={d} fill="none" stroke="#4A6A7A" strokeWidth={1.8 / s} />)}
        <path d={MAPS.years["900"]!["Kyivan Rus"]} fill="#B8352A" opacity={0.35} stroke="#B8352A" strokeWidth={3 / s} strokeDasharray={`${8 / s} ${5 / s}`} />
        <path d={MAPS.years["900"]!["Byzantine Empire"]} fill="#5A4A86" opacity={0.22} stroke="#5A4A86" strokeWidth={2.5 / s} strokeDasharray={`${8 / s} ${5 / s}`} />
        <path d={MAPS.lakes} fill="#B9C3AE" stroke={ink} strokeWidth={1.4 / s} />
      </g>
      {[[[31.3, 58.5], "Novgorod"], [[30.5, 50.45], "Kiev"], [[29, 41], "Constantinople"]].map(([ll, n]) => {
        const [x, y] = proj(ll as [number, number]);
        const X = 960 + s * (x - cx), Y = 540 + s * (y - cy);
        return (
          <g key={n as string}>
            <path d={`M${X} ${Y - 26} l14 18 l0 18 l-28 0 l0 -18 Z`} fill="#B8352A" stroke={ink} strokeWidth={2.5} />
            <text x={X + 22} y={Y + 8} fontFamily="Fraktur" fontSize={44} fill={ink}>{n as string}</text>
          </g>
        );
      })}
      <text x={960} y={470} textAnchor="middle" fontFamily="Ruslan" fontSize={70} fill="#8E2A1E" letterSpacing={10} opacity={0.85}>RVS</text>
      {/* compass rose */}
      <g transform="translate(1660 820)">
        <circle r={110} fill="none" stroke={ink} strokeWidth={3} /><circle r={96} fill="none" stroke={ink} strokeWidth={1.5} />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d="M0 -100 L14 -14 L0 0 L-14 -14 Z" fill={i % 2 ? "#E2D2A8" : "#8E2A1E"} stroke={ink} strokeWidth={2} transform={`rotate(${i * 45}) scale(${i % 2 ? 0.7 : 1})`} />
        ))}
        <text y={-124} textAnchor="middle" fontFamily="Fraktur" fontSize={40} fill={ink}>N</text>
      </g>
      {/* sea serpent in the Black Sea's neighbour, as one does */}
      <g transform="translate(260 900)" fill="#5A7A5A" stroke={ink} strokeWidth={3}>
        {[0, 1, 2].map((i) => <path key={i} d={`M${i * 90} 0 q20 -70 45 0`} fill="none" strokeWidth={22} stroke="#5A7A5A" />)}
        {[0, 1, 2].map((i) => <path key={`o${i}`} d={`M${i * 90} 0 q20 -70 45 0`} fill="none" strokeWidth={3} />)}
        <path d="M-40 -20 Q-10 -60 20 -10 L-10 0 Z" /><circle cx={-12} cy={-28} r={4} fill={ink} />
        <path d="M270 0 l40 -30 l-6 30 Z" />
      </g>
      {/* cartouche */}
      <g transform="translate(110 70)">
        <path d={torn(0, 0, 640, 170, 88, 4, 30)} fill="#EFE3C2" stroke={ink} strokeWidth={4} />
        <rect x={16} y={16} width={608} height={138} fill="none" stroke="#8E2A1E" strokeWidth={2} />
        <text x={320} y={80} textAnchor="middle" fontFamily="Fraktur" fontSize={56} fill={ink}>Tabula Russiae</text>
        <text x={320} y={134} textAnchor="middle" fontFamily="Ruslan" fontSize={40} fill="#8E2A1E">ANNO DOMINI 882</text>
      </g>
      <rect width={1920} height={1080} fill="url(#burn)" />
      <Grain fibres />
    </svg>
  );
};

export const StyleLab: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: "#000" }}>{[<PaperTheatre key="a" />, <Manuscript key="b" />, <Poster key="c" />, <OldMap key="d" />][f]}</AbsoluteFill>;
};
