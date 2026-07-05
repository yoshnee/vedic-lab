/* ============================================================
   chart/types.ts — the ChartModel: the single in-memory object the /chart page
   renders. It WRAPS the engine's ChartData (kept byte-for-byte unchanged, so the
   155/155 validation and sample-chart.json stay valid) and adds app-level meta
   (name, zone, the resolved UT instant) plus a chart-level panchanga (the Moon
   line). Built by generateChart(); held in the ChartProvider store.
   ============================================================ */
import type { ChartData, TransitSet } from "@/core/types";

/** How the chart is drawn — chosen once in the birth-details modal and FIXED on
    /chart (no in-page toggle). North Indian diamond or South Indian fixed grid. */
export type ChartStyle = "north" | "south";

export interface ChartMeta {
  name?: string;
  ianaTz: string; // IANA birth zone (e.g. "Asia/Kolkata")
  computedUtcISO: string; // the resolved UT instant (birthDate.toISOString())
  chartStyle: ChartStyle; // the birth-modal choice; drives BOTH charts on /chart
}

export interface Panchanga {
  tithiNumber: number | null; // 1–30 (from the Moon); null if unavailable
  waxing: boolean | null; // Shukla paksha
}

export interface ChartModel {
  chart: ChartData; // the existing engine output (natal)
  meta: ChartMeta;
  panchanga: Panchanga;
  /** Current planetary positions on the natal lagna frame (gochara), for Chart 2.
      null if the transit scan failed (optional, like the Sade Sati timeline). */
  transit: TransitSet | null;
}
