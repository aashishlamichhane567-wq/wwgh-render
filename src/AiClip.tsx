import React from "react";
import { AbsoluteFill, OffthreadVideo, getStaticFiles, interpolate, staticFile, useCurrentFrame } from "remotion";

/**
 * An AI-generated shot (free-ai-video skill, public/ai/) laid over the scene's own art. It plays from the
 * start of its enclosing Sequence and dissolves into the drawing underneath at `to`. Key `to` to a spoken word
 * with w(scene, word) so it cannot drift from the voice. The clip must run at least `to` frames at 30 fps
 * (a 5 s --hd clip = 150 frames). A clip not generated yet renders as nothing, so the drawn shot underneath shows.
 */
export const AiClip: React.FC<{ src: string; to: number; fade?: number; push?: number }> = ({ src, to, fade = 18, push = 1.06 }) => {
  const f = useCurrentFrame();
  if (f >= to || !getStaticFiles().some((s) => s.name === src)) return null;
  const opacity = interpolate(f, [to - fade, to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(f, [0, to], [1, push]);
  return (
    <AbsoluteFill style={{ opacity }}>
      <OffthreadVideo src={staticFile(src)} muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})` }} />
    </AbsoluteFill>
  );
};
