/* Dev validation: compute the sample (Gandhi) chart with our engine and compare
   every planet + Lagna against the Hora-Prakash JHora ground-truth fixture.
   Run: npx --yes tsx scripts/validate-engine.ts
   This is the accuracy gate for CLAUDE.md working rule #1. */
import { computeChart } from "../src/core/index";
import { computeDasha } from "../src/core/dasha";
import { sampleBirth } from "../src/core/sample";

const FIXTURE =
  "https://raw.githubusercontent.com/PriyankGahtori/hora-prakash/main/src/core/__fixtures__/jhora-ground-truth/Mahatma_Gandhi.json";

const TOL_DEG = 0.05; // longitude tolerance (~3 arcmin) — absorbs apparent/true & rounding

// Vimshottari start-date tolerances (days). MD boundaries match JHora tightly; AD boundaries
// carry the inherent linear-vs-JHora drift the reference documents in DASHA_CALCULATION_METHODS.md
// (clock-time fractions vs solar-arc compound at sub-period level). Observed on this fixture:
// MD ≤1.64d, AD ≤4.49d. Tolerances sit just above to flag real regressions (wrong lord/sequence,
// gross date jumps) without failing on the expected method gap.
const TOL_MD_DAYS = 2;
const TOL_AD_DAYS = 5;
const DAY_MS = 86_400_000;

function parseSignDeg(s: string): number {
  // "12°53'" -> decimal degrees within sign
  const m = s.match(/(\d+)°(\d+)/);
  if (!m) return NaN;
  return Number(m[1]) + Number(m[2]) / 60;
}

// reference's measure: keep the time component, fractional abs days (src/core/dasha.test.js)
const diffDays = (engineIso: string, fixtureDate: string) =>
  Math.abs(new Date(engineIso).getTime() - new Date(fixtureDate).getTime()) / DAY_MS;

async function main() {
  const fx = (await (await fetch(FIXTURE)).json()) as {
    planets: Record<string, { longitude: number; sign: string; sign_degree: string; nakshatra: string; nakshatra_lord: string; pada: number; retrograde: boolean }>;
    dasha: Record<string, { start: string; antardashas: Record<string, string> }>;
  };
  const birth = await sampleBirth();
  const chart = await computeChart(birth, new Date());

  // `quiet` rows count toward the total but only print when they fail (keeps the ~80 AD
  // checks from drowning the output).
  const rows: { body: string; field: string; engine: string; fixture: string; ok: boolean; quiet?: boolean }[] = [];
  const cmpAngle = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

  // Lagna
  const lag = fx.planets["Lagna"];
  rows.push({ body: "Lagna", field: "sign", engine: chart.ascendant.signName, fixture: lag.sign, ok: chart.ascendant.signName === lag.sign });
  rows.push({ body: "Lagna", field: "longitude", engine: chart.ascendant.longitude.toFixed(3), fixture: lag.longitude.toFixed(3), ok: cmpAngle(chart.ascendant.longitude, lag.longitude) <= TOL_DEG });

  for (const p of chart.planets) {
    const f = fx.planets[p.name];
    if (!f) continue;
    rows.push({ body: p.name, field: "sign", engine: p.signName, fixture: f.sign, ok: p.signName === f.sign });
    rows.push({ body: p.name, field: "lon", engine: p.longitude.toFixed(3), fixture: f.longitude.toFixed(3), ok: cmpAngle(p.longitude, f.longitude) <= TOL_DEG });
    rows.push({ body: p.name, field: "deg", engine: p.degree, fixture: f.sign_degree, ok: Math.abs(p.degreeValue - parseSignDeg(f.sign_degree)) <= 0.05 });
    // JHora uses some regional name variants (e.g. Pushyami = Pushya); treat as equal.
    const ALIAS: Record<string, string> = { Pushyami: "Pushya", Shravan: "Shravana" };
    const fxNak = ALIAS[f.nakshatra] ?? f.nakshatra;
    rows.push({ body: p.name, field: "nak", engine: p.nakshatra.name, fixture: f.nakshatra, ok: p.nakshatra.name === fxNak });
    rows.push({ body: p.name, field: "nakLord", engine: p.nakshatra.lord, fixture: f.nakshatra_lord, ok: p.nakshatra.lord === f.nakshatra_lord });
    rows.push({ body: p.name, field: "pada", engine: String(p.nakshatra.pada), fixture: String(f.pada), ok: p.nakshatra.pada === f.pada });
    rows.push({ body: p.name, field: "retro", engine: String(p.retro), fixture: String(f.retrograde), ok: p.retro === f.retrograde });
  }

  /* ---- Vimshottari dasha vs the fixture's `dasha` tree (MD lord + start, AD lords + starts).
     The engine windows mahadashas around `asOf`, so we re-run as-of a date inside each MD to
     bring it into view, then match by lord and bounded start-date delta. This asserts the whole
     birth-onward MD sequence and every AD lord — not just the snapshot window /chart shows. ---- */
  const moonLon = chart.planets.find((p) => p.key === "moon")!.longitude;
  let maxMd = 0, maxAd = 0;
  for (const [lordName, block] of Object.entries(fx.dasha)) {
    const asOf = new Date(Date.parse(block.start) + 30 * DAY_MS); // safely inside the MD (min 6y)
    const { mahadashas } = computeDasha(moonLon, birth.birthDate, asOf);
    const md = mahadashas.find((m) => m.lordName === lordName);
    const dMd = md ? diffDays(md.start, block.start) : Infinity;
    if (md) maxMd = Math.max(maxMd, dMd);
    rows.push({ body: `MD ${lordName}`, field: "start", engine: md ? md.start.slice(0, 10) : "MISSING", fixture: block.start, ok: dMd <= TOL_MD_DAYS });
    if (!md) continue;
    for (const [adLord, adStart] of Object.entries(block.antardashas)) {
      const child = md.children?.find((c) => c.lordName === adLord);
      const dAd = child ? diffDays(child.start, adStart) : Infinity;
      if (child) maxAd = Math.max(maxAd, dAd);
      rows.push({ body: `MD ${lordName}`, field: `AD ${adLord}`, engine: child ? child.start.slice(0, 10) : "MISSING", fixture: adStart, ok: dAd <= TOL_AD_DAYS, quiet: true });
    }
  }

  let fails = 0;
  for (const r of rows) {
    if (!r.ok) fails++;
    if (r.quiet && r.ok) continue; // suppress the ~80 passing AD rows; failures always print
    const mark = r.ok ? "✓" : "✗";
    console.log(`${mark} ${r.body.padEnd(10)} ${r.field.padEnd(11)} engine=${r.engine.padEnd(14)} fixture=${r.fixture}`);
  }
  console.log(`\nayanamsa engine=${chart.ayanamsa.toFixed(5)} (JHora ~22.0382)`);
  console.log(`dasha starts vs JHora: MD max Δ=${maxMd.toFixed(2)}d (tol ${TOL_MD_DAYS}d) · AD max Δ=${maxAd.toFixed(2)}d (tol ${TOL_AD_DAYS}d)`);
  console.log(`current dasha: ${chart.currentDasha.chain.join(" → ")}`);
  console.log(`\n${fails === 0 ? "✅ ALL CHECKS PASSED" : `❌ ${fails} CHECK(S) FAILED`} (${rows.length - fails}/${rows.length})`);
  if (fails > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
