/* ============================================================
   constants.ts — fixed Jyotish tables. Every value here follows the
   Hora-Prakash reference (github.com/petergus/hora-prakash, src/core/)
   — see CLAUDE.md working rule #1. Do not edit without checking the reference.
   ============================================================ */
import type { PlanetKey } from "./types";

/** Navagraha order used everywhere (Sun … Ketu). */
export const PLANET_ORDER: PlanetKey[] = [
  "sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu",
];

export const PLANET_NAMES: Record<PlanetKey, string> = {
  sun: "Sun", moon: "Moon", mars: "Mars", mercury: "Mercury", jupiter: "Jupiter",
  venus: "Venus", saturn: "Saturn", rahu: "Rahu", ketu: "Ketu",
};

/** Swiss Ephemeris body id per graha. Rahu = mean node (10); Ketu derived = Rahu+180. */
export const SE_BODY: Record<Exclude<PlanetKey, "ketu">, number> = {
  sun: 0, moon: 1, mercury: 2, venus: 3, mars: 4, jupiter: 5, saturn: 6, rahu: 10,
};

export const SIGN_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

export const SIGN_ABBR = [
  "Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi",
];

export const PLANET_SANSKRIT: Record<PlanetKey, string> = {
  sun: "Surya", moon: "Chandra", mars: "Mangala", mercury: "Budha", jupiter: "Guru",
  venus: "Shukra", saturn: "Shani", rahu: "Rahu", ketu: "Ketu",
};

/** Element of each sign 1–12 — fire/earth/air/water cycling from Aries. Drives
    the chart's element-balance readout and the Elements deck. */
export type Element = "fire" | "earth" | "air" | "water";
export const SIGN_ELEMENT: Element[] = [
  "fire", "earth", "air", "water", // Aries Taurus Gemini Cancer
  "fire", "earth", "air", "water", // Leo Virgo Libra Scorpio
  "fire", "earth", "air", "water", // Sagittarius Capricorn Aquarius Pisces
];

/** Ruler of each sign 1–12 (used for house lordship; nodes rule nothing). */
export const SIGN_RULER: PlanetKey[] = [
  "mars", "venus", "mercury", "moon", "sun", "mercury",
  "venus", "mars", "jupiter", "saturn", "saturn", "jupiter",
];

/** 27 nakshatras with their Vimshottari lord (9-lord cycle ×3). */
export const NAKSHATRAS: { name: string; lord: PlanetKey }[] = [
  { name: "Ashwini", lord: "ketu" }, { name: "Bharani", lord: "venus" }, { name: "Krittika", lord: "sun" },
  { name: "Rohini", lord: "moon" }, { name: "Mrigashira", lord: "mars" }, { name: "Ardra", lord: "rahu" },
  { name: "Punarvasu", lord: "jupiter" }, { name: "Pushya", lord: "saturn" }, { name: "Ashlesha", lord: "mercury" },
  { name: "Magha", lord: "ketu" }, { name: "Purva Phalguni", lord: "venus" }, { name: "Uttara Phalguni", lord: "sun" },
  { name: "Hasta", lord: "moon" }, { name: "Chitra", lord: "mars" }, { name: "Swati", lord: "rahu" },
  { name: "Vishakha", lord: "jupiter" }, { name: "Anuradha", lord: "saturn" }, { name: "Jyeshtha", lord: "mercury" },
  { name: "Mula", lord: "ketu" }, { name: "Purva Ashadha", lord: "venus" }, { name: "Uttara Ashadha", lord: "sun" },
  { name: "Shravana", lord: "moon" }, { name: "Dhanishta", lord: "mars" }, { name: "Shatabhisha", lord: "rahu" },
  { name: "Purva Bhadrapada", lord: "jupiter" }, { name: "Uttara Bhadrapada", lord: "saturn" }, { name: "Revati", lord: "mercury" },
];

/* Pada → purushartha per nakshatra (rows align with NAKSHATRAS, columns = padas 1–4).
   Vendored verbatim from Komilla Sutton, "The Nakshatras: The Stars Beyond the Zodiac"
   (Nakshatra Purushartha and Pada Purushartha table). The cycle alternates —
   Dharma·Artha·Kama·Moksha, then reversed Moksha·Kama·Artha·Dharma — but the book's
   alternation counts Abhijit (which has no padas) between Uttara Ashadha and Shravana,
   so the parity flips there: Shravana restarts at Dharma. A plain odd/even rule over
   27 nakshatras would be wrong from Shravana on — keep this an explicit table. */
export type Purushartha = "Dharma" | "Artha" | "Kama" | "Moksha";
const DAKM: Purushartha[] = ["Dharma", "Artha", "Kama", "Moksha"];
const MKAD: Purushartha[] = ["Moksha", "Kama", "Artha", "Dharma"];
export const PADA_PURUSHARTHAS: Purushartha[][] = [
  DAKM, // Ashwini
  MKAD, // Bharani
  DAKM, // Krittika
  MKAD, // Rohini
  DAKM, // Mrigashira
  MKAD, // Ardra
  DAKM, // Punarvasu
  MKAD, // Pushya
  DAKM, // Ashlesha
  MKAD, // Magha
  DAKM, // Purva Phalguni
  MKAD, // Uttara Phalguni
  DAKM, // Hasta
  MKAD, // Chitra
  DAKM, // Swati
  MKAD, // Vishakha
  DAKM, // Anuradha
  MKAD, // Jyeshtha
  DAKM, // Mula
  MKAD, // Purva Ashadha
  DAKM, // Uttara Ashadha
  DAKM, // Shravana — parity flips here (Abhijit, pada-less, sits before it in the book's cycle)
  MKAD, // Dhanishta
  DAKM, // Shatabhisha
  MKAD, // Purva Bhadrapada
  DAKM, // Uttara Bhadrapada
  MKAD, // Revati
];

/* Each nakshatra's own main purushartha (rows align with NAKSHATRAS) — the
   "Purushartha" column of the same Sutton table, vendored verbatim. With Abhijit
   (Kama) inserted after Uttara Ashadha it snakes D·A·K·M·M·K·A·D through Dhanishta,
   but Sutton's last four (Shatabhisha→Revati) run M·K·A·D where other sources
   (dirah.org, Dennis Harness) continue the snake with D·A·K·M — her column wins
   here (owner-directed); don't "fix" it to the formula. Feeds the Nakshatras
   deck's "Life aim" fact (single source, so card and engine can't diverge). */
export const NAKSHATRA_PURUSHARTHA: Purushartha[] = [
  "Dharma", // Ashwini
  "Artha",  // Bharani
  "Kama",   // Krittika
  "Moksha", // Rohini
  "Moksha", // Mrigashira
  "Kama",   // Ardra
  "Artha",  // Punarvasu
  "Dharma", // Pushya
  "Dharma", // Ashlesha
  "Artha",  // Magha
  "Kama",   // Purva Phalguni
  "Moksha", // Uttara Phalguni
  "Moksha", // Hasta
  "Kama",   // Chitra
  "Artha",  // Swati
  "Dharma", // Vishakha
  "Dharma", // Anuradha
  "Artha",  // Jyeshtha
  "Kama",   // Mula
  "Moksha", // Purva Ashadha
  "Moksha", // Uttara Ashadha
  "Artha",  // Shravana — Abhijit (Kama, pada-less) sits before it in the book's cycle
  "Dharma", // Dhanishta
  "Moksha", // Shatabhisha
  "Kama",   // Purva Bhadrapada
  "Artha",  // Uttara Bhadrapada
  "Dharma", // Revati
];

/* Dignity by sign number (1–12). Nodes have no dignity (always neutral). */
export const EXALTATION: Partial<Record<PlanetKey, number>> = {
  sun: 1, moon: 2, mars: 10, mercury: 6, jupiter: 4, venus: 12, saturn: 7,
};
export const DEBILITATION: Partial<Record<PlanetKey, number>> = {
  // Each debilitation sits exactly opposite the planet's exaltation (+6 signs).
  // Moon: exalted Taurus (2) → debilitated Scorpio (8). NB: the Hora-Prakash
  // reference's _DEBI_SIGN has a typo here (Mo:9, Sagittarius); JHora ground-truth
  // and canonical BPHS both place Moon neecha at Scorpio 3°, so we use 8.
  sun: 7, moon: 8, mars: 4, mercury: 12, jupiter: 10, venus: 6, saturn: 1,
};
export const OWN_SIGNS: Partial<Record<PlanetKey, number[]>> = {
  sun: [5], moon: [4], mars: [1, 8], mercury: [3, 6], jupiter: [9, 12], venus: [2, 7], saturn: [10, 11],
};
/* Mooltrikona sign per planet (canonical BPHS; sign-level, no degree sub-range).
   Coincides with an own sign for all except the Moon (Taurus, not its own Cancer).
   Used by Jagradadi avastha and shadbala's Saptavargaja bala (both sign-level, to
   match the pinned Hora-Prakash upstream, whose MOOLA_SIGN is likewise sign-level). */
export const MOOLTRIKONA: Partial<Record<PlanetKey, number>> = {
  sun: 5, moon: 2, mars: 1, mercury: 6, jupiter: 9, venus: 7, saturn: 11,
};

/* Mooltrikona DEGREE sub-range within the mool sign, [lower, upper) in degrees,
   standard BPHS. PRESENTATION-ONLY (owner-directed): used solely by the planet
   panel's dignity label to split the mool sign into "Mooltrikona" (inside the
   range) vs "Own Sign" (the rest). Deliberately NOT fed into shadbala or the
   Jagradadi avastha — those stay sign-level on MOOLTRIKONA above, pinned to the
   upstream. Moon (Taurus) and Mercury (Virgo) are omitted: their mool sign IS
   their exaltation sign, which the engine flags exalted at sign level, so the
   label resolves to "Exalted" first and never reaches a mooltrikona-degree test. */
export const MOOLTRIKONA_DEGREES: Partial<Record<PlanetKey, [number, number]>> = {
  sun: [0, 20],      // Leo 0°–20°
  mars: [0, 12],     // Aries 0°–12°
  jupiter: [0, 10],  // Sagittarius 0°–10°
  venus: [0, 15],    // Libra 0°–15°
  saturn: [0, 20],   // Aquarius 0°–20°
};

/* Naisargika (natural) maitri — each planet's standing friends / enemies; anyone not
   listed (and not itself) is neutral. Direction matters (asymmetric). Matches the
   Planets deck facts and the Hora-Prakash reference (shadbala.js PERM_FRIENDS/PERM_ENEMIES).
   Rahu/Ketu are intentionally absent — the reference defines no node friendships, so the
   maitri-to-dispositor badge is omitted for the nodes (never guessed). */
export const NAISARGIKA_FRIENDS: Partial<Record<PlanetKey, PlanetKey[]>> = {
  sun: ["moon", "mars", "jupiter"],
  moon: ["sun", "mercury"],
  mars: ["sun", "moon", "jupiter"],
  mercury: ["sun", "venus"],
  jupiter: ["sun", "moon", "mars"],
  venus: ["mercury", "saturn"],
  saturn: ["mercury", "venus"],
};
export const NAISARGIKA_ENEMIES: Partial<Record<PlanetKey, PlanetKey[]>> = {
  sun: ["venus", "saturn"],
  moon: [],
  mars: ["mercury"],
  mercury: ["moon"],
  jupiter: ["mercury", "venus"],
  venus: ["sun", "moon"],
  saturn: ["sun", "moon", "mars"],
};

/* ============================================================
   Functional nature per ascendant — THE single canonical table.
   Keyed by lagna sign (1=Aries … 12=Pisces); planet lists are in natural order.
   The source of truth for the Zodiac Ascendants deck, which generates its
   Yogakaraka/Benefics/Neutral/Malefics facts from it — the rising-sign card is
   where users see who the functional benefics/malefics are. (The panels' per-
   planet B/M/N/Y badge and its `vedic.functionalNatureOf` mapping were removed,
   owner-directed — visually distracting.) Yogakaraka = the planet ruling both
   a kendra and a trikona (also listed among the benefics). The `*Note` fields
   carry the deck's editorial parentheticals. Nodes are unclassified.
   ============================================================ */
export interface AscendantFunctional {
  benefics: PlanetKey[];
  neutrals: PlanetKey[];
  malefics: PlanetKey[];
  yogakaraka: PlanetKey | null;
  yogakarakaNote?: string; // parenthetical on the Yogakaraka fact (e.g. "5+10", "Sun strongest")
  beneficNote?: string; // emphasis appended to the Benefics list
  maleficNote?: string; // emphasis appended to the Malefics list
}

export const ASCENDANT_FUNCTIONAL: AscendantFunctional[] = [
  // 1 Aries
  { benefics: ["sun", "moon", "mars", "jupiter"], neutrals: [], malefics: ["mercury", "venus", "saturn"],
    yogakaraka: null, yogakarakaNote: "Sun strongest" },
  // 2 Taurus — Sun (4th lord, a lone kendra) is functionally NEUTRAL, not malefic
  // (owner-corrected 2026-06; an earlier dictation error listed it malefic)
  { benefics: ["mercury", "venus", "saturn"], neutrals: ["sun"], malefics: ["moon", "mars", "jupiter"],
    yogakaraka: "saturn", yogakarakaNote: "9+10", beneficNote: "Saturn especially auspicious" },
  // 3 Gemini
  { benefics: ["mercury", "venus", "saturn"], neutrals: ["moon"], malefics: ["sun", "mars", "jupiter"],
    yogakaraka: null, maleficNote: "Mars especially difficult" },
  // 4 Cancer
  { benefics: ["moon", "mars", "jupiter"], neutrals: ["sun"], malefics: ["mercury", "venus", "saturn"],
    yogakaraka: "mars", yogakarakaNote: "5+10", beneficNote: "Mars especially auspicious", maleficNote: "especially difficult" },
  // 5 Leo
  { benefics: ["sun", "mars", "jupiter"], neutrals: ["moon"], malefics: ["mercury", "venus", "saturn"],
    yogakaraka: "mars", yogakarakaNote: "4+9", beneficNote: "Mars especially auspicious", maleficNote: "especially difficult" },
  // 6 Virgo
  { benefics: ["mercury", "venus"], neutrals: ["sun", "saturn"], malefics: ["moon", "mars", "jupiter"],
    yogakaraka: null, maleficNote: "Mars especially difficult" },
  // 7 Libra
  { benefics: ["mercury", "venus", "saturn"], neutrals: ["moon"], malefics: ["sun", "mars", "jupiter"],
    yogakaraka: "saturn", yogakarakaNote: "4+5", beneficNote: "Saturn especially auspicious" },
  // 8 Scorpio
  { benefics: ["sun", "moon", "mars", "jupiter"], neutrals: [], malefics: ["mercury", "venus", "saturn"],
    yogakaraka: null, yogakarakaNote: "Sun+Moon raja yoga", beneficNote: "Moon especially auspicious" },
  // 9 Sagittarius
  { benefics: ["sun", "mars", "jupiter"], neutrals: ["moon"], malefics: ["mercury", "venus", "saturn"],
    yogakaraka: null },
  // 10 Capricorn
  { benefics: ["mercury", "venus", "saturn"], neutrals: ["moon"], malefics: ["sun", "mars", "jupiter"],
    yogakaraka: "venus", yogakarakaNote: "5+10", beneficNote: "Venus especially auspicious" },
  // 11 Aquarius
  { benefics: ["mercury", "venus", "saturn"], neutrals: [], malefics: ["sun", "moon", "mars", "jupiter"],
    yogakaraka: "venus", yogakarakaNote: "4+9", beneficNote: "Venus especially auspicious" },
  // 12 Pisces
  { benefics: ["moon", "mars", "jupiter"], neutrals: ["sun"], malefics: ["mercury", "venus", "saturn"],
    yogakaraka: null, beneficNote: "Moon especially auspicious" },
];

/* Graha drishti — houses a planet aspects, counted from itself (1 = its own sign).
   Sun/Moon/Mercury/Venus: 7th only. Mars 4/7/8. Jupiter 5/7/9. Saturn 3/7/10.
   Nodes (owner-directed school): Rahu casts 5/9 only, Ketu casts none — node
   aspecting is classically disputed, and crucially NEITHER node has the 7th, so
   the always-opposite nodes never read as aspecting each other. NB the
   Hora-Prakash reference treats both nodes as Jupiter (5/7/9); the owner chose
   this convention instead — don't re-align to the reference. */
export const DRISHTI: Record<PlanetKey, number[]> = {
  sun: [7], moon: [7], mercury: [7], venus: [7],
  mars: [4, 7, 8], jupiter: [5, 7, 9], saturn: [3, 7, 10],
  rahu: [5, 9], ketu: [],
};

/* Combustion orbs (degrees) — matches the Combustion study deck (owner-directed):
   only the five tara grahas combust; Sun/Moon/Rahu/Ketu never do. Mercury's tight
   solar orbit gets the much smaller orb. NB the Hora-Prakash reference uses the
   wider Parashari orbs (Moon 12, Mars 17, Mercury 14, Jupiter 11, Venus 10,
   Saturn 15); the owner chose the deck's values — don't re-align to the reference. */
export const COMBUSTION_ORB: Partial<Record<PlanetKey, number>> = {
  mercury: 1, venus: 8, mars: 10, jupiter: 10, saturn: 10,
};

/* Vimshottari dasha: lord order + years (sums to 120). */
export const DASHA_SEQUENCE: { lord: PlanetKey; years: number }[] = [
  { lord: "ketu", years: 7 }, { lord: "venus", years: 20 }, { lord: "sun", years: 6 },
  { lord: "moon", years: 10 }, { lord: "mars", years: 7 }, { lord: "rahu", years: 18 },
  { lord: "jupiter", years: 16 }, { lord: "saturn", years: 19 }, { lord: "mercury", years: 17 },
];
export const DASHA_TOTAL_YEARS = 120;

export const NAKSHATRA_ARC = 360 / 27; // 13°20′
export const PADA_ARC = 360 / 108; // 3°20′

/* Gandanta — the three water→fire sign junctions: Pisces→Aries (0°/360°),
   Cancer→Leo (120°), Scorpio→Sagittarius (240°). Two tiers (owner-directed,
   encoding both schools): the FLAG covers the full junction padas — one pada
   (3°20′) each side, matching the Hora-Prakash reference (calculations.js
   `_GANDANTA_DEG = 360/108`); DEEP is the narrower 28°20′→1°40′ "true gandanta"
   zone — 1°40′ each side (Sutton). The still-tighter named bands (nakshatra
   gandanta ±48′, lagna gandanta ±14′) live in the Gandanta deck as study
   content, not engine logic. */
export const GANDANTA_BOUNDARIES = [0, 120, 240];
export const GANDANTA_ORB = 360 / 108; // 3°20′ each side — the full junction padas (flag)
export const GANDANTA_DEEP_ORB = 100 / 60; // within ±1°40′ → "deep" (the 28°20′→1°40′ zone)
