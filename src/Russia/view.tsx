import React from "react";

/**
 * Stage camera for the paper look: a transparent full-frame SVG (the era backdrop shows through) whose pieces cast
 * one soft shadow onto the backdrop. The camera centres world point (x, y) at scale s, like Other/kit's View.
 */
export const View: React.FC<{ x?: number; y?: number; s?: number; children: React.ReactNode }> = ({ x = 960, y = 540, s = 1, children }) => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "drop-shadow(5px 8px 4px rgba(42,30,18,0.32))" }}>
    <g transform={`translate(${960 - s * x} ${540 - s * y}) scale(${s})`}>{children}</g>
  </svg>
);
