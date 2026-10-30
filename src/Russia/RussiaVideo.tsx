import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, getStaticFiles, interpolate, staticFile, useCurrentFrame } from "remotion";
import { INK, PaperDefs, PaperTexture, torn, usePaperFonts } from "../Puppet/paper";
import { T } from "./kit";
import { Backdrop, ERA_OF, EraContext } from "./era";
import { Captions } from "./overlays";
import { SceneInserts } from "./inserts";
import { HookPaper } from "./Pilot";
import { SCENES1 } from "./scenes1";
import { SCENES2 } from "./scenes2";
import { SCENES3 } from "./scenes3";
import { SCENES4 } from "./scenes4";
import { SCENES } from "./timing";
import { Soundtrack } from "./sound";

/**
 * "The Entire History of Russia in 12 Minutes", paper-theatre cut: cut-paper puppets on era backdrops, satellite maps
 * with paper labels, paper captions. Every event is keyed to a spoken word via w(scene, word); maps come from
 * src/Russia/maps.json + public/sat, the deep narration from public/vo_russia, music and effects from sound.tsx.
 */

const SCENE: Record<string, React.FC> = { ...SCENES1, ...SCENES2, ...SCENES3, ...SCENES4, hook: HookPaper };

const Missing: React.FC<{ name: string }> = ({ name }) => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}><T x={960} y={540} size={90}>{name}</T></svg>
);

const has = (src: string) => getStaticFiles().some((s) => s.name === src);

/**
 * A slow camera on every scene so no shot is ever static: alternate scenes push in or ease out, with a gentle drift
 * whose direction also alternates. Captions sit outside it and stay put.
 */
const camera = (i: number, f: number, dur: number) => {
  const t = interpolate(f, [0, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });
  const zoom = i % 2 ? 1.07 - 0.05 * t : 1.02 + 0.05 * t;
  const dir = i % 4 < 2 ? 1 : -1;
  return `scale(${zoom.toFixed(4)}) translate(${(dir * (t - 0.5) * 28).toFixed(2)}px, ${((0.5 - t) * 10).toFixed(2)}px)`;
};

const SceneFrame: React.FC<{ k: string; i: number; dur: number }> = ({ k, i, dur }) => {
  const f = useCurrentFrame();
  const Comp = SCENE[k];
  const era = ERA_OF[k] ?? "saga";
  return (
    <EraContext.Provider value={era}>
      <AbsoluteFill style={{ transform: camera(i, f, dur), transformOrigin: "50% 45%" }}>
        <Backdrop era={era} f={f} />
        {Comp ? <Comp /> : <Missing name={k} />}
      </AbsoluteFill>
      <PaperTexture op={0.3} />
    </EraContext.Provider>
  );
};

const WIPE = 18; // frames: a torn paper sheet sweeps across every scene cut, covering the frame at the cut itself
const PAPER_OF: Record<string, string> = { saga: "#EDE3CC", chronicle: "#E8D9B2", empire: "#E4DFD0", soviet: "#EFE4CC", modern: "#E6E3DC" };

const Wipe: React.FC<{ next: string; seed: number }> = ({ next, seed }) => {
  const f = useCurrentFrame();
  // sheet travels right to left: off-screen right -> covering (at WIPE / 2, the cut) -> off-screen left
  const x = interpolate(f, [0, WIPE / 2, WIPE], [1960, -80, -2300], { easing: Easing.inOut(Easing.cubic) });
  const tilt = interpolate(f, [0, WIPE], [4, -4]);
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${x} 0) rotate(${tilt} 1000 540)`}>
          <path d={torn(0, -200, 2100, 1480, seed, 26, 40)} fill={PAPER_OF[ERA_OF[next] ?? "saga"]} stroke={INK} strokeWidth={3} filter="url(#cut)" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const RussiaVideo: React.FC = () => {
  usePaperFonts();
  return (
    <AbsoluteFill style={{ background: "#E8D9B2" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}><PaperDefs /></svg>
      {Object.entries(SCENES).map(([key, sc], i) => (
        <Sequence key={key} from={sc.start} durationInFrames={sc.dur} name={key}>
          <SceneFrame k={key} i={i} dur={sc.dur} />
          <SceneInserts scene={key} />
          <Captions scene={key} paper />
          {has(`vo_russia/${key}.wav`) ? (
            <Sequence from={sc.lead}>
              <Audio src={staticFile(`vo_russia/${key}.wav`)} />
            </Sequence>
          ) : null}
        </Sequence>
      ))}
      {Object.entries(SCENES).slice(1).map(([key, sc], i) => (
        <Sequence key={`wipe-${key}`} from={sc.start - WIPE / 2} durationInFrames={WIPE} name={`wipe → ${key}`}>
          <Wipe next={key} seed={i * 7 + 3} />
        </Sequence>
      ))}
      <Soundtrack />
    </AbsoluteFill>
  );
};
