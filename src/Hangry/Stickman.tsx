import React from "react";
import { COLORS } from "./theme";

/**
 * A poseable stickman drawn in SVG.
 *
 * The rig is intentionally simple — limbs are straight segments rotated about
 * their joint — because the expressiveness in this style comes from timing and
 * silhouette, not from anatomy. Two shoulders, two hips, a head that can tilt.
 *
 * `anger` (0..1) drives the whole emotional read: eyebrows rotate down and in,
 * the mouth inverts, the body picks up a tremble, and the ink shifts toward the
 * accent colour. Driving one scalar from the scenes rather than swapping discrete
 * "moods" is what lets the escalation feel continuous instead of stepped.
 *
 * Local coordinate space is 200x320 with the figure centred on x=100, so callers
 * can position with `x`/`y` and not think about the internals.
 */

export type StickmanProps = {
  /** 0 = calm, 1 = fully hangry. Drives face, tremble and colour. */
  anger?: number;
  /** Limb angles in degrees. 0 points straight down from the joint. */
  armL?: number;
  armR?: number;
  legL?: number;
  legR?: number;
  /** Whole-body lean in degrees, positive leans right. */
  lean?: number;
  /** Head tilt in degrees, independent of lean. */
  headTilt?: number;
  /** Breathing / idle bob amplitude in px. Set 0 to freeze. */
  bob?: number;
  /** Frame counter, used for tremble and bob. Pass useCurrentFrame(). */
  frame?: number;
  /** Centre of the figure in world coordinates, independent of `scale`. */
  x?: number;
  y?: number;
  scale?: number;
  color?: string;
  /** Renders eyes as X marks — for the "brain offline" beat. */
  knockedOut?: boolean;
  opacity?: number;
  /** Hollow head with no face — the "Why hate the other" style. */
  faceless?: boolean;
  /** Dashed lines, for an unknown stranger. */
  dashed?: boolean;
  /** Line weight in rig units. */
  stroke?: number;
  /** Faceless head fill, so heads knock out the art behind them on a non-white ground. */
  headFill?: string;
  /** Full expression (overrides the anger-driven face). Use a FACES preset, or blendFace() between two. */
  face?: Face;
};

/**
 * Every field is numeric so two expressions can blend frame by frame (blendFace), which is what makes a
 * reaction read as a change of mind rather than a swapped sticker.
 */
export type Face = {
  /** + = inner ends down (anger), - = inner ends up (sad, worried). Degrees. */
  browTilt: number;
  /** Brow height in rig units: ~28 raised, 36 rest, 40 frowning. */
  browY: number;
  /** Lifts the right brow only: the "wait, what?" brow. */
  browAsym: number;
  /** 0 shut, 1 normal, 1.7 wide. */
  eyeOpen: number;
  /** 0..1, closed happy arcs. */
  eyeSmile: number;
  /** Gaze, -1..1. Eyes looking AT the other character is most of what makes two figures relate. */
  lookX: number;
  lookY: number;
  /** + smile, - frown. */
  mouthCurve: number;
  /** 0 closed, 1 wide open. */
  mouthOpen: number;
  /** One corner up: smirk, doubt. */
  mouthSkew: number;
};

const F = (f: Partial<Face>): Face => ({
  browTilt: 0, browY: 36, browAsym: 0, eyeOpen: 1, eyeSmile: 0, lookX: 0, lookY: 0,
  mouthCurve: 2, mouthOpen: 0, mouthSkew: 0, ...f,
});

export const FACES = {
  neutral: F({}),
  happy: F({ browTilt: -4, browY: 33, eyeSmile: 1, mouthCurve: 10, mouthOpen: 0.25 }),
  laugh: F({ browTilt: -6, browY: 31, eyeSmile: 1, mouthCurve: 12, mouthOpen: 0.85 }),
  sad: F({ browTilt: -18, browY: 36, eyeOpen: 0.8, lookY: 0.5, mouthCurve: -8 }),
  worried: F({ browTilt: -14, browY: 33, eyeOpen: 1.25, mouthCurve: -4, mouthSkew: 0.3 }),
  confused: F({ browAsym: 5, eyeOpen: 1.05, lookX: 0.5, lookY: -0.3, mouthCurve: -2, mouthSkew: 0.7 }),
  shocked: F({ browY: 30, eyeOpen: 1.7, mouthCurve: 0, mouthOpen: 1 }),
  annoyed: F({ browTilt: 12, browY: 38, eyeOpen: 0.5, lookX: -0.6, mouthCurve: -3, mouthSkew: -0.3 }),
  angry: F({ browTilt: 26, browY: 40, eyeOpen: 0.8, mouthCurve: -10, mouthOpen: 0.35 }),
  smug: F({ browAsym: 5, browTilt: 4, eyeOpen: 0.6, lookX: 0.4, mouthCurve: 5, mouthSkew: 1 }),
} satisfies Record<string, Face>;

export const blendFace = (a: Face, b: Face, t: number, extra: Partial<Face> = {}): Face => {
  const k = Math.max(0, Math.min(1, t));
  const out = { ...a };
  (Object.keys(a) as (keyof Face)[]).forEach((key) => (out[key] = a[key] + (b[key] - a[key]) * k));
  return { ...out, ...extra };
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const mixHex = (from: string, to: string, t: number) => {
  const parse = (h: string) =>
    [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = parse(from);
  const [r2, g2, b2] = parse(to);
  const c = (a: number, b: number) =>
    Math.round(lerp(a, b, t)).toString(16).padStart(2, "0");
  return `#${c(r1!, r2!)}${c(g1!, g2!)}${c(b1!, b2!)}`;
};

export const Stickman: React.FC<StickmanProps> = ({
  anger = 0,
  armL = 25,
  armR = -25,
  legL = 15,
  legR = -15,
  lean = 0,
  headTilt = 0,
  bob = 2,
  frame = 0,
  x = 0,
  y = 0,
  scale = 1,
  color,
  knockedOut = false,
  opacity = 1,
  faceless = false,
  dashed = false,
  stroke = 7,
  headFill = "#FFFFFF",
  face,
}) => {
  const a = Math.max(0, Math.min(1, anger));

  // Tremble grows with anger and is deliberately high-frequency so it reads as
  // tension rather than as a wobble.
  const tremble = a * 1.6;
  const shakeX = Math.sin(frame * 1.9) * tremble;
  const shakeY = Math.cos(frame * 2.3) * tremble * 0.6;

  const breathe = Math.sin(frame / 14) * bob;

  const ink = color ?? mixHex(COLORS.ink, COLORS.accent, a * 0.75);

  // Eyebrows: from flat-and-neutral to steep-and-converging.
  const browAngle = lerp(-4, 26, a);
  const browY = lerp(34, 39, a);

  // Mouth: a smile at a=0, a flat line mid-way, a deep scowl at a=1.
  const mouthCurve = lerp(8, -11, a);

  // x/y is the figure's CENTRE, not its box corner. Anchoring by corner meant every
  // caller had to subtract half the figure's size *times its scale* to place it, and
  // getting that wrong silently mis-frames every close-up that aims at the figure.
  // Local centre is (100, 160) in the 200x320 rig space.
  const originX = x - 100 * scale;
  const originY = y - 160 * scale;

  return (
    <g
      transform={`translate(${originX + shakeX}, ${originY + shakeY + breathe}) scale(${scale})`}
      opacity={opacity}
      strokeDasharray={dashed ? "13 9" : undefined}
    >
      <g transform={`rotate(${lean}, 100, 190)`}>
        {/* torso */}
        <line
          x1={100}
          y1={92}
          x2={100}
          y2={190}
          stroke={ink}
          strokeWidth={stroke}
          strokeLinecap="round"
        />

        {/* arms pivot at the shoulder */}
        <g transform={`rotate(${armL}, 100, 108)`}>
          <line
            x1={100}
            y1={108}
            x2={100}
            y2={168}
            stroke={ink}
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        </g>
        <g transform={`rotate(${armR}, 100, 108)`}>
          <line
            x1={100}
            y1={108}
            x2={100}
            y2={168}
            stroke={ink}
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        </g>

        {/* legs pivot at the hip */}
        <g transform={`rotate(${legL}, 100, 190)`}>
          <line
            x1={100}
            y1={190}
            x2={100}
            y2={262}
            stroke={ink}
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        </g>
        <g transform={`rotate(${legR}, 100, 190)`}>
          <line
            x1={100}
            y1={190}
            x2={100}
            y2={262}
            stroke={ink}
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        </g>

        {/* head */}
        <g transform={`rotate(${headTilt}, 100, 58)`}>
          <circle
            cx={100}
            cy={58}
            r={32}
            stroke={ink}
            strokeWidth={stroke}
            fill={faceless || face ? headFill : "none"}
          />

          {!faceless && face ? (
            <FaceMarks f={face} ink={ink} frame={frame} />
          ) : null}
          {!faceless && !face && (<>
          {knockedOut ? (
            <>
              <path
                d="M80 48 l12 12 M92 48 l-12 12"
                stroke={ink}
                strokeWidth={4.5}
                strokeLinecap="round"
              />
              <path
                d="M108 48 l12 12 M120 48 l-12 12"
                stroke={ink}
                strokeWidth={4.5}
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              <circle cx={88} cy={54} r={4} fill={ink} />
              <circle cx={112} cy={54} r={4} fill={ink} />
              {/* eyebrows converge as anger rises */}
              <line
                x1={78}
                y1={browY}
                x2={95}
                y2={browY}
                stroke={ink}
                strokeWidth={4.5}
                strokeLinecap="round"
                transform={`rotate(${browAngle}, 86, ${browY})`}
              />
              <line
                x1={105}
                y1={browY}
                x2={122}
                y2={browY}
                stroke={ink}
                strokeWidth={4.5}
                strokeLinecap="round"
                transform={`rotate(${-browAngle}, 114, ${browY})`}
              />
            </>
          )}

          <path
            d={`M84 72 Q100 ${72 + mouthCurve} 116 72`}
            stroke={ink}
            strokeWidth={4.5}
            fill="none"
            strokeLinecap="round"
          />
          </>)}
        </g>
      </g>
    </g>
  );
};

/** A blink every ~3.3 s (offset per figure by frame phase), 4 frames long, skipped when the eyes are shut anyway. */
const blinkAt = (frame: number) => {
  const p = frame % 100;
  return p < 4 ? [1, 0.25, 0.1, 0.5][p]! : 1;
};

const FaceMarks: React.FC<{ f: Face; ink: string; frame: number }> = ({ f, ink, frame }) => {
  const w = 4.5;
  const px = f.lookX * 4, py = f.lookY * 3.5;
  const open = f.eyeOpen * (f.eyeSmile > 0.5 ? 1 : blinkAt(frame));
  const eye = (cx: number) =>
    f.eyeSmile > 0.5 ? (
      <path d={`M${cx - 7} 59 Q${cx} 49 ${cx + 7} 59`} stroke={ink} strokeWidth={w} fill="none" strokeLinecap="round" />
    ) : open < 0.2 ? (
      <line x1={cx - 6} y1={56} x2={cx + 6} y2={56} stroke={ink} strokeWidth={w} strokeLinecap="round" />
    ) : (
      <>
        <ellipse cx={cx + px} cy={56 + py} rx={4.3} ry={4.3 * open} fill={ink} />
        {f.eyeOpen < 0.75 ? (
          <line x1={cx - 7} y1={56 - 4.3 * open} x2={cx + 7} y2={56 - 4.3 * open} stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
        ) : null}
      </>
    );
  const brow = (cx: number, side: 1 | -1) => {
    // +6: presets are authored on the old eye line; this keeps raised brows inside the head
    const y = f.browY + 6 - (side === -1 ? f.browAsym : 0);
    return (
      <line x1={cx - 7} y1={y} x2={cx + 7} y2={y} stroke={ink} strokeWidth={w} strokeLinecap="round"
        transform={`rotate(${side * f.browTilt}, ${cx}, ${y})`} />
    );
  };
  const M = 71;
  const yl = M - f.mouthSkew * 3, yr = M + f.mouthSkew * 3;
  // an open smile keeps a flatter top lip; the jaw drop is clamped so it never crosses the chin
  const up = M + f.mouthCurve * 0.3 - f.mouthOpen * 3, down = Math.min(86, M + f.mouthCurve + f.mouthOpen * 12);
  const mouth =
    f.mouthOpen > 0.05 ? (
      <path d={`M84 ${yl} Q100 ${up} 116 ${yr} Q100 ${down} 84 ${yl} Z`} fill={ink} stroke={ink} strokeWidth={w * 0.7} strokeLinejoin="round" />
    ) : (
      <path d={`M84 ${yl} Q100 ${M + f.mouthCurve} 116 ${yr}`} stroke={ink} strokeWidth={w} fill="none" strokeLinecap="round" />
    );
  return (
    <>
      {eye(88)}
      {eye(112)}
      {brow(88, 1)}
      {brow(112, -1)}
      {mouth}
    </>
  );
};

/** Full-bleed SVG stage so scenes can drop stickmen into a shared coordinate space. */
export const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg
    viewBox="0 0 1920 1080"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
  >
    {children}
  </svg>
);
