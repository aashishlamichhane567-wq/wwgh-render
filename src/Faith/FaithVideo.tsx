import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, getStaticFiles, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CAPS, SCENES, TOTAL_FRAMES } from "./timing";

/**
 * "Look at the Lilies" (~20 s vertical faith reel): a two-voice dialogue (b = the young man, j = Jesus, public/vo_faith)
 * over warm storybook stills (public/ai/faith, FLUX) with slow camera pushes, small centred sentence captions
 * and soft music, in the format of the @christthroughai reels.
 */
const FONT = "Liberation Sans, Arial, sans-serif";
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, "");
const w = (scene: string, word: string, n = 0): number => {
  const hit = (CAPS[scene] ?? []).filter((c) => norm(c[2]) === norm(word))[n];
  if (!hit) throw new Error(`caption word "${word}" #${n} not found in ${scene}`);
  return hit[0];
};
const has = (src: string) => getStaticFiles().some((s) => s.name === src);

/** [still, starts at word (null = scene start), push direction] per scene; each runs until the next one. */
const SHOTS: Record<string, [string, string | null, 1 | -1][]> = {
  b1: [["f1", null, 1], ["f2", "falls", 1]],
  j1: [["f3", null, 1]],
  b2: [["f4", null, 1]],
  j2: [["f5", null, 1], ["f4", "still", -1]],
  b3: [["f6", null, 1]],
  j3: [["f7", null, 1], ["f8", "today", -1]],
};

/** A still with a slow push in (1) or pull out (-1), a soft dissolve in, and a warm glow that breathes. */
const Still: React.FC<{ still: string; len: number; dir: 1 | -1 }> = ({ still, len, dir }) => {
  const f = useCurrentFrame();
  const src = `ai/faith/${still}.webp`;
  const t = interpolate(f, [0, len], [0, 1]);
  const scale = dir === 1 ? 1.02 + 0.09 * t : 1.11 - 0.09 * t;
  return (
    <AbsoluteFill style={{ opacity: interpolate(f, [0, 8], [0, 1], { extrapolateRight: "clamp" }), background: "#2A1A0E" }}>
      {has(src) ? (
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})` }} />
      ) : (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", color: "#7a5a3a", fontFamily: FONT, fontSize: 60 }}>{still}</AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 30%, rgba(255,190,90,0.18), rgba(0,0,0,0) 60%)", opacity: 0.7 + 0.3 * Math.sin(f / 20) }} />
    </AbsoluteFill>
  );
};

/** The whole current sentence, small and centred, the way the reference reels caption dialogue. */
const Caption: React.FC<{ scene: string }> = ({ scene }) => {
  const f = useCurrentFrame();
  const caps = CAPS[scene] ?? [];
  const i = caps.findIndex(([s, e], j) => f >= s && f < (caps[j + 1]?.[0] ?? e + 15));
  if (i < 0) return null;
  let a = i, b = i;
  while (a > 0 && !/[.?!…]$/.test(caps[a - 1][2])) a--;
  while (b < caps.length - 1 && !/[.?!…]$/.test(caps[b][2])) b++;
  const op = interpolate(f, [caps[a][0], caps[a][0] + 4], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ top: 1250, alignItems: "center" }}>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 50, color: "#fff", textAlign: "center", maxWidth: 820, lineHeight: 1.25, opacity: op,
        textShadow: "0 2px 6px rgba(0,0,0,0.9), 0 0 18px rgba(0,0,0,0.6)" }}>
        {caps.slice(a, b + 1).map((c) => c[2]).join(" ")}
      </div>
    </AbsoluteFill>
  );
};

const MUSIC_VOL = 0.1;

export const FaithVideo: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {Object.entries(SCENES).map(([key, sc]) => {
      const shots = SHOTS[key].map(([s, word, dir]) => [s, word ? w(key, word) : 0, dir] as const);
      return (
        // a shot runs over the gap into the next turn, so the picture never drops to black between lines
        <Sequence key={key} from={sc.start} durationInFrames={sc.dur} name={key}>
          {shots.map(([s, at, dir], i) => {
            const end = i + 1 < shots.length ? shots[i + 1][1] : sc.dur;
            return <Sequence key={`${s}${at}`} from={at} durationInFrames={end - at}><Still still={s} len={end - at} dir={dir} /></Sequence>;
          })}
          <Caption scene={key} />
          {has(`vo_faith/${key}.wav`) ? <Sequence from={sc.lead}><Audio src={staticFile(`vo_faith/${key}.wav`)} /></Sequence> : null}
        </Sequence>
      );
    })}
    <Audio src={staticFile("sfx/wind.wav")} loop volume={0.05} />
    <Audio src={staticFile("music/elegy.mp3")} loop volume={(fr) => MUSIC_VOL * Math.min(1, fr / 20, Math.max(0, (TOTAL_FRAMES - fr) / 30))} />
  </AbsoluteFill>
);
