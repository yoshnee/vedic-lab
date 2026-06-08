/* ============================================================
   types.ts — the chart-engine output contract. computeChart() returns
   ChartData; the North Indian chart and the Planet Detail Panels both read
   PlanetData. Shapes match the Planet Detail Panel design (panel.data.js):
   chips reference planet KEYS, combust is {on,note}, dasha is a pill list.
   Longitudes stay raw (sidereal) so divisional charts can be layered later.
   ============================================================ */

export type PlanetKey =
  | "sun" | "moon" | "mars" | "mercury" | "jupiter"
  | "venus" | "saturn" | "rahu" | "ketu";

export type Dignity = "exalted" | "debilitated" | "own" | "neutral";

/** Panchadha (compound) maitri of a planet toward its dispositor; "own_sign" when
    self-dispositing. (Nodes carry null — the reference defines no node friendships.) */
export type Maitri = "adhi_mitra" | "mitra" | "sama" | "shatru" | "adhi_shatru" | "own_sign";

/** A planet's functional nature for the chart's ascendant (from ASCENDANT_FUNCTIONAL).
    "yogakaraka" takes precedence over "benefic". (Nodes carry null — unclassified.) */
export type FunctionalNature = "benefic" | "malefic" | "neutral" | "yogakaraka";

/** Header pill flags (the planet is the active MD / AD lord). */
export type DashaPill = "maha" | "antar";

export interface AspectRef {
  planet: PlanetKey; // aspecting planet (chip)
  aspect: string; // e.g. "3rd", "7th"
}

export interface Combust {
  on: boolean;
  note?: string;
}

export interface Nakshatra {
  name: string;
  pada: number;
  lord: string; // display name of the Vimshottari lord
}

/* ---- extraRows: open-ended, type-discriminated (the extensibility contract) ---- */
export interface SadePhase {
  name: string; // "Rising" | "Peak" | "Setting"
  from: string; // "Mon YYYY"
  to: string;
}
export interface SadePeriod {
  status: "past" | "current" | "upcoming";
  from: string;
  to: string;
  phases: SadePhase[];
  activePhase: number | null; // index into phases when status==="current"
}
export type ExtraRow =
  | {
      id: string;
      type: "sadesati";
      label: string;
      sanskrit: string;
      moonSign: string;
      moonHouse: number;
      periods: SadePeriod[];
    }
  | { id: string; type: "text"; label: string; content: string };

/* ---- avasthas: a planet's "states", an open-ended family (Baladi, Jagradadi,
   Lajjitadi, …). One entry per system; the panel renders them all, so adding a
   system just pushes another entry. Panel shows English (`label`/`systemLabel`);
   the stable keys (`system`/`state`) and `sanskrit` keep the language seam clean.
   Nodes carry none (empty array → section hidden). */
export interface Avastha {
  system: string; // stable system key, e.g. "baladi" | "jagradadi"
  systemLabel: string; // English system name shown on the row, e.g. "Maturity" | "Alertness"
  state: string; // stable Sanskrit-translit key, e.g. "yuva" | "jagrat" (never shown raw)
  label: string; // English display string the panel shows, e.g. "Adult (prime)" | "Awake"
  sanskrit?: string; // optional Sanskrit subtitle, e.g. "Yuva" | "Jagrat"
  strength?: number; // Baladi only; omitted until a sourced value exists (Hora Prakash is silent)
  flashcard: { type: "avastha"; id: string }; // tap target → onOpenCard("avastha", id)
}

export interface PlanetData {
  key: PlanetKey;
  name: string;
  sanskrit: string;
  longitude: number; // raw sidereal longitude 0–360
  sign: number; // 1–12
  signName: string;
  signAbbr: string;
  degree: string; // "20°10′" within the sign
  degreeValue: number; // decimal degrees within the sign (0–30)
  house: number; // 1–12, whole-sign from the Lagna
  nakshatra: Nakshatra;
  pada: number; // 1–4, the nakshatra quarter (mirrors nakshatra.pada; surfaced for the placement line)
  purushartha: string; // life-aim derived from the pada: 1 Dharma · 2 Artha · 3 Kama · 4 Moksha
  dignity: Dignity;
  retro: boolean;
  combust: Combust;
  dispositor: PlanetKey | null; // lord of the occupied sign; null if own sign
  maitriToDispositor: Maitri | null; // occupant→dispositor panchadha; null = nodes (undefined)
  functionalNature: FunctionalNature | null; // benefic/malefic/neutral/yogakaraka for the lagna; null = nodes
  gandanta: boolean; // within one pada of a water→fire junction (0°/120°/240°)
  gandantaDeep: boolean; // within ~1° of the exact junction
  gandantaDistance: number; // ° to the nearest water→fire junction
  avasthas: Avastha[]; // planetary "states" (Baladi, Jagradadi, …); [] for nodes
  /* ---- Moon only (tithi, from the Moon–Sun elongation) ---- */
  tithiNumber?: number; // 1–30 absolute (15 = Purnima/full, 30 = Amavasya/new)
  waxing?: boolean; // Shukla paksha; kept for paksha bala (shadbala, later)
  illumination?: number; // lit fraction 0–1
  dasha: DashaPill[]; // header pills
  lagnaLord: boolean; // rules the ascendant sign
  rules: number[]; // house numbers this planet lords
  aspectedBy: AspectRef[];
  conjunct: PlanetKey[];
  yogas: string[]; // [] for now
  extraRows: ExtraRow[];
}

export interface DashaPeriod {
  lord: PlanetKey;
  lordName: string;
  start: string; // ISO
  end: string; // ISO
  running: boolean;
  children?: DashaPeriod[];
}

export interface CurrentDasha {
  maha: PlanetKey;
  antar: PlanetKey;
  pratyantar: PlanetKey;
  chain: PlanetKey[]; // [maha, antar, pratyantar]
}

export interface ChartData {
  birth: { dateLabel: string; placeLabel?: string; lat: number; lon: number; jdUT: number };
  ayanamsa: number;
  ascendant: {
    longitude: number; sign: number; signName: string; degree: string;
    gandanta: boolean; gandantaDeep: boolean; gandantaDistance: number;
  };
  lagnaLord: PlanetKey;
  planets: PlanetData[]; // navagraha order
  dasha: DashaPeriod[]; // mahadashas (each with antar → pratyantar children + running flags)
  currentDasha: CurrentDasha;
}

export interface BirthInput {
  jdUT: number; // Julian Day in UT (the seam the input popup feeds)
  lat: number;
  lon: number;
  dateLabel: string;
  placeLabel?: string;
  birthDate: Date; // real UT instant, for the dasha timeline
}

/* ---- Transit (gochara): the engine re-run for the present moment, with the
   current planets mapped onto a given lagna frame (the natal lagna by default).
   A lighter PlanetData — only what the chart renderer needs. ---- */
export interface PlacedBody {
  key: PlanetKey;
  name: string;
  longitude: number; // raw sidereal longitude 0–360 (now)
  sign: number; // 1–12
  signName: string;
  degree: string; // "20°10′" within the sign
  degreeValue: number; // decimal degrees within the sign (0–30)
  house: number; // 1–12 on the supplied lagna frame
  dignity: Dignity;
  retro: boolean;
}

export interface TransitSet {
  computedUtcISO: string; // the instant these positions were computed for
  planets: PlacedBody[]; // navagraha order, placed on the natal lagna frame
}
