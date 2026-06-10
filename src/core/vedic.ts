/* ============================================================
   vedic.ts — the Vedic derivation layer over raw sidereal longitudes.
   Pure functions, following the Hora-Prakash reference (CLAUDE.md #1):
   sign + degree, nakshatra/pada/lord, whole-sign houses from the Lagna,
   dignity (sign-number lookup), retrograde, combustion, drishti, conjunction,
   and house lordships.
   ============================================================ */
import type { PlanetKey, Dignity, Nakshatra, AspectRef, Maitri, FunctionalNature } from "./types";
import {
  SIGN_NAMES, SIGN_RULER, NAKSHATRAS, PLANET_NAMES,
  EXALTATION, DEBILITATION, OWN_SIGNS, DRISHTI, COMBUSTION_ORB,
  NAKSHATRA_ARC, PADA_ARC,
  GANDANTA_BOUNDARIES, GANDANTA_ORB, GANDANTA_DEEP_ORB,
  NAISARGIKA_FRIENDS, NAISARGIKA_ENEMIES, ASCENDANT_FUNCTIONAL,
} from "./constants";
import { norm360 } from "./swisseph";

/** Sign 1–12 from a longitude. */
export function signOf(lon: number): number {
  return Math.floor(norm360(lon) / 30) + 1;
}

/** Decimal degrees within the sign (0–30). */
export function degInSign(lon: number): number {
  return norm360(lon) % 30;
}

export function signName(sign: number): string {
  return SIGN_NAMES[sign - 1];
}

/** Format degrees-within-sign as "20°10′" (carry minute rounding). */
export function formatDMS(degWithinSign: number): string {
  let d = Math.floor(degWithinSign);
  let m = Math.round((degWithinSign - d) * 60);
  if (m === 60) { m = 0; d += 1; }
  return `${d}°${String(m).padStart(2, "0")}′`;
}

export function nakshatraOf(lon: number): Nakshatra {
  const L = norm360(lon);
  const idx = Math.floor(L / NAKSHATRA_ARC) % 27;
  const pada = Math.floor((L % NAKSHATRA_ARC) / PADA_ARC) + 1;
  const nk = NAKSHATRAS[idx];
  return { name: nk.name, pada, lord: PLANET_NAMES[nk.lord] };
}

/** Nakshatra index 0–26 (used to seed the dasha). */
export function nakshatraIndex(lon: number): number {
  return Math.floor(norm360(lon) / NAKSHATRA_ARC) % 27;
}

export function dignityOf(planet: PlanetKey, sign: number): Dignity {
  if (planet === "rahu" || planet === "ketu") return "neutral"; // nodal dignity debated
  if (EXALTATION[planet] === sign) return "exalted";
  if (DEBILITATION[planet] === sign) return "debilitated";
  if (OWN_SIGNS[planet]?.includes(sign)) return "own";
  return "neutral";
}

/** Whole-sign house of a planet's sign, counted from the Lagna sign. */
export function houseOf(planetSign: number, lagnaSign: number): number {
  return ((planetSign - lagnaSign + 12) % 12) + 1;
}

/* ---- Panchadha maitri toward the dispositor (the lord of the occupied sign).
   Direction is occupant → dispositor and is asymmetric; never reverse it. ---- */

/** Natural (naisargika) standing of `planet` toward `other`. undefined when `planet`
    has no defined natural table (Rahu/Ketu — the reference omits node friendships). */
function naturalRelation(
  planet: PlanetKey,
  other: PlanetKey,
): "friend" | "neutral" | "enemy" | undefined {
  const friends = NAISARGIKA_FRIENDS[planet];
  const enemies = NAISARGIKA_ENEMIES[planet];
  if (!friends || !enemies) return undefined;
  if (friends.includes(other)) return "friend";
  if (enemies.includes(other)) return "enemy";
  return "neutral";
}

/** Temporal (tatkalika): friend if `other` sits 2/3/4/10/11/12 from `self` (counting
    from self = 1), enemy if 1/5/6/7/8/9. */
function temporalRelation(selfSign: number, otherSign: number): "friend" | "enemy" {
  const pos = ((otherSign - selfSign + 12) % 12) + 1; // 1..12, self = 1
  return pos === 1 || (pos >= 5 && pos <= 9) ? "enemy" : "friend";
}

/** Combine natural + temporal into the five-step panchadha result. */
function combinePanchadha(
  nat: "friend" | "neutral" | "enemy",
  temp: "friend" | "enemy",
): Maitri {
  if (temp === "friend") {
    return nat === "friend" ? "adhi_mitra" : nat === "neutral" ? "mitra" : "sama";
  }
  return nat === "friend" ? "sama" : nat === "neutral" ? "shatru" : "adhi_shatru";
}

/** A planet's compound (panchadha) relationship toward its dispositor — the lord of
    the sign it occupies (its "landlord"). `signs` maps every planet key to its sign.
    Returns `{ dispositor: null, relation: "own_sign" }` when self-dispositing, and
    `{ dispositor, relation: null }` for a node occupant (no defined natural table). */
export function maitriToDispositor(
  planet: PlanetKey,
  signs: Record<PlanetKey, number>,
): { dispositor: PlanetKey | null; relation: Maitri | null } {
  const occSign = signs[planet];
  const lord = SIGN_RULER[occSign - 1];
  if (lord === planet) return { dispositor: null, relation: "own_sign" };
  const nat = naturalRelation(planet, lord); // occupant → dispositor (asymmetric)
  if (!nat) return { dispositor: lord, relation: null }; // node occupant → omit badge
  const temp = temporalRelation(occSign, signs[lord]);
  return { dispositor: lord, relation: combinePanchadha(nat, temp) };
}

/** Natural (naisargika) standing of a planet toward the lord of the sign it occupies —
    the basis for Jagradadi avastha. `null` when self-dispositing (own sign) or for a
    node (no defined natural table). Distinct from the compound `maitriToDispositor`. */
export function naturalToDispositor(
  planet: PlanetKey,
  signs: Record<PlanetKey, number>,
): "friend" | "neutral" | "enemy" | null {
  const lord = SIGN_RULER[signs[planet] - 1];
  if (lord === planet) return null; // own sign — dignity already reads it as Awake
  return naturalRelation(planet, lord) ?? null;
}

/** Houses a planet lords (its sign-rulerships mapped to house numbers from the Lagna). */
export function rulesOf(planet: PlanetKey, lagnaSign: number): number[] {
  const houses: number[] = [];
  for (let s = 1; s <= 12; s++) {
    if (SIGN_RULER[s - 1] === planet) houses.push(houseOf(s, lagnaSign));
  }
  return houses.sort((a, b) => a - b);
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Which planets aspect `targetSign` — chips reference the aspecting planet KEY
    and the ordinal ("7th"). */
export function aspectsOnto(
  targetSign: number,
  signs: Record<PlanetKey, number>,
): AspectRef[] {
  const out: AspectRef[] = [];
  (Object.keys(signs) as PlanetKey[]).forEach((p) => {
    const from = signs[p];
    if (from === targetSign) return; // a planet doesn't aspect its own sign
    for (const dist of DRISHTI[p]) {
      const aspectedSign = ((from - 1 + (dist - 1)) % 12) + 1;
      if (aspectedSign === targetSign) {
        out.push({ planet: p, aspect: ordinal(dist) });
        break;
      }
    }
  });
  return out;
}

/** Other planets sharing a sign (conjunction by sign) — returns planet keys. */
export function conjunctIn(
  self: PlanetKey,
  sign: number,
  signs: Record<PlanetKey, number>,
): PlanetKey[] {
  return (Object.keys(signs) as PlanetKey[]).filter(
    (p) => p !== self && signs[p] === sign,
  );
}

/** Gandanta — proximity to a water→fire sign junction (0°/120°/240°). `distance`
    is the circular degrees to the nearest junction; `on` within GANDANTA_ORB
    (1°40′ each side — the 28°20′→1°40′ zone), `deep` within GANDANTA_DEEP_ORB
    (±48′). Applies to any point — planet or Lagna — since it derives straight
    from the longitude. */
export function gandantaOf(lon: number): { on: boolean; deep: boolean; distance: number } {
  const L = norm360(lon);
  const distance = Math.min(
    ...GANDANTA_BOUNDARIES.map((b) => {
      const d = Math.abs(L - b) % 360;
      return Math.min(d, 360 - d);
    }),
  );
  return { on: distance <= GANDANTA_ORB, deep: distance <= GANDANTA_DEEP_ORB, distance };
}

/** A planet's functional nature for the chart's ascendant, read from the single
    canonical ASCENDANT_FUNCTIONAL table (the same table that backs the Ascendants
    deck). Yogakaraka takes precedence over benefic. Nodes are unclassified → null. */
export function functionalNatureOf(planet: PlanetKey, lagnaSign: number): FunctionalNature | null {
  if (planet === "rahu" || planet === "ketu") return null;
  const t = ASCENDANT_FUNCTIONAL[lagnaSign - 1];
  if (t.yogakaraka === planet) return "yogakaraka"; // precedence over benefic
  if (t.benefics.includes(planet)) return "benefic";
  if (t.malefics.includes(planet)) return "malefic";
  if (t.neutrals.includes(planet)) return "neutral";
  return null;
}

/** Tithi (lunar day) from the Moon & Sun longitudes. The Moon–Sun elongation
    divides into 30 tithis of 12° each — `number` is the absolute 1–30 count
    (15 = Purnima/full, 30 = Amavasya/new); `waxing` is the Shukla paksha (elongation
    < 180°, i.e. tithi ≤ 15); `illumination` is the lit fraction 0–1. Ayanamsa cancels
    in the Moon−Sun difference, so sidereal inputs are fine. Follows the Hora-Prakash
    reference (panchang.js: `floor(((moon−sun)+360)%360 / 12) + 1`). */
export function tithiOf(
  moonLon: number,
  sunLon: number,
): { number: number; waxing: boolean; illumination: number } {
  const elong = norm360(moonLon - sunLon);
  return {
    number: Math.floor(elong / 12) + 1,
    waxing: elong < 180,
    illumination: (1 - Math.cos((elong * Math.PI) / 180)) / 2,
  };
}

/** Is a planet combust (too close to the Sun)? Sun/Rahu/Ketu never combust. */
export function isCombust(
  planet: PlanetKey,
  lon: number,
  sunLon: number,
): boolean {
  const orb = COMBUSTION_ORB[planet];
  if (orb === undefined) return false;
  let diff = Math.abs(norm360(lon) - norm360(sunLon));
  if (diff > 180) diff = 360 - diff;
  return diff <= orb;
}
