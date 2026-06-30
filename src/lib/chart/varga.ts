/* ============================================================
   varga.ts — build a divisional chart's render datasets from the live
   ChartData. Pure presentation over core/divisional.ts: a varga's frame is
   that varga of the natal ascendant, houses are whole-sign from it, dignity
   is read on the varga sign, retro carries over from the natal chart.

   VARGAS is the registry both chart-type dropdowns read: D2 (Hora),
   D7 (Saptamsa), D9 (Navamsa), D10 (Dasamsa), D30 (Trimsamsa) — every
   mapping a verbatim port of the Hora-Prakash reference in core/divisional.ts.

   Two consumers:
   - buildVargaChart → the diamond (frame + minimal ChartBody[]).
   - buildVargaPanels → full PlanetData[] for the planet detail panels when
     Chart 1 is toggled to a varga (Chart 1 is the panel context; Chart 2 is
     an independent secondary view and never drives the grid). Owner-directed
     "varga == D1": the varga is read as a full chart in its own right, so
     everything chart-derivable is RECOMPUTED from the varga placements with
     the same validated functions — sign/house/dignity/aspects/conjunctions/
     rulerships, panchadha maitri to the varga dispositor, and — all from the
     VARGA LONGITUDES ((sign−1)·30 + expanded degree, the planet's position
     within this frame; owner-directed) — combustion, gandanta, tithi (Moon),
     and the full yoga detector set (core/yoga.ts fed the varga frame; NB the
     degree-gated reads — Budhaditya's 6–14° window, Grahana's intensity
     tiers — measure varga-longitude arcs, which expand real separations by
     the divisor). Avasthas per Ryan Kurczak: Baladi from the expanded degree
     + varga sign parity, Jagradadi from varga dignity + natural relation to
     the varga sign's lord. Still hidden, deliberately: nakshatra/pada (a
     real-sky coordinate, not re-read from varga longitudes) and the
     rasi-only systems (shadbala, sade sati).
   ============================================================ */
import { hora, drekkana, saptamsa, navamsa, dasamsa, dwadasamsa, trimsamsa, type VargaPoint } from "@/core/divisional";
import * as v from "@/core/vedic";
import { computeAvasthas } from "@/core/avastha";
import { computeYogas } from "@/core/yoga";
import { SIGN_ABBR, SIGN_RULER, MOOLTRIKONA, COMBUSTION_ORB } from "@/core/constants";
import type { ChartData, PlanetData, PlanetKey } from "@/core/types";
import type { ChartBody, ChartFrame } from "@/components/chart/NorthIndianChart";

export type VargaKey = "d2" | "d3" | "d7" | "d9" | "d10" | "d12" | "d30";

export interface VargaDef {
  /** Dropdown label (Sanskrit name + Dn). */
  label: string;
  /** Short context label for the panel grid, e.g. "Navāṁśa · D9". */
  short: string;
  map: (lon: number) => VargaPoint;
}

/** The shipped varga set, in dropdown order. */
export const VARGAS: Record<VargaKey, VargaDef> = {
  d2: { label: "Horā (D2)", short: "Horā · D2", map: hora },
  d3: { label: "Drekkāṇa (D3)", short: "Drekkāṇa · D3", map: drekkana },
  d7: { label: "Saptāṁśa (D7)", short: "Saptāṁśa · D7", map: saptamsa },
  d9: { label: "Navāṁśa (D9)", short: "Navāṁśa · D9", map: navamsa },
  d10: { label: "Daśāṁśa (D10)", short: "Daśāṁśa · D10", map: dasamsa },
  d12: { label: "Dvādaśāṁśa (D12)", short: "Dvādaśāṁśa · D12", map: dwadasamsa },
  d30: { label: "Triṁśāṁśa (D30)", short: "Triṁśāṁśa · D30", map: trimsamsa },
};

export const VARGA_KEYS = Object.keys(VARGAS) as VargaKey[];

export function isVargaKey(s: string): s is VargaKey {
  return s in VARGAS;
}

export interface VargaPanelSet {
  ascendant: { sign: number; signName: string; degree: string };
  lagnaLord: PlanetKey;
  planets: PlanetData[];
}

/** Full panel dataset for a varga chart (generic over the mapping fn).
    See the header note for what is and isn't computed. */
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
    // varga-longitude reads (owner-directed): the varga longitude IS the
    // planet's position within this frame, so gandanta, tithi, and the yoga
    // detectors all run on it — same validated functions as the rasi chart
    const gand = v.gandantaOf(pseudoLon[p.key]);
    const tithi = p.key === "moon" ? v.tithiOf(pseudoLon.moon, pseudoLon.sun) : null;
    return {
      ...p,
      sign: d.sign,
      signName: v.signName(d.sign),
      signAbbr: SIGN_ABBR[d.sign - 1],
      degree: v.formatDMS(d.degree),
      degreeValue: d.degree,
      house: v.houseOf(d.sign, asc.sign),
      dignity,
      // chart-level recomputes within the varga ("varga == D1")
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
      gandanta: gand.on,
      gandantaDeep: gand.deep,
      gandantaDistance: gand.distance,
      tithiNumber: tithi?.number,
      waxing: tithi?.waxing,
      illumination: tithi?.illumination,
      yogas: computeYogas(p.key, {
        dignity,
        house: v.houseOf(d.sign, asc.sign),
        signs,
        longitudes: pseudoLon,
        lagnaSign: asc.sign,
      }),
      // rasi-only systems — still emptied so the panels hide them
      shadbala: null,
      extraRows: [],
    };
  });

  return {
    ascendant: { sign: asc.sign, signName: v.signName(asc.sign), degree: v.formatDMS(asc.degree) },
    lagnaLord,
    planets,
  };
}

/** Minimal render dataset (frame + ChartBody[]) for any varga — what the
    diamond needs and nothing more. */
export function buildVargaChart(
  chart: ChartData,
  varga: (lon: number) => VargaPoint = navamsa,
): { frame: ChartFrame; planets: ChartBody[] } {
  const asc = varga(chart.ascendant.longitude);
  const frame: ChartFrame = { ascSign: asc.sign, ascDegree: v.formatDMS(asc.degree) };
  const planets: ChartBody[] = chart.planets.map((p) => {
    const d = varga(p.longitude);
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
