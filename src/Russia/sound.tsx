import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
import { w } from "./overlays";
import { CAPS, SCENES, TOTAL_FRAMES } from "./timing";

/**
 * Music and effects. The score (public/music, episodes/music/compose.py) changes cue with the era and sits well under
 * the narration; effects (public/sfx, episodes/sfx/make_sfx.py) are keyed to spoken words like the animation, so a
 * cannon fires on "fired" whatever the voice's timing.
 */

type Fx = "whoosh" | "whoosh_low" | "paper" | "tear" | "pop" | "thud" | "boom" | "cannon" | "gunshots" | "coin" | "coins" | "bell" | "ding" | "tick" | "clock"
  | "snip" | "clang" | "splash" | "waves" | "wind" | "train" | "rocket" | "beep" | "sting" | "boing" | "drumroll" | "crowd" | "typing" | "sparkle" | "gulp" | "fire";

/** [word, occurrence, effect, volume, frame offset] per scene. */
const CUES: Record<string, [string, number, Fx, number, number?][]> = {
  hook: [["862,", 0, "waves", 0.18], ["order", 0, "crowd", 0.12], ["Come", 0, "pop", 0.3], ["They", 0, "waves", 0.3], ["Vikings.", 0, "crowd", 0.3, 10], ["Vikings.", 0, "pop", 0.25, 22],
    ["Eleven", 0, "whoosh_low", 0.3, -6], ["biggest", 0, "pop", 0.3], ["zones,", 0, "clock", 0.3, -18], ["Vikings", 1, "paper", 0.35], ["Mongols,", 0, "paper", 0.35], ["tsars", 0, "paper", 0.35],
    ["communists.", 0, "paper", 0.35], ["entire", 0, "typing", 0.35, -8], ["Russia.", 0, "typing", 0.3, -8], ["go.", 0, "tear", 0.45]],
  rus: [["Rurik,", 0, "pop", 0.3], ["Novgorod.", 0, "pop", 0.25], ["sailed", 0, "waves", 0.25], ["Kyiv.", 0, "pop", 0.25], ["Kievan", 0, "whoosh", 0.3], ["rowing", 0, "waves", 0.2],
    ["furs,", 0, "pop", 0.25], ["honey", 0, "pop", 0.25], ["slaves", 0, "pop", 0.25], ["Great", 0, "ding", 0.3]],
  faith: [["religion,", 0, "paper", 0.3], ["shopping.", 0, "pop", 0.3], ["alcohol.", 0, "boing", 0.35], ["\"Drinking", 0, "gulp", 0.4], ["envoys", 0, "whoosh", 0.25],
    ["church", 0, "bell", 0.35], ["heaven", 0, "sparkle", 0.35], ["Orthodox", 0, "ding", 0.3], ["baptized", 0, "splash", 0.4]],
  mongols: [["split", 0, "tear", 0.4], ["fighting", 0, "clang", 0.3], ["1237,", 0, "drumroll", 0.35, -20], ["arrived.", 0, "whoosh_low", 0.4], ["Batu", 0, "sting", 0.35],
    ["burned", 0, "fire", 0.35], ["1240", 0, "boom", 0.4], ["two", 1, "whoosh", 0.3], ["tribute", 0, "coins", 0.35], ["permission", 0, "paper", 0.3], ["slip.", 0, "thud", 0.4]],
  moscow: [["small", 0, "pop", 0.25], ["brilliant", 0, "ding", 0.35], ["tax", 0, "coins", 0.35], ["Moneybag.", 0, "coin", 0.4], ["rich,", 0, "coins", 0.3], ["strong.", 0, "whoosh", 0.3],
    ["stopped", 0, "tear", 0.4], ["Ugra", 0, "wind", 0.22], ["weeks.", 0, "clock", 0.3, -20], ["home.", 0, "whoosh", 0.25], ["nobody", 0, "boing", 0.3], ["married", 0, "sparkle", 0.3],
    ["eagle,", 0, "whoosh", 0.3], ["Third", 1, "thud", 0.4]],
  terrible: [["crowned", 0, "sparkle", 0.35], ["Caesar.", 0, "pop", 0.3], ["conquered", 0, "drumroll", 0.3, -10], ["Kazan", 0, "whoosh", 0.3], ["Basil's", 0, "bell", 0.4],
    ["died,", 0, "sting", 0.4], ["Terrible.", 0, "boom", 0.35], ["black,", 0, "whoosh_low", 0.3], ["sweep", 0, "whoosh", 0.35], ["rage,", 0, "sting", 0.4], ["struck", 0, "thud", 0.45],
    ["chess.", 0, "thud", 0.35], ["chess.", 0, "ding", 0.3, 10]],
  siberia: [["hired", 0, "coins", 0.3], ["Yermak", 0, "pop", 0.3], ["cross", 0, "whoosh", 0.3], ["1582", 0, "drumroll", 0.3, -10], ["Sibir.", 0, "boom", 0.3], ["furs", 0, "whoosh", 0.3],
    ["Pacific", 0, "waves", 0.3], ["sixty", 0, "ding", 0.3]],
  troubles: [["died", 0, "sting", 0.35], ["over.", 0, "thud", 0.35], ["Time", 0, "tear", 0.4], ["famine.", 0, "wind", 0.3], ["claiming", 0, "pop", 0.3], ["youngest", 0, "thud", 0.3],
    ["Polish", 0, "drumroll", 0.3], ["tsar.", 0, "sparkle", 0.3], ["killed.", 0, "thud", 0.4], ["fired", 0, "cannon", 0.45], ["Poland.", 0, "boing", 0.3], ["second", 0, "pop", 0.3],
    ["Poles", 0, "drumroll", 0.3], ["Moscow.", 0, "clang", 0.3], ["threw", 0, "whoosh", 0.35], ["threw", 0, "crowd", 0.25, 8], ["1613,", 0, "sparkle", 0.3], ["three", 0, "ding", 0.3, 40]],
  peter: [["two", 0, "pop", 0.3], ["Holland.", 0, "sparkle", 0.3], ["disguise", 0, "pop", 0.3], ["tall", 1, "boing", 0.3], ["shipyard,", 0, "clang", 0.3], ["cut", 0, "snip", 0.45],
    ["beards.", 0, "snip", 0.4], ["tax.", 0, "coin", 0.35], ["Sweden", 0, "drumroll", 0.3], ["lost", 0, "thud", 0.35], ["crushed", 0, "cannon", 0.45], ["swamp", 0, "splash", 0.25],
    ["Petersburg.", 0, "bell", 0.35], ["Emperor.", 0, "sparkle", 0.35], ["arrested", 0, "clang", 0.35], ["died", 0, "sting", 0.4], ["second", 0, "ding", 0.3]],
  catherine: [["Fast", 0, "whoosh", 0.35], ["peace", 0, "paper", 0.3], ["gave", 0, "whoosh", 0.25], ["wife,", 0, "pop", 0.3], ["guards", 0, "drumroll", 0.3], ["overthrew", 0, "thud", 0.4],
    ["dead,", 0, "sting", 0.35], ["colic.", 0, "boing", 0.35], ["Great.", 0, "sparkle", 0.35], ["Crimea,", 0, "pop", 0.3], ["carved", 0, "tear", 0.4], ["disappeared", 0, "whoosh_low", 0.35],
    ["Pugachev", 0, "pop", 0.3], ["career.", 0, "ding", 0.35]],
  napoleon: [["invaded", 0, "drumroll", 0.35], ["six", 0, "pop", 0.3], ["retreating,", 0, "whoosh", 0.3], ["burned", 0, "fire", 0.35], ["Borodino,", 0, "cannon", 0.45], ["Borodino,", 0, "boom", 0.35, 18],
    ["seventy", 0, "sting", 0.35], ["took", 0, "whoosh", 0.3], ["empty.", 0, "wind", 0.3], ["burned", 1, "fire", 0.45], ["waited", 0, "clock", 0.3], ["letter", 0, "pop", 0.3],
    ["winter.", 0, "wind", 0.4, -10], ["fraction", 0, "sting", 0.35], ["Paris.", 0, "crowd", 0.3]],
  reform: [["sold.", 0, "ding", 0.3], ["Crimean", 0, "drumroll", 0.25], ["freed", 0, "clang", 0.35], ["freed", 0, "crowd", 0.3, 6], ["Alaska", 0, "whoosh", 0.35], ["seven", 0, "ding", 0.3],
    ["cents", 0, "coin", 0.35], ["gold.", 0, "sparkle", 0.35], ["oil.", 0, "whoosh_low", 0.35], ["Oops.", 0, "boing", 0.4], ["attempts.", 0, "pop", 0.3], ["bomb", 0, "boom", 0.45]],
  nicholas: [["Japan", 0, "drumroll", 0.3], ["sent", 0, "waves", 0.3], ["fire", 0, "cannon", 0.35], ["Japanese.", 0, "boing", 0.3], ["destroyed", 0, "boom", 0.45], ["fired", 0, "gunshots", 0.35],
    ["revolution", 0, "crowd", 0.3], ["parliament.", 0, "thud", 0.35], ["World", 1, "boom", 0.4], ["millions", 0, "sting", 0.4], ["influence.", 0, "sparkle", 0.3], ["poison", 0, "gulp", 0.35],
    ["bullets", 0, "gunshots", 0.3], ["river.", 0, "splash", 0.4], ["autopsy", 0, "thud", 0.35]],
  revolution: [["bread", 0, "crowd", 0.35], ["throne.", 0, "thud", 0.4], ["Germany", 0, "train", 0.35], ["chaos.", 0, "boom", 0.4], ["October", 0, "pop", 0.3], ["November,", 0, "pop", 0.3],
    ["calendar.", 0, "tear", 0.35], ["civil", 0, "drumroll", 0.3], ["basement.", 0, "sting", 0.4], ["Soviet", 0, "ding", 0.3], ["display", 0, "bell", 0.3]],
  stalin: [["steel.", 0, "clang", 0.4], ["giant", 0, "thud", 0.35], ["famine", 0, "wind", 0.3], ["Ukraine.", 0, "sting", 0.35], ["Terror,", 0, "sting", 0.4], ["Gulag.", 0, "wind", 0.35],
    ["photographs.", 0, "whoosh", 0.3], ["deal", 0, "paper", 0.3], ["broke", 0, "tear", 0.4], ["invaded", 0, "boom", 0.45], ["Leningrad", 0, "boom", 0.35], ["Stalingrad,", 0, "cannon", 0.45],
    ["turned", 0, "drumroll", 0.35], ["twenty-seven", 0, "sting", 0.4], ["Berlin.", 0, "bell", 0.35]],
  coldwar: [["hated", 0, "clang", 0.35], ["Sputnik,", 0, "beep", 0.35], ["panicked.", 0, "boing", 0.35], ["Laika.", 0, "pop", 0.3], ["Gagarin", 0, "sparkle", 0.3], ["lifted", 0, "rocket", 0.5],
    ["go!\"", 0, "crowd", 0.3], ["missiles", 0, "sting", 0.4], ["stagnation,", 0, "clock", 0.3], ["Afghanistan,", 0, "boom", 0.35], ["Chernobyl.", 0, "sting", 0.45]],
  collapse: [["openness", 0, "sparkle", 0.3], ["reform.", 0, "clang", 0.3], ["out.", 0, "crowd", 0.35], ["fell.", 0, "boom", 0.35], ["fell.", 0, "crowd", 0.3, 10], ["coup,", 0, "drumroll", 0.3],
    ["tank", 0, "thud", 0.35], ["three", 0, "clock", 0.3], ["Christmas", 0, "bell", 0.35], ["fifteen", 0, "pop", 0.3], ["Pizza", 0, "boing", 0.4]],
  modern: [["chaos.", 0, "whoosh", 0.3], ["vanished,", 0, "whoosh_low", 0.3], ["nothing.", 0, "coin", 0.35], ["Eve", 0, "clock", 0.3], ["Putin.", 0, "thud", 0.35], ["2014,", 0, "pop", 0.3],
    ["invasion", 0, "sting", 0.4]],
  end: [["Vikings,", 0, "pop", 0.3], ["Mongol", 0, "pop", 0.3], ["sons,", 0, "pop", 0.3], ["royals,", 0, "pop", 0.3], ["zones,", 0, "pop", 0.3], ["month,", 0, "pop", 0.3],
    ["human", 0, "pop", 0.3], ["pizza", 0, "pop", 0.3], ["\"Come", 0, "waves", 0.3], ["\"Come", 0, "crowd", 0.25, 20], ["Which", 0, "typing", 0.35], ["comments.", 0, "ding", 0.35]],
};

/** Music cue per scene; neighbours with the same cue play as one continuous loop. */
const MUSIC: Record<string, string> = {
  hook: "saga", rus: "saga", faith: "saga", mongols: "chronicle", moscow: "chronicle", terrible: "chronicle", siberia: "chronicle", troubles: "chronicle",
  peter: "empire", catherine: "empire", napoleon: "napoleon", reform: "empire", nicholas: "empire", revolution: "soviet", stalin: "elegy", coldwar: "space",
  collapse: "modern", modern: "modern", end: "finale",
};
const MUSIC_VOL = 0.1;
const DUCK = 0.5; // music gain while the narrator speaks
const SFX_GAIN = 0.7;
const XFADE = 36;

/** Music gain per global frame: DUCK under speech (gaps under 15 frames count as speech), easing down fast and up slowly. */
const duckCurve = (() => {
  const speech = new Uint8Array(TOTAL_FRAMES + 1);
  for (const [k, sc] of Object.entries(SCENES)) {
    let prev = -1e9;
    for (const [a, b] of CAPS[k] ?? []) {
      const from = a - prev < 15 ? prev : a;
      for (let f = sc.start + from; f <= Math.min(TOTAL_FRAMES, sc.start + b); f++) speech[f] = 1;
      prev = b;
    }
  }
  const g = new Float32Array(TOTAL_FRAMES + 1);
  let cur = 1;
  for (let f = 0; f <= TOTAL_FRAMES; f++) {
    const look = speech[Math.min(TOTAL_FRAMES, f + 4)] ? DUCK : 1; // start ducking just before the voice
    cur += (look - cur) * (look < cur ? 0.25 : 0.05);
    g[f] = cur;
  }
  return g;
})();

const segments = () => {
  const out: { cue: string; from: number; to: number }[] = [];
  for (const [k, sc] of Object.entries(SCENES)) {
    const cue = MUSIC[k]!;
    const last = out[out.length - 1];
    if (last && last.cue === cue) last.to = sc.start + sc.dur;
    else out.push({ cue, from: sc.start, to: sc.start + sc.dur });
  }
  return out;
};

export const Soundtrack: React.FC = () => {
  const segs = segments();
  const total = segs[segs.length - 1]!.to;
  return (
    <>
      {segs.map((s, i) => {
        const from = Math.max(0, s.from - (i ? XFADE / 2 : 0));
        const len = s.to - from + (i < segs.length - 1 ? XFADE / 2 : 0);
        const end = s.to === total;
        return (
          <Sequence key={`${s.cue}${i}`} from={from} durationInFrames={len}>
            <Audio src={staticFile(`music/${s.cue}.mp3`)} loop
              volume={(f) => MUSIC_VOL * duckCurve[Math.max(0, Math.min(TOTAL_FRAMES, Math.round(from + f)))]! * interpolate(f, [0, i ? XFADE : 1, len - (end ? 60 : XFADE), len], [i ? 0 : 1, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
          </Sequence>
        );
      })}
      {Object.entries(SCENES).map(([k, sc], i) => (
        <React.Fragment key={k}>
          {i > 0 ? (
            <>
              <Sequence from={sc.start - 9} durationInFrames={30}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.22 * SFX_GAIN} /></Sequence>
              <Sequence from={sc.start - 4} durationInFrames={30}><Audio src={staticFile("sfx/paper.wav")} volume={0.28 * SFX_GAIN} /></Sequence>
            </>
          ) : null}
          {(CUES[k] ?? []).map(([word, n, fx, vol, off = 0], j) => (
            <Sequence key={j} from={Math.max(0, sc.start + w(k, word, n) + off)} durationInFrames={200}>
              <Audio src={staticFile(`sfx/${fx}.wav`)} volume={vol * SFX_GAIN} />
            </Sequence>
          ))}
        </React.Fragment>
      ))}
    </>
  );
};
