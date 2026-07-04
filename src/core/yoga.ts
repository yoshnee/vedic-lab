/* ============================================================
   yoga.ts — yoga detection. Detectors: Pancha Mahapurusha (Lagna frame),
   Gaja Kesari (Moon frame), Budhaditya (degree separation), Neecha Bhanga
   (per-rule pills R1–R4 on a debilitated planet; Lagna OR Moon Kendras),
   Venus & Mercury Conjunction (house-gated whole-sign conjunction),
   Dhana 2/11 (house-lord relationship: conjunction / mutual aspect / exchange),
   Grahana (luminary + node sharing a sign; orb grades intensity, never gates).

   Every detector is a PURE function of already-computed placement facts
   (dignity / whole-sign house / sign / longitude, in some reference frame) —
   so the same detector can be reused later for transit and divisional
   contexts by feeding it that frame's placements (vargas would pass their
   pseudo-longitudes, as combustion already does). For now computeChart
   calls it with the natal D1 placements only.

   NB: the Hora-Prakash reference has NO yoga module, so unlike the rest of
   the engine these rules are pinned to the owner-provided Yogas flashcard
   deck (src/data/decks/yogas.ts), which doubles as the per-yoga spec.
   ============================================================ */
import type { Dignity, PlanetKey, YogaRef } from "./types";
import { SIGN_RULER, EXALTATION, DEBILITATION } from "./constants";
import { aspectsOnto } from "./vedic";

const KENDRAS = new Set([1, 4, 7, 10]);
/** Whole-sign position of `sign` counted from `fromSign` (1–12). */
const positionFrom = (sign: number, fromSign: number) => ((sign - fromSign + 12) % 12) + 1;

/** The five Mahapurusha yogas — one per non-luminary planet (the Yogas deck's
    "Pancha Mahapurusha Yoga" card). Luminaries and nodes are absent: they
    never form one. */
export const MAHAPURUSHA: Partial<Record<PlanetKey, { key: string; name: string }>> = {
  mars: { key: "ruchaka", name: "Ruchaka Mahapurusha Yoga" },
  mercury: { key: "bhadra", name: "Bhadra Mahapurusha Yoga" },
  jupiter: { key: "hamsa", name: "Hamsa Mahapurusha Yoga" },
  venus: { key: "malavya", name: "Malavya Mahapurusha Yoga" },
  saturn: { key: "sasa", name: "Sasa Mahapurusha Yoga" },
};

/** Pancha Mahapurusha: a non-luminary in own sign or exaltation, placed in a
    Kendra (1, 4, 7, 10) of the supplied frame. No combustion or retrograde
    gating. `dignity` is single-valued, so Mercury in Virgo (own AND exalted)
    yields exactly one Bhadra entry.
    NB classically the yoga is assessed from the Lagna AND from the Moon
    (Chandra lagna); the engine deliberately computes the Lagna frame only
    (owner-accepted) and the deck card tells readers to check the Moon count
    themselves. The Moon frame would just be this same function fed
    Moon-counted houses, when wanted. */
export function panchaMahapurusha(
  planet: PlanetKey,
  dignity: Dignity,
  house: number,
): YogaRef | null {
  const yoga = MAHAPURUSHA[planet];
  if (!yoga) return null;
  if (dignity !== "own" && dignity !== "exalted") return null;
  if (!KENDRAS.has(house)) return null;
  return { key: yoga.key, name: yoga.name, flashcard: { type: "yoga", id: "pancha-mahapurusha" } };
}

/** Gaja Kesari (the Yogas deck's "Gaja Kesari Yoga" card): Jupiter in a Kendra
    counted WHOLE-SIGN FROM THE MOON — the deliberate frame difference from
    Mahapurusha (which counts from the Lagna). Position 1 is Jupiter in the
    Moon's own sign, so the conjunction case is included by construction (no
    degree orb). Both participants carry the entry. Core rule only for v1 —
    a stricter tradition also requires Jupiter reasonably strong (not
    debilitated / combust / in an enemy sign) to curb over-firing, since a
    Kendra-from-Moon alone is common; that belongs in a separate strength
    pass later, NOT in detection. */
export function gajaKesari(jupiterSign: number, moonSign: number): YogaRef | null {
  if (!KENDRAS.has(positionFrom(jupiterSign, moonSign))) return null;
  return { key: "gaja-kesari", name: "Gaja Kesari", flashcard: { type: "yoga", id: "gaja-kesari" } };
}

/** Venus & Mercury Conjunction (the Yogas deck's Dhana-family card): Venus and
    Mercury in the same sign (whole-sign conjunction, no degree orb — neither
    is the Sun, so no combustion concern), and that shared sign sits in the
    2nd, 5th, 9th, or 11th house from the frame's lagna. Conjunctions in any
    other house do not surface. Both participants carry the entry. */
const VENUS_MERCURY_HOUSES = new Set([2, 5, 9, 11]);
export function venusMercuryConjunction(
  venusSign: number,
  mercurySign: number,
  lagnaSign: number,
): YogaRef | null {
  if (venusSign !== mercurySign) return null;
  if (!VENUS_MERCURY_HOUSES.has(positionFrom(venusSign, lagnaSign))) return null;
  return {
    key: "venus-mercury",
    name: "Venus & Mercury Conjunction",
    flashcard: { type: "yoga", id: "venus-mercury" },
  };
}

/** Grahana / Grahan Dosha (the Yogas deck's Grahana cards): a luminary (Sun
    or Moon) afflicted by a node (Rahu or Ketu) in the SAME SIGN — the four
    base pairs. Formation is sign-based; the longitudinal separation only
    grades INTENSITY per the card's tiers: ≤5° Purna (complete, strongest),
    ≤10° Strong, beyond that (same sign) Mild. The card's eight combinations
    fall out of per-pair detection — a new moon with Rahu is simply Sun–Rahu
    AND Moon–Rahu both firing (the node then carries two pills). Both
    participants carry the entry — the nodes' first yoga pills (they're
    excluded from Mahapurusha/Neecha Bhanga, but Grahana is THEIRS).
    Future, deliberately not v1: the card's eclipse layer (Sun within ~18° /
    Moon within ~12° of a node, degree-based across signs) as a separate,
    stronger flag. */
export function grahana(
  luminary: "sun" | "moon",
  node: "rahu" | "ketu",
  signs: Record<PlanetKey, number>,
  longitudes: Record<PlanetKey, number>,
): YogaRef | null {
  if (signs[luminary] !== signs[node]) return null;
  let separation = Math.abs(longitudes[luminary] - longitudes[node]);
  if (separation > 180) separation = 360 - separation; // defensive; same-sign pairs are always ≤30° apart
  const intensity = separation <= 5 ? "purna" : separation <= 10 ? "strong" : "mild";
  const key = `grahana-${luminary}-${node}`;
  return { key, name: "Grahana", flashcard: { type: "yoga", id: key }, intensity };
}

/** Whole-sign sign occupying `house` counted from `lagnaSign`. */
const signOfHouse = (house: number, lagnaSign: number) => ((lagnaSign - 1 + house - 1) % 12) + 1;

/** Dhana Yoga, 2nd & 11th lords (the Yogas deck's "Dhana Yoga (2nd & 11th
    Lords)" card): the lords of the frame's 2nd and 11th whole-sign houses,
    connected by any ONE of three modes — conjunction (same sign, NO house
    restriction: the wealth is in the lords' relationship, not where they
    meet), mutual graha drishti (BOTH directions — one-way is not enough;
    reuses vedic.aspectsOnto), or exchange (L2 sits in the 11th house and L11
    in the 2nd, each in the other's sign). One pill regardless of mode (the
    first matching mode is stored as `mode` metadata), on BOTH lords.
    Dual-lord skip: a Leo lagna makes Mercury both lords (Virgo 2nd + Gemini
    11th) and an Aquarius lagna makes Jupiter both (Pisces + Sagittarius) —
    the yoga needs two distinct planets, so those charts skip it. */
export function dhana2and11(
  planet: PlanetKey,
  signs: Record<PlanetKey, number>,
  lagnaSign: number,
): YogaRef | null {
  const l2 = SIGN_RULER[signOfHouse(2, lagnaSign) - 1];
  const l11 = SIGN_RULER[signOfHouse(11, lagnaSign) - 1];
  if (l2 === l11) return null; // dual lord (Leo / Aquarius lagna): skip
  if (planet !== l2 && planet !== l11) return null;

  const s2 = signs[l2];
  const s11 = signs[l11];
  let mode: YogaRef["mode"] | null = null;
  if (s2 === s11) {
    mode = "conjunction";
  } else if (
    aspectsOnto(s11, signs).some((a) => a.planet === l2) &&
    aspectsOnto(s2, signs).some((a) => a.planet === l11)
  ) {
    mode = "mutual-aspect";
  } else if (positionFrom(s2, lagnaSign) === 11 && positionFrom(s11, lagnaSign) === 2) {
    mode = "exchange";
  }
  if (!mode) return null;
  return { key: "dhana-2-11", name: "Dhana Yoga", flashcard: { type: "yoga", id: "dhana-2-11" }, mode };
}

/** Neecha Bhanga Raja Yoga (the Yogas deck's card; its four rules R1–R4 are the
    spec). Runs per DEBILITATED planet (the seven classicals only — nodes are
    never debilitated, dignityOf gives them "neutral"). Two rescuer identities
    are resolved from the same canonical dignity tables that generate the card's
    back-side reference table — dispositor = lord of the debilitation sign,
    exaltation-lord = lord of the planet's exaltation sign. The rules:
      R1 the dispositor sits in a Kendra from the LAGNA OR THE MOON (wider than
         Mahapurusha, deliberately).
      R2 the exaltation-lord does the same.
      R3 the debilitated planet is conjunct (same sign) OR aspected (graha
         drishti, via vedic.aspectsOnto) by its dispositor or exaltation-lord —
         ONE rule, so ONE pill however many of those four sub-cases hold.
      R4 parivartana: the debilitated planet and its dispositor exchange signs
         (the dispositor occupies a sign the debilitated planet rules).
    Mercury self-reference: debilitated Mercury's exaltation-lord is Mercury
    itself, so R2 and the exaltation-lord half of R3 are skipped.
    One YogaRef per activated rule (carrying `condition` = the rule number 1–4);
    the chart surfaces one pill each, multiple pills when multiple rules fire.
    NB vs the earlier 7-condition scheme (owner-directed 2026-07): conjunct /
    Kendra / aspect are no longer separate pills (merged into R3), the
    exalted-occupant condition is dropped, and parivartana (R4) is new. */
export function neechaBhanga(
  planet: PlanetKey,
  dignity: Dignity,
  signs: Record<PlanetKey, number>,
  lagnaSign: number,
): YogaRef[] {
  if (dignity !== "debilitated") return [];
  if (!EXALTATION[planet] || !DEBILITATION[planet]) return []; // nodes: the yoga does not apply
  const dSign = signs[planet]; // === DEBILITATION[planet] when debilitated
  const dispositor = SIGN_RULER[dSign - 1];
  const exaltLord = SIGN_RULER[EXALTATION[planet]! - 1];
  const selfExaltLord = exaltLord === planet; // Mercury only: its exaltation-lord is itself

  const moonSign = signs.moon;
  const inKendra = (s: number) =>
    KENDRAS.has(positionFrom(s, lagnaSign)) || KENDRAS.has(positionFrom(s, moonSign));
  const aspectingD = new Set(aspectsOnto(dSign, signs).map((a) => a.planet));
  const conjunctOrAspects = (rescuer: PlanetKey) =>
    signs[rescuer] === dSign || aspectingD.has(rescuer);

  const fired: (1 | 2 | 3 | 4)[] = [];
  // R1: the debilitation-sign lord (dispositor) sits in a Kendra from Lagna or Moon
  if (inKendra(signs[dispositor])) fired.push(1);
  // R2: the exaltation-sign lord sits in a Kendra from Lagna or Moon (n/a for Mercury)
  if (!selfExaltLord && inKendra(signs[exaltLord])) fired.push(2);
  // R3: the planet is conjunct OR aspected by its dispositor or exaltation-lord (one rule)
  if (conjunctOrAspects(dispositor) || (!selfExaltLord && conjunctOrAspects(exaltLord)))
    fired.push(3);
  // R4: parivartana — the dispositor occupies a sign the debilitated planet rules
  if (SIGN_RULER[signs[dispositor] - 1] === planet) fired.push(4);

  return fired.map((n) => ({
    key: `neecha-bhanga-r${n}`,
    name: `Neecha Bhanga R${n}`,
    flashcard: { type: "yoga" as const, id: `neecha-bhanga-r${n}` },
    condition: n,
  }));
}

/** Budhaditya (the Yogas deck's "Budhaditya Yoga" card): Sun and Mercury in
    the SAME SIGN with a longitudinal separation of 6°–14° INCLUSIVE — the
    card's sweet spot: close enough to blend, far enough that Mercury escapes
    the burn. Below 6° Mercury is too close (effectively combust); above 14°,
    even same-sign, is a looser form deliberately not surfaced in v1 (a milder
    tier may come later). Both participants carry the entry.
    NB on the 6° floor: it approximates Mercury's combustion cutoff as the
    owner's deck cards define it. The Hora-Prakash reference's Parashari orb
    is far wider (Mercury 14°, which would swallow this whole band) and our
    engine's combust flag uses the Combustion deck's 1° — the 6–14 band is the
    owner's Budhaditya-card convention, kept verbatim (and with the 1° engine
    orb the combust flag and this pill can never contradict on screen).
    Quality tag for later, NOT a v1 gate: more auspicious when the conjunction
    sits in a Kendra (1/4/7/10) or Trikona (1/5/9) from the Lagna. */
export function budhaditya(
  sunLon: number,
  mercuryLon: number,
  sunSign: number,
  mercurySign: number,
): YogaRef | null {
  if (sunSign !== mercurySign) return null;
  let separation = Math.abs(sunLon - mercuryLon);
  if (separation > 180) separation = 360 - separation; // defensive; same-sign pairs are always ≤30° apart
  if (separation < 6 || separation > 14) return null;
  return { key: "budhaditya", name: "Budhaditya", flashcard: { type: "yoga", id: "budhaditya" } };
}

/** Everything a planet's `yogas[]` needs beyond its own placement: the frame's
    full sign + longitude maps, for multi-planet and degree-based yogas
    (Gaja Kesari reads Jupiter + Moon signs; Budhaditya reads Sun + Mercury
    longitudes — a varga frame would pass its pseudo-longitudes). */
export interface YogaInputs {
  dignity: Dignity;
  house: number; // whole-sign house in the frame (Kendras from its lagna)
  signs: Record<PlanetKey, number>; // all nine bodies' signs in the frame
  longitudes: Record<PlanetKey, number>; // all nine bodies' longitudes in the frame
  lagnaSign: number; // the frame's lagna sign (Neecha Bhanga's Lagna-Kendra test)
}

/** All yogas one planet participates in — its `yogas[]`. Single-planet yogas
    land on that planet; multi-planet yogas land on every participant. Future
    detectors (Raja, …) append here. */
export function computeYogas(planet: PlanetKey, inp: YogaInputs): YogaRef[] {
  const out: YogaRef[] = [];
  const mahapurusha = panchaMahapurusha(planet, inp.dignity, inp.house);
  if (mahapurusha) out.push(mahapurusha);
  if (planet === "jupiter" || planet === "moon") {
    const gk = gajaKesari(inp.signs.jupiter, inp.signs.moon);
    if (gk) out.push(gk);
  }
  if (planet === "sun" || planet === "mercury") {
    const ba = budhaditya(inp.longitudes.sun, inp.longitudes.mercury, inp.signs.sun, inp.signs.mercury);
    if (ba) out.push(ba);
  }
  if (planet === "venus" || planet === "mercury") {
    const vm = venusMercuryConjunction(inp.signs.venus, inp.signs.mercury, inp.lagnaSign);
    if (vm) out.push(vm);
  }
  const dhana = dhana2and11(planet, inp.signs, inp.lagnaSign); // self-selects: only the 2nd/11th lords
  if (dhana) out.push(dhana);
  if (planet === "sun" || planet === "moon") {
    for (const node of ["rahu", "ketu"] as const) {
      const g = grahana(planet, node, inp.signs, inp.longitudes);
      if (g) out.push(g);
    }
  }
  if (planet === "rahu" || planet === "ketu") {
    // a node can eclipse BOTH luminaries at once (the card's new-moon triples)
    for (const lum of ["sun", "moon"] as const) {
      const g = grahana(lum, planet, inp.signs, inp.longitudes);
      if (g) out.push(g);
    }
  }
  out.push(...neechaBhanga(planet, inp.dignity, inp.signs, inp.lagnaSign));
  return out;
}
