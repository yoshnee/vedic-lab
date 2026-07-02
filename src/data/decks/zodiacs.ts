/* Zodiacs (Rashis). The twelve signs, one card each (split out of the former
   "Ascendants & Zodiacs" deck). FRONT = lord, element, modality, polarity, plus
   the functional benefics/neutral/malefics for that sign AS a rising sign
   (element-triplicity method, generated from the canonical ASCENDANT_FUNCTIONAL
   table); BACK = a two-part trait word cloud, positive traits in green and
   negative in red (owner copy; `TraitCloud`). Each card uses its zodiac glyph
   colored by its ruling planet.

   The chart page's `sign` / `ascendant` flashcard links resolve into THIS deck
   (by sign title), so the rising-sign card is one tap from the /chart panels. */
import type { Card, Deck, CardFact } from "./types";
import { PLANET_COLORS, ACCENT } from "@/lib/design/colors";
import { PLANET_NAMES, ASCENDANT_FUNCTIONAL } from "@/core/constants";
import type { PlanetKey } from "@/core/types";

/** The four functional-nature facts for a lagna, generated from the single canonical
    ASCENDANT_FUNCTIONAL table (src/core/constants.ts) — the SAME table the panel's
    functional-nature badge reads. Generating them here (rather than hardcoding) is what
    keeps the deck and the badge from ever disagreeing. */
function fnFacts(lagnaSign: number): CardFact[] {
  const t = ASCENDANT_FUNCTIONAL[lagnaSign - 1];
  const list = (arr: PlanetKey[], note?: string) =>
    (arr.length ? arr.map((k) => PLANET_NAMES[k]).join(", ") : "None") + (note ? ` (${note})` : "");
  const yk =
    (t.yogakaraka ? PLANET_NAMES[t.yogakaraka] : "None") + (t.yogakarakaNote ? ` (${t.yogakarakaNote})` : "");
  // The four functional rows carry a "*" tying them to the card's footnote —
  // they hold only when this sign is the ascendant (unlike Lord/Element/etc.).
  return [
    { label: "Yogakaraka *", value: yk },
    { label: "Benefics *", value: list(t.benefics, t.beneficNote) },
    { label: "Neutral *", value: list(t.neutrals) },
    { label: "Malefics *", value: list(t.malefics, t.maleficNote) },
  ];
}

/** Shown on every rising-sign card: the functional-nature rows (Yogakaraka /
    Benefics / Neutral / Malefics) are ascendant-specific, not properties of the
    sign in general. Mapped onto every card at export so it can't drift per-card. */
const LAGNA_FN_NOTE = "* Applies only when this sign is the ascendant.";

const SIGN_CARDS: Card[] = [
    {
      title: "Aries",
      sanskrit: "Mesha",
      accentColor: PLANET_COLORS.mars,
      icon: { kind: "zodiac", symbol: "♈" },
      body: "",
      facts: [
        { label: "Lord", value: "Mars" },
        { label: "Element", value: "Fire" },
        { label: "Modality", value: "Movable (Chara)" },
        { label: "Polarity", value: "Odd (male)" },
        ...fnFacts(1),
      ],
      traits: {
        positive: [
          { label: "Fearlessness", weight: "big" },
          { label: "Pioneering", weight: "medium" },
          { label: "Self-starter", weight: "medium" },
          { label: "Straightforward", weight: "small" },
          { label: "Enthusiasm", weight: "small" },
        ],
        negative: [
          { label: "Impatience", weight: "big" },
          { label: "Combativeness", weight: "medium" },
          { label: "Self-absorption", weight: "medium" },
          { label: "Rashness", weight: "small" },
          { label: "Unfinished business", weight: "small" },
        ],
      },
    },
    {
      title: "Taurus",
      sanskrit: "Vrishabha",
      accentColor: PLANET_COLORS.venus,
      icon: { kind: "zodiac", symbol: "♉" },
      body: "",
      facts: [
        { label: "Lord", value: "Venus" },
        { label: "Element", value: "Earth" },
        { label: "Modality", value: "Fixed (Sthira)" },
        { label: "Polarity", value: "Even (female)" },
        ...fnFacts(2),
      ],
      traits: {
        positive: [
          { label: "Patience", weight: "big" },
          { label: "Steadfastness", weight: "medium" },
          { label: "Sensuality", weight: "medium" },
          { label: "Practicality", weight: "small" },
          { label: "Loyalty", weight: "small" },
        ],
        negative: [
          { label: "Stubbornness", weight: "big" },
          { label: "Possessiveness", weight: "medium" },
          { label: "Indulgence", weight: "medium" },
          { label: "Complacency", weight: "small" },
          { label: "Resistance to change", weight: "small" },
        ],
      },
    },
    {
      title: "Gemini",
      sanskrit: "Mithuna",
      accentColor: PLANET_COLORS.mercury,
      icon: { kind: "zodiac", symbol: "♊" },
      body: "",
      facts: [
        { label: "Lord", value: "Mercury" },
        { label: "Element", value: "Air" },
        { label: "Modality", value: "Dual (Dvisvabhava)" },
        { label: "Polarity", value: "Odd (male)" },
        ...fnFacts(3),
      ],
      traits: {
        positive: [
          { label: "Humorous", weight: "big" },
          { label: "Communicative", weight: "medium" },
          { label: "Versatile", weight: "medium" },
          { label: "Curiosity", weight: "small" },
          { label: "Cleverness", weight: "small" },
        ],
        negative: [
          { label: "Superficiality", weight: "big" },
          { label: "Inconsistency", weight: "medium" },
          { label: "Restlessness", weight: "medium" },
          { label: "Two-faced", weight: "small" },
          { label: "Scattered focus", weight: "small" },
        ],
      },
    },
    {
      title: "Cancer",
      sanskrit: "Karka",
      accentColor: PLANET_COLORS.moon,
      icon: { kind: "zodiac", symbol: "♋" },
      body: "",
      facts: [
        { label: "Lord", value: "Moon" },
        { label: "Element", value: "Water" },
        { label: "Modality", value: "Movable (Chara)" },
        { label: "Polarity", value: "Even (female)" },
        ...fnFacts(4),
      ],
      traits: {
        positive: [
          { label: "Caregiving", weight: "big" },
          { label: "Emotional insight", weight: "medium" },
          { label: "Fierce loyalty", weight: "medium" },
          { label: "Long memory", weight: "small" },
          { label: "Creative imagination", weight: "small" },
        ],
        negative: [
          { label: "Mood swings", weight: "big" },
          { label: "Can't let go", weight: "medium" },
          { label: "Guardedness", weight: "medium" },
          { label: "Guilt-tripping", weight: "small" },
          { label: "Closed circle", weight: "small" },
        ],
      },
    },
    {
      title: "Leo",
      sanskrit: "Simha",
      accentColor: PLANET_COLORS.sun,
      icon: { kind: "zodiac", symbol: "♌" },
      body: "",
      facts: [
        { label: "Lord", value: "Sun" },
        { label: "Element", value: "Fire" },
        { label: "Modality", value: "Fixed (Sthira)" },
        { label: "Polarity", value: "Odd (male)" },
        ...fnFacts(5),
      ],
      traits: {
        positive: [
          { label: "Natural leader", weight: "big" },
          { label: "Creative fire", weight: "medium" },
          { label: "Big-hearted", weight: "medium" },
          { label: "Boldness", weight: "small" },
          { label: "Protective loyalty", weight: "small" },
        ],
        negative: [
          { label: "Arrogance", weight: "big" },
          { label: "Overbearing", weight: "medium" },
          { label: "Dramatic", weight: "medium" },
          { label: "Craves validation", weight: "small" },
          { label: "Inflexibility", weight: "small" },
        ],
      },
    },
    {
      title: "Virgo",
      sanskrit: "Kanya",
      accentColor: PLANET_COLORS.mercury,
      icon: { kind: "zodiac", symbol: "♍" },
      body: "",
      facts: [
        { label: "Lord", value: "Mercury" },
        { label: "Element", value: "Earth" },
        { label: "Modality", value: "Dual (Dvisvabhava)" },
        { label: "Polarity", value: "Even (female)" },
        ...fnFacts(6),
      ],
      traits: {
        positive: [
          { label: "Precision", weight: "big" },
          { label: "Discernment", weight: "medium" },
          { label: "Skilled hands", weight: "medium" },
          { label: "Wellness-minded", weight: "small" },
          { label: "Quiet humility", weight: "small" },
        ],
        negative: [
          { label: "Nitpicking", weight: "big" },
          { label: "Worry-prone", weight: "medium" },
          { label: "Never good enough", weight: "medium" },
          { label: "Imagined ailments", weight: "small" },
          { label: "Doormat tendency", weight: "small" },
        ],
      },
    },
    {
      title: "Libra",
      sanskrit: "Tula",
      accentColor: PLANET_COLORS.venus,
      icon: { kind: "zodiac", symbol: "♎" },
      body: "",
      facts: [
        { label: "Lord", value: "Venus" },
        { label: "Element", value: "Air" },
        { label: "Modality", value: "Movable (Chara)" },
        { label: "Polarity", value: "Odd (male)" },
        ...fnFacts(7),
      ],
      traits: {
        positive: [
          { label: "Peacemaker", weight: "big" },
          { label: "Refined taste", weight: "medium" },
          { label: "Justice oriented", weight: "medium" },
          { label: "Effortless charm", weight: "small" },
          { label: "True collaborator", weight: "small" },
        ],
        negative: [
          { label: "Fence-sitting", weight: "big" },
          { label: "Approval-seeking", weight: "medium" },
          { label: "Style over substance", weight: "medium" },
          { label: "Passive-aggressive", weight: "small" },
          { label: "Leans on others", weight: "small" },
        ],
      },
    },
    {
      title: "Scorpio",
      sanskrit: "Vrishchika",
      accentColor: PLANET_COLORS.mars,
      icon: { kind: "zodiac", symbol: "♏" },
      body: "",
      facts: [
        { label: "Lord", value: "Mars" },
        { label: "Element", value: "Water" },
        { label: "Modality", value: "Fixed (Sthira)" },
        { label: "Polarity", value: "Even (female)" },
        ...fnFacts(8),
      ],
      traits: {
        positive: [
          { label: "Deep intuition", weight: "big" },
          { label: "Resilience", weight: "medium" },
          { label: "Committed", weight: "medium" },
          { label: "Catalyst for change", weight: "small" },
          { label: "Reads people", weight: "small" },
        ],
        negative: [
          { label: "Obsessive grip", weight: "big" },
          { label: "Puppet-master", weight: "medium" },
          { label: "Jealous possession", weight: "medium" },
          { label: "Holds grudges", weight: "small" },
          { label: "Own worst enemy", weight: "small" },
        ],
      },
    },
    {
      title: "Sagittarius",
      sanskrit: "Dhanu",
      accentColor: PLANET_COLORS.jupiter,
      icon: { kind: "zodiac", symbol: "♐" },
      body: "",
      facts: [
        { label: "Lord", value: "Jupiter" },
        { label: "Element", value: "Fire" },
        { label: "Modality", value: "Dual (Dvisvabhava)" },
        { label: "Polarity", value: "Odd (male)" },
        ...fnFacts(9),
      ],
      traits: {
        positive: [
          { label: "Wise counsel", weight: "big" },
          { label: "Open-handed", weight: "medium" },
          { label: "Keeps the faith", weight: "medium" },
          { label: "Long view", weight: "small" },
          { label: "Acts on principle", weight: "small" },
        ],
        negative: [
          { label: "Sermonizing", weight: "big" },
          { label: "Holier-than-thou", weight: "medium" },
          { label: "Commitment-shy", weight: "medium" },
          { label: "Over-promises", weight: "small" },
          { label: "Spread too thin", weight: "small" },
        ],
      },
    },
    {
      title: "Capricorn",
      sanskrit: "Makara",
      accentColor: PLANET_COLORS.saturn,
      icon: { kind: "zodiac", symbol: "♑" },
      body: "",
      facts: [
        { label: "Lord", value: "Saturn" },
        { label: "Element", value: "Earth" },
        { label: "Modality", value: "Movable (Chara)" },
        { label: "Polarity", value: "Even (female)" },
        ...fnFacts(10),
      ],
      traits: {
        positive: [
          { label: "Disciplined", weight: "big" },
          { label: "Accountable", weight: "medium" },
          { label: "Builds legacies", weight: "medium" },
          { label: "Feet on the ground", weight: "small" },
          { label: "Earned wisdom", weight: "small" },
        ],
        negative: [
          { label: "Emotionally distant", weight: "big" },
          { label: "Married to work", weight: "medium" },
          { label: "Sees only obstacles", weight: "medium" },
          { label: "Bound by convention", weight: "small" },
          { label: "Authoritarianism", weight: "small" },
        ],
      },
    },
    {
      title: "Aquarius",
      sanskrit: "Kumbha",
      accentColor: PLANET_COLORS.saturn,
      icon: { kind: "zodiac", symbol: "♒" },
      body: "",
      facts: [
        { label: "Lord", value: "Saturn" },
        { label: "Element", value: "Air" },
        { label: "Modality", value: "Fixed (Sthira)" },
        { label: "Polarity", value: "Odd (male)" },
        ...fnFacts(11),
      ],
      traits: {
        positive: [
          { label: "Out of the box", weight: "big" },
          { label: "Serves the collective", weight: "medium" },
          { label: "Marches to own drum", weight: "medium" },
          { label: "Systems thinker", weight: "small" },
          { label: "Treats all as equals", weight: "small" },
        ],
        negative: [
          { label: "Emotionally distant", weight: "big" },
          { label: "Contrarian streak", weight: "medium" },
          { label: "Hard to get along", weight: "medium" },
          { label: "Fixed ideas", weight: "small" },
          { label: "Rebels on reflex", weight: "small" },
        ],
      },
    },
    {
      title: "Pisces",
      sanskrit: "Meena",
      accentColor: PLANET_COLORS.jupiter,
      icon: { kind: "zodiac", symbol: "♓" },
      body: "",
      facts: [
        { label: "Lord", value: "Jupiter" },
        { label: "Element", value: "Water" },
        { label: "Modality", value: "Dual (Dvisvabhava)" },
        { label: "Polarity", value: "Even (female)" },
        ...fnFacts(12),
      ],
      traits: {
        positive: [
          { label: "Empathic sponge", weight: "big" },
          { label: "Dreamweaver", weight: "medium" },
          { label: "Mystic pull", weight: "medium" },
          { label: "Sixth sense", weight: "small" },
          { label: "Quiet healer", weight: "small" },
        ],
        negative: [
          { label: "Escape hatch", weight: "big" },
          { label: "No edges", weight: "medium" },
          { label: "Self-inflicting suffering", weight: "medium" },
          { label: "Self-deceiving", weight: "small" },
          { label: "Swallowed by the tide", weight: "small" },
        ],
      },
    },
];

/** Concise Kalapurusha (Cosmic Man) body-part rulership per sign, Aries → Pisces,
    shown as a front "Body" fact row (owner-provided; the fuller description also
    opens on each card's back). Edit values here — they map to the cards in order. */
const BODY_PARTS = [
  "Head", // Aries
  "Face & neck", // Taurus
  "Shoulders & hands", // Gemini
  "Chest & breast", // Cancer
  "Heart & spine", // Leo
  "Lower abdomen & intestines", // Virgo
  "Lower back & kidneys", // Libra
  "Pelvis & genitals", // Scorpio
  "Hips, thighs & liver", // Sagittarius
  "Knees", // Capricorn
  "Calves & ankles", // Aquarius
  "Feet", // Pisces
];

export const zodiacs: Deck = {
  id: "zodiacs",
  title: "Zodiacs",
  subtitle: "Rashi",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  // inject a concise "Body" fact right before the ascendant-only Yogakaraka block
  cards: SIGN_CARDS.map((c, i) => {
    const facts = c.facts ?? [];
    const at = facts.findIndex((f) => f.label === "Yogakaraka");
    const cut = at < 0 ? facts.length : at;
    const withBody = [
      ...facts.slice(0, cut),
      { label: "Body", value: BODY_PARTS[i] },
      ...facts.slice(cut),
    ];
    return { ...c, facts: withBody, footnote: LAGNA_FN_NOTE };
  }),
};
