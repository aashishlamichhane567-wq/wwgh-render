import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { LOOKS } from "../Puppet/cast";
import { Brad, INK, PaperBubble, PaperDefs, PaperLabel, PaperTexture, rnd, ridge, torn, usePaperFonts } from "../Puppet/paper";
import { FACES, Puppet, blendFace, flap } from "../Puppet/rig";
import { ez, glide, mix, pop, span, wob } from "./kit";
import { MapView, P, at, reg } from "./map";
import { Captions, w } from "./overlays";
import { CAPS, SCENES } from "./timing";

/**
 * Pilot of the new look on the opening scene (same VO and word timing as the stick-figure hook): cut-paper puppets,
 * era-styled backdrops, satellite maps with paper labels, paper captions.
 */

const W = (x: string, n = 0) => w("hook", x, n);
/** [start, end] spans of the spoken words from `from` through `to` (for lip flaps). */
const words = (from: string, to: string): [number, number][] => {
  const caps = CAPS.hook!;
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, "");
  const a = caps.findIndex((c) => norm(c[2]) === norm(from)), b = caps.findIndex((c, i) => i >= a && norm(c[2]) === norm(to));
  return caps.slice(a, b + 1).map((c) => [c[0], c[1]]);
};

/* ─────────────── the village: paper theatre with parallax ─────────────── */

const Pine: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} filter="url(#cut)">
    <rect x={-10} y={-40} width={20} height={44} fill="#6A4A2C" />
    {[0, 1, 2].map((j) => <path key={j} d={`M${-74 + j * 16} ${-30 - j * 62} L0 ${-140 - j * 62} L${74 - j * 16} ${-30 - j * 62} Z`} fill={["#4E7350", "#5B8257", "#679161"][j]} stroke={INK} strokeWidth={2} />)}
  </g>
);
const Hut: React.FC<{ x: number; y: number; k?: number }> = ({ x, y, k = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} filter="url(#cut)">
    <rect x={-110} y={-150} width={220} height={150} fill="#B07A4A" stroke={INK} strokeWidth={3} />
    {[-120, -90, -60, -30].map((yy) => <line key={yy} x1={-110} y1={yy} x2={110} y2={yy} stroke={INK} strokeWidth={1.5} opacity={0.35} />)}
    <path d="M-140 -140 L0 -250 L140 -140 Z" fill="#7A4A2A" stroke={INK} strokeWidth={3} />
    <rect x={-26} y={-80} width={52} height={80} fill="#4A2E1A" stroke={INK} strokeWidth={2} />
  </g>
);
const Waves: React.FC<{ y: number; f: number; color: string; x0?: number; phase?: number }> = ({ y, f, color, x0 = 1000, phase = 0 }) => (
  <path d={`M${x0} 1300 L${x0} ${y} ${Array.from({ length: 30 }, (_, i) => `Q${x0 + 20 + i * 40} ${y - 20 + 6 * Math.sin(f / 9 + i + phase)} ${x0 + 40 + i * 40} ${y}`).join(" ")} L2600 1300 Z`} fill={color} filter="url(#cut)" />
);
const Longship: React.FC<{ x: number; y: number; f: number; children?: React.ReactNode }> = ({ x, y, f, children }) => (
  <g transform={`translate(${x} ${y + 5 * Math.sin(f / 10)}) rotate(${-2 + 1.5 * Math.sin(f / 13)})`}>
    <g filter="url(#cut)">
      <line x1={0} y1={-20} x2={0} y2={-420} stroke="#5A3A22" strokeWidth={14} />
      <path d={torn(-170, -400, 340, 260, 31, 5, 22)} fill="#F1E3C6" stroke={INK} strokeWidth={3} transform={`skewX(${2 * Math.sin(f / 14)})`} />
      {[-130, -50, 30, 110].map((xx) => <rect key={xx} x={xx} y={-398} width={36} height={256} fill="#B8352A" transform={`skewX(${2 * Math.sin(f / 14)})`} />)}
    </g>
    {children}
    <g filter="url(#cut)">
      <path d="M-330 -60 Q-200 40 0 40 Q200 40 330 -60 L300 -30 Q170 10 0 10 Q-170 10 -300 -30 Z" fill="#8A5A34" stroke={INK} strokeWidth={3} />
      <path d="M330 -60 Q370 -120 350 -170 Q340 -200 365 -205 Q395 -195 380 -160 Q365 -130 345 -110" fill="#8A5A34" stroke={INK} strokeWidth={3} />
      <circle cx={368} cy={-188} r={4} fill={INK} />
    </g>
    {[-240, -160, -80, 80, 160, 240].map((xx, i) => (
      <g key={xx} filter="url(#cutSoft)"><circle cx={xx} cy={-18} r={30} fill={["#C8452D", "#E3B341", "#2F6E8E"][i % 3]} stroke={INK} strokeWidth={3} /><Brad x={xx} y={-18} r={8} /></g>
    ))}
  </g>
);

const Village: React.FC = () => {
  const f = useCurrentFrame();
  const said = W("said:"), our = W("\"Our"), order = W("order"), come = W("Come"), they = W("They"), vikings = W("Vikings."), eleven = W("Eleven");
  const pan = glide(f, [[0, { x: 800, y: 600, s: 1.25 }], [our, { x: 780, y: 590, s: 1.4 }], [they, { x: 1120, y: 580, s: 1.0 }]], 40);
  /** Parallax: a layer at depth d (0 far, 1 near) follows the camera by d. */
  const layer = (d: number) => {
    const cx = 960 + (pan.x - 960) * d, cy = 540 + (pan.y - 540) * d, s = 1 + (pan.s - 1) * (0.4 + 0.6 * d);
    return `translate(${960 - s * cx} ${540 - s * cy}) scale(${s})`;
  };
  const quote = words("\"Our", "us.\"");
  const talk = flap(f, quote);
  const squabble = span(f, order - 6, come);
  const shipX = mix(2500, 1500, ez(f, they - 6, vikings + 24));
  const cheer = f >= vikings + 10;
  const tribeFace = (i: number) =>
    f < said ? blendFace(FACES.neutral, FACES.confused, 0.6, { lookX: Math.sin(f / 14 + i * 2) })
      : f < come ? (i < 2 ? blendFace(FACES.annoyed, FACES.angry, squabble, { lookX: i === 0 ? 0.9 : -0.9 }) : blendFace(FACES.worried, FACES.worried, 1, { lookX: -0.6 }))
      : !cheer ? blendFace(FACES.happy, FACES.laugh, 0.4, { lookX: 0.9 })
      : blendFace(FACES.shocked, FACES.laugh, ez(f, vikings + 16, vikings + 34), { lookX: 1 });
  const looks = [LOOKS.tribeA, LOOKS.tribeB, LOOKS.tribeC];
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
      <PaperDefs />
      <rect width={1920} height={1080} fill="#CFE0DF" />
      <g transform={layer(0.2)}>
        <circle cx={1450} cy={200} r={90} fill="#F3D27A" filter="url(#cutSoft)" />
        {[[300, 160, 1], [1000, 120, 2]].map(([cx, cy, sd]) => <path key={sd} d={torn(cx!, cy!, 260, 70, sd! * 9, 10, 26)} fill="#F6F1E4" filter="url(#cutSoft)" transform={`translate(${wob(f + sd! * 40, 12, 40)} 0)`} />)}
      </g>
      <g transform={layer(0.45)}>
        <path d={ridge(-400, 2400, 560, 50, 1)} fill="#A9BFA3" filter="url(#cut)" />
      </g>
      <g transform={layer(0.7)}>
        <path d={ridge(-400, 2400, 650, 34, 7)} fill="#8DAA86" filter="url(#cut)" />
        {[-60, 70, 190].map((x, i) => <Pine key={x} x={x} y={720 + (i % 2) * 20} k={1.1 + (i % 3) * 0.2} />)}
        <Pine x={1880} y={730} k={1.3} />
      </g>
      <g transform={layer(1)}>
        <Hut x={330} y={800} />
        <path d={ridge(-400, 2400, 800, 6, 3, 1400, 30)} fill="#C2A878" filter="url(#cut)" />
        <Waves y={845} f={f} color="#5C8EA6" x0={1080} />
        <Longship x={shipX} y={860} f={f}>
          <Puppet look={LOOKS.viking} x={-40} ground={-30} k={0.95} f={f} seed={21} flip
            face={blendFace(FACES.neutral, FACES.smug, ez(f, vikings, vikings + 12), { lookX: 0.9 })} armL={f >= vikings + 14 ? 150 + wob(f, 15, 4) : 20} />
        </Longship>
        <Waves y={940} f={f} color="#4A7C95" x0={1060} phase={2} />
        {looks.map((lk, i) => {
          const wave = f >= come;
          return (
            <Puppet key={i} look={lk} x={600 + i * 200} ground={885 + (i === 1 ? 12 : 0)} k={1.22} f={f + i * 13} seed={i * 7 + 2}
              flip={i === 1 && f >= order - 6 && f < come} face={tribeFace(i)} talk={i === 2 || f >= come ? talk : 0}
              armL={wave ? 150 + wob(f + i * 5, 16, 4) : i < 2 ? 30 + 60 * squabble * Math.abs(Math.sin(f / 4 + i)) : 15}
              armR={wave ? -150 - wob(f + i * 5, 16, 4) : i < 2 ? -30 - 60 * squabble * Math.abs(Math.sin(f / 4 + i + 1)) : -15}
              lean={cheer ? 4 * Math.sin(f / 3 + i) : 0} headTilt={f < said ? 6 * Math.sin(f / 14 + i * 2) : 0} />
          );
        })}
        <PaperBubble x={820} y={345} t={span(f, come - 4, vikings + 4)} lines={[["Come and rule"], ["over us!!", "#B8352A"]]} size={52} tail={-1} seed={51} />
        <PaperBubble x={1560} y={330} t={span(f, vikings + 20, eleven)} lines={[["Deal."]]} size={64} tail={-1} seed={8} />
      </g>
      <PaperLabel x={190} y={120} t={pop(f, 6)} text="862" size={84} />
    </svg>
  );
};

/* ─────────────── satellite map with paper labels ─────────────── */

const RUSSIA = at([104, 60], 1.0);

const MapShot: React.FC = () => {
  const f = useCurrentFrame();
  const eleven = W("Eleven"), biggest = W("biggest"), zones = W("zones,"), ruled = W("ruled");
  const cam = glide(f, [[eleven - 4, at([31.3, 58.5], 3)], [biggest, RUSSIA]], 50);
  const [mx] = P("moscow");
  return (
    <AbsoluteFill>
      <MapView cam={cam} year="1994" borderOp={0.6} regions={[reg(1994, "Russia", "#D8402F", { t: ez(f, eleven, biggest + 10), from: [31.3, 58.5] })]}>
        {Array.from({ length: 10 }, (_, i) => {
          const x = mx + (40 + i * 15.5 - 37.6) * 16.5 * 0.643;
          return <line key={i} x1={x} y1={0} x2={x} y2={1200} stroke="#FFFFFF" strokeWidth={2} strokeDasharray="10 8" vectorEffect="non-scaling-stroke" opacity={0.75 * ez(f, zones - 20 + i * 3, zones - 10 + i * 3)} />;
        })}
      </MapView>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <PaperDefs />
        <PaperLabel x={960} y={470} t={pop(f, biggest, 12)} text="RUSSIA" size={110} rot={-2} seed={4} />
        {Array.from({ length: 11 }, (_, i) => {
          const t = pop(f, zones - 24 + i * 3, 10);
          if (t <= 0) return null;
          return (
            <g key={i} transform={`translate(${250 + i * 142} 150) rotate(${(rnd(i) - 0.5) * 12}) scale(${t * 0.6})`} filter="url(#cut)">
              <circle r={60} fill="#FBF4E2" stroke={INK} strokeWidth={4} />
              <line x1={0} y1={0} x2={Math.sin(i * 0.57) * 42} y2={-Math.cos(i * 0.57) * 42} stroke={INK} strokeWidth={6} strokeLinecap="round" />
              <line x1={0} y1={0} x2={Math.sin(i * 0.52) * 26} y2={-Math.cos(i * 0.52) * 26} stroke="#B8352A" strokeWidth={8} strokeLinecap="round" />
              <Brad x={0} y={0} r={8} />
            </g>
          );
        })}
      </svg>
      {f >= ruled - 8 ? <EraCards /> : null}
    </AbsoluteFill>
  );
};

/* ─────────────── era cards: each ruler in the art of his age ─────────────── */

const Card: React.FC<{ x: number; t: number; seed: number; children: React.ReactNode; label: string; font: string; labelColor: string; labelBg: string }> = ({ x, t, seed, children, label, font, labelColor, labelBg }) => {
  if (t <= 0) return null;
  const id = `card${seed}`;
  return (
    <g transform={`translate(${x} ${560 + 500 * (1 - t)}) rotate(${(rnd(seed) - 0.5) * 8})`}>
      <clipPath id={id}><path d={torn(-180, -230, 360, 440, seed, 6, 20)} /></clipPath>
      <path d={torn(-190, -240, 380, 460, seed + 1, 6, 20)} fill="#FBF4E2" filter="url(#cut)" />
      <g clipPath={`url(#${id})`}>{children}</g>
      <path d={torn(-180, -230, 360, 440, seed, 6, 20)} fill="none" stroke={INK} strokeWidth={3} />
      <g transform="translate(0 250) rotate(-2)" filter="url(#cut)">
        <path d={torn(-label.length * 19 - 30, -38, label.length * 38 + 60, 72, seed + 5, 4, 14)} fill={labelBg} stroke={INK} strokeWidth={2} />
        <text x={0} y={18} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={50} fill={labelColor}>{label}</text>
      </g>
    </g>
  );
};

const EraCards: React.FC = () => {
  const f = useCurrentFrame();
  const vik = W("Vikings", 1), mon = W("Mongols,"), tsar = W("tsars"), comm = W("communists."), entire = W("entire");
  const out = 1 - ez(f, entire - 14, entire - 4);
  const p = (a: number) => pop(f, a - 4, 12) * out;
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
      <PaperDefs />
      <rect width={1920} height={1080} fill="#14100C" opacity={0.45 * ez(f, W("ruled") - 8, W("ruled") + 4) * out} />
      <Card x={300} t={p(vik)} seed={71} label="VIKINGS" font="Oswald" labelColor="#F3E6C4" labelBg="#5A3A22">
        <rect x={-200} y={-250} width={400} height={480} fill="#8A5A34" />
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-200} y1={-230 + i * 60} x2={200} y2={-230 + i * 60} stroke="#5A3A22" strokeWidth={4} />)}
        <text x={0} y={-180} textAnchor="middle" fontFamily="Oswald" fontSize={36} fill="#E3C27A" opacity={0.7} letterSpacing={8}>ᚱᚢᚱᛁᚲ</text>
        <Puppet look={LOOKS.viking} x={0} ground={220} k={1.15} f={f} seed={3} face={FACES.smug} armR={-140} />
      </Card>
      <Card x={740} t={p(mon)} seed={83} label="MONGOLS" font="Oswald" labelColor="#FBF4E2" labelBg="#2F5E8E">
        <rect x={-200} y={-250} width={400} height={480} fill="#9CC6DE" />
        <path d={ridge(-220, 220, 120, 18, 5, 300, 20)} fill="#C9B46A" />
        <path d={ridge(-220, 220, 170, 10, 9, 300, 20)} fill="#A9944A" />
        <Puppet look={LOOKS.khan} x={0} ground={220} k={1.15} f={f + 9} seed={5} face={FACES.angry} armR={-90} />
      </Card>
      <Card x={1180} t={p(tsar)} seed={97} label="TSARS" font="Ruslan" labelColor="#9E2A1E" labelBg="#E8D9B2">
        <rect x={-200} y={-250} width={400} height={480} fill="#E8D9B2" />
        <path d="M-150 230 L-150 -100 Q-150 -210 0 -210 Q150 -210 150 -100 L150 230 Z" fill="url(#gold)" stroke="#9E2A1E" strokeWidth={5} />
        {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${-180 + i * 40} -228 l8 8 l-8 8 l-8 -8 Z`} fill={i % 2 ? "#9E2A1E" : "#2E4A86"} />)}
        <Puppet look={LOOKS.tsar} x={0} ground={230} k={1.1} f={f + 3} seed={7} face={FACES.smug} armR={-30} />
      </Card>
      <Card x={1620} t={p(comm)} seed={109} label="COMMUNISTS" font="Oswald" labelColor="#EFE4CC" labelBg="#1A1210">
        <rect x={-200} y={-250} width={400} height={480} fill="#EFE4CC" />
        <path d="M-200 -250 L120 -250 L-80 260 L-200 260 Z" fill="#1A1210" />
        <path d="M-220 200 L200 -60 L160 -110 Z" fill="#C8281E" />
        <path d="M-220 200 L200 -60 L160 -110 Z" fill="url(#halftone)" />
        <Puppet look={LOOKS.lenin} x={20} ground={230} k={1.1} f={f + 11} seed={9} face={FACES.smug} armR={-120} />
      </Card>
    </svg>
  );
};

/* ─────────────── cut-out title, then the page tears away ─────────────── */

const Title: React.FC = () => {
  const f = useCurrentFrame();
  const entire = W("entire"), russia = W("Russia."), go = W("go.");
  const tear = ez(f, go, go + 18);
  const letters = (s: string, y: number, size: number, at0: number) =>
    s.split("").map((ch, i) => {
      if (ch === " ") return null;
      const t = pop(f, at0 + i * 1.5, 8);
      const x = 960 + (i - (s.length - 1) / 2) * size * 0.78;
      const bg = ["#FBF4E2", "#F3E6C4", "#E8D9B2", "#B8352A", "#1A1210"][Math.floor(rnd(i + y) * 5)]!;
      const fg = bg === "#B8352A" || bg === "#1A1210" ? "#FBF4E2" : INK;
      const font = ["Oswald", "Liberation Serif", "Oswald"][Math.floor(rnd(i * 3 + y) * 3)]!;
      return t <= 0 ? null : (
        <g key={i} transform={`translate(${x} ${y}) rotate(${(rnd(i * 7 + y) - 0.5) * 12}) scale(${t})`} filter="url(#cutSoft)">
          <path d={torn(-size * 0.36, -size * 0.62, size * 0.72, size * 0.86, i + y, 3, 10)} fill={bg} stroke={INK} strokeWidth={2} />
          <text x={0} y={size * 0.12} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={size * 0.62} fill={fg}>{ch}</text>
        </g>
      );
    });
  return (
    <AbsoluteFill>
      <MapView cam={{ ...RUSSIA, s: RUSSIA.s * (1 + 0.05 * ez(f, entire, go)) }} year="1994" borderOp={0.4} regions={[reg(1994, "Russia", "#D8402F")]} dim={0.3} />
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <PaperDefs />
        <g transform={`translate(${-900 * tear} ${120 * tear}) rotate(${-14 * tear} 0 1080)`}>
          <path d={`${torn(260, 250, 700, 560, 61, 8, 24)}`} fill="#F6EDD6" filter="url(#cut)" />
        </g>
        <g transform={`translate(${900 * tear} ${-80 * tear}) rotate(${12 * tear} 1920 0)`}>
          <path d={`${torn(960, 250, 700, 560, 62, 8, 24)}`} fill="#F6EDD6" filter="url(#cut)" />
        </g>
        <g opacity={1 - tear}>
          {letters("THE ENTIRE", 410, 124, entire - 8)}
          {letters("HISTORY OF", 555, 124, entire + 4)}
          {letters("RUSSIA", 710, 150, russia - 8)}
          <PaperLabel x={960} y={810} t={pop(f, russia + 6)} text="862 – TODAY" size={44} rot={2} seed={19} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** The opening in the paper style (used by the full video as the hook scene). */
export const HookPaper: React.FC = () => {
  const f = useCurrentFrame();
  const eleven = W("Eleven"), entire = W("entire");
  return f < eleven - 4 ? <Village /> : f < entire - 6 ? <MapShot /> : <Title />;
};

export const RussiaPilot: React.FC = () => {
  usePaperFonts();
  const f = useCurrentFrame();
  const sc = SCENES.hook;
  const eleven = W("Eleven");
  return (
    <AbsoluteFill style={{ background: "#CFE0DF" }}>
      <HookPaper />
      <PaperTexture op={f < eleven - 4 ? 0.32 : 0.18} />
      <Captions scene="hook" paper />
      <Sequence from={sc.lead}><Audio src={staticFile("vo_russia/hook.wav")} /></Sequence>
    </AbsoluteFill>
  );
};
export const PILOT_FRAMES = SCENES.hook.dur;
