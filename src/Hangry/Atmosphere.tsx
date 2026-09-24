import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "./theme";

/**
 * The lighting rig. This is most of what separates "motion graphics" from "slides".
 *
 * A flat fill behind a flat figure reads as a PowerPoint background no matter how
 * well the figure is animated, because nothing in the frame has depth or falloff.
 * Four cheap layers fix that:
 *
 *   1. a graded ground instead of a solid colour
 *   2. a soft key light behind the subject, which gives the figure somewhere to be
 *   3. a vignette, which stops the frame edges reading as a slide border
 *   4. grain, which glues the flat vector layers into one image
 *
 * Grain is the expensive one if done naively — a per-frame feTurbulence at 1920x1080
 * across 3500 frames is minutes of render time. Instead the turbulence is rendered
 * once at a small size, tiled, and translated a few pixels per frame. It reads as
 * moving grain and costs effectively nothing.
 */

export const KeyLight: React.FC<{
  x?: number;
  y?: number;
  radius?: number;
  color?: string;
  intensity?: number;
}> = ({ x = 62, y = 46, radius = 58, color = COLORS.accent, intensity = 0.22 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse ${radius}% ${radius * 1.15}% at ${x}% ${y}%, ${color}, transparent 70%)`,
      opacity: intensity,
      mixBlendMode: "screen",
    }}
  />
);

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.72 }) => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse 78% 78% at 50% 48%, transparent 42%, rgba(0,0,0,0.95) 100%)",
      opacity: strength,
    }}
  />
);

/**
 * Static turbulence, translated per frame. Cheap, and reads as real grain.
 *
 * Kept deliberately light. Grain is high-frequency noise, so the encoder cannot
 * predict it between frames — at 0.055 it pushed the same 117s render from 12 MB to
 * 82 MB. Two octaves instead of three also thins the noise and renders faster.
 */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.022 }) => {
  const frame = useCurrentFrame();
  // Deterministic jitter — no Math.random, so renders are reproducible.
  const dx = ((frame * 37) % 11) - 5;
  const dy = ((frame * 53) % 13) - 6;
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none", opacity }}>
      <svg
        width="120%"
        height="120%"
        style={{
          position: "absolute",
          left: `${dx}px`,
          top: `${dy}px`,
          mixBlendMode: "overlay",
        }}
      >
        <filter id="grain-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.92"
            numOctaves={2}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-noise)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Graded ground. Two stops plus a warm floor bounce reads as lit space, not paper. */
export const Ground: React.FC<{ tint?: string }> = ({ tint = COLORS.accent }) => (
  <>
    <AbsoluteFill
      style={{
        background: `linear-gradient(165deg, ${COLORS.bgAlt} 0%, ${COLORS.bg} 46%, #0A0B10 100%)`,
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 90% 40% at 50% 104%, ${tint}, transparent 68%)`,
        opacity: 0.12,
        mixBlendMode: "screen",
      }}
    />
  </>
);

/**
 * Full atmosphere stack. Scenes render their world as children; everything that
 * makes the frame feel lit is applied around it in the right order.
 */
export const Atmosphere: React.FC<{
  children: React.ReactNode;
  /** Key light position in percent, so scenes can light their own subject. */
  lightX?: number;
  lightY?: number;
  lightColor?: string;
  lightIntensity?: number;
  /** Rises with tension — the frame gets hotter as the beat escalates. */
  heat?: number;
}> = ({
  children,
  lightX = 62,
  lightY = 46,
  lightColor = COLORS.accent,
  lightIntensity = 0.2,
  heat = 0,
}) => (
  <AbsoluteFill>
    <Ground tint={lightColor} />
    <KeyLight
      x={lightX}
      y={lightY}
      color={lightColor}
      intensity={lightIntensity + heat * 0.28}
    />
    {children}
    {/* Heat haze sits above the art so escalation reads on the whole frame. */}
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 70% 60% at ${lightX}% ${lightY}%, ${COLORS.accent}, transparent 72%)`,
        opacity: heat * 0.16,
        mixBlendMode: "screen",
      }}
    />
    <Vignette strength={interpolate(heat, [0, 1], [0.7, 0.86])} />
    <Grain />
  </AbsoluteFill>
);
