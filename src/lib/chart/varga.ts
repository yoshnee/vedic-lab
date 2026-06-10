/* ============================================================
   varga.ts — build a divisional chart's render dataset (frame + ChartBody[])
   from the live ChartData. Pure presentation over core/divisional.ts: the D9
   frame is the navamsa of the natal ascendant, houses are whole-sign from it,
   dignity is read on the varga sign, retro carries over from the natal chart.
   ============================================================ */
import { navamsa } from "@/core/divisional";
import * as v from "@/core/vedic";
import type { ChartData } from "@/core/types";
import type { ChartBody, ChartFrame } from "@/components/chart/NorthIndianChart";

export function buildD9(chart: ChartData): { frame: ChartFrame; planets: ChartBody[] } {
  const asc = navamsa(chart.ascendant.longitude);
  const frame: ChartFrame = { ascSign: asc.sign, ascDegree: v.formatDMS(asc.degree) };
  const planets: ChartBody[] = chart.planets.map((p) => {
    const d = navamsa(p.longitude);
    return {
      key: p.key,
      name: p.name,
      house: v.houseOf(d.sign, asc.sign),
      signName: v.signName(d.sign),
      degree: v.formatDMS(d.degree),
      degreeValue: d.degree,
      dignity: v.dignityOf(p.key, d.sign),
      retro: p.retro,
    };
  });
  return { frame, planets };
}
