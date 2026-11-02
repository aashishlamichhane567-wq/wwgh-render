import React from "react";
import { FACES, FaceMarks, type StickmanProps } from "../Hangry/Stickman";

/**
 * The PsychToons-style figure: big cream head with dot eyes, a solid coloured tank-top body, thin ink limbs
 * from the shoulders and hips, little feet. Same 200x320 rig space, centre and pose angles as Stickman, so
 * every pose (walk, strain, SIT) carries over. Brows only appear when the expression needs them.
 */
export const Pal: React.FC<StickmanProps & { shirt: string; ink: string; skin: string }> = ({
  armL = 25, armR = -25, legL = 6, legR = -6, lean = 0, headTilt = 0, bob = 1.5, frame = 0,
  x = 0, y = 0, scale = 1, face = FACES.neutral, anger = 0, opacity = 1, shirt, ink, skin,
}) => {
  const shake = Math.sin(frame * 1.9) * anger * 1.6;
  const breathe = Math.sin(frame / 14) * bob;
  const ln = { stroke: ink, strokeWidth: 3.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const arm = (sx: number, a: number) => (
    <g transform={`rotate(${a} ${sx} 106)`}>
      <line x1={sx} y1={106} x2={sx} y2={176} {...ln} />
      <circle cx={sx} cy={180} r={5} fill={skin} {...ln} strokeWidth={3} />
    </g>
  );
  // a leg swung past 60° is a seated thigh: the shin hangs straight down from the knee
  const leg = (hx: number, a: number, side: 1 | -1) => {
    const sit = Math.abs(a) > 60, thigh = sit ? 52 : 74;
    const kx = hx - Math.sin((a * Math.PI) / 180) * thigh, ky = 194 + Math.cos((a * Math.PI) / 180) * thigh;
    const fx = sit ? kx : hx - Math.sin((a * Math.PI) / 180) * 74, fy = sit ? ky + 66 : 194 + Math.cos((a * Math.PI) / 180) * 74;
    return (
      <g>
        <path d={sit ? `M${hx} 194 L${kx} ${ky} L${fx} ${fy}` : `M${hx} 194 L${fx} ${fy}`} fill="none" {...ln} />
        <line x1={fx} y1={fy} x2={fx + (sit ? Math.sign(-a) : side) * 11} y2={fy} {...ln} strokeWidth={4.5} />
      </g>
    );
  };
  const brows = Math.abs(face.browTilt) >= 8 || face.browAsym > 0 || face.browY < 32;
  return (
    <g transform={`translate(${x - 100 * scale + shake} ${y - 160 * scale + breathe}) scale(${scale})`} opacity={opacity}>
      <g transform={`rotate(${lean} 100 194)`}>
        {leg(90, legL, -1)}
        {leg(110, legR, 1)}
        {arm(79, armL)}
        {arm(121, armR)}
        <path d="M76 100 Q100 93 124 100 L127 197 Q100 202 73 197 Z" fill={shirt} {...ln} />
        <g transform={`rotate(${headTilt} 100 92)`}>
          <circle cx={100} cy={54} r={41} fill={skin} {...ln} />
          <g transform="translate(-10 -9.8) scale(1.1)">
            <FaceMarks f={face} ink={ink} frame={frame} brows={brows} />
          </g>
        </g>
      </g>
    </g>
  );
};
