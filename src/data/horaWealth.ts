/* ============================================================
   horaWealth.ts — the D2 (Horā) chart's READING LAYER. Pure data + a placement
   lookup; nothing astrological is computed and nothing here feeds any varga
   dignity or strength scoring (owner-directed: keep the wealth content separate).

   The D2 splits every sign between the two luminaries, so the chart reads as TWO
   horās, not a twelve-house diamond. A planet's column is its luminary horā:
   the engine's hora() (core/divisional.ts) maps a D1 longitude to a 1–12 sign
   whose PARITY is the luminary — odd → Sun's horā (the Leo column), even →
   Moon's horā (the Cancer column). horaLuminaryOf() reads that parity off the
   already-computed varga sign NAME (so the rule lives in one validated place).

   HORA_WEALTH is the owner's 9×2 wealth interpretation, verbatim (no em-dashes):
   the active reading is HORA_WEALTH[planet][column]. Consumed only by HoraChart.
   ============================================================ */
import { SIGN_NAMES } from "@/core/constants";
import type { PlanetKey } from "@/core/types";

export type HoraKey = "sun" | "moon";

/** The two fixed horā columns. Sun's horā = Leo (warm), Moon's horā = Cancer
    (cool) — regardless of which spread sign a planet's hora() actually lands in;
    parity is all that matters. */
export const HORA_COLUMNS: ReadonlyArray<{
  key: HoraKey;
  luminary: string;
  sign: string;
  glyph: string;
  theme: "warm" | "cool";
}> = [
  { key: "sun", luminary: "Sun", sign: "Leo", glyph: "♌", theme: "warm" },
  { key: "moon", luminary: "Moon", sign: "Cancer", glyph: "♋", theme: "cool" },
];

/** Which luminary's horā a planet sits in, from its varga sign name: odd sign
    (1,3,5,7,9,11) → Sun's horā, even → Moon's horā. (Rahu & Ketu are 180° apart
    — same parity, same half — so they always resolve to the same column; the
    rule handles it, no special-casing.) */
export function horaLuminaryOf(signName: string): HoraKey {
  const sign = SIGN_NAMES.indexOf(signName) + 1; // 1–12
  return sign % 2 === 1 ? "sun" : "moon";
}

/** Wealth interpretation per graha, for each horā. Pick the one matching the
    planet's actual column: HORA_WEALTH[planet][column]. Owner's copy, verbatim. */
export const HORA_WEALTH: Record<PlanetKey, Record<HoraKey, string>> = {
  sun: {
    sun: "Neutral to mildly favorable. Wealth through authority, position, and visibility.",
    moon: "Self-directed earning weakens. Gains lean on nurturing or caretaking channels.",
  },
  moon: {
    sun: "Tension between emotional needs and structured earning. Inner financial unease.",
    moon: "Strong for flowing, circulating wealth. Financial life tied to emotional security.",
  },
  mars: {
    sun: "Disciplined drive toward wealth. Suits entrepreneurs and competitive fields.",
    moon: "Volatile finances. Sharp gains followed by sharp losses.",
  },
  mercury: {
    sun: "Wealth through intellect and trade, tilting speculative or authority dependent.",
    moon: "Wealth through intellect and trade, with steadier, more sustained returns.",
  },
  jupiter: {
    sun: "Favorable, but more dependent on external recognition.",
    moon: "Among the strongest D2 placements. Sustained, ethical wealth via wisdom, teaching, and expansion.",
  },
  venus: {
    sun: "Wealth through status, glamour, or authority backed creative work.",
    moon: "Luxury, beauty based income, partnership wealth, and comforts.",
  },
  saturn: {
    sun: "Classic slow, structured, disciplined long-term accumulation.",
    moon: "Emotional heaviness around money. Fear of loss or felt restriction despite real resources.",
  },
  rahu: {
    sun: "Ambitious, unconventional pursuit of wealth.",
    moon: "Compulsive spending, unstable cash flow, unexpected gains and losses through circulation.",
  },
  ketu: {
    sun: "Indifference to authority based earning. Loosened attachment to accumulated wealth.",
    moon: "Detachment from family wealth or inheritance.",
  },
};
