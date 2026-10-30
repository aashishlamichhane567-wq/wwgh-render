import React, { createContext, useContext } from "react";
import { AbsoluteFill } from "remotion";
import { INK, ridge, rnd } from "../Puppet/paper";

/**
 * Era art direction: every stage scene sits on a backdrop in the art of its age, and its ground is cut paper in a
 * matching colour. The cast and props stay the same cut-paper puppets throughout.
 *   saga        Vikings and Kievan Rus — sky, hills, birch
 *   chronicle   Mongols to the Time of Troubles — illuminated manuscript
 *   empire      Peter to Nicholas II — engraved print
 *   soviet      1917 to the Cold War — constructivist poster
 *   modern      1985 to today — newsprint
 */
export type Era = "saga" | "chronicle" | "empire" | "soviet" | "modern";

export const ERA_OF: Record<string, Era> = {
  hook: "saga", rus: "saga", faith: "saga", mongols: "chronicle", moscow: "chronicle", terrible: "chronicle", siberia: "chronicle", troubles: "chronicle",
  peter: "empire", catherine: "empire", napoleon: "empire", reform: "empire", nicholas: "empire", revolution: "soviet", stalin: "soviet", coldwar: "soviet",
  collapse: "modern", modern: "modern", end: "saga",
};

export const EraContext = createContext<Era>("saga");
export const useEra = () => useContext(EraContext);

export const GROUND_PAPER: Record<Era, [string, string]> = {
  saga: ["#C2A878", "#A88E5E"], chronicle: ["#BFA06A", "#9E8150"], empire: ["#B9B08A", "#99906A"], soviet: ["#C9B79A", "#A8967A"], modern: ["#AEB0AA", "#8E908A"],
};

const Frame: React.FC<{ era: Era }> = ({ era }) => {
  if (era === "chronicle") {
    return (
      <>
        <rect x={18} y={18} width={1884} height={1044} fill="none" stroke="#9E2A1E" strokeWidth={4} />
        <rect x={32} y={32} width={1856} height={1016} fill="none" stroke="url(#gold)" strokeWidth={12} />
        <rect x={46} y={46} width={1828} height={988} fill="none" stroke="#2E4A86" strokeWidth={3} />
        {Array.from({ length: 48 }, (_, i) => <path key={i} d={`M${70 + i * 38} 32 l8 8 l-8 8 l-8 -8 Z`} fill={i % 2 ? "#9E2A1E" : "#2E4A86"} />)}
        {[[32, 32], [1888, 32], [32, 1048], [1888, 1048]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={20} fill="url(#gold)" stroke="#9E2A1E" strokeWidth={3} /><circle cx={x} cy={y} r={7} fill="#2E4A86" /></g>)}
      </>
    );
  }
  if (era === "empire") {
    return (
      <>
        <rect x={24} y={24} width={1872} height={1032} fill="none" stroke="#5A4A33" strokeWidth={3} />
        <rect x={36} y={36} width={1848} height={1008} fill="none" stroke="#5A4A33" strokeWidth={1.5} />
        {[[36, 36, 1], [1884, 36, -1]].map(([x, y, sg], i) => (
          <path key={i} d={`M${x} ${y! + 120} Q${x! + sg! * 10} ${y! + 10} ${x! + sg! * 120} ${y}`} fill="none" stroke="#5A4A33" strokeWidth={3} />
        ))}
      </>
    );
  }
  return null;
};

/** Full-frame era backdrop (opaque), drawn under each stage scene. */
export const Backdrop: React.FC<{ era: Era; f: number }> = ({ era, f }) => (
  <AbsoluteFill>
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      {era === "saga" ? (
        <>
          <rect width={1920} height={1080} fill="#CFE0DF" />
          {[[260, 140, 1], [1180, 100, 2], [1600, 220, 3]].map(([x, y, sd]) => (
            <path key={sd} d={`M${x! - 130 + 10 * Math.sin(f / 60 + sd!)} ${y} q30 -40 80 -20 q30 -40 90 -10 q50 -10 60 30 q30 30 -10 40 l-200 0 q-40 -10 -20 -40 Z`} fill="#F6F1E4" filter="url(#cutSoft)" />
          ))}
          <path d={ridge(-50, 1970, 600, 44, 1)} fill="#A9BFA3" filter="url(#cut)" />
          <path d={ridge(-50, 1970, 690, 30, 7)} fill="#8DAA86" filter="url(#cut)" />
        </>
      ) : era === "chronicle" ? (
        <>
          <rect width={1920} height={1080} fill="#E8D9B2" />
          <path d="M260 1080 L260 300 Q260 120 960 110 Q1660 120 1660 300 L1660 1080 Z" fill="url(#gold)" opacity={0.42} />
          {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${200 + i * 120} 180 l14 14 l-14 14 l-14 -14 Z`} fill={i % 2 ? "#9E2A1E" : "#2E4A86"} opacity={0.35} />)}
        </>
      ) : era === "empire" ? (
        <>
          <rect width={1920} height={1080} fill="#E4DFD0" />
          {Array.from({ length: 60 }, (_, i) => <line key={i} x1={0} y1={30 + i * 13} x2={1920} y2={30 + i * 13} stroke="#6A6050" strokeWidth={1} opacity={0.18 - i * 0.002} />)}
          <path d={ridge(-50, 1970, 640, 26, 5)} fill="#CFC6AE" filter="url(#cutSoft)" />
        </>
      ) : era === "soviet" ? (
        <>
          <rect width={1920} height={1080} fill="#EFE4CC" />
          <path d="M1920 0 L1240 0 L1920 760 Z" fill="#1A1210" opacity={0.92} />
          <path d="M-60 320 L1920 120 L1920 240 L-60 400 Z" fill="#C8281E" opacity={0.85} />
          <path d="M-60 320 L1920 120 L1920 240 L-60 400 Z" fill="url(#halftone)" />
          <circle cx={1500} cy={230} r={120} fill="#EFE4CC" opacity={0.0} />
        </>
      ) : (
        <>
          <rect width={1920} height={1080} fill="#E6E3DC" />
          {Array.from({ length: 6 }, (_, i) => <line key={i} x1={160 + i * 320} y1={60} x2={160 + i * 320} y2={1020} stroke="#8E8A80" strokeWidth={2} opacity={0.35} />)}
          {Array.from({ length: 40 }, (_, i) => (
            <rect key={i} x={40 + (i % 6) * 320 + 20} y={80 + Math.floor(i / 6) * 120 + rnd(i) * 30} width={240 - rnd(i + 3) * 80} height={8} fill="#8E8A80" opacity={0.25} />
          ))}
        </>
      )}
      <Frame era={era} />
    </svg>
  </AbsoluteFill>
);

export { INK };
