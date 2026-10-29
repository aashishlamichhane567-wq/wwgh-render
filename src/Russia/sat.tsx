import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import type { Cam } from "./kit";

/**
 * NASA Blue Marble (public domain) under the map overlays, cut by episodes/russia/build_sat.py to the exact
 * lon/lat rectangle of the map world (W x H world px). l0 covers everything and always draws; the native
 * resolution l1 tiles (8x4) draw on top only when the camera is close enough to need them.
 */
const COLS = 8, ROWS = 4;

export const SatLayer: React.FC<{ cam: Cam; W: number; H: number }> = ({ cam, W, H }) => {
  const tx = 960 - cam.s * cam.x, ty = 540 - cam.s * cam.y;
  const tw = W / COLS, th = H / ROWS;
  const vx0 = -tx / cam.s, vx1 = (1920 - tx) / cam.s, vy0 = -ty / cam.s, vy1 = (1080 - ty) / cam.s;
  const tiles: [number, number][] = [];
  if (cam.s > 1.25) {
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
      if ((c + 1) * tw > vx0 && c * tw < vx1 && (r + 1) * th > vy0 && r * th < vy1) tiles.push([c, r]);
    }
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#081830" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${cam.s})`, filter: "saturate(0.92) brightness(0.9)" }}>
        <Img src={staticFile("sat/l0.jpg")} style={{ position: "absolute", left: 0, top: 0, width: W, height: H }} />
        {tiles.map(([c, r]) => (
          <Img key={`${c}-${r}`} src={staticFile(`sat/l1_${c}_${r}.jpg`)} style={{ position: "absolute", left: c * tw, top: r * th, width: tw + 0.6, height: th + 0.6 }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
