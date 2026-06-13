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
   - D10 dasamsa: odd signs count from self, even from the 9th (+8) — equal 3° parts.
   - D30 trimsamsa: the ONE unequal varga — no 1°-part formula. Parashari
     planet-portions: odd signs 5/5/8/7/5° → Aries/Aquarius/Sagittarius/Gemini/
     Libra; even signs 5/7/8/5/5° → Taurus/Virgo/Pisces/Capricorn/Scorpio.
     Inclusive upper bounds and the uniform (deg×30)%30 degree expansion both
     ported verbatim from the reference (per PyJHora; the spec exempts D30 from
     the equal-division scaling note but the reference applies it — we follow
     the working code, not an improvised proportional expansion).
   Further vargas (D60, …) drop in here later as functions of the same shape.
   ============================================================ */

export interface VargaPoint {
  sign: number; // 1–12
  degree: number; // expanded degree within the varga sign, 0–30
}

const degInSign = (lon: number) => ((lon % 30) + 30) % 30;
const signOf = (lon: number) => Math.floor((((lon % 360) + 360) % 360) / 30) + 1;

const part = (lon: number, n: number) => Math.floor((degInSign(lon) * n) / 30);
const divDeg = (lon: number, n: number) => (degInSign(lon) * n) % 30;
const normSign = (s: number) => ((((s - 1) % 12) + 12) % 12) + 1;

/** D9 — navamsa. Element-group seeds per the reference (fire/earth/air/water →
    Aries/Capricorn/Libra/Cancer), 9 parts of 3°20′ per sign. */
export function navamsa(lon: number): VargaPoint {
  const sign = signOf(lon);
  const SEEDS = [0, 9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3];
  return { sign: ((SEEDS[sign - 1] + part(lon, 9)) % 12) + 1, degree: divDeg(lon, 9) };
}

/* The remaining saptavargaja vargas (used by Shadbala's Sthana Bala) — each a
   verbatim port of the reference's divisional.js (JHora "Traditional"). */

/** D2 — hora, Udayashakti rule: odd signs run forward, even signs mirrored. */
export function hora(lon: number): VargaPoint {
  const sign = signOf(lon);
  const d = degInSign(lon);
  const first = d < 15;
  let dSign: number, degree: number;
  if (sign % 2 === 1) {
    dSign = first ? 2 * sign - 1 : 2 * sign;
    degree = first ? d * 2 : (d - 15) * 2;
  } else {
    dSign = first ? 2 * sign : 2 * sign - 1;
    degree = first ? 30 - d * 2 : 30 - (d - 15) * 2;
    if (degree >= 30) degree = 0;
  }
  return { sign: normSign(dSign), degree };
}

/** D3 — drekkana: trikona advance, +4 signs per 10° part. */
export function drekkana(lon: number): VargaPoint {
  const sign = signOf(lon);
  return { sign: ((sign - 1 + part(lon, 3) * 4) % 12) + 1, degree: divDeg(lon, 3) };
}

/** D7 — saptamsa: odd signs start from self, even from the 7th. */
export function saptamsa(lon: number): VargaPoint {
  const sign = signOf(lon);
  const offset = sign % 2 === 0 ? 6 : 0;
  return { sign: ((sign - 1 + offset + part(lon, 7)) % 12) + 1, degree: divDeg(lon, 7) };
}

/** D10 — dasamsa: odd signs start from self, even from the 9th (+8). */
export function dasamsa(lon: number): VargaPoint {
  const sign = signOf(lon);
  const offset = sign % 2 === 0 ? 8 : 0;
  return { sign: ((sign - 1 + offset + part(lon, 10)) % 12) + 1, degree: divDeg(lon, 10) };
}

/** D30 — trimsamsa: unequal Parashari planet-portions (see the header note).
    Odd signs: 0–5° Aries · 5–10° Aquarius · 10–18° Sagittarius · 18–25° Gemini ·
    25–30° Libra. Even signs: 0–5° Taurus · 5–12° Virgo · 12–20° Pisces ·
    20–25° Capricorn · 25–30° Scorpio. Bounds inclusive per the reference. */
export function trimsamsa(lon: number): VargaPoint {
  const sign = signOf(lon);
  const d = degInSign(lon);
  let dSign: number;
  if (sign % 2 === 1) {
    if (d <= 5) dSign = 1;
    else if (d <= 10) dSign = 11;
    else if (d <= 18) dSign = 9;
    else if (d <= 25) dSign = 3;
    else dSign = 7;
  } else {
    if (d <= 5) dSign = 2;
    else if (d <= 12) dSign = 6;
    else if (d <= 20) dSign = 12;
    else if (d <= 25) dSign = 10;
    else dSign = 8;
  }
  return { sign: dSign, degree: divDeg(lon, 30) };
}

/** D12 — dwadasamsa: starts from the sign itself, +1 per part. */
export function dwadasamsa(lon: number): VargaPoint {
  const sign = signOf(lon);
  return { sign: ((sign - 1 + part(lon, 12)) % 12) + 1, degree: divDeg(lon, 12) };
}

/** D16 — shodasamsa: movable→Aries, fixed→Leo, dual→Sagittarius. */
export function shodasamsa(lon: number): VargaPoint {
  const sign = signOf(lon);
  const seed = ((sign - 1) % 3) * 4;
  return { sign: ((seed + part(lon, 16)) % 12) + 1, degree: divDeg(lon, 16) };
}
