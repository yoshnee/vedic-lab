/* ============================================================
   shadbala.ts — the six-fold planetary strength (virupas). Seven grahas only (nodes have
   no shadbala). PROVENANCE: this engine began as a port of the Hora-Prakash
   reference (src/core/shadbala.js) and now DELIBERATELY DIVERGES from it
   toward classical BPHS on five documented points: (1) the Moon's Cheshta
   source is its Paksha Bala, not Ayana; (2) the luminary Ayana term inside
   Kala is no longer zeroed; (3) the Saptavargaja varga set is D30, not D16;
   (4) Ojayugma is summed (max 30), not averaged; (5) Mercury's Ayana is
   declination-derived, always additive. The Ayana/declination terms also
   reconstruct tropical longitude from the chart's ACTUAL Lahiri ayanamsa
   (threaded in via computeShadbala), not the upstream's hard-coded ~24°, so
   they stay correct for historical and future charts. So it is no longer
   byte-parity with the upstream (kept only as a historical copy under
   __tests__/__upstream__);
   the regression test shadbala-regression.test.ts locks the engine's own
   BPHS-anchored outputs instead. Components:
     Sthana = Ucha + Saptavargaja (dignity over D1/D2/D3/D7/D9/D12/D30, the
              classical Saptavarga) + Ojayugma (D1+D9 parity) + Kendradi +
              Drekkana ·  Dig (best-house distance) ·  Kala (Nathonnatha +
              Paksha + Ayana) ·  Chesta (retro/speed brackets; Sun takes Ayana,
              Moon takes Paksha, BPHS 27.18) ·  Naisargika (fixed) ·  Drik (±15 ×
              aspect strength ÷ 2).
   STILL SIMPLIFIED (accepted; BPHS-anchored on the five points above but not a
   full classical Shadbala): the Kala Bala is REDUCED, omitting Tribhaga, the
   Varsha/Masa/Vara/Hora lord balas, and Yuddha; the Chesta Bala is BUCKETED
   (retro/speed brackets) rather than the continuous Cheshta-Kendra formula; and
   the Drik Bala uses WHOLE-SIGN aspect offsets rather than Sphuta Drishti. So
   totals will not match JHora exactly; the UI presents them with required
   minimums + ratio.
   Day/night method (a further reference divergence): the reference reads panchang sunrise/sunset
   (which we don't compute) and silently falls back to "day" without them; we
   instead use the ecliptic-horizon test — the Sun is a day birth when it sits
   in the western half from the ascendant ((sun − asc) mod 360 > 180°), i.e.
   above the asc/desc axis. Degree-accurate and never silently wrong-by-default.
   ============================================================ */
import type { PlanetKey, ShadbalaScore } from "./types";
import { MOOLTRIKONA, SIGN_RULER } from "./constants";
import { panchadhaMaitri } from "./vedic";
import { navamsa, hora, drekkana, saptamsa, dwadasamsa, trimsamsa, type VargaPoint } from "./divisional";

export type { ShadbalaScore } from "./types";

export interface ShadbalaBody {
  key: PlanetKey;
  lon: number; // sidereal longitude
  sign: number; // 1–12
  house: number; // 1–12 whole-sign
  degreeValue: number; // degrees within sign
  retro: boolean;
  speed: number; // °/day from the ephemeris
}

const GRAHAS: PlanetKey[] = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"];

/* Ecliptic longitude of the exact exaltation point (reference EXALT_LON). */
const EXALT_LON: Partial<Record<PlanetKey, number>> = {
  sun: 10, moon: 33, mars: 298, mercury: 165, jupiter: 95, venus: 357, saturn: 200,
};

const VARGAS: ((lon: number) => VargaPoint)[] = [
  (lon) => ({ sign: Math.floor((((lon % 360) + 360) % 360) / 30) + 1, degree: lon % 30 }), // D1
  hora, drekkana, saptamsa, navamsa, dwadasamsa, trimsamsa,
];

/* Saptavargaja dignity POINTS (virupas), per BPHS / the astrosight.ai 7-tier
   scheme: moolatrikona 45 > own 30 > the COMPOUND (panchadha) relation to the
   varga sign's lord — Adhimitra 22.5 / Mitra 15 / Sama 7.5 / Shatru 3.75 /
   Adhishatru 1.875. The compound relation combines naisargika (permanent) +
   tatkalika (temporal, from the RASI/D1 positions of the planet and the lord),
   reusing the same panchadhaMaitri as the maitri pill. (The Hora-Prakash
   upstream's getDignity used permanent-only 5 tiers — 15/7.5/3.75, no
   great-friend/great-enemy; see __upstream__. Owner-directed change, 2026-07.)
   `d1Signs` maps every graha to its rasi sign; the lord (a sign ruler) is always
   one of the seven and therefore present. */
function vargaDignityPts(
  planet: PlanetKey,
  vargaSign: number,
  d1Signs: Record<PlanetKey, number>,
): number {
  if (MOOLTRIKONA[planet] === vargaSign) return 45;
  const lord = SIGN_RULER[vargaSign - 1];
  if (lord === planet) return 30; // own sign (non-moolatrikona)
  switch (panchadhaMaitri(planet, lord, d1Signs[planet], d1Signs[lord])) {
    case "adhi_mitra": return 22.5;
    case "mitra": return 15;
    case "sama": return 7.5;
    case "shatru": return 3.75;
    case "adhi_shatru": return 1.875;
    default: return 7.5; // own_sign/null unreachable past the guards (grahas only)
  }
}

function uchaBala(planet: PlanetKey, lon: number): number {
  const exalt = EXALT_LON[planet];
  if (exalt === undefined) return 0;
  const dist = Math.abs(((lon - exalt + 540) % 360) - 180);
  return 60 * (1 - dist / 180);
}

function saptaVargajaBala(planet: PlanetKey, lon: number, d1Signs: Record<PlanetKey, number>): number {
  let total = 0;
  for (const varga of VARGAS) total += vargaDignityPts(planet, varga(lon).sign, d1Signs);
  return total;
}

function ojayugmaBala(planet: PlanetKey, d1Sign: number, d9Sign: number): number {
  const pref = (sign: number) => {
    const isOdd = sign % 2 === 1;
    if (["sun", "mars", "jupiter", "saturn"].includes(planet)) return isOdd ? 15 : 0;
    if (["moon", "venus"].includes(planet)) return isOdd ? 0 : 15;
    return 15; // Mercury always
  };
  return pref(d1Sign) + pref(d9Sign); // 15 (Rasi) + 15 (Navamsa), summed; max 30 (BPHS)
}

const kendradiBala = (house: number) =>
  [1, 4, 7, 10].includes(house) ? 60 : [2, 5, 8, 11].includes(house) ? 30 : 15;

const DREKKANA_GENDER: Record<string, "male" | "female" | "neutral"> = {
  sun: "male", mars: "male", jupiter: "male",
  moon: "female", venus: "female",
  mercury: "neutral", saturn: "neutral",
};
function drekkanaBala(planet: PlanetKey, degree: number): number {
  const third = Math.floor((degree % 30) / 10);
  const g = DREKKANA_GENDER[planet];
  if (g === "male" && third === 0) return 15;
  if (g === "female" && third === 2) return 15;
  if (g === "neutral" && third === 1) return 15;
  return 0;
}

const DIG_BEST: Record<string, number> = { sun: 10, mars: 10, moon: 4, venus: 4, mercury: 1, jupiter: 1, saturn: 7 };
function digBala(planet: PlanetKey, house: number): number {
  const best = DIG_BEST[planet];
  const dist = Math.min(Math.abs(house - best), 12 - Math.abs(house - best));
  return 60 * (1 - dist / 6);
}

function nathonnathaBala(planet: PlanetKey, isDayBirth: boolean): number {
  if (planet === "mercury") return 60;
  if (["sun", "jupiter", "venus"].includes(planet)) return isDayBirth ? 60 : 0;
  return isDayBirth ? 0 : 60; // Moon, Mars, Saturn
}

function pakshaBala(planet: PlanetKey, moonLon: number, sunLon: number): number {
  const phase = (moonLon - sunLon + 360) % 360;
  if (planet === "moon") return phase <= 180 ? phase / 3 : (360 - phase) / 3;
  const waxing = phase <= 180;
  if (["mercury", "jupiter", "venus"].includes(planet)) {
    return waxing ? phase / 3 : (360 - phase) / 3;
  }
  return waxing ? (180 - phase) / 3 : (phase - 180) / 3;
}

function ayanaBala(planet: PlanetKey, lon: number, ayanamsa: number): number {
  // Tropical longitude = sidereal + the chart's actual ayanamsa. The upstream
  // reference hard-coded ~24°; we use the per-chart Lahiri value (from
  // rawPositions) so the declination — and so Mercury's Ayana, every graha's
  // Kala Ayana, and the Sun's Cheshta — stays correct for historical charts.
  const tropLon = ((lon + ayanamsa) % 360 + 360) % 360;
  const obliqRad = (23.45 * Math.PI) / 180;
  const decl = (Math.asin(Math.sin(obliqRad) * Math.sin((tropLon * Math.PI) / 180)) * 180) / Math.PI;
  // Mercury's declination is always additive (BPHS) -> range 30..60.
  if (planet === "mercury") return 30 + 30 * (Math.abs(decl) / 23.45);
  const factor = ["sun", "mars", "jupiter", "venus"].includes(planet) ? 1 : -1;
  return 30 + factor * 30 * (decl / 23.45);
}

const CHESTA_MEAN_SPEED: Record<string, number> = {
  mars: 0.524, mercury: 1.383, jupiter: 0.083, venus: 1.2, saturn: 0.033,
};
function chestaBala(p: ShadbalaBody, ayanamsa: number): number {
  if (p.key === "sun") return ayanaBala(p.key, p.lon, ayanamsa); // Moon's Cheshta = Paksha, set in computeShadbala (BPHS 27.18)
  if (p.retro) return 60;
  const spd = Math.abs(p.speed);
  if (spd < 0.083) return 30;
  return spd >= (CHESTA_MEAN_SPEED[p.key] ?? 1) ? 45 : 15;
}

/* The Naisargika table (owner-locked). These are the classical 60/7 multiples,
   strongest to weakest (Sun 7× … Saturn 1×) — the deck teaches that pattern;
   the upstream's rounding (Jupiter 34.28 where 4 × 60/7 = 34.2857) is kept
   unchanged in this pass and locked by the regression test. */
const NAISARGIKA: Record<string, number> = {
  sun: 60, moon: 51.43, venus: 42.86, jupiter: 34.28, mercury: 25.71, mars: 17.14, saturn: 8.57,
};

const DRIK_OFFSETS: Record<string, number[]> = {
  sun: [6], moon: [6], mercury: [6], venus: [6],
  mars: [3, 6, 7], jupiter: [4, 6, 8], saturn: [2, 6, 9],
};
const DRIK_STRENGTH: Record<number, number> = { 2: 0.25, 3: 0.5, 4: 0.75, 6: 1.0, 7: 0.5, 8: 0.75, 9: 0.25 };
const DRIK_BENEFICS = new Set<PlanetKey>(["moon", "mercury", "jupiter", "venus"]);
const DRIK_MALEFICS = new Set<PlanetKey>(["sun", "mars", "saturn"]);

function drikBala(target: ShadbalaBody, bodies: ShadbalaBody[]): number {
  let total = 0;
  for (const caster of bodies) {
    if (caster.key === target.key) continue;
    const relOffset = (target.house - caster.house + 12) % 12;
    if (!DRIK_OFFSETS[caster.key]?.includes(relOffset)) continue;
    const strength = DRIK_STRENGTH[relOffset] ?? 0;
    if (DRIK_BENEFICS.has(caster.key)) total += 15 * strength;
    if (DRIK_MALEFICS.has(caster.key)) total -= 15 * strength;
  }
  return total / 2;
}

/** BPHS minimum total (virupas) per planet. */
export const SHADBALA_REQUIRED: Record<string, number> = {
  sun: 390, moon: 360, mars: 300, mercury: 420, jupiter: 390, venus: 330, saturn: 300,
};

const r1 = (x: number) => Math.round(x * 10) / 10;

/** Compute shadbala for the seven grahas. `ascLon` drives the day/night test;
    `ayanamsa` (the chart's actual Lahiri value, from rawPositions) reconstructs
    tropical longitude for the Ayana/declination terms. */
export function computeShadbala(
  bodies: ShadbalaBody[],
  ascLon: number,
  ayanamsa: number,
): Partial<Record<PlanetKey, ShadbalaScore>> {
  const grahas = bodies.filter((b) => GRAHAS.includes(b.key));
  const sun = grahas.find((b) => b.key === "sun");
  const moon = grahas.find((b) => b.key === "moon");
  if (!sun || !moon) {
    throw new Error("computeShadbala requires both Sun and Moon in `bodies` (paksha & day/night depend on them)");
  }
  // Day birth ⇔ the Sun is above the asc/desc axis (see header note).
  const isDayBirth = (sun.lon - ascLon + 360) % 360 > 180;
  // Rasi (D1) signs of every graha — the tatkalika (temporal) basis for the
  // compound Saptavargaja dignity (a sign's lord is always one of the seven).
  const d1Signs = Object.fromEntries(grahas.map((g) => [g.key, g.sign])) as Record<PlanetKey, number>;

  const out: Partial<Record<PlanetKey, ShadbalaScore>> = {};
  for (const p of grahas) {
    const d9Sign = navamsa(p.lon).sign;
    const uchcha = uchaBala(p.key, p.lon);
    const saptavargaja = saptaVargajaBala(p.key, p.lon, d1Signs);
    const ojayugma = ojayugmaBala(p.key, p.sign, d9Sign);
    const kendradi = kendradiBala(p.house);
    const drekkana = drekkanaBala(p.key, p.degreeValue);
    const sthana = uchcha + saptavargaja + ojayugma + kendradi + drekkana;
    const dig = digBala(p.key, p.house);
    const nathonnatha = nathonnathaBala(p.key, isDayBirth);
    const paksha = pakshaBala(p.key, moon.lon, sun.lon);
    // BPHS 27.18 dual-count (no literal x2): every planet's Ayana counts in
    // Kala; the Sun's Ayana also returns as its Cheshta (Sun Ayana doubled),
    // and the Moon's Paksha returns as its Cheshta below (Moon Paksha doubled).
    const ayana = ayanaBala(p.key, p.lon, ayanamsa);
    const kala = nathonnatha + paksha + ayana;
    const chesta = p.key === "moon" ? paksha : chestaBala(p, ayanamsa);
    const naisargika = NAISARGIKA[p.key];
    const drik = drikBala(p, grahas);
    const total = sthana + dig + kala + chesta + naisargika + drik;
    const required = SHADBALA_REQUIRED[p.key];
    // Ishta/Kashta Phala — BPHS geometric means over Uchcha & Chesta (the
    // reference implements no phala; BPHS governs where it is silent).
    const ishta = Math.sqrt(uchcha * chesta);
    const kashta = Math.sqrt((60 - uchcha) * (60 - chesta));
    out[p.key] = {
      sthana: r1(sthana), dig: r1(dig), kala: r1(kala), chesta: r1(chesta),
      naisargika: r1(naisargika), drik: r1(drik),
      total: r1(total), required, ratio: Math.round((total / required) * 100) / 100,
      ishta: r1(ishta), kashta: r1(kashta),
      parts: {
        uchcha: r1(uchcha), saptavargaja: r1(saptavargaja), ojayugma: r1(ojayugma),
        kendradi: r1(kendradi), drekkana: r1(drekkana),
        nathonnatha: r1(nathonnatha), paksha: r1(paksha), ayana: r1(ayana),
      },
    };
  }
  return out;
}

/** Tier reading of the total vs the planet's own bar (owner-endorsed):
    ≥ +20% strong · ≥ minimum adequate · within 10% below borderline · else weak.
    The classical binary (Bal-Yukta/Balaheena) is simply ratio ≥ 1. */
export type ShadbalaTier = "strong" | "adequate" | "borderline" | "weak";
export function tierOf(s: Pick<ShadbalaScore, "total" | "required">): ShadbalaTier {
  if (s.total >= s.required * 1.2) return "strong";
  if (s.total >= s.required) return "adequate";
  if (s.total >= s.required * 0.9) return "borderline";
  return "weak";
}
