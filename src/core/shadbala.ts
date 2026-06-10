/* ============================================================
   shadbala.ts — the six-fold planetary strength (virupas), a faithful port of
   the Hora-Prakash reference's src/core/shadbala.js. Seven grahas only (nodes
   have no shadbala). Components:
     Sthana = Ucha + Saptavargaja (dignity over D1/D2/D3/D7/D9/D12/D16, the
              reference's varga set) + Ojayugma (D1+D9 parity) + Kendradi +
              Drekkana ·  Dig (best-house distance) ·  Kala (Nathonnatha +
              Paksha + Ayana) ·  Chesta (retro/speed brackets; Sun & Moon take
              Ayana, per the reference) ·  Naisargika (fixed) ·  Drik (±15 ×
              aspect strength ÷ 2).
   NOTE this is the reference's deliberately SIMPLIFIED scheme — JHora's full
   Kala Bala has more sub-balas (tribhaga, year/month/day/hour lords, yuddha)
   and its Chesta uses orbital anomaly. Totals are therefore comparable but not
   JHora-exact; the UI presents them with required minimums + ratio, as the
   reference does.
   ONE divergence: day/night birth. The reference reads panchang sunrise/sunset
   (which we don't compute) and silently falls back to "day" without them; we
   instead use the ecliptic-horizon test — the Sun is a day birth when it sits
   in the western half from the ascendant ((sun − asc) mod 360 > 180°), i.e.
   above the asc/desc axis. Degree-accurate and never silently wrong-by-default.
   ============================================================ */
import type { PlanetKey, ShadbalaScore } from "./types";
import {
  OWN_SIGNS, MOOLTRIKONA, SIGN_RULER, NAISARGIKA_FRIENDS, NAISARGIKA_ENEMIES,
} from "./constants";
import { navamsa, hora, drekkana, saptamsa, dwadasamsa, shodasamsa, type VargaPoint } from "./divisional";

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

const DIGNITY_PTS = { moolatrikona: 45, own: 30, friend: 15, neutral: 7.5, enemy: 3.75 } as const;
const VARGAS: ((lon: number) => VargaPoint)[] = [
  (lon) => ({ sign: Math.floor((((lon % 360) + 360) % 360) / 30) + 1, degree: lon % 30 }), // D1
  hora, drekkana, saptamsa, navamsa, dwadasamsa, shodasamsa,
];

/* Saptavargaja dignity: moolatrikona > own > permanent (naisargika) relation
   to the varga sign's ruler — the reference's getDignity. */
function vargaDignity(planet: PlanetKey, sign: number): keyof typeof DIGNITY_PTS {
  if (MOOLTRIKONA[planet] === sign) return "moolatrikona";
  if (OWN_SIGNS[planet]?.includes(sign)) return "own";
  const ruler = SIGN_RULER[sign - 1];
  if (NAISARGIKA_FRIENDS[planet]?.includes(ruler)) return "friend";
  if (NAISARGIKA_ENEMIES[planet]?.includes(ruler)) return "enemy";
  return "neutral";
}

function uchaBala(planet: PlanetKey, lon: number): number {
  const exalt = EXALT_LON[planet];
  if (exalt === undefined) return 0;
  const dist = Math.abs(((lon - exalt + 540) % 360) - 180);
  return 60 * (1 - dist / 180);
}

function saptaVargajaBala(planet: PlanetKey, lon: number): number {
  let total = 0;
  for (const varga of VARGAS) total += DIGNITY_PTS[vargaDignity(planet, varga(lon).sign)];
  return total;
}

function ojayugmaBala(planet: PlanetKey, d1Sign: number, d9Sign: number): number {
  const pref = (sign: number) => {
    const isOdd = sign % 2 === 1;
    if (["sun", "mars", "jupiter", "saturn"].includes(planet)) return isOdd ? 15 : 0;
    if (["moon", "venus"].includes(planet)) return isOdd ? 0 : 15;
    return 15; // Mercury always
  };
  return (pref(d1Sign) + pref(d9Sign)) / 2;
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

function ayanaBala(planet: PlanetKey, lon: number): number {
  if (planet === "mercury") return 30;
  const tropLon = (lon + 24) % 360; // reference's fixed ~24° ayanamsa shift
  const obliqRad = (23.45 * Math.PI) / 180;
  const decl = (Math.asin(Math.sin(obliqRad) * Math.sin((tropLon * Math.PI) / 180)) * 180) / Math.PI;
  const factor = ["sun", "mars", "jupiter", "venus"].includes(planet) ? 1 : -1;
  return 30 + factor * 30 * (decl / 23.45);
}

const CHESTA_MEAN_SPEED: Record<string, number> = {
  mars: 0.524, mercury: 1.383, jupiter: 0.083, venus: 1.2, saturn: 0.033,
};
function chestaBala(p: ShadbalaBody): number {
  if (p.key === "sun" || p.key === "moon") return ayanaBala(p.key, p.lon);
  if (p.retro) return 60;
  const spd = Math.abs(p.speed);
  if (spd < 0.083) return 30;
  return spd >= (CHESTA_MEAN_SPEED[p.key] ?? 1) ? 45 : 15;
}

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

/** Compute shadbala for the seven grahas. `ascLon` drives the day/night test. */
export function computeShadbala(
  bodies: ShadbalaBody[],
  ascLon: number,
): Partial<Record<PlanetKey, ShadbalaScore>> {
  const grahas = bodies.filter((b) => GRAHAS.includes(b.key));
  const sun = grahas.find((b) => b.key === "sun")!;
  const moon = grahas.find((b) => b.key === "moon")!;
  // Day birth ⇔ the Sun is above the asc/desc axis (see header note).
  const isDayBirth = (sun.lon - ascLon + 360) % 360 > 180;

  const out: Partial<Record<PlanetKey, ShadbalaScore>> = {};
  for (const p of grahas) {
    const d9Sign = navamsa(p.lon).sign;
    const sthana =
      uchaBala(p.key, p.lon) +
      saptaVargajaBala(p.key, p.lon) +
      ojayugmaBala(p.key, p.sign, d9Sign) +
      kendradiBala(p.house) +
      drekkanaBala(p.key, p.degreeValue);
    const dig = digBala(p.key, p.house);
    const ayanaContrib = p.key === "sun" || p.key === "moon" ? 0 : ayanaBala(p.key, p.lon);
    const kala = nathonnathaBala(p.key, isDayBirth) + pakshaBala(p.key, moon.lon, sun.lon) + ayanaContrib;
    const chesta = chestaBala(p);
    const naisargika = NAISARGIKA[p.key];
    const drik = drikBala(p, grahas);
    const total = sthana + dig + kala + chesta + naisargika + drik;
    const required = SHADBALA_REQUIRED[p.key];
    out[p.key] = {
      sthana: r1(sthana), dig: r1(dig), kala: r1(kala), chesta: r1(chesta),
      naisargika: r1(naisargika), drik: r1(drik),
      total: r1(total), required, ratio: Math.round((total / required) * 100) / 100,
    };
  }
  return out;
}
