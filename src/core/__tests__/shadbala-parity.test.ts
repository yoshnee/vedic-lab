/* ============================================================
   shadbala-parity.test.ts — THE differential validation gate. Runs the same
   raw chart data through our engine (src/core/shadbala.ts) AND the vendored
   upstream Hora-Prakash shadbala.js (__upstream__/, byte-identical), asserting
   every component and the total agree within 0.1 virupa, for all 23 fixture
   charts. Our port is only trusted because this passes.

   Day/night note: the upstream reads panchang sunrise/sunset (Dates) and
   silently defaults to day-birth without them; our engine uses the ecliptic-
   horizon test. The gate constructs a panchang that brackets (or excludes)
   the birth instant to MATCH our engine's day/night result — i.e. it tests
   formula parity given an agreed day/night, not sunrise computation.

   Constants are kept literally the upstream's (e.g. Naisargika Jupiter 34.28)
   so components match exactly; the 0.1 tolerance guards rounding only.
   ============================================================ */
import { describe, it, expect, beforeAll } from "vitest";
import { rawPositions } from "../swisseph";
import { signOf, houseOf, degInSign } from "../vedic";
import { computeShadbala, type ShadbalaBody } from "../shadbala";
import { loadJhoraFixtures, fixtureBirth } from "./jhora-fixtures";
import type { PlanetKey } from "../types";
// @ts-expect-error — vendored upstream JS, no type declarations (see __upstream__/README.md)
import { calcShadbala } from "./__upstream__/src/core/shadbala.js";

const TOL = 0.1; // virupas

const GRAHAS: PlanetKey[] = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"];
const UPSTREAM_NAME: Record<string, string> = {
  sun: "Sun", moon: "Moon", mars: "Mars", mercury: "Mercury",
  jupiter: "Jupiter", venus: "Venus", saturn: "Saturn",
};
const COMPONENTS = [
  ["sthana", "sthanaBala"],
  ["dig", "digBala"],
  ["kala", "kalaBala"],
  ["chesta", "chestaBala"],
  ["naisargika", "naisargikaBala"],
  ["drik", "drikBala"],
  ["total", "total"],
] as const;

const jdToDate = (jd: number) => new Date((jd - 2440587.5) * 86_400_000);

interface ParityRun {
  ours: ReturnType<typeof computeShadbala>;
  upstream: Record<string, Record<string, number>>;
}

const fixtures = loadJhoraFixtures();
const runs = new Map<string, ParityRun>();

beforeAll(async () => {
  for (const fx of fixtures) {
    const birth = await fixtureBirth(fx);
    const raw = await rawPositions(birth.jdUT, birth.lat, birth.lon);
    const lagnaSign = signOf(raw.ascendant);

    // the exact same body set computeChart hands to computeShadbala
    const bodies: ShadbalaBody[] = GRAHAS.map((key) => ({
      key,
      lon: raw.longitudes[key],
      sign: signOf(raw.longitudes[key]),
      house: houseOf(signOf(raw.longitudes[key]), lagnaSign),
      degreeValue: degInSign(raw.longitudes[key]),
      retro: key === "sun" || key === "moon" ? false : raw.speeds[key] < 0,
      speed: raw.speeds[key],
    }));
    const ours = computeShadbala(bodies, raw.ascendant);

    // upstream state from the SAME raw data
    const upPlanets = bodies.map((b) => ({
      name: UPSTREAM_NAME[b.key],
      lon: b.lon,
      sign: b.sign,
      house: b.house,
      degree: b.degreeValue,
      retrograde: b.retro,
      speed: b.speed,
    }));
    const upLagna = { lon: raw.ascendant, sign: lagnaSign };
    // panchang bracketed to agree with OUR day/night result (see header)
    const ourIsDay = (raw.longitudes.sun - raw.ascendant + 360) % 360 > 180;
    const birthDate = jdToDate(birth.jdUT);
    const HOUR = 3_600_000;
    const panchang = ourIsDay
      ? { sunrise: new Date(birthDate.getTime() - HOUR), sunset: new Date(birthDate.getTime() + HOUR) }
      : { sunrise: new Date(birthDate.getTime() + HOUR), sunset: new Date(birthDate.getTime() + 2 * HOUR) };
    const upstream = calcShadbala(upPlanets, upLagna, [], birth.jdUT, panchang);

    runs.set(fx.slug, { ours, upstream });
  }
}, 60_000);

it("all 23 fixtures are exercised by the parity gate", () => {
  expect(fixtures.length).toBe(23);
});

describe.each(fixtures)("parity · $name", (fx) => {
  it("every shadbala component matches the upstream within 0.1 virupa", () => {
    const { ours, upstream } = runs.get(fx.slug)!;
    for (const key of GRAHAS) {
      const o = ours[key]!;
      const u = upstream[UPSTREAM_NAME[key]];
      expect(u, `${key} present upstream`).toBeDefined();
      for (const [ourField, upField] of COMPONENTS) {
        expect(
          Math.abs(o[ourField] - u[upField]),
          `${fx.slug} ${key} ${ourField} (ours ${o[ourField]} vs upstream ${u[upField]})`,
        ).toBeLessThanOrEqual(TOL);
      }
      expect(o.required, `${key} required`).toBe(u.required);
    }
  });
});
