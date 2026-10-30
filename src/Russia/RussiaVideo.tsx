import React from "react";
import { AbsoluteFill, Audio, Sequence, getStaticFiles, staticFile, useCurrentFrame } from "remotion";
import { PaperDefs, PaperTexture, usePaperFonts } from "../Puppet/paper";
import { T } from "./kit";
import { Backdrop, ERA_OF, EraContext } from "./era";
import { Captions } from "./overlays";
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

const SceneFrame: React.FC<{ k: string }> = ({ k }) => {
  const f = useCurrentFrame();
  const Comp = SCENE[k];
  const era = ERA_OF[k] ?? "saga";
  return (
    <EraContext.Provider value={era}>
      <Backdrop era={era} f={f} />
      {Comp ? <Comp /> : <Missing name={k} />}
      <PaperTexture op={0.3} />
    </EraContext.Provider>
  );
};

export const RussiaVideo: React.FC = () => {
  usePaperFonts();
  return (
    <AbsoluteFill style={{ background: "#E8D9B2" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}><PaperDefs /></svg>
      {Object.entries(SCENES).map(([key, sc]) => (
        <Sequence key={key} from={sc.start} durationInFrames={sc.dur} name={key}>
          <SceneFrame k={key} />
          <Captions scene={key} paper />
          {has(`vo_russia/${key}.wav`) ? (
            <Sequence from={sc.lead}>
              <Audio src={staticFile(`vo_russia/${key}.wav`)} />
            </Sequence>
          ) : null}
        </Sequence>
      ))}
      <Soundtrack />
    </AbsoluteFill>
  );
};
