// ponytail: copy of Wwgh/overlays bound to this episode's timing (captions only; punch cards live in the scenes).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ramp } from "../Hangry/actions";
import { CAPS } from "./timing";
import { C, FONT } from "../Hangry2/kit";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, "");

/** Scene-relative frame at which `word` (nth occurrence) is spoken — measured from the VO, never guessed. */
export const w = (scene: string, word: string, n = 0): number => {
  const hit = (CAPS[scene] ?? []).filter((c) => norm(c[2]) === norm(word))[n];
  if (!hit) throw new Error(`caption word "${word}" #${n} not found in ${scene}`);
  return hit[0];
};

// Solid white outline so text stays legible over line art without a box.
// Paper-coloured outline, thick enough to cut through road lines and props under the captions.
const HALO = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2;
  return `${(Math.cos(a) * 6).toFixed(1)}px ${(Math.sin(a) * 6).toFixed(1)}px 0 #F6F1E7`;
}).join(", ");

/* ─────────────── Word-synced captions ─────────────── */

type Tok = [number, number, string];
type Phrase = { start: number; end: number; toks: Tok[] };

const ENDS = /[.?!:;]$/;
/** Break at sentence punctuation, after ~6 words (unless that orphans 1–2 words), at commas once a phrase has body, or at pauses. */
const toPhrases = (caps: Tok[]): Phrase[] => {
  const out: Phrase[] = [];
  let cur: Tok[] = [];
  const leftInSentence = (i: number) => {
    let n = 0;
    for (let j = i + 1; j < caps.length; j++) {
      n++;
      if (ENDS.test(caps[j]![2])) break;
    }
    return n;
  };
  let inQuote = false; // never split a quoted phrase across two captions
  caps.forEach((c, i) => {
    cur.push(c);
    inQuote = inQuote !== ((c[2].match(/"/g) ?? []).length % 2 === 1);
    const next = caps[i + 1];
    const brk =
      !next ||
      ENDS.test(c[2]) ||
      (cur.length >= 6 && !inQuote && leftInSentence(i) > 2) ||
      cur.length >= 9 ||
      (/,$/.test(c[2]) && cur.length >= 3) ||
      next[0] - c[1] > 12;
    if (brk) {
      out.push({ start: cur[0]![0] - 2, end: 0, toks: cur });
      cur = [];
    }
  });
  out.forEach((p, i) => {
    const last = p.toks[p.toks.length - 1]!;
    const nxt = out[i + 1];
    p.end = nxt ? Math.min(nxt.start, last[1] + 24) : last[1] + 30;
  });
  return out;
};
const PHRASES: Record<string, Phrase[]> = Object.fromEntries(Object.entries(CAPS).map(([k, v]) => [k, toPhrases(v)]));

export const Captions: React.FC<{ scene: string }> = ({ scene }) => {
  const f = useCurrentFrame();
  const p = (PHRASES[scene] ?? []).find((x) => f >= x.start && f < x.end);
  if (!p) return null;
  const op = Math.min(ramp(f, p.start, p.start + 3), 1 - ramp(f, p.end - 3, p.end));
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 48 }}>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, lineHeight: 1.15, textShadow: HALO, opacity: op, maxWidth: 1500, textAlign: "center",
        // paper backing: close-ups put thick line art right behind the captions
        background: "rgba(246,241,231,0.88)", borderRadius: 18, padding: "4px 24px 8px" }}>
        {p.toks.map(([s, e, t], i) => {
          const active = f >= s && f < (p.toks[i + 1]?.[0] ?? e + 6);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                margin: "0 9px",
                color: active ? C.teal : C.ink,
                transform: `scale(${active ? 1.08 : 1})`,
              }}
            >
              {t}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
