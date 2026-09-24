import type { StickmanProps } from "./Stickman";

/**
 * Body actions for the stickman rig.
 *
 * The first cut had figures that *posed* — limb angles interpolated between two
 * static values while text did the explaining. A figure that performs an action
 * carries meaning on its own, which is the whole point of going motion-driven:
 * the narration stops being the only thing communicating.
 *
 * Each helper returns a partial pose for a given frame, so scenes compose them with
 * whatever else that shot needs (`{...walk(f), anger: 0.6}`).
 */

/** Ease a value into 0..1 over a window, clamped. */
const ramp = (f: number, a: number, b: number) =>
  Math.max(0, Math.min(1, (f - a) / Math.max(1, b - a)));

/**
 * Walk cycle. Legs counter-swing, arms oppose them, and the body bobs at twice
 * stride frequency — the vertical bounce is what sells a walk more than the legs do.
 */
export const walk = (frame: number, speed = 0.16, amp = 1): Partial<StickmanProps> => {
  const p = frame * speed;
  const swing = Math.sin(p) * 26 * amp;
  return {
    legL: swing,
    legR: -swing,
    armL: -swing * 0.65,
    armR: swing * 0.65,
    lean: 3 * amp,
    bob: 0, // the cycle supplies its own bounce below
    headTilt: Math.sin(p * 2) * 1.5 * amp,
  };
};

/** Vertical offset for a walk cycle, to be added to the figure's y. */
export const walkBob = (frame: number, speed = 0.16, amp = 1) =>
  Math.abs(Math.sin(frame * speed)) * -6 * amp;

/**
 * Trudge — a walk that runs out of energy. `fatigue` 0..1 shortens the stride,
 * drops the arms and sinks the whole body, which is the glucose beat in one gesture.
 */
export const trudge = (frame: number, fatigue: number): Partial<StickmanProps> => {
  const w = walk(frame, 0.16 - fatigue * 0.075, 1 - fatigue * 0.55);
  return {
    ...w,
    lean: 3 + fatigue * 7,
    headTilt: (w.headTilt ?? 0) + fatigue * 9,
    armL: (w.armL ?? 0) * (1 - fatigue * 0.6),
    armR: (w.armR ?? 0) * (1 - fatigue * 0.6),
  };
};

/**
 * Outburst — the snap. Arms fly up and out, body pitches forward, head snaps back.
 * `t` 0..1 across the burst; overshoot then settle is what makes it read as violent
 * rather than as a smooth raise.
 */
export const outburst = (t: number): Partial<StickmanProps> => {
  const overshoot = Math.sin(Math.min(1, t) * Math.PI) * 0.35;
  const a = Math.min(1, t) + overshoot;
  return {
    armL: 25 + a * 105,
    armR: -25 - a * 105,
    lean: a * 7,
    headTilt: -a * 6,
    legL: 15 + a * 8,
    legR: -15 - a * 8,
  };
};

/**
 * Straining against a pull — planted feet, both arms back, hard lean away.
 * `effort` 0..1. Used for the prefrontal cortex holding the rope.
 */
export const strain = (frame: number, effort: number): Partial<StickmanProps> => ({
  armL: 62 + Math.sin(frame * 0.55) * 4 * effort,
  armR: 48 + Math.sin(frame * 0.55 + 1) * 4 * effort,
  legL: 26,
  legR: -30,
  lean: -16 * effort,
  headTilt: -5 * effort,
  bob: 0.6,
});

/**
 * Collapse — losing the fight and going down. `t` 0..1. Returns pose plus a `drop`
 * offset the caller adds to y, and a `rot` for the whole body toppling.
 */
export const collapse = (t: number) => {
  const e = ramp(t, 0, 1);
  const fall = Math.pow(e, 1.7); // accelerates, like gravity
  return {
    pose: {
      armL: 62 - fall * 55,
      armR: 48 - fall * 44,
      legL: 26 - fall * 20,
      legR: -30 + fall * 22,
      lean: -16 + fall * 30,
      headTilt: -5 + fall * 22,
      bob: 0.4,
    } as Partial<StickmanProps>,
    drop: fall * 108,
    rot: fall * 16,
  };
};

/**
 * Recover — sitting up and steadying. The inverse arc of collapse, deliberately
 * slower, because recovery reading as instant undercuts the "give it 20 minutes" beat.
 */
export const recover = (t: number) => {
  const e = 1 - Math.pow(1 - ramp(t, 0, 1), 2.4);
  return {
    pose: {
      armL: 8 + e * 16,
      armR: -8 - e * 16,
      legL: 6 + e * 9,
      legR: -6 - e * 9,
      lean: 9 - e * 9,
      headTilt: 14 - e * 14,
      bob: 1 + e,
    } as Partial<StickmanProps>,
    drop: (1 - e) * 40,
  };
};

/** Flinch — a small recoil, for the bystander taking the blame. `t` 0..1. */
export const flinch = (t: number): Partial<StickmanProps> => {
  const k = Math.sin(Math.min(1, t) * Math.PI);
  return {
    lean: -k * 9,
    headTilt: -k * 12,
    armL: 18 + k * 34,
    armR: -18 - k * 34,
  };
};

/** Breathing hard — chest heaving after the outburst. */
export const winded = (frame: number, intensity = 1): Partial<StickmanProps> => ({
  bob: 3.5 * intensity,
  lean: 5 * intensity + Math.sin(frame * 0.22) * 1.6 * intensity,
  headTilt: 7 * intensity,
  armL: 14,
  armR: -14,
});

export { ramp };
