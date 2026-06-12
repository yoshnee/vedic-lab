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

/* ---- yogas: formed planetary combinations, an open-ended family. One entry
   per formed yoga; the panel renders each as a tappable pill (label = `name`)
   that opens its Yogas-deck card. Detection lives in core/yoga.ts as pure
   functions of already-computed placement facts, so it can be reused for
   transit and divisional contexts later. */
export interface YogaRef {
  key: string; // stable detector key, e.g. "ruchaka", "neecha-bhanga-c2"
  name: string; // pill label, e.g. "Ruchaka Mahapurusha Yoga", "Neecha Bhanga C2"
  flashcard: { type: "yoga"; id: string }; // tap target → onOpenCard("yoga", id)
  /* Neecha Bhanga only: which of the seven conditions fired, and its weight */
  condition?: number; // 1–7
  tier?: "major" | "minor"; // major = C1–C5 (conjunction/Kendra), minor = C6–C7 (aspect)
  /* Lord-relationship yogas (Dhana 2/11) only: which connection mode fired */
  mode?: "conjunction" | "mutual-aspect" | "exchange";
}

/* ---- chara karaka: the planet's Jaimini designation (core/karaka.ts), a
   NATAL-D1 property by degree-within-sign ranking. Only the three surfaced
   designations exist as pills; null for the other planets and the nodes,
   and varga panels null it (never recomputed per chart type). */
export interface KarakaRef {
  key: "atmakaraka" | "amatyakaraka" | "darakaraka";
  name: string; // pill label, e.g. "Atmakaraka"
  flashcard: { type: "karaka"; id: string }; // tap target → onOpenCard("karaka", id)
}

/** Sub-components of Sthana and Kala Bala (virupas) — plumbed for the drawer's
    future progressive disclosure; not yet rendered. */
export interface ShadbalaParts {
  uchcha: number;
  saptavargaja: number;
  ojayugma: number;
  kendradi: number;
  drekkana: number;
  nathonnatha: number;
  paksha: number;
  ayana: number; // the Kala contribution (0 for Sun/Moon — theirs lives in Chesta)
}

/** Six-fold strength, all in virupas (60 = 1 rupa). See core/shadbala.ts. */
export interface ShadbalaScore {
  sthana: number;
  dig: number;
  kala: number;
  chesta: number;
  naisargika: number;
  drik: number; // can be negative (net malefic aspect pressure) — never clamp
  total: number;
  required: number; // BPHS minimum for this planet
  ratio: number; // total / required — ≥1 reads strong (Bal-Yukta)
  ishta: number; // Ishta Phala 0–60 — √(uchcha × chesta); BPHS-derived (the reference is silent)
  kashta: number; // Kashta Phala 0–60 — √((60−uchcha) × (60−chesta))
  parts: ShadbalaParts;
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
  purushartha: string; // life-aim of the pada — per-nakshatra alternating cycle (PADA_PURUSHARTHAS), not fixed by pada number
  dignity: Dignity;
  retro: boolean;
  combust: Combust;
  dispositor: PlanetKey | null; // lord of the occupied sign; null if own sign
  maitriToDispositor: Maitri | null; // occupant→dispositor panchadha; null = nodes (undefined)
  // (functionalNature was removed with the panels' B/M/N/Y badge — the determination
  //  lives in ASCENDANT_FUNCTIONAL, surfaced on the Ascendants deck's rising-sign card)
  gandanta: boolean; // within one pada of a water→fire junction (0°/120°/240°)
  gandantaDeep: boolean; // within ~1° of the exact junction
  gandantaDistance: number; // ° to the nearest water→fire junction
  avasthas: Avastha[]; // planetary "states" (Baladi, Jagradadi, …); [] for nodes
  shadbala: ShadbalaScore | null; // six-fold strength (virupas); null for the nodes
  /* ---- Moon only (tithi, from the Moon–Sun elongation) ---- */
  tithiNumber?: number; // 1–30 absolute (15 = Purnima/full, 30 = Amavasya/new)
  waxing?: boolean; // Shukla paksha; kept for paksha bala (shadbala, later)
  illumination?: number; // lit fraction 0–1
  dasha: DashaPill[]; // header pills
  lagnaLord: boolean; // rules the ascendant sign
  rules: number[]; // house numbers this planet lords
  aspectedBy: AspectRef[];
  conjunct: PlanetKey[];
  yogas: YogaRef[]; // formed yogas (core/yoga.ts); [] when none detected
  karaka: KarakaRef | null; // Jaimini chara karaka (natal D1 only; null in varga panels)
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
