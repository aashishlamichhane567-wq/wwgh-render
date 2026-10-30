import React from "react";
import { blendFace, FACES, type Face } from "../Hangry/Stickman";
import { Puppet, type Look } from "../Puppet/rig";

/**
 * The Russia cast as cut-paper puppets. Scenes still say <Person who="peter" s={2.1} ... /> with the stick-figure
 * pose props; s is mapped to the puppet scale so heights match the original staging (s 1.7 ≈ a 340-unit puppet).
 */

const SK = { a: "#EBC7A4", b: "#E2B892", c: "#D9A982", d: "#C9956E" };
const L = (l: Look) => l;

export const LOOK = {
  plain: L({ skin: SK.b, garment: "tunic", color: "#9C8B70", trim: "#6E5E46", belt: "#5A3A22", hair: "short", hairColor: "#5A3A22" }),
  tribe: L({ skin: SK.a, garment: "tunic", color: "#B9822E", trim: "#7A2E22", belt: "#5A3A22", hat: "fur", hatColor: "#6B4A2B", beard: "full", beardColor: "#6B4A2B" }),
  viking: L({ skin: SK.a, garment: "mail", color: "#7A2E22", trim: "#C9A23A", belt: "#5A3A22", hat: "helm", beard: "full", beardColor: "#C8642E", hair: "long", hairColor: "#B8552E" }),
  prince: L({ skin: SK.a, garment: "robe", color: "#2E4A86", trim: "#E3B341", hat: "crown", beard: "full", beardColor: "#7A5230" }),
  monomakh: L({ skin: SK.a, garment: "robe", color: "#7A1E1E", trim: "#E3B341", hat: "monomakh", hatColor: "#6B4A2B", beard: "full", beardColor: "#6A4A2A" }),
  khan: L({ skin: SK.c, garment: "deel", color: "#8A3A22", trim: "#E3B341", belt: "#3A2A1C", hat: "mongol", hatColor: "#6B4A2B", tache: "thin", beardColor: "#2A1E14" }),
  mongol: L({ skin: SK.c, garment: "deel", color: "#3E5A6E", trim: "#C9A23A", belt: "#3A2A1C", hat: "mongol", hatColor: "#5A3A22" }),
  boyar: L({ skin: SK.a, garment: "robe", color: "#6E3A5E", trim: "#E3B341", hat: "tall", hatColor: "#5A3A22", beard: "long", beardColor: "#5A3E2B" }),
  boyarShaved: L({ skin: SK.a, garment: "robe", color: "#6E3A5E", trim: "#E3B341", hat: "tall", hatColor: "#5A3A22" }),
  ivan: L({ skin: SK.a, garment: "robe", color: "#5E1414", trim: "#E3B341", hat: "monomakh", hatColor: "#4A3220", beard: "pointed", beardColor: "#2B1A10" }),
  cossack: L({ skin: SK.b, garment: "coat", color: "#3A4A3A", trim: "#C9A23A", belt: "#B8352A", hat: "papakha", hatColor: "#2E2A26", tache: "walrus", beardColor: "#2A1E14" }),
  merchant: L({ skin: SK.a, garment: "coat", color: "#7A5A3A", trim: "#C9A23A", belt: "#3A2A1C", hat: "fur", hatColor: "#5A3A22", beard: "full", beardColor: "#8A6A3A" }),
  dmitry: L({ skin: SK.a, garment: "robe", color: "#7A1E1E", trim: "#E3B341", hat: "crown", hatTilt: -14, glasses: true, tache: "thick", beardColor: "#2A1E14" }),
  pugachev: L({ skin: SK.b, garment: "coat", color: "#3A4A3A", trim: "#C9A23A", belt: "#B8352A", hat: "crown", hatTilt: 16, glasses: true, tache: "walrus", beardColor: "#2A1E14" }),
  butcher: L({ skin: SK.a, garment: "tunic", color: "#F1EADB", trim: "#B8352A", belt: "#5A3A22", hair: "short", hairColor: "#8A6A3A", beard: "full", beardColor: "#8A6A3A" }),
  knight: L({ skin: SK.a, garment: "mail", color: "#6A2A22", trim: "#C9A23A", belt: "#5A3A22", hat: "helm", beard: "short", beardColor: "#6A4A2A" }),
  michael: L({ skin: SK.a, garment: "robe", color: "#7A1E1E", trim: "#E3B341", hat: "bigcrown", hair: "short", hairColor: "#8A6A3A" }),
  peter: L({ skin: SK.a, garment: "coat", color: "#2F5B3A", trim: "#C9A23A", hat: "tricorn", hatColor: "#1F1F1F", hair: "long", hairColor: "#3B2A1E", tache: "thin", beardColor: "#3B2A1E" }),
  peterDisguise: L({ skin: SK.a, garment: "coat", color: "#6B5B4B", trim: "#3A2A1C", hat: "cap", hatColor: "#4A3A2C", glasses: true, tache: "thick", beardColor: "#3B2A1E" }),
  swede: L({ skin: SK.a, garment: "coat", color: "#3E6FB0", trim: "#E3B341", hat: "tricorn", hatColor: "#1F2A44", hair: "long", hairColor: "#C9A86A" }),
  peter3: L({ skin: SK.a, garment: "coat", color: "#2F4F8F", trim: "#E3B341", hat: "crown", hatTilt: 14, hair: "short", hairColor: "#E8E4DA" }),
  catherine: L({ skin: SK.a, garment: "dress", color: "#6C8CC7", trim: "#E3B341", hat: "crown", hair: "bun", hairColor: "#E9E4DA" }),
  guard: L({ skin: SK.b, garment: "coat", color: "#2F5B3A", trim: "#C9A23A", belt: "#F1EADB", hat: "tall", hatColor: "#2E2A26", tache: "thick", beardColor: "#2A1E14" }),
  napoleon: L({ skin: SK.a, garment: "coat", color: "#2F4F8F", trim: "#E3B341", hat: "bicorne", hatColor: "#1F1F1F", hair: "short", hairColor: "#3B2A1E" }),
  frenchSoldier: L({ skin: SK.a, garment: "coat", color: "#2F4F8F", trim: "#F1EADB", hat: "tall", hatColor: "#1F1F1F", tache: "thin", beardColor: "#3B2A1E" }),
  landlord: L({ skin: SK.a, garment: "coat", color: "#3A2E2A", trim: "#C9A23A", hat: "top", hatColor: "#1F1F1F", tache: "thick", beardColor: "#3B2A1E" }),
  serf: L({ skin: SK.c, garment: "tunic", color: "#B49A70", trim: "#8A6A3A", belt: "#5A3A22", hat: "fur", hatColor: "#8A6A3A", beard: "full", beardColor: "#9A7A4A" }),
  alexander2: L({ skin: SK.a, garment: "coat", color: "#E9E4DA", trim: "#C9A23A", belt: "#B8352A", hair: "short", hairColor: "#7A5A3A", beard: "short", beardColor: "#7A5A3A", tache: "walrus" }),
  american: L({ skin: SK.a, garment: "coat", color: "#2E3A55", trim: "#C9A23A", hat: "top", hatColor: "#1F1F1F", beard: "goatee", beardColor: "#5A3A22" }),
  uncleSam: L({ skin: SK.a, garment: "coat", color: "#2E4A86", trim: "#FFFFFF", hat: "top", hatColor: "#F3F0E8", hair: "short", hairColor: "#F3F0E8", beard: "goatee", beardColor: "#F3F0E8" }),
  nicholas: L({ skin: SK.a, garment: "coat", color: "#E9E4DA", trim: "#C9A23A", belt: "#B8352A", hat: "crown", beard: "short", beardColor: "#7A5A3A", tache: "thin" }),
  admiral: L({ skin: SK.a, garment: "coat", color: "#1F2A44", trim: "#E3B341", hat: "peaked", hatColor: "#1F2A44", beard: "full", beardColor: "#9A9A9A" }),
  rasputin: L({ skin: SK.a, garment: "robe", color: "#2B2620", trim: "#5A4A3A", hair: "long", hairColor: "#2B1F17", beard: "long", beardColor: "#2B1F17" }),
  worker: L({ skin: SK.b, garment: "coat", color: "#5B5F66", trim: "#3A3A3A", belt: "#3A2A1C", hat: "cap", hatColor: "#4A4A4A", tache: "thin", beardColor: "#3A2A1C" }),
  lenin: L({ skin: SK.a, garment: "suit", color: "#3A3F4A", trim: "#2A1E14", hat: "cap", hatColor: "#3A3A3A", hair: "bald", hairColor: "#7A4A2A", beard: "goatee", beardColor: "#7A4A2A", tache: "thin" }),
  red: L({ skin: SK.b, garment: "coat", color: "#6B6B4B", trim: "#C8281E", belt: "#3A2A1C", hat: "budenovka", hatColor: "#6B6B4B" }),
  white: L({ skin: SK.a, garment: "coat", color: "#E9E4DA", trim: "#C9A23A", belt: "#3A2A1C", hat: "peaked", hatColor: "#F3F0E8", tache: "thick", beardColor: "#3B2A1E" }),
  stalin: L({ skin: SK.b, garment: "coat", color: "#8A8F6A", trim: "#C9A23A", hair: "swept", hairColor: "#2B1F17", tache: "thick", beardColor: "#2B1F17" }),
  soldier: L({ skin: SK.b, garment: "coat", color: "#5E6B47", trim: "#3A3A2A", belt: "#3A2A1C", hat: "soviet", hatColor: "#5E6B47" }),
  german: L({ skin: SK.a, garment: "coat", color: "#6E7378", trim: "#3A3A3A", belt: "#2A2A2A", hat: "german", hatColor: "#6E7378" }),
  gagarin: L({ skin: SK.a, garment: "suit", color: "#E86A3A", trim: "#F3F0E8", hat: "space", hair: "short", hairColor: "#3B2A1E" }),
  ushanka: L({ skin: SK.b, garment: "coat", color: "#4A5A4A", trim: "#C8281E", hat: "ushanka", hatColor: "#6B4A2B" }),
  brezhnev: L({ skin: SK.a, garment: "suit", color: "#3A3F4A", trim: "#C9A23A", hair: "swept", hairColor: "#3A3A3A", tache: "none" }),
  gorby: L({ skin: SK.a, garment: "suit", color: "#3A3F4A", trim: "#B8352A", hair: "bald", hairColor: "#9A9A9A", mark: true }),
  yeltsin: L({ skin: SK.a, garment: "suit", color: "#3A3F4A", trim: "#B8352A", hair: "swept", hairColor: "#E8E8E8" }),
  suit: L({ skin: SK.a, garment: "suit", color: "#3A3F4A", trim: "#B8352A", hair: "short", hairColor: "#8A7A6A" }),
  oligarch: L({ skin: SK.a, garment: "suit", color: "#1F1F1F", trim: "#C9A23A", hat: "top", hatColor: "#1F1F1F", tache: "thin", beardColor: "#3A2A1C" }),
  priest: L({ skin: SK.a, garment: "robe", color: "#1F1F1F", trim: "#C9A23A", hat: "tall", hatColor: "#1F1F1F", beard: "long", beardColor: "#4A4A4A" }),
  oprichnik: L({ skin: SK.b, garment: "robe", color: "#1C1A18", trim: "#3A3430", hat: "fur", hatColor: "#1C1A18", beard: "full", beardColor: "#2B1F17" }),
} satisfies Record<string, Look>;
export type Who = keyof typeof LOOK;

export type PersonProps = {
  who: Who; x: number; ground: number; f: number; s?: number; face?: Face; flip?: boolean;
  armL?: number; armR?: number; legL?: number; legR?: number; lean?: number; headTilt?: number; walking?: boolean; speed?: number;
  op?: number; ko?: boolean; talk?: number;
};

/** A costumed puppet standing on `ground`; walking overrides the limbs with the hop-walk cycle. */
export const Person: React.FC<PersonProps> = ({ who, x, ground, f, s = 1.4, face = FACES.neutral, flip, walking, op = 1, ko, talk, ...pose }) => (
  <Puppet look={LOOK[who]} x={x} ground={ground} k={s * 0.6} f={f} flip={flip} walking={walking} op={op} talk={talk}
    seed={Math.round(x * 7 + s * 13) % 97} face={ko ? { ...FACES.sad, eyeOpen: 0.05, mouthOpen: 0.3 } : face} {...pose} />
);

export { FACES, blendFace };
