import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, getStaticFiles, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CAPS, SCENES, TOTAL_FRAMES } from "./timing";

/**
 * "Why Nepal's Hills Keep Falling" (~35 s vertical Short): realistic Wan 2.2 shots (public/ai/slide, free-ai-video
 * skill) cut on spoken words, stat cards with their sources, word-synced captions, the channel narrator
 * (public/vo_slide), low music and effects keyed to words.
 */
const FONT = "Liberation Sans, Arial, sans-serif";
const RED = "#FF3B30", YEL = "#FFD60A";
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, "");
/** Scene-relative start frame of the nth spoken occurrence of `word`. */
const w = (scene: string, word: string, n = 0): number => {
  const hit = (CAPS[scene] ?? []).filter((c) => norm(c[2]) === norm(word))[n];
  if (!hit) throw new Error(`caption word "${word}" #${n} not found in ${scene}`);
  return hit[0];
};
const has = (src: string) => getStaticFiles().some((s) => s.name === src);

/** [clip, starts at word (null = scene start)] per scene; each runs until the next one. */
const SHOTS: Record<string, [string, string | null][]> = {
  hook: [["s1", null], ["s2", "record."]],
  roads: [["s3", null], ["s4", "many"], ["s5", "most"]],
  quake: [["s6", null], ["s7", "now"]],
  end: [["s8", null]],
};

const Shot: React.FC<{ clip: string; len: number }> = ({ clip, len }) => {
  const f = useCurrentFrame();
  const src = `ai/slide/${clip}_1080.mp4`;
  const scale = interpolate(f, [0, len], [1.04, 1.14]);
  const flash = interpolate(f, [0, 5], [0.5, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      {has(src) ? (
        // a 5 s clip stretched (never below half speed) to cover a longer shot
        <OffthreadVideo src={staticFile(src)} muted playbackRate={Math.max(0.5, Math.min(1, 150 / len))}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})` }} />
      ) : (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", color: "#555", fontFamily: FONT, fontSize: 60 }}>{clip}</AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

/** Darken top and bottom so the stat cards and captions read over any shot. */
const Grade: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.7) 80%, rgba(0,0,0,0.85) 100%)" }} />
);

const pop = (f: number, at: number, fps: number) => spring({ frame: f - at, fps, config: { damping: 11, mass: 0.6 } });

/** A big number that counts up from `at`, with a label and its source under it. */
const Stat: React.FC<{ at: number; to?: number; value: number; suffix?: string; label: string; source: string; color?: string }> = ({ at, to = 1e9, value, suffix = "", label, source, color = "#fff" }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  if (f < at || f >= to) return null;
  const s = pop(f, at, fps);
  const n = Math.round(value * Math.min(1, interpolate(f, [at, at + 18], [0, 1], { extrapolateRight: "clamp" })));
  const out = interpolate(f, [to - 8, to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 300, opacity: out }}>
      <div style={{ transform: `scale(${0.6 + 0.4 * s})`, textAlign: "center", fontFamily: FONT, fontWeight: 700 }}>
        <div style={{ fontSize: 230, lineHeight: 1, color, WebkitTextStroke: "6px #000", paintOrder: "stroke", textShadow: "0 10px 40px rgba(0,0,0,0.8)" }}>
          {n.toLocaleString("en-US")}{suffix}
        </div>
        <div style={{ fontSize: 58, color: "#fff", marginTop: 14, letterSpacing: 2, textShadow: "0 4px 18px #000" }}>{label}</div>
        <div style={{ fontSize: 30, color: "rgba(255,255,255,0.75)", marginTop: 12, fontWeight: 400, textShadow: "0 2px 10px #000" }}>{source}</div>
      </div>
    </AbsoluteFill>
  );
};

/** A tilted stamp that slams in on a word. */
const Stamp: React.FC<{ at: number; to?: number; text: string; top?: number; color?: string }> = ({ at, to = 1e9, text, top = 760, color = RED }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  if (f < at || f >= to) return null;
  const s = pop(f, at, fps);
  return (
    <AbsoluteFill style={{ alignItems: "center", top }}>
      <div style={{ transform: `rotate(-6deg) scale(${2.2 - 1.2 * s})`, opacity: Math.min(1, s * 2), border: `10px solid ${color}`, borderRadius: 18,
        padding: "8px 34px", fontFamily: FONT, fontWeight: 700, fontSize: 110, color, background: "rgba(0,0,0,0.45)", letterSpacing: 4 }}>{text}</div>
    </AbsoluteFill>
  );
};

/** Word-synced captions: up to three words on screen, the spoken one in yellow. */
const Captions: React.FC<{ scene: string }> = ({ scene }) => {
  const f = useCurrentFrame();
  const caps = CAPS[scene] ?? [];
  const i = caps.findIndex(([s, e], j) => f >= s && f < (caps[j + 1]?.[0] ?? e + 12));
  if (i < 0) return null;
  const g = Math.floor(i / 3) * 3;
  return (
    <AbsoluteFill style={{ top: 1180, alignItems: "center" }}>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 92, textAlign: "center", maxWidth: 960, lineHeight: 1.1, textTransform: "uppercase" }}>
        {caps.slice(g, g + 3).map(([, , t], j) => (
          <span key={j} style={{ color: g + j === i ? YEL : "#fff", WebkitTextStroke: "14px #000", paintOrder: "stroke", marginRight: 22,
            display: "inline-block", transform: g + j === i ? "scale(1.08)" : "none" }}>{t}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** Per-scene cards on top of the shots. */
const Cards: React.FC<{ scene: string }> = ({ scene }) => {
  const f = useCurrentFrame();
  if (scene === "hook") return (
    <>
      <Stat at={w("hook", "334")} value={334} label="LANDSLIDE DEATHS IN ONE MONSOON" source="Nepal, 2020 · Nepali Times" />
      <Stamp at={w("hook", "record.")} text="A RECORD" />
    </>
  );
  if (scene === "roads") return (
    <>
      <Stat at={w("roads", "60,000")} to={w("roads", "many")} value={60000} suffix=" km" label="OF RURAL ROADS IN 30 YEARS" source="Nepali Times, 2020" color={YEL} />
      <Stat at={w("roads", "doubled")} value={2} suffix="×" label="LANDSLIDES NEAR NEW ROADS" source="McAdoo et al. 2018 · one district" color={RED} />
    </>
  );
  if (scene === "quake") {
    const at = w("quake", "cracked"), k = Math.max(0, 1 - (f - at) / 20);
    const shake = f >= at ? Math.sin(f * 2.3) * 22 * k : 0;
    return (
      <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
        <Stat at={w("quake", "2015")} to={w("quake", "now")} value={2015} label="GORKHA EARTHQUAKE" source="20,000+ landslides · BGS / Durham" />
      </AbsoluteFill>
    );
  }
  return null;
};

type Fx = "thud" | "whoosh" | "whoosh_low" | "sting" | "boom" | "tick" | "wind" | "splash";
const CUES: Record<string, [string, number, Fx, number, number?][]> = {
  hook: [["334", 0, "thud", 0.55], ["record.", 0, "sting", 0.4], ["record.", 0, "boom", 0.35]],
  roads: [["changed", 0, "whoosh_low", 0.4], ["60,000", 0, "tick", 0.4], ["many", 0, "thud", 0.4], ["most", 0, "splash", 0.3], ["doubled", 0, "sting", 0.4]],
  quake: [["2015", 0, "whoosh", 0.35], ["cracked", 0, "boom", 0.6], ["now", 0, "whoosh_low", 0.35]],
  end: [["mountains", 0, "wind", 0.3]],
};
const MUSIC_VOL = 0.09;

export const SlideVideo: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {Object.entries(SCENES).map(([key, sc]) => {
      const shots = SHOTS[key].map(([c, word]) => [c, word ? w(key, word) : 0] as const);
      return (
        <Sequence key={key} from={sc.start} durationInFrames={sc.dur} name={key}>
          {shots.map(([c, at], i) => {
            const end = i + 1 < shots.length ? shots[i + 1][1] : sc.dur;
            return <Sequence key={c} from={at} durationInFrames={end - at}><Shot clip={c} len={end - at} /></Sequence>;
          })}
          <Grade />
          <Cards scene={key} />
          <Captions scene={key} />
          {has(`vo_slide/${key}.wav`) ? <Sequence from={sc.lead}><Audio src={staticFile(`vo_slide/${key}.wav`)} /></Sequence> : null}
          {(CUES[key] ?? []).map(([word, n, fx, vol, off = 0], i) => (
            <Sequence key={i} from={Math.max(0, w(key, word, n) + off)}><Audio src={staticFile(`sfx/${fx}.wav`)} volume={vol} /></Sequence>
          ))}
        </Sequence>
      );
    })}
    <Audio src={staticFile("music/elegy.mp3")} loop volume={(fr) => MUSIC_VOL * Math.min(1, fr / 15, Math.max(0, (TOTAL_FRAMES - fr) / 30))} />
  </AbsoluteFill>
);
