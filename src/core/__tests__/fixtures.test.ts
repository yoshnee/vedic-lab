/* ============================================================
   fixtures.test.ts — end-to-end engine validation against JHora
   (Jagannatha Hora) ground truth. Each vendored fixture in
   __fixtures__/jhora/ carries its own birth input + JHora's computed output;
   we recompute the chart from the birth data and compare.

   23 charts spanning every sign and ascendant (vs. the single chart the old
   dev script checked) — the breadth that catches placement-specific bugs like
   the Moon-in-Scorpio debilitation typo (which two of these charts exercise).

   Positions match JHora exactly (within ~3 arcmin). Vimśottarī start dates
   carry the small linear-vs-JHora method gap the reference documents
   (DASHA_CALCULATION_METHODS.md); observed maxima across these 23 charts are
   MD ≤3.90d, AD ≤4.55d, so the tolerances below sit just above to flag real
   regressions (wrong lord/sequence, gross date jumps) without failing on the
   expected drift.
   ============================================================ */
import { describe, it, expect, beforeAll } from "vitest";
import { computeChart } from "../index";
import { computeDasha } from "../dasha";
import { navamsa } from "../divisional";
import { signName } from "../vedic";
import { loadJhoraFixtures, fixtureBirth } from "./jhora-fixtures";
import type { BirthInput, ChartData } from "../types";

const DAY = 86_400_000;
const TOL_DEG = 0.05; // ~3 arcmin — absorbs apparent/true & rounding
const TOL_MD_DAYS = 5; // observed max 3.90d
const TOL_AD_DAYS = 7; // observed max 4.55d
const AS_OF = new Date("2026-06-07T00:00:00Z"); // fixed so runs are deterministic

/** JHora regional name variants → our canonical nakshatra names. */
const NAK_ALIAS: Record<string, string> = {
  Pushyami: "Pushya", Shravan: "Shravana", Anu: "Anuradha", Dhanishtha: "Dhanishta",
};

function parseSignDeg(s: string): number {
  const m = s.match(/(\d+)°(\d+)/); // "16°55'"
  return m ? Number(m[1]) + Number(m[2]) / 60 : NaN;
}
const cmpAngle = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
const diffDays = (iso: string, date: string) => Math.abs(new Date(iso).getTime() - Date.parse(date)) / DAY;

const fixtures = loadJhoraFixtures();
const computed = new Map<string, { chart: ChartData; birth: BirthInput }>();

beforeAll(async () => {
  for (const fx of fixtures) {
    const birth = await fixtureBirth(fx);
    computed.set(fx.slug, { chart: await computeChart(birth, AS_OF), birth });
  }
}, 60_000);

it("all 23 JHora ground-truth fixtures are vendored", () => {
  expect(fixtures.length).toBe(23);
});

describe.each(fixtures)("$name", (fx) => {
  it("positions · sign · degree · nakshatra · pada · retrograde match JHora", () => {
    const { chart } = computed.get(fx.slug)!;

    const lag = fx.planets["Lagna"];
    expect(chart.ascendant.signName, "Lagna sign").toBe(lag.sign);
    expect(cmpAngle(chart.ascendant.longitude, lag.longitude), "Lagna longitude").toBeLessThanOrEqual(TOL_DEG);

    for (const p of chart.planets) {
      const f = fx.planets[p.name];
      if (!f) continue; // JHora lists extra upagrahas we don't compute
      expect(p.signName, `${p.name} sign`).toBe(f.sign);
      expect(cmpAngle(p.longitude, f.longitude), `${p.name} longitude`).toBeLessThanOrEqual(TOL_DEG);
      expect(Math.abs(p.degreeValue - parseSignDeg(f.sign_degree)), `${p.name} degree`).toBeLessThanOrEqual(TOL_DEG);
      expect(p.nakshatra.name, `${p.name} nakshatra`).toBe(NAK_ALIAS[f.nakshatra] ?? f.nakshatra);
      // JHora's extract leaves nakshatra_lord blank for "Anu"-abbreviated entries;
      // the name is validated above (which fixes the lord), so only assert when present.
      if (f.nakshatra_lord) expect(p.nakshatra.lord, `${p.name} nakshatra lord`).toBe(f.nakshatra_lord);
      expect(p.nakshatra.pada, `${p.name} pada`).toBe(f.pada);
      expect(p.retro, `${p.name} retrograde`).toBe(f.retrograde);
    }
  });

  it("navamsa (D9) sign matches JHora for the Lagna and every listed body", () => {
    // Mapped from JHora's own longitudes, so this validates the varga mapping
    // itself (our longitudes are validated separately above) — no boundary
    // flakiness from the ≤3′ ephemeris tolerance.
    for (const [name, f] of Object.entries(fx.planets)) {
      expect(f.navamsa_sign, `${name} navamsa_sign present in fixture`).toBeTruthy();
      expect(signName(navamsa(f.longitude).sign), `${name} navamsa sign`).toBe(f.navamsa_sign);
    }
  });

  it("Vimśottarī MD/AD tree matches JHora (within documented drift)", () => {
    const { chart, birth } = computed.get(fx.slug)!;
    const moonLon = chart.planets.find((p) => p.key === "moon")!.longitude;

    for (const [lord, block] of Object.entries(fx.dasha)) {
      // re-window the dasha as-of a date inside this MD so it surfaces in view
      const asOf = new Date(Date.parse(block.start) + 30 * DAY);
      const { mahadashas } = computeDasha(moonLon, birth.birthDate, asOf);
      const md = mahadashas.find((m) => m.lordName === lord);
      expect(md, `MD ${lord} present`).toBeDefined();
      expect(diffDays(md!.start, block.start), `MD ${lord} start`).toBeLessThanOrEqual(TOL_MD_DAYS);

      for (const [adLord, adStart] of Object.entries(block.antardashas)) {
        const child = md!.children?.find((c) => c.lordName === adLord);
        expect(child, `MD ${lord} / AD ${adLord} present`).toBeDefined();
        expect(diffDays(child!.start, adStart), `MD ${lord} / AD ${adLord} start`).toBeLessThanOrEqual(TOL_AD_DAYS);
      }
    }
  });
});
