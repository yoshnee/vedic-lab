/* ============================================================
   chart/generateChart.ts — the single seam the UI calls to run the engine.
   Takes the persisted civil birth, runs swisseph-wasm via the validated engine
   (birthFromCivil → computeChart), and wraps the result in a ChartModel. Reused
   by BOTH the modal-submit flow and the /chart refresh/recompute flow, so the
   engine is invoked from exactly one place.
   ============================================================ */
import { birthFromCivil, computeChart, computeTransit } from "@/core";
import type { ChartData, TransitSet } from "@/core";
import type { EngineCivilBirth } from "@/lib/birth";
import type { ChartModel } from "./types";

/** Transit (gochara) positions for a chosen moment on the NATAL lagna frame —
    a pure function of (natal chart, instant): only the transit longitudes
    move with `asOf`; the lagna/houses stay natal, and no location input is
    needed (the natal coordinates ride along for the swisseph call). Used for
    the initial "now" compute AND the gochar chart's date-time scrubber.
    Optional by design: returns null on failure (same posture as Sade Sati —
    a failed scan must not break the natal chart). */
export async function transitFor(chart: ChartData, asOf: Date): Promise<TransitSet | null> {
  try {
    return await computeTransit(chart.ascendant.sign, chart.birth.lat, chart.birth.lon, asOf);
  } catch {
    return null;
  }
}

export async function generateChart(civil: EngineCivilBirth): Promise<ChartModel> {
  const birth = await birthFromCivil(civil);
  const chart = await computeChart(birth, new Date());
  const moon = chart.planets.find((p) => p.key === "moon");

  const transit = await transitFor(chart, new Date());

  return {
    chart,
    meta: {
      name: civil.name,
      ianaTz: civil.ianaTz ?? "",
      computedUtcISO: birth.birthDate.toISOString(),
    },
    panchanga: {
      tithiNumber: moon?.tithiNumber ?? null,
      waxing: moon?.waxing ?? null,
    },
    transit,
  };
}
