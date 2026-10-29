import React from "react";
import { AbsoluteFill, Audio, Sequence, getStaticFiles, staticFile } from "remotion";
import { Paper } from "../Hangry2/kit";
import { C, T } from "./kit";
import { Captions } from "./overlays";
import { SCENES1 } from "./scenes1";
import { SCENES2 } from "./scenes2";
import { SCENES3 } from "./scenes3";
import { SCENES4 } from "./scenes4";
import { SCENES } from "./timing";

/**
 * "The Entire History of Russia in 12 Minutes". Every event is keyed to a spoken word via w(scene, word);
 * maps come from src/Russia/maps.json (episodes/russia/build_maps.py), the voice from public/vo_russia.
 */

const SCENE: Record<string, React.FC> = { ...SCENES1, ...SCENES2, ...SCENES3, ...SCENES4 };

const Missing: React.FC<{ name: string }> = ({ name }) => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}><T x={960} y={540} size={90}>{name}</T></svg>
);

const has = (src: string) => getStaticFiles().some((s) => s.name === src);

export const RussiaVideo: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    {Object.entries(SCENES).map(([key, sc]) => {
      const Comp = SCENE[key];
      return (
        <Sequence key={key} from={sc.start} durationInFrames={sc.dur} name={key}>
          <Paper>{Comp ? <Comp /> : <Missing name={key} />}</Paper>
          <Captions scene={key} />
          {has(`vo_russia/${key}.wav`) ? (
            <Sequence from={sc.lead}>
              <Audio src={staticFile(`vo_russia/${key}.wav`)} />
            </Sequence>
          ) : null}
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
