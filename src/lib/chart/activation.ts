/* ============================================================
   activation.ts — the "activated houses" overlay's data: which natal D1
   houses a dasha lord lights up. A house is activated when the lord RULES it
   (a natal whole-sign house holding a sign that planet rules — the engine's
   PlanetData.rules) or OCCUPIES it (PlanetData.house). Graha-drishti aspects
   are deliberately NOT counted (owner-revised: rules-or-occupies only).
   Nodes: Rahu/Ketu rule no sign, so they contribute only the house they
   occupy. Pure functions of (lord, natal chart) — natal D1 only, never the
   gochar or a varga frame.
   ============================================================ */
import type { ChartData, PlanetKey } from "@/core/types";

/** Houses one lord activates: occupies ∪ rules (deduped, unsorted). */
export function activatedHouses(lord: PlanetKey, chart: ChartData): number[] {
  const p = chart.planets.find((x) => x.key === lord);
  if (!p) return [];
  const out = new Set<number>([p.house]); // occupies
  if (lord !== "rahu" && lord !== "ketu") {
    for (const h of p.rules) out.add(h); // rules (nodes rule nothing — occupancy only)
  }
  return [...out];
}

/** The union for several lords (the Maha + Antar pair) — deduped and sorted;
    a house activated by more than one source highlights once. */
export function activatedHousesFor(lords: PlanetKey[], chart: ChartData): number[] {
  const out = new Set<number>();
  for (const lord of lords) for (const h of activatedHouses(lord, chart)) out.add(h);
  return [...out].sort((a, b) => a - b);
}
