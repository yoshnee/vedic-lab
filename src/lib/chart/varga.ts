/* ============================================================
   varga.ts — build a divisional chart's render datasets from the live
   ChartData. Pure presentation over core/divisional.ts: the D9 frame is the
   navamsa of the natal ascendant, houses are whole-sign from it, dignity is
   read on the varga sign, retro carries over from the natal chart.

   Two consumers:
   - buildD9 → the diamond (frame + minimal ChartBody[]).
   - buildVargaPanels → full PlanetData[] for the planet detail panels when
     Chart 1 is toggled to a varga. Owner-directed "D9 == D1": the varga is
     read as a full chart in its own right, so everything chart-derivable is
     RECOMPUTED from the varga placements with the same validated functions —
     sign/house/dignity/aspects/conjunctions/rulerships, panchadha maitri to
     the varga dispositor, combustion from the varga pseudo-longitudes
     ((sign−1)·30 + expanded degree), and avasthas (per Ryan Kurczak: Baladi
     from the expanded degree + varga sign parity, Jagradadi from varga
     dignity + natural relation to the varga sign's lord). The ASCENDANT-LORD identity is D1-only (pill suppressed
     here; ChartView also hides the ChartRuler card in varga mode). Still
     hidden, deliberately: real-longitude concepts (nakshatra/pada, gandanta,
     tithi), rasi-only systems (shadbala, sade sati), and yogas (detection is
     natal-D1-only for now; core/yoga.ts is pure over dignity + house, so
     feeding it the varga frame later is one line) — no invented values.
   ============================================================ */
import { navamsa, type VargaPoint } from "@/core/divisional";
import * as v from "@/core/vedic";
import { computeAvasthas } from "@/core/avastha";
import { SIGN_ABBR, SIGN_RULER, MOOLTRIKONA, COMBUSTION_ORB } from "@/core/constants";
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
  const pseudoLon = {} as Record<PlanetKey, number>; // (sign−1)·30 + expanded degree
  for (const p of chart.planets) {
    const d = varga(p.longitude);
    signs[p.key] = d.sign;
    pseudoLon[p.key] = (d.sign - 1) * 30 + d.degree;
  }
  const lagnaLord = SIGN_RULER[asc.sign - 1];

  const planets: PlanetData[] = chart.planets.map((p) => {
    const d = varga(p.longitude);
    const isNode = p.key === "rahu" || p.key === "ketu";
    const dignity = v.dignityOf(p.key, d.sign);
    const maitri = v.maitriToDispositor(p.key, signs);
    const combOn = v.isCombust(p.key, pseudoLon[p.key], pseudoLon.sun);
    return {
      ...p,
      sign: d.sign,
      signName: v.signName(d.sign),
      signAbbr: SIGN_ABBR[d.sign - 1],
      degree: v.formatDMS(d.degree),
      degreeValue: d.degree,
      house: v.houseOf(d.sign, asc.sign),
      dignity,
      // chart-level recomputes within the varga ("D9 == D1")
      lagnaLord: false, // the Ascendant-Lord identity is D1-only (owner-directed)
      rules: v.rulesOf(p.key, asc.sign),
      aspectedBy: v.aspectsOnto(d.sign, signs),
      conjunct: v.conjunctIn(p.key, d.sign, signs),
      dispositor: maitri.dispositor,
      maitriToDispositor: maitri.relation,
      combust: combOn
        ? {
            on: true as const,
            note: `Within ${COMBUSTION_ORB[p.key]}° of the Sun — its significations are absorbed into the Sun's glare.`,
          }
        : { on: false as const },
      // avasthas re-read from the varga placement (Kurczak method — see header)
      avasthas: isNode
        ? [] // nodes: no avasthas, as in the rasi chart
        : computeAvasthas({
            degreeValue: d.degree,
            sign: d.sign,
            dignity,
            inMooltrikona: MOOLTRIKONA[p.key] === d.sign,
            naturalToLord: v.naturalToDispositor(p.key, signs),
          }),
      // real-longitude / rasi-only concepts — emptied so the panels hide them
      gandanta: false,
      gandantaDeep: false,
      shadbala: null,
      tithiNumber: undefined,
      waxing: undefined,
      illumination: undefined,
      yogas: [], // detection is natal-D1-only for now (panel hides the row in varga mode)
      karaka: null, // chara karakas are a natal-D1 designation, never per chart type
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
