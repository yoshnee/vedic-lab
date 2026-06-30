/* ============================================================
   jhora-fixtures.ts — shared loader for the vendored JHora ground-truth
   charts (__fixtures__/jhora/). fixtures.test.ts reads these charts and builds
   BirthInputs through this single path. (The retired shadbala parity gate also
   used this loader; the shadbala regression test now uses the sample chart.)
   Not a test file (vitest only picks up *.test.ts).
   ============================================================ */
import { readdirSync, readFileSync } from "node:fs";
import { birthFromCivil } from "../index";
import type { BirthInput } from "../types";

const DIR = new URL("../__fixtures__/jhora/", import.meta.url);

export interface JhoraPlanet {
  longitude: number;
  sign: string;
  sign_degree: string;
  nakshatra: string;
  nakshatra_lord: string;
  pada: number;
  retrograde: boolean;
  navamsa_sign?: string;
}

export interface JhoraFixture {
  slug: string;
  name: string;
  birth: { dob: string; tob: string; timezone: string; lat: number; lon: number };
  planets: Record<string, JhoraPlanet>;
  dasha: Record<string, { start: string; antardashas: Record<string, string> }>;
}

export function loadJhoraFixtures(): JhoraFixture[] {
  return readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((fn) => {
      const j = JSON.parse(readFileSync(new URL(fn, DIR), "utf8"));
      return {
        slug: fn.replace(/\.json$/, ""),
        name: j.meta?.name ?? fn,
        birth: j.birth,
        planets: j.planets,
        dasha: j.dasha,
      };
    });
}

export function tzHours(s: string): number {
  const m = s.match(/([+-])(\d\d):(\d\d)/);
  if (!m) throw new Error(`unparseable timezone: ${s}`);
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) + Number(m[3]) / 60);
}

export function fixtureBirth(fx: JhoraFixture): Promise<BirthInput> {
  const [Y, Mo, Da] = fx.birth.dob.split("-").map(Number);
  const [H, Mi, S] = fx.birth.tob.split(":").map(Number);
  return birthFromCivil({
    year: Y, month: Mo, day: Da, hour: H, minute: Mi, second: S || 0,
    tzOffsetHours: tzHours(fx.birth.timezone),
    lat: fx.birth.lat, lon: fx.birth.lon, dateLabel: fx.birth.dob,
  });
}
