/* ============================================================
   divisional.ts — varga (divisional-chart) mapping. Longitude in → division
   {sign, degree} out, so every varga layers on the same longitude-based engine.
   Math follows the Hora-Prakash reference (src/core/divisional.js +
   JHORA_DIVISIONAL_SPEC.md, JHora "Traditional"):
   - D9 navamsa: 3°20′ parts seeded by element group — Fire→Aries(0),
     Earth→Capricorn(9), Air→Libra(6), Water→Cancer(3) — equivalent to the
     continuous 108-navamsa cycle from Aries (invariant-tested).
   - Degrees are "expanded" per the spec: divDegree = (lon % (30/n)) * n, so a
     planet mid-part reads 15° — full 0–30 range in every varga.
   Validated against the vendored JHora fixtures' navamsa_sign (all 23 charts).
   D10/D60 etc. drop in here later as further functions of the same shape.
   ============================================================ */

export interface VargaPoint {
  sign: number; // 1–12
  degree: number; // expanded degree within the varga sign, 0–30
}

const degInSign = (lon: number) => ((lon % 30) + 30) % 30;
const signOf = (lon: number) => Math.floor((((lon % 360) + 360) % 360) / 30) + 1;

/** D9 — navamsa. Element-group seeds per the reference (fire/earth/air/water →
    Aries/Capricorn/Libra/Cancer), 9 parts of 3°20′ per sign. */
export function navamsa(lon: number): VargaPoint {
  const sign = signOf(lon);
  const part = Math.floor((degInSign(lon) * 9) / 30);
  const SEEDS = [0, 9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3];
  return { sign: ((SEEDS[sign - 1] + part) % 12) + 1, degree: (degInSign(lon) * 9) % 30 };
}
