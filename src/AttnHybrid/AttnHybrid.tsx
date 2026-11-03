import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, getStaticFiles, spring, staticFile, useCurrentFrame } from "remotion";
import { usePaperFonts } from "../Puppet/paper";
import { Captions, w } from "../Attn/overlays";
import { Grade } from "../AttnToon/AttnToon";

/**
 * Hybrid style test on the same attention hook as AttnToon: AI-illustrated stills (public/hybrid/a-e.webp, made by
 * public/hybrid/flux_stills.py) carry the art; code carries camera, kinetic type, light and sync. Same voice, cuts and SFX
 * as AttnToon so the two can be compared shot for shot. A missing still renders as a labelled placeholder.
 */

const W = (word: string, n = 0) => w("hook", word, n);
const cl = (t: number) => Math.min(1, Math.max(0, t));
const ez = (f: number, a: number, b: number) => { const t = cl((f - a) / (b - a)); return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2; };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const sp = (f: number, at: number, damping = 12, mass = 0.7) => (f < at ? 0 : spring({ frame: f - at, fps: 30, config: { damping, mass, stiffness: 120 } }));
const has = (src: string) => getStaticFiles().some((s) => s.name === src);

const C = { amber: "#FFB45E", red: "#E4572E", cream: "#F4F1E8", glow: "#7FB6FF" };
const OS = { fontFamily: "Oswald", fontWeight: 700 } as const;
const B_AT = W("That"), C_AT = W("but"), D_AT = W("One"), E_AT = W("of") + 2;

/** One still under a camera: zoom z, focus point (x, y) in 0-1 of the frame, roll in degrees, plus a slow handheld drift. */
const Plate: React.FC<{ id: string; f: number; z: number; x?: number; y?: number; roll?: number }> = ({ id, f, z, x = 0.5, y = 0.5, roll = 0 }) => {
  const src = `hybrid/${id}.webp`;
  const dx = 6 * Math.sin(f / 37) + 3 * Math.sin(f / 13), dy = 5 * Math.cos(f / 29);
  const style: React.CSSProperties = {
    position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
    transformOrigin: `${x * 100}% ${y * 100}%`, transform: `translate(${dx}px, ${dy}px) scale(${z * 1.03}) rotate(${roll}deg)`,
  };
  return has(src) ? <Img src={staticFile(src)} style={style} /> : (
    <div style={{ ...style, background: "linear-gradient(#0B1426, #1A2C48)", color: "#3A4F78", ...OS, fontSize: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
      still {id} pending
    </div>
  );
};

/** Big kinetic word: springs in from below, optional exit drop. */
const Word: React.FC<{ f: number; at: number; text: string; color: string; size: number; y: number; outAt?: number }> = ({ f, at, text, color, size, y, outAt }) => {
  const s = sp(f, at, 11, 0.6);
  const drop = outAt === undefined ? 0 : ez(f, outAt, outAt + 14);
  if (s <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", ...OS, fontSize: size, color, letterSpacing: 2,
      transform: `translateY(${(1 - s) * 80 + drop * 500}px) scale(${0.7 + 0.3 * s}) rotate(${drop * 14}deg)`, opacity: cl(s * 1.5) * (1 - drop),
      textShadow: "0 10px 40px rgba(0,0,0,0.65)" }}>
      {text}
    </div>
  );
};

/** Screen light that breathes on faces lit by a phone. */
const ScreenGlow: React.FC<{ f: number; x: string; y: string; k?: number }> = ({ f, x, y, k = 1 }) => (
  <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: k * (0.22 + 0.08 * Math.sin(f / 5) * Math.sin(f / 11)),
    background: `radial-gradient(circle at ${x} ${y}, ${C.glow} 0%, transparent 45%)` }} />
);

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** A (close): hands and phone; the real-time timecode, "1:26" slams in on "26". */
const ShotA: React.FC<{ f: number }> = ({ f }) => {
  const pop = sp(f, W("26"), 9, 0.5);
  return (
    <>
      <Plate id="a" f={f} z={mix(1.0, 1.25, ez(f, 0, B_AT))} x={0.5} y={0.55} roll={-1.5 + ez(f, 0, B_AT)} />
      <ScreenGlow f={f} x="50%" y="50%" />
      <div style={{ position: "absolute", left: 120, top: 110, ...OS, fontSize: 64, color: C.cream, opacity: 0.85 }}>{fmt(f / 30)} / 1:26</div>
      <Word f={f} at={W("26")} text="1:26" color={C.amber} size={300 + 60 * Math.max(0, 1 - (f - W("26")) / 12) * cl(pop)} y={330} />
    </>
  );
};

/** B (mid): Ray on the sofa, a quick push as he shrugs it off. */
const ShotB: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Plate id="b" f={f} z={mix(1.12, 1.22, ez(f, B_AT, C_AT))} x={0.55} y={0.4} />
    <ScreenGlow f={f} x="55%" y="60%" k={0.7} />
  </>
);

/** C (wide): pull back off one window to the whole building; "LIFETIME" lands, "FOCUS" falls off the frame. */
const ShotC: React.FC<{ f: number }> = ({ f }) => {
  const dim = ez(f, W("lose"), W("days."));
  return (
    <>
      <Plate id="c" f={f} z={mix(1.6, 1.05, ez(f, C_AT, W("lose")))} x={0.45} y={0.45} />
      {/* the building's light drains as people lose focus */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, rgba(4,8,20,${0.55 * dim}) ${mix(0, 100, dim)}%, transparent ${mix(0, 100, dim) + 15}%)` }} />
      <Word f={f} at={W("lifetime")} text="A LIFETIME" color={C.amber} size={200} y={360} outAt={W("lose") - 6} />
      <Word f={f} at={W("focus")} text="FOCUS" color={C.red} size={230} y={340} outAt={W("days.") + 6} />
    </>
  );
};

/** D (wide, tracking): the line people fall off; the number rolls up and stops dead on 23.7%. */
const ShotD: React.FC<{ f: number }> = ({ f }) => {
  const roll = ez(f, W("average"), W("23.7%") + 6);
  const land = sp(f, W("23.7%") + 6, 8, 0.5);
  const shake = f > W("23.7%") + 6 && f < W("23.7%") + 16 ? 8 * Math.sin(f * 3) * (1 - (f - W("23.7%") - 6) / 10) : 0;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translate(${shake}px, ${shake / 2}px)` }}>
      <Plate id="d" f={f} z={mix(1.15, 1.35, ez(f, D_AT, E_AT))} x={mix(0.3, 0.6, ez(f, D_AT, E_AT))} y={0.5} />
      {f >= W("average") ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", ...OS, fontSize: 280 + 50 * land * Math.max(0, 1 - (f - W("23.7%") - 6) / 14),
          color: land > 0.01 ? C.amber : C.cream, textShadow: "0 10px 50px rgba(0,0,0,0.7)", fontVariantNumeric: "tabular-nums" }}>
          {(23.7 * roll).toFixed(1)}%
        </div>
      ) : null}
    </div>
  );
};

/** E (close): Ray looks up from the phone at you. */
const ShotE: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Plate id="e" f={f} z={mix(1.05, 1.3, ez(f, E_AT, E_AT + 40))} x={0.5} y={0.4} />
    <ScreenGlow f={f} x="50%" y="75%" />
  </>
);

/** 4-frame flash on every cut so the edits hit. */
const CutFlash: React.FC<{ f: number }> = ({ f }) => {
  const d = Math.min(...[B_AT, C_AT, D_AT, E_AT].map((c) => (f >= c ? f - c : 99)));
  return d < 4 ? <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: 0.18 * (1 - d / 4) }} /> : null;
};

export const AttnHybrid: React.FC = () => {
  usePaperFonts();
  const f = useCurrentFrame();
  const shot = f < B_AT ? <ShotA f={f} /> : f < C_AT ? <ShotB f={f} /> : f < D_AT ? <ShotC f={f} /> : f < E_AT ? <ShotD f={f} /> : <ShotE f={f} />;
  const fx: [string, number, number][] = [["pop", W("26"), 0.3], ["sparkle", W("lifetime"), 0.18], ["tick", W("lose"), 0.2], ["tick", W("focus"), 0.2], ["thud", W("23.7%") + 6, 0.35]];
  return (
    <AbsoluteFill style={{ background: "#0B1426", overflow: "hidden" }}>
      {shot}
      <CutFlash f={f} />
      <Grade f={f} />
      <Captions scene="hook" toon />
      <Sequence from={12}><Audio src={staticFile("vo_attn/hook.wav")} /></Sequence>
      {fx.map(([s, at, v], i) => <Sequence key={i} from={at} durationInFrames={40}><Audio src={staticFile(`sfx/${s}.wav`)} volume={v} /></Sequence>)}
      <Audio src={staticFile("music/modern.mp3")} volume={0.06} />
    </AbsoluteFill>
  );
};
