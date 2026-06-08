/* ============================================================
   dasha.ts — Vimshottari dasha (following the reference). Seeded from the
   Moon's nakshatra with the balance of the first mahadasha; subdivided
   MD → AD → PD by proportion of the 120-year cycle (365.25-day years).
   Returns all nine mahadashas of the birth cycle (from the dasha running at
   birth through the last), with running flags and the current MD→AD→PD chain.
   ============================================================ */
import type { DashaPeriod, CurrentDasha } from "./types";
import { DASHA_SEQUENCE, DASHA_TOTAL_YEARS, PLANET_NAMES, NAKSHATRA_ARC } from "./constants";
import { norm360 } from "./swisseph";

const DAY_MS = 86_400_000;
const YEAR_MS = 365.25 * DAY_MS;

function subdivide(
  startIdx: number,
  startMs: number,
  spanMs: number,
  depth: number,
  t: number,
): DashaPeriod[] {
  const out: DashaPeriod[] = [];
  let cursor = startMs;
  for (let i = 0; i < 9; i++) {
    const idx = (startIdx + i) % 9;
    const seq = DASHA_SEQUENCE[idx];
    const childSpan = spanMs * (seq.years / DASHA_TOTAL_YEARS);
    const start = cursor;
    const end = cursor + childSpan;
    const period: DashaPeriod = {
      lord: seq.lord,
      lordName: PLANET_NAMES[seq.lord],
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      running: t >= start && t < end,
    };
    if (depth > 0) period.children = subdivide(idx, start, childSpan, depth - 1, t);
    out.push(period);
    cursor = end;
  }
  return out;
}

export function computeDasha(
  moonLon: number,
  birthDate: Date,
  asOf: Date,
): { mahadashas: DashaPeriod[]; current: CurrentDasha } {
  const L = norm360(moonLon);
  const nakIdx = Math.floor(L / NAKSHATRA_ARC) % 27;
  const startIdx = nakIdx % 9;
  const fraction = (L % NAKSHATRA_ARC) / NAKSHATRA_ARC;
  const elapsedMs = DASHA_SEQUENCE[startIdx].years * YEAR_MS * fraction;
  const t = asOf.getTime();

  // MD bounds across enough cycles to cover `asOf` (even for old births)
  const bounds: { idx: number; startMs: number; endMs: number; span: number }[] = [];
  let cursor = birthDate.getTime() - elapsedMs;
  for (let i = 0; i < 27; i++) {
    const idx = (startIdx + i) % 9;
    const span = DASHA_SEQUENCE[idx].years * YEAR_MS;
    bounds.push({ idx, startMs: cursor, endMs: cursor + span, span });
    cursor += span;
  }

  // The full Vimshottari cycle is exactly nine mahadashas (one per lord),
  // spanning the ~120 years from the birth lord's start through the whole life.
  // Show all of them — from the dasha running at birth to the last — not a
  // window around the current one.
  const mahadashas: DashaPeriod[] = bounds.slice(0, 9).map((b) => {
    const seq = DASHA_SEQUENCE[b.idx];
    return {
      lord: seq.lord,
      lordName: PLANET_NAMES[seq.lord],
      start: new Date(b.startMs).toISOString(),
      end: new Date(b.endMs).toISOString(),
      running: t >= b.startMs && t < b.endMs,
      children: subdivide(b.idx, b.startMs, b.span, 1, t), // AD → PD
    };
  });

  const runMD = mahadashas.find((m) => m.running) ?? mahadashas[0];
  const runAD = runMD.children?.find((c) => c.running) ?? runMD.children?.[0];
  const runPD = runAD?.children?.find((c) => c.running) ?? runAD?.children?.[0];
  const maha = runMD.lord;
  const antar = runAD?.lord ?? maha;
  const pratyantar = runPD?.lord ?? antar;

  return {
    mahadashas,
    current: { maha, antar, pratyantar, chain: [maha, antar, pratyantar] },
  };
}
