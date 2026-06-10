/* ============================================================
   varga.ts — build a divisional chart's render datasets from the live
   ChartData. Pure presentation over core/divisional.ts: the D9 frame is the
   navamsa of the natal ascendant, houses are whole-sign from it, dignity is
   read on the varga sign, retro carries over from the natal chart.

   Two consumers:
   - buildD9 → the diamond (frame + minimal ChartBody[]).
   - buildVargaPanels → full PlanetData[] for the planet detail panels when
     Chart 1 is toggled to a varga. Only sign-level facts are recomputed
     (sign/house/dignity/aspects/conjunctions/rulerships — all validated
     sign math reused from core/vedic). D1-longitude and rasi-chart concepts
     (nakshatra/pada, combustion, gandanta, tithi, avasthas, shadbala, sade
     sati, functional nature, panchadha maitri) are deliberately EMPTIED so
     the panels hide them instead of showing invented varga values.
   ============================================================ */
import { navamsa, type VargaPoint } from "@/core/divisional";
import * as v from "@/core/vedic";
import { SIGN_ABBR, SIGN_RULER } from "@/core/constants";
import type { ChartData, PlanetData, PlanetKey } from "@/core/types";
import type { ChartBody, ChartFrame } from "@/components/chart/NorthIndianChart";

export interface VargaPanelSet {
  ascendant: { sign: number; signName: string; degree: string };
  lagnaLord: PlanetKey;
  planets: PlanetData[];
}

/** Full panel dataset for a varga chart (generic over the mapping fn, so D10
    etc. reuse it later). See the header note for what is and isn't computed. */
export function buildVargaPanels(
  chart: ChartData,
  varga: (lon: number) => VargaPoint = navamsa,
): VargaPanelSet {
  const asc = varga(chart.ascendant.longitude);
  const signs = {} as Record<PlanetKey, number>;
  for (const p of chart.planets) signs[p.key] = varga(p.longitude).sign;
  const lagnaLord = SIGN_RULER[asc.sign - 1];

  const planets: PlanetData[] = chart.planets.map((p) => {
    const d = varga(p.longitude);
    return {
      ...p,
      sign: d.sign,
      signName: v.signName(d.sign),
      signAbbr: SIGN_ABBR[d.sign - 1],
      degree: v.formatDMS(d.degree),
      degreeValue: d.degree,
      house: v.houseOf(d.sign, asc.sign),
      dignity: v.dignityOf(p.key, d.sign),
      // sign-level recomputes within the varga chart
      lagnaLord: lagnaLord === p.key,
      rules: v.rulesOf(p.key, asc.sign),
      aspectedBy: v.aspectsOnto(d.sign, signs),
      conjunct: v.conjunctIn(p.key, d.sign, signs),
      // D1-longitude / rasi-chart concepts — emptied so the panels hide them
      combust: { on: false as const },
      dispositor: null,
      maitriToDispositor: null,
      functionalNature: null,
      gandanta: false,
      gandantaDeep: false,
      avasthas: [],
      shadbala: null,
      tithiNumber: undefined,
      waxing: undefined,
      illumination: undefined,
      yogas: [],
      extraRows: [],
    };
  });

  return {
    ascendant: { sign: asc.sign, signName: v.signName(asc.sign), degree: v.formatDMS(asc.degree) },
    lagnaLord,
    planets,
  };
}

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
