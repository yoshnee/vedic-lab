/* ============================================================
   swisseph.ts — thin wrapper over swisseph-wasm. Lazy-initialised
   singleton (works in the browser and in Node). Produces raw SIDEREAL
   (Lahiri) longitudes + speeds + the Lagna. Validated against the
   Hora-Prakash JHora ground-truth fixtures (see core/__validate__).

   Recipe (proven by the spike): set_sid_mode(LAHIRI) →
   calc_ut(body, SIDEREAL|SPEED) geocentric; Rahu = mean node (10);
   Ketu = Rahu+180; Lagna = normalize(houses().ascmc[0] − ayanamsa)
   (swe_houses is tropical, so we subtract the ayanamsa).
   ============================================================ */
import type { PlanetKey } from "./types";
import { SE_BODY } from "./constants";

export function norm360(x: number): number {
  return ((x % 360) + 360) % 360;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let swePromise: Promise<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSwe(): Promise<any> {
  if (!swePromise) {
    swePromise = (async () => {
      const mod = await import("swisseph-wasm");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SwissEph = ((mod as any).default ?? mod) as new () => any;
      const swe = new SwissEph();
      await swe.initSwissEph();
      swe.set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0); // Lahiri ayanamsa
      return swe;
    })();
  }
  return swePromise;
}

export interface RawPositions {
  ayanamsa: number;
  ascendant: number; // sidereal longitude of the Lagna
  longitudes: Record<PlanetKey, number>; // sidereal
  speeds: Record<PlanetKey, number>; // °/day; negative = retrograde
}

/** Compute raw sidereal positions for a Julian Day (UT) + location. */
export async function rawPositions(
  jdUT: number,
  lat: number,
  lon: number,
): Promise<RawPositions> {
  const swe = await getSwe();
  const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SIDEREAL | swe.SEFLG_SPEED;
  const ayanamsa = swe.get_ayanamsa(jdUT);

  const longitudes = {} as Record<PlanetKey, number>;
  const speeds = {} as Record<PlanetKey, number>;
  (Object.keys(SE_BODY) as Exclude<PlanetKey, "ketu">[]).forEach((k) => {
    const r = swe.calc_ut(jdUT, SE_BODY[k], flags);
    longitudes[k] = norm360(r[0]);
    speeds[k] = r[3];
  });
  // Ketu is exactly opposite Rahu.
  longitudes.ketu = norm360(longitudes.rahu + 180);
  speeds.ketu = speeds.rahu;

  // swe_houses is tropical → subtract the ayanamsa to get the sidereal Lagna.
  const h = swe.houses(jdUT, lat, lon, "P");
  const ascendant = norm360(h.ascmc[0] - ayanamsa);

  return { ayanamsa, ascendant, longitudes, speeds };
}

/** Sidereal longitude of a single body at a Julian Day (UT) — for transit scans. */
export async function transitLongitude(jdUT: number, body: number): Promise<number> {
  const swe = await getSwe();
  const r = swe.calc_ut(jdUT, body, swe.SEFLG_SWIEPH | swe.SEFLG_SIDEREAL);
  return norm360(r[0]);
}

/** Compute a Julian Day (UT) from a UT calendar instant (Gregorian). */
export async function julianDayUT(
  year: number,
  month: number,
  day: number,
  utHour: number,
): Promise<number> {
  const swe = await getSwe();
  return swe.julday(year, month, day, utHour);
}
