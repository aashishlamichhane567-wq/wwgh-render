import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, getStaticFiles, spring, staticFile, useCurrentFrame } from "remotion";
import { usePaperFonts } from "../Puppet/paper";
import { Captions, w } from "../Attn/overlays";
import { Grade } from "../AttnToon/AttnToon";
import { CUES } from "../Attn/AttnVideo";
import { SCENES, TOTAL_FRAMES } from "../Attn/timing";

/**
 * The Attention episode in the hybrid style (first built as a hook-only test against AttnToon): AI-illustrated stills (public/hybrid/a-e.webp, made by
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

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const shot = f < B_AT ? <ShotA f={f} /> : f < C_AT ? <ShotB f={f} /> : f < D_AT ? <ShotC f={f} /> : f < E_AT ? <ShotD f={f} /> : <ShotE f={f} />;
  return <>{shot}<CutFlash f={f} /></>;
};

/* ─────────────── scenes after the hook: one still per shot, cut on a spoken word ─────────────── */
type Kin = { at: string; text: string; color: string; size?: number; y?: number; out?: string };
/** at: the word the cut lands on (n: which occurrence); z/x: camera zoom and focus from shot start to end; glow: phone light (x%, y%). */
type Shot = { id: string; at: string; n?: number; z: [number, number]; x?: [number, number]; y?: number; roll?: number; glow?: [string, string]; kin?: Kin[] };

const SHOTS: Record<string, Shot[]> = {
  math: [
    { id: "m1", at: "For", z: [1.25, 1.05], x: [0.45, 0.5], kin: [{ at: "1:26", text: "1:26 × 23.7%", color: C.cream, size: 170, out: "20" }, { at: "20", text: "≈ 20 SECONDS", color: C.amber, size: 210 }] },
    { id: "m2", at: "That", n: 1, z: [1.1, 1.25], y: 0.4, glow: ["55%", "60%"] },
    { id: "m3", at: "you've", z: [1.45, 1.05], y: 0.45, kin: [{ at: "outlasted", text: "YOU OUTLASTED THEM", color: C.amber, size: 150, y: 120 }] },
    { id: "m4", at: "It", z: [1.05, 1.3], roll: 2, glow: ["50%", "50%"] },
  ],
  caught: [
    { id: "c1", at: "Be", z: [1.3, 1.1], y: 0.45, glow: ["50%", "60%"] },
    { id: "c2", at: "Were", z: [1.05, 1.3], x: [0.4, 0.65] },
    { id: "c3", at: "skimming", z: [1.2, 1.05], glow: ["50%", "55%"] },
    { id: "c4", at: "or", z: [1.35, 1.05], y: 0.5 },
    { id: "c5", at: "Maybe", z: [1.05, 1.3], x: [0.5, 0.6], kin: [{ at: "next", text: "NEXT?", color: C.red, size: 220, y: 90 }] },
  ],
  wired: [
    { id: "w1", at: "If", z: [1.1, 1.25], y: 0.4 },
    { id: "w2", at: "Almost", z: [1.3, 1.05], kin: [{ at: "everyone", text: "EVERYONE", color: C.amber, size: 220, out: "We've" }] },
    { id: "w3", at: "We've", z: [1.05, 1.35], kin: [{ at: "wired", text: "WIRED", color: C.amber, size: 260 }] },
    { id: "w4", at: "As", z: [1.1, 1.3], x: [0.45, 0.6], y: 0.4 },
    { id: "w5", at: "brain", z: [1.05, 1.2], y: 0.55 },
  ],
  truth: [
    { id: "t1", at: "The", z: [1.4, 1.05], y: 0.55, kin: [{ at: "exploit", text: "EXPLOIT", color: C.red, size: 240 }] },
    { id: "t2", at: "Their", z: [1.05, 1.3], y: 0.4 },
    { id: "t3", at: "making", z: [1.1, 1.25], x: [0.35, 0.6] },
    { id: "t4", at: "so", z: [1.1, 1.4], y: 0.45, glow: ["50%", "70%"], kin: [{ at: "glued", text: "GLUED", color: C.red, size: 260 }] },
  ],
  end: [
    { id: "e1", at: "So,", z: [1.2, 1.05], y: 0.4 },
    { id: "e2", at: "outsmarted", z: [1.35, 1.05], kin: [{ at: "outsmarted", text: "YOU OUTSMARTED", color: C.amber, size: 190, y: 140 }, { at: "algorithm.", text: "THE ALGORITHM", color: C.cream, size: 150, y: 330 }] },
    { id: "e3", at: "Now,", z: [1.05, 1.25], y: 0.4, glow: ["55%", "75%"] },
  ],
};

const Scene: React.FC<{ scene: string; dur: number }> = ({ scene, dur }) => {
  const f = useCurrentFrame();
  const S = (word: string, n = 0) => w(scene, word, n);
  const shots = SHOTS[scene]!;
  const starts = shots.map((s, i) => (i === 0 ? 0 : S(s.at, s.n)));
  const i = starts.reduce((k, st, j) => (f >= st ? j : k), 0);
  const s = shots[i]!, a = starts[i]!, b = starts[i + 1] ?? dur;
  const t = ez(f, a, b);
  return (
    <>
      <Plate id={s.id} f={f} z={mix(s.z[0], s.z[1], t)} x={s.x ? mix(s.x[0], s.x[1], t) : 0.5} y={s.y} roll={s.roll ? s.roll * t : 0} />
      {s.glow ? <ScreenGlow f={f} x={s.glow[0]} y={s.glow[1]} /> : null}
      {(s.kin ?? []).map((k, j) => <Word key={j} f={f} at={S(k.at)} text={k.text} color={k.color} size={k.size ?? 200} y={k.y ?? 340} outAt={k.out ? S(k.out) - 6 : undefined} />)}
      {f - a < 4 ? <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: 0.18 * (1 - (f - a) / 4) }} /> : null}
    </>
  );
};

export const AttnHybrid: React.FC = () => {
  usePaperFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0B1426", overflow: "hidden" }}>
      {Object.entries(SCENES).map(([key, sc]) => (
        <Sequence key={key} from={sc.start} durationInFrames={sc.dur} name={key}>
          {key === "hook" ? <Hook /> : <Scene scene={key} dur={sc.dur} />}
          <Captions scene={key} toon />
          <Sequence from={sc.lead}><Audio src={staticFile(`vo_attn/${key}.wav`)} /></Sequence>
          {(CUES[key] ?? []).map(([word, n, fx, vol, off = 0], i) => (
            <Sequence key={i} from={Math.max(0, w(key, word, n) + off)} durationInFrames={60}><Audio src={staticFile(`sfx/${fx}.wav`)} volume={vol} /></Sequence>
          ))}
        </Sequence>
      ))}
      <Grade f={f} />
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: cl((f - (TOTAL_FRAMES - 24)) / 24) }} />
      <Audio src={staticFile("music/modern.mp3")} loop volume={(fr) => 0.07 * Math.min(1, fr / 20, Math.max(0, (TOTAL_FRAMES - fr) / 20))} />
    </AbsoluteFill>
  );
};
