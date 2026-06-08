/* ============================================================
   chart/generateChart.ts — the single seam the UI calls to run the engine.
   Takes the persisted civil birth, runs swisseph-wasm via the validated engine
   (birthFromCivil → computeChart), and wraps the result in a ChartModel. Reused
   by BOTH the modal-submit flow and the /chart refresh/recompute flow, so the
   engine is invoked from exactly one place.
   ============================================================ */
import { birthFromCivil, computeChart, computeTransit } from "@/core";
import type { TransitSet } from "@/core";
import type { EngineCivilBirth } from "@/lib/birth";
import type { ChartModel } from "./types";

export async function generateChart(civil: EngineCivilBirth): Promise<ChartModel> {
  const birth = await birthFromCivil(civil);
  const chart = await computeChart(birth, new Date());
  const moon = chart.planets.find((p) => p.key === "moon");

  // Transit (gochara): current planets on the natal lagna frame. Optional — a
  // failed scan must not break the natal chart (same posture as Sade Sati).
  let transit: TransitSet | null = null;
  try {
    transit = await computeTransit(
      chart.ascendant.sign,
      chart.birth.lat,
      chart.birth.lon,
      new Date(),
    );
  } catch {
    /* transit optional */
  }

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
