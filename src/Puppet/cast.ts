import type { Look } from "./rig";

/** Costume presets for the Russia episode (add to these rather than styling puppets inline). */
const SKIN = { a: "#EBC7A4", b: "#E2B892", c: "#D9A982", d: "#C9956E" };

export const LOOKS = {
  tribeA: { skin: SKIN.a, garment: "tunic", color: "#B9822E", trim: "#7A2E22", belt: "#5A3A22", hat: "fur", hatColor: "#6B4A2B", beard: "full", beardColor: "#6B4A2B" },
  tribeB: { skin: SKIN.b, garment: "tunic", color: "#5E7F4E", trim: "#E3B341", belt: "#5A3A22", hat: "fur", hatColor: "#3A2A1C", hair: "short", hairColor: "#3A2A1C" },
  tribeC: { skin: SKIN.a, garment: "tunic", color: "#9A3B2E", trim: "#E8D8B0", belt: "#5A3A22", hair: "short", hairColor: "#A0703F", beard: "full", beardColor: "#A0703F" },
  viking: { skin: SKIN.a, garment: "mail", color: "#7A2E22", trim: "#C9A23A", belt: "#5A3A22", hat: "helm", beard: "full", beardColor: "#C8642E", hair: "long", hairColor: "#B8552E" },
  khan: { skin: SKIN.c, garment: "deel", color: "#8A3A22", trim: "#E3B341", belt: "#3A2A1C", hat: "mongol", hatColor: "#6B4A2B", tache: "thin", beardColor: "#2A1E14" },
  tsar: { skin: SKIN.a, garment: "robe", color: "#7A1E1E", trim: "#E3B341", hat: "monomakh", hatColor: "#6B4A2B", beard: "long", beardColor: "#3B2A1E" },
  lenin: { skin: SKIN.a, garment: "suit", color: "#3A3F4A", trim: "#2A1E14", hat: "cap", hatColor: "#3A3A3A", hair: "bald", hairColor: "#7A4A2A", beard: "goatee", beardColor: "#7A4A2A", tache: "thin" },
} satisfies Record<string, Look>;
