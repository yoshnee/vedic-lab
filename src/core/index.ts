/* ============================================================
   index.ts — the chart engine's single entry point. `computeChart` is the
   seam the UI (and the future birth-details popup) calls. Math follows the
   Hora-Prakash reference and is validated against its JHora ground-truth
   fixtures (scripts/validate-engine.ts).
   ============================================================ */
import type {
  BirthInput, ChartData, PlanetData, PlanetKey, DashaPill, Combust, ExtraRow, SadePeriod, SadePhase,
  PlacedBody, TransitSet,
} from "./types";
import {
  PLANET_ORDER, PLANET_NAMES, PLANET_SANSKRIT, SIGN_ABBR, SIGN_RULER, COMBUSTION_ORB, SE_BODY, MOOLTRIKONA,
  PADA_PURUSHARTHAS,
} from "./constants";
import { rawPositions, transitLongitude, julianDayUT } from "./swisseph";
import * as v from "./vedic";
import { computeDasha } from "./dasha";
import { computeAvasthas } from "./avastha";
import { computeShadbala } from "./shadbala";
import { computeYogas } from "./yoga";

export type { ChartData, PlanetData, PlanetKey, BirthInput, PlacedBody, TransitSet } from "./types";

const DAY_MS = 86_400_000;
const YEAR_MS = 365.25 * DAY_MS;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtMonth = (t: number) => {
  const d = new Date(t);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

/** Build a BirthInput from civil birth details (the shape the input popup produces). */
export async function birthFromCivil(c: {
  year: number; month: number; day: number;
  hour: number; minute: number; second?: number;
  tzOffsetHours: number; lat: number; lon: number;
  dateLabel: string; placeLabel?: string;
}): Promise<BirthInput> {
  const utHour = c.hour + c.minute / 60 + (c.second ?? 0) / 3600 - c.tzOffsetHours;
  const jdUT = await julianDayUT(c.year, c.month, c.day, utHour);
  const localMs = Date.UTC(c.year, c.month - 1, c.day, c.hour, c.minute, c.second ?? 0);
  const birthDate = new Date(localMs - c.tzOffsetHours * 3_600_000);
  return { jdUT, lat: c.lat, lon: c.lon, dateLabel: c.dateLabel, placeLabel: c.placeLabel, birthDate };
}

async function dateToJdUT(d: Date): Promise<number> {
  const utHour = d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;
  return julianDayUT(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), utHour);
}

/* ---- Transit (gochara) — the engine re-run for the present moment (a different
   jd from the natal birth jd), with the current planets mapped onto a lagna frame.
   Reference frame: the NATAL lagna (lagnaSign) is house 1, so transiting planets
   show through the natal houses — the side-by-side-with-natal default. (The
   Moon-sign / Chandra-lagna reference is the classic gochara alternative; pass a
   different lagnaSign to switch frames.) Reuses the same validated swisseph path. ---- */
export async function computeTransit(
  lagnaSign: number,
  lat: number,
  lon: number,
  asOf: Date = new Date(),
): Promise<TransitSet> {
  const jd = await dateToJdUT(asOf);
  const raw = await rawPositions(jd, lat, lon); // current positions; raw.ascendant ignored (natal frame)
  const planets: PlacedBody[] = PLANET_ORDER.map((key) => {
    const lon = raw.longitudes[key];
    const sign = v.signOf(lon);
    const degVal = v.degInSign(lon);
    const isNode = key === "rahu" || key === "ketu";
    const retro = isNode || key === "sun" || key === "moon" ? false : raw.speeds[key] < 0;
    return {
      key,
      name: PLANET_NAMES[key],
      longitude: lon,
      sign,
      signName: v.signName(sign),
      degree: v.formatDMS(degVal),
      degreeValue: degVal,
      house: v.houseOf(sign, lagnaSign),
      dignity: v.dignityOf(key, sign),
      retro,
    };
  });
  return { computedUtcISO: asOf.toISOString(), planets };
}

/* ---- Sade Sati timeline: scan transit Saturn relative to the natal Moon sign,
   group contiguous spans in the 12th/1st/2nd-from-Moon band into periods, then
   keep the most recent past + current + soonest upcoming. ---- */
async function computeSadeSati(moonSign: number, asOf: Date): Promise<SadePeriod[]> {
  const STEP = 15 * DAY_MS;
  const startT = asOf.getTime() - 37 * YEAR_MS;
  const endT = asOf.getTime() + 37 * YEAR_MS;
  const PHASE_NAME = ["Rising", "Peak", "Setting"]; // 12th → 1st → 2nd from Moon

  const samples: { t: number; phase: number | null }[] = [];
  for (let t = startT; t <= endT; t += STEP) {
    const jd = await dateToJdUT(new Date(t));
    const sign = v.signOf(await transitLongitude(jd, SE_BODY.saturn));
    const fromMoon = v.houseOf(sign, moonSign); // 1 = Moon's sign
    const phase = fromMoon === 12 ? 0 : fromMoon === 1 ? 1 : fromMoon === 2 ? 2 : null;
    samples.push({ t, phase });
  }

  type Raw = { startT: number; endT: number; phases: { p: number; from: number; to: number }[] };
  const raws: Raw[] = [];
  let cur: { startT: number; pts: { t: number; phase: number }[] } | null = null;
  const flush = (closeT: number) => {
    if (!cur) return;
    // Aggregate each phase (0 Rising / 1 Peak / 2 Setting) into a single span —
    // retrograde wobble across sign boundaries otherwise splits them up.
    const agg = new Map<number, { from: number; to: number }>();
    for (const pt of cur.pts) {
      const a = agg.get(pt.phase);
      if (!a) agg.set(pt.phase, { from: pt.t, to: pt.t + STEP });
      else a.to = pt.t + STEP;
    }
    const phases = [0, 1, 2]
      .filter((p) => agg.has(p))
      .map((p) => ({ p, from: agg.get(p)!.from, to: agg.get(p)!.to }));
    raws.push({ startT: cur.pts[0].t, endT: closeT, phases });
    cur = null;
  };
  for (const s of samples) {
    if (s.phase !== null) {
      if (!cur) cur = { startT: s.t, pts: [] };
      cur.pts.push({ t: s.t, phase: s.phase });
    } else flush(s.t);
  }
  flush(endT);

  // Retrograde wobble near a sign boundary briefly drops Saturn out of the
  // 12/1/2 band, fragmenting one Sade Sati into several raws (e.g. a stray
  // ~15-day blip at the leading edge shown as "Feb 2041 – Feb 2041"). Merge
  // raws separated by less than ~2 years; true Sade Satis are ~22 years apart,
  // so this coalesces the wobble without merging distinct periods.
  const MERGE_GAP = 2 * YEAR_MS;
  const merged: Raw[] = [];
  for (const r of raws) {
    const last = merged[merged.length - 1];
    if (last && r.startT - last.endT <= MERGE_GAP) {
      last.endT = r.endT;
      for (const ph of r.phases) {
        const ex = last.phases.find((x) => x.p === ph.p);
        if (ex) { ex.from = Math.min(ex.from, ph.from); ex.to = Math.max(ex.to, ph.to); }
        else last.phases.push(ph);
      }
      last.phases.sort((a, b) => a.p - b.p);
    } else {
      merged.push({ startT: r.startT, endT: r.endT, phases: r.phases.map((p) => ({ ...p })) });
    }
  }

  const now = asOf.getTime();
  const classify = (r: Raw): SadePeriod["status"] =>
    r.endT < now ? "past" : r.startT > now ? "upcoming" : "current";
  const toPeriod = (r: Raw): SadePeriod => {
    const status = classify(r);
    const phases: SadePhase[] = r.phases.map((ph) => ({
      name: PHASE_NAME[ph.p], from: fmtMonth(ph.from), to: fmtMonth(ph.to),
    }));
    const activePhase =
      status === "current" ? r.phases.findIndex((ph) => now >= ph.from && now < ph.to) : null;
    return { status, from: fmtMonth(r.startT), to: fmtMonth(r.endT), phases, activePhase: activePhase === -1 ? null : activePhase };
  };

  const past = merged.filter((r) => classify(r) === "past").sort((a, b) => b.startT - a.startT)[0];
  const current = merged.find((r) => classify(r) === "current");
  const upcoming = merged.filter((r) => classify(r) === "upcoming").sort((a, b) => a.startT - b.startT)[0];
  return [past, current, upcoming].filter(Boolean).map((r) => toPeriod(r as Raw));
}

export async function computeChart(birth: BirthInput, asOf: Date = new Date()): Promise<ChartData> {
  const raw = await rawPositions(birth.jdUT, birth.lat, birth.lon);
  const lagnaSign = v.signOf(raw.ascendant);
  const lagnaLordKey = SIGN_RULER[lagnaSign - 1];

  const signs = {} as Record<PlanetKey, number>;
  PLANET_ORDER.forEach((k) => { signs[k] = v.signOf(raw.longitudes[k]); });
  const sunLon = raw.longitudes.sun;

  const { mahadashas, current } = computeDasha(raw.longitudes.moon, birth.birthDate, asOf);

  // Saturn Sade Sati timeline (always present on Saturn)
  const moonSign = signs.moon;
  let sadePeriods: SadePeriod[] = [];
  try {
    sadePeriods = await computeSadeSati(moonSign, asOf);
  } catch {
    /* transit scan optional */
  }
  const saturnExtra: ExtraRow[] = [
    {
      id: "sade-sati", type: "sadesati",
      label: "Sade Sati", sanskrit: "Saḍe Sātī",
      moonSign: v.signName(moonSign), moonHouse: v.houseOf(moonSign, lagnaSign),
      periods: sadePeriods,
    },
  ];

  // Six-fold strength for the seven grahas (nodes have no shadbala).
  const shadbala = computeShadbala(
    PLANET_ORDER.map((key) => ({
      key,
      lon: raw.longitudes[key],
      sign: signs[key],
      house: v.houseOf(signs[key], lagnaSign),
      degreeValue: v.degInSign(raw.longitudes[key]),
      retro: key === "rahu" || key === "ketu" || key === "sun" || key === "moon" ? false : raw.speeds[key] < 0,
      speed: raw.speeds[key],
    })),
    raw.ascendant,
  );

  const planets: PlanetData[] = PLANET_ORDER.map((key) => {
    const lon = raw.longitudes[key];
    const sign = signs[key];
    const degVal = v.degInSign(lon);
    const nak = v.nakshatraOf(lon);
    const gand = v.gandantaOf(lon);
    const tithi = key === "moon" ? v.tithiOf(lon, sunLon) : null; // tithi is a Moon–Sun relationship
    const maitri = v.maitriToDispositor(key, signs); // occupant → dispositor (asymmetric)
    const dignity = v.dignityOf(key, sign);
    const house = v.houseOf(sign, lagnaSign);
    const isNode = key === "rahu" || key === "ketu";
    const retro = isNode || key === "sun" || key === "moon" ? false : raw.speeds[key] < 0;

    const dasha: DashaPill[] = [];
    if (current.maha === key) dasha.push("maha");
    if (current.antar === key) dasha.push("antar");

    const orb = COMBUSTION_ORB[key];
    const combOn = v.isCombust(key, lon, sunLon);
    const combust: Combust = combOn
      ? { on: true, note: `Within ${orb}° of the Sun — its significations are absorbed into the Sun's glare.` }
      : { on: false };

    return {
      key,
      name: PLANET_NAMES[key],
      sanskrit: PLANET_SANSKRIT[key],
      longitude: lon,
      sign,
      signName: v.signName(sign),
      signAbbr: SIGN_ABBR[sign - 1],
      degree: v.formatDMS(degVal),
      degreeValue: degVal,
      house,
      nakshatra: nak,
      pada: nak.pada,
      // life-aim of the pada — per-nakshatra cycle (Sutton table), NOT fixed by pada number
      purushartha: PADA_PURUSHARTHAS[v.nakshatraIndex(lon)][nak.pada - 1],
      dignity,
      retro,
      combust,
      dispositor: maitri.dispositor,
      maitriToDispositor: maitri.relation,
      gandanta: gand.on,
      gandantaDeep: gand.deep,
      gandantaDistance: gand.distance,
      avasthas: isNode
        ? [] // nodes: the reference defines no node avasthas — omit, don't guess
        : computeAvasthas({
            degreeValue: degVal,
            sign,
            dignity,
            inMooltrikona: MOOLTRIKONA[key] === sign,
            naturalToLord: v.naturalToDispositor(key, signs),
          }),
      shadbala: shadbala[key] ?? null,
      tithiNumber: tithi?.number,
      waxing: tithi?.waxing,
      illumination: tithi?.illumination,
      dasha,
      lagnaLord: lagnaLordKey === key,
      rules: v.rulesOf(key, lagnaSign),
      aspectedBy: v.aspectsOnto(sign, signs),
      conjunct: v.conjunctIn(key, sign, signs),
      yogas: computeYogas(key, { dignity, house, signs, longitudes: raw.longitudes, lagnaSign }), // natal D1 frame
      extraRows: key === "saturn" ? saturnExtra : [],
    };
  });

  const ascDeg = v.degInSign(raw.ascendant);
  const ascGand = v.gandantaOf(raw.ascendant);
  return {
    birth: {
      dateLabel: birth.dateLabel, placeLabel: birth.placeLabel,
      lat: birth.lat, lon: birth.lon, jdUT: birth.jdUT,
    },
    ayanamsa: raw.ayanamsa,
    ascendant: {
      longitude: raw.ascendant, sign: lagnaSign,
      signName: v.signName(lagnaSign), degree: v.formatDMS(ascDeg),
      gandanta: ascGand.on, gandantaDeep: ascGand.deep, gandantaDistance: ascGand.distance,
    },
    lagnaLord: lagnaLordKey,
    planets,
    dasha: mahadashas,
    currentDasha: current,
  };
}
