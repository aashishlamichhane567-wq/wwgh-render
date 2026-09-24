import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, getStaticFiles, interpolate, staticFile, useCurrentFrame } from "remotion";

const has = (src: string) => getStaticFiles().some((s) => s.name === src);
const snap = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 5);
const FONT = "'Segoe UI', Arial, sans-serif";

/**
 * Real footage as an "evidence card": the photo or clip pinned onto the paper world with a white border, a slight
 * tilt and a credit line (CC BY needs the author and licence on screen as well as in the description).
 * `from`/`to` are frames of the enclosing Sequence; a missing file renders nothing, so the drawing shows.
 */
export const Evidence: React.FC<{
  src: string; from: number; to: number; w: number; h: number; title: string; credit: string; rot?: number; x?: number; y?: number;
}> = ({ src, from, to, w, h, title, credit, rot = -2, x = 960, y = 500 }) => {
  if (!has(src)) return null;
  return (
    <Sequence from={from} durationInFrames={to - from} layout="none">
      <Card src={src} len={to - from} w={w} h={h} title={title} credit={credit} rot={rot} x={x} y={y} />
    </Sequence>
  );
};

const Card: React.FC<{ src: string; len: number; w: number; h: number; title: string; credit: string; rot: number; x: number; y: number }> = ({
  src, len, w, h, title, credit, rot, x, y,
}) => {
  const f = useCurrentFrame();
  const inT = snap(f / 12);
  const out = interpolate(f, [len - 10, len], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const drift = interpolate(f, [0, len], [1, 1.07]);
  const video = /\.(mp4|webm)$/.test(src);
  const pad = 22, cap = 92;
  return (
    <AbsoluteFill style={{ background: `rgba(26,23,20,${0.35 * Math.min(inT, out)})` }}>
      <div
        style={{
          position: "absolute", left: x - w / 2 - pad, top: y - h / 2 - pad, width: w + 2 * pad, height: h + 2 * pad + cap,
          background: "#FFFDF8", boxShadow: "0 18px 50px rgba(0,0,0,0.35)", borderRadius: 6, opacity: out,
          transform: `translateY(${(1 - inT) * 120}px) rotate(${rot * inT}deg) scale(${0.9 + 0.1 * inT})`,
        }}
      >
        <div style={{ position: "absolute", left: pad, top: pad, width: w, height: h, overflow: "hidden", background: "#222" }}>
          <div style={{ width: "100%", height: "100%", transform: `scale(${drift})` }}>
            {video ? (
              <OffthreadVideo src={staticFile(src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
          </div>
        </div>
        <div style={{ position: "absolute", left: pad, top: h + pad + 12, width: w, fontFamily: FONT }}>
          <div style={{ fontWeight: 800, fontSize: 34, color: "#1A1714", lineHeight: 1.15 }}>{title}</div>
          <div style={{ fontWeight: 600, fontSize: 22, color: "#6B645A", marginTop: 6 }}>{credit}</div>
        </div>
        <div style={{ position: "absolute", left: "50%", top: -14, width: 150, height: 34, marginLeft: -75, background: "rgba(240,160,24,0.55)", transform: "rotate(3deg)" }} />
      </div>
    </AbsoluteFill>
  );
};

/** A full-frame rendered clip (Blender shots in public/3d) from the enclosing Sequence's start; nothing if missing. */
export const Footage: React.FC<{ src: string }> = ({ src }) =>
  has(src) ? (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile(src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
  ) : null;
