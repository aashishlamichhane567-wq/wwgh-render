import React from "react";
import { AbsoluteFill, Audio, Sequence, getStaticFiles, staticFile } from "remotion";
import { PaperDefs, usePaperFonts } from "../Puppet/paper";
import { Hook } from "./hook";
import { SECTIONS } from "./sections";
import { Captions, w } from "./overlays";
import { SCENES, TOTAL_FRAMES } from "./timing";

/**
 * "You Were Trained Wrong" (discipline, ~8 min): the hook from hook.tsx, sections 2-7 from sections.tsx, word-synced
 * captions, the designed narrator (public/vo_disc), coded music under it and effects keyed to spoken words.
 */

type Fx = "beep" | "thud" | "whoosh" | "whoosh_low" | "pop" | "ding" | "sting" | "clock" | "typing" | "paper" | "tick" | "tear" | "boing"
  | "sparkle" | "coin" | "coins" | "crowd" | "wind" | "clang";
/** [word, occurrence, effect, volume, frame offset] per scene — keyed to the voice like the animation. */
const CUES: Record<string, [string, number, Fx, number, number?][]> = {
  hook: [["There", 0, "clock", 0.15, -20], ["eyes", 0, "thud", 0.35], ["before", 0, "whoosh_low", 0.45, -4], ["cold", 0, "pop", 0.3], ["long", 0, "pop", 0.3],
    ["project", 0, "thud", 0.4, 8], ["for", 0, "thud", 0.55], ["for", 0, "sting", 0.3, 2], ["reaches", 0, "whoosh", 0.25], ["alarm", 1, "thud", 0.5],
    ["later.", 0, "pop", 0.3], ["fight", 0, "ding", 0.45], ["awake", 0, "thud", 0.45]],
  guilt: [["guilt", 0, "whoosh_low", 0.3], ["tab", 0, "typing", 0.3], ["plan", 0, "paper", 0.35], ["three", 0, "tick", 0.35], ["works", 0, "ding", 0.3],
    ["doesn't", 0, "tear", 0.45], ["wrong", 0, "sting", 0.3], ["willpower", 0, "thud", 0.35], ["soft", 0, "boing", 0.25], ["push", 0, "thud", 0.4], ["barely", 0, "ding", 0.3]],
  sensation: [["2012", 0, "paper", 0.3], ["buzzed", 0, "beep", 0.2], ["asked", 0, "pop", 0.3], ["fewer", 0, "whoosh", 0.3], ["industriousness", 0, "ding", 0.35],
    ["sensation", 0, "thud", 0.5, 8], ["chest", 0, "thud", 0.35], ["conditioned", 0, "pop", 0.3], ["reward", 0, "sparkle", 0.35], ["reward", 1, "sparkle", 0.35]],
  prediction: [["helicopters", 0, "whoosh", 0.3], ["paradox", 0, "ding", 0.3], ["dopamine", 0, "sting", 0.35], ["schultz", 0, "paper", 0.3], ["juice", 0, "pop", 0.3],
    ["moved", 0, "whoosh_low", 0.4], ["glass", 0, "ding", 0.35], ["ten", 0, "coins", 0.3], ["strain", 0, "thud", 0.35], ["flinches", 0, "boing", 0.25], ["prediction", 0, "sting", 0.35]],
  flinch: [["lazy", 0, "tear", 0.35], ["report", 0, "pop", 0.3], ["trophy", 0, "sparkle", 0.3], ["celebrated", 0, "crowd", 0.3], ["weeks", 0, "clock", 0.25],
    ["tax", 0, "coin", 0.35], ["gate", 0, "whoosh", 0.3], ["finish", 0, "crowd", 0.25], ["shut", 0, "thud", 0.45], ["punishment", 0, "thud", 0.5], ["carve", 0, "whoosh_low", 0.35]],
  rewires: [["weather", 0, "wind", 0.2], ["association", 0, "clang", 0.25], ["one", 0, "ding", 0.35], ["tick", 0, "tick", 0.4], ["showed", 0, "sparkle", 0.3],
    ["two", 0, "ding", 0.35], ["coffee", 0, "pop", 0.3], ["three", 0, "ding", 0.35], ["sentence", 0, "boing", 0.3], ["four", 0, "ding", 0.35], ["calm", 0, "clang", 0.25],
    ["five", 1, "ding", 0.35], ["win", 0, "thud", 0.45], ["win", 0, "sparkle", 0.3, 4]],
  quiet: [["argument", 0, "pop", 0.3], ["quiet", 0, "whoosh_low", 0.3], ["side", 0, "pop", 0.35], ["good", 0, "sparkle", 0.3], ["comments", 0, "ding", 0.3],
    ["cognalyst", 0, "sting", 0.3]],
};

/** Music cue per scene; neighbours with the same cue play as one continuous loop. */
const MUSIC: Record<string, string> = { hook: "elegy", guilt: "elegy", sensation: "modern", prediction: "modern", flinch: "elegy", rewires: "finale", quiet: "finale" };
const MUSIC_VOL = 0.07;
const FADE = 30;

const Music: React.FC = () => {
  const segs: { cue: string; from: number; to: number }[] = [];
  for (const [k, sc] of Object.entries(SCENES)) {
    const cue = MUSIC[k] ?? "elegy", last = segs[segs.length - 1];
    if (last && last.cue === cue) last.to = sc.start + sc.dur;
    else segs.push({ cue, from: sc.start, to: sc.start + sc.dur });
  }
  return (
    <>
      {segs.map((s) => (
        <Sequence key={s.from} from={s.from} durationInFrames={Math.min(TOTAL_FRAMES, s.to) - s.from}>
          <Audio src={staticFile(`music/${s.cue}.mp3`)} loop volume={(fr) => MUSIC_VOL * Math.min(1, fr / FADE, Math.max(0, (s.to - s.from - fr) / FADE))} />
        </Sequence>
      ))}
    </>
  );
};

const Sfx: React.FC<{ scene: string }> = ({ scene }) => {
  const beeps: number[] = [];
  if (scene === "hook") for (let at = w(scene, "alarm"); at < w(scene, "alarm", 1); at += 15) beeps.push(at);
  return (
    <>
      {beeps.map((at) => (
        <Sequence key={`b${at}`} from={at} durationInFrames={12}><Audio src={staticFile("sfx/beep.wav")} volume={0.16} /></Sequence>
      ))}
      {(CUES[scene] ?? []).map(([word, n, fx, vol, off = 0], i) => (
        <Sequence key={i} from={Math.max(0, w(scene, word, n) + off)}><Audio src={staticFile(`sfx/${fx}.wav`)} volume={vol * 0.7} /></Sequence>
      ))}
    </>
  );
};

const has = (src: string) => getStaticFiles().some((s) => s.name === src);

export const DiscVideo: React.FC = () => {
  usePaperFonts();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}><PaperDefs /></svg>
      {Object.entries(SCENES).map(([key, sc]) => {
        const Section = SECTIONS[key];
        return (
          <Sequence key={key} from={sc.start} durationInFrames={sc.dur} name={key}>
            {Section ? <Section /> : <Hook scene={key} />}
            <Captions scene={key} paper={key === "paper"} />
            {has(`vo_disc/${key}.wav`) ? <Sequence from={sc.lead}><Audio src={staticFile(`vo_disc/${key}.wav`)} /></Sequence> : null}
            <Sfx scene={key} />
          </Sequence>
        );
      })}
      <Music />
    </AbsoluteFill>
  );
};
