import React from "react";
import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { w } from "./overlays";

/**
 * Generated video inserts (public/gemini, made in Google Flow from the prompts in episodes/russia/veo_shots.md).
 * Each one cuts in full-screen on a spoken word and plays until another spoken word, keyed like everything else, so it
 * follows the narration's timing. They sit under the captions; their own ambient sound is mixed low.
 */
type Insert = { scene: string; clip: string; from: [string, number]; to: [string, number]; tail?: number; skip?: number; vol?: number };

export const INSERTS: Insert[] = [
  { scene: "hook", clip: "vikings", from: ["They", 0], to: ["Eleven", 0], tail: 20, vol: 0.5 },
  { scene: "napoleon", clip: "moscow_fire", from: ["Then", 0], to: ["He", 0], tail: 40, skip: 2.2, vol: 0.5 },
  { scene: "napoleon", clip: "winter_retreat", from: ["So", 0], to: ["Only", 0], tail: 70, vol: 0.6 },
  { scene: "coldwar", clip: "launch", from: ["As", 0], to: ["A", 1], skip: 1.0, vol: 0.35 },
  { scene: "collapse", clip: "berlin_wall", from: ["they", 1], to: ["In", 1], tail: 6, skip: 2.5, vol: 0.6 },
];

const FADE = 5;

const Clip: React.FC<{ clip: string; len: number; skip: number; vol: number }> = ({ clip, len, skip, vol }) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, FADE, len - FADE, len], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zoom = interpolate(f, [0, len], [1.0, 1.06], { easing: Easing.inOut(Easing.sin) });
  return (
    <AbsoluteFill style={{ opacity: op, background: "#1A1210" }}>
      <OffthreadVideo src={staticFile(`gemini/${clip}.mp4`)} startFrom={Math.round(skip * 30)} volume={vol}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
    </AbsoluteFill>
  );
};

/** The inserts of one scene (render inside that scene's Sequence, under its captions). */
export const SceneInserts: React.FC<{ scene: string }> = ({ scene }) => (
  <>
    {INSERTS.filter((x) => x.scene === scene).map((x) => {
      const a = w(scene, ...x.from) - 4;
      const skip = x.skip ?? 0;
      const len = Math.min(w(scene, ...x.to) + (x.tail ?? 0) - a, Math.floor((8 - skip) * 30) - 2);
      return (
        <Sequence key={x.clip} from={a} durationInFrames={len} name={`insert ${x.clip}`}>
          <Clip clip={x.clip} len={len} skip={skip} vol={x.vol ?? 0.5} />
        </Sequence>
      );
    })}
  </>
);
