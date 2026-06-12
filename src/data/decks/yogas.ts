/* Yogas — planetary combinations. Full content from yogas-flashcards.md
   (owner-provided): Raja yogas, Parivartana, Pancha Mahapurusha, Dhana yogas,
   Budhaditya, Neecha Bhanga, and the Grahana (eclipse) family. FRONT = facts
   (the core rule), BACK = points (examples and finer detail); no em-dashes,
   matching the source. Card order follows the source's section order. The
   numbered Neecha Bhanga conditions (1-7) are preserved verbatim: these cards
   double as the spec for the yoga computation engine (next phase), so the
   rules must stay exact. Planet-pair yogas use the conjunction icon; the
   Grahana overview uses Rahu's eclipse body. English gloss subtitles were
   removed (owner-directed: the yogas aren't known by those names) — only
   genuinely Sanskrit subtitles remain. The chart's per-planet yoga pills
   link here by card title (flashcardLink.ts → "yoga"). */
import type { Deck } from "./types";
import { ACCENT } from "@/lib/design/colors";
import { PLANET_NAMES, SIGN_NAMES, SIGN_RULER, EXALTATION, DEBILITATION } from "@/core/constants";
import type { PlanetKey } from "@/core/types";

/* "Resolved rescuers per debilitated planet" (the Neecha Bhanga card's back) —
   GENERATED from the engine's validated dignity tables so the card can never
   drift from the chart: dispositor = lord of the debilitation sign;
   exaltation-lord = lord of the sign where the planet exalts; exalted
   occupant = the planet exalted in the debilitation sign (none exalts in
   Scorpio, so the Moon's row has none). */
const SEVEN: PlanetKey[] = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"];
function rescuerRow(p: PlanetKey): string {
  const debSign = DEBILITATION[p]!;
  const dispositor = SIGN_RULER[debSign - 1];
  const exaltLord = SIGN_RULER[EXALTATION[p]! - 1];
  const occupant = SEVEN.find((q) => EXALTATION[q] === debSign);
  return (
    `${PLANET_NAMES[p]} (${SIGN_NAMES[debSign - 1]})` +
    ` · Dispositor: ${PLANET_NAMES[dispositor]}` +
    ` · Exaltation-lord: ${PLANET_NAMES[exaltLord]}${exaltLord === p ? " (self)" : ""}` +
    ` · Exalted occupant: ${occupant ? PLANET_NAMES[occupant] : "None"}`
  );
}

export const yogas: Deck = {
  id: "yogas",
  title: "Yogas",
  subtitle: "Planetary Combinations",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  cards: [
    // ---- Raja Yogas ----
    {
      title: "Raja Yoga (Core)",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Union of", value: "A Kendra lord + a Trikona lord" },
        {
          label: "By",
          value: "Conjunction · mutual aspect · exchange (parivartana)",
        },
        {
          label: "Blends",
          value: "The angular house's drive with the trinal house's grace and intelligence",
        },
        { label: "Rank", value: "Among the most auspicious yogas in a chart" },
        {
          label: "Exchange form",
          value: "A Kendra-Trikona exchange is also called Maha Parivartana Yoga",
        },
      ],
      points: [
        "Lord-pair examples (illustrations, not the rule itself):",
        "1 + 5: self-initiative with intelligence; creative leadership, charisma, inspiring others",
        "1 + 9: identity with spiritual destiny; higher purpose, philosophy, dharma",
        "4 + 5: emotional grounding through intellect or art; education, psychology, counseling",
        "4 + 9: spiritual grace in the home; stable, sometimes sacred domestic life",
        "7 + 5: entrepreneurship, romantic unions, creative collaborations",
      ],
    },
    {
      title: "Raja Yoga (Activation & Strength)",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Principle", value: "The union only sets the stage" },
        {
          label: "Delivery depends on",
          value: "The house it occupies · the dignity of the planets involved",
        },
      ],
      points: [
        "10th house union: career breakthroughs",
        "9th house union: spiritual insight",
        "Exalted or own sign: amplified, constructive results",
        "Debilitated or enemy sign: struggles, delays, lessons",
        "A benefic aspect, especially Jupiter's, amplifies the yoga",
        "Dasha and transit timing decide when it activates",
      ],
    },
    // ---- Parivartana Yogas ----
    {
      title: "Parivartana Yoga",
      icon: { kind: "conjunction", a: "mars", b: "sun" },
      body: "",
      facts: [
        {
          label: "Rule",
          value: "Two planets exchange signs, each sitting in the sign the other rules (mutual reception)",
        },
        {
          label: "Creates",
          value: "An energetic bond between the two houses · strong mutual influence",
        },
        {
          label: "Outcome",
          value: "The houses involved decide whether it is fortunate or difficult",
        },
      ],
      points: [
        "Example: Mars in Leo (ruled by the Sun) and the Sun in Scorpio (ruled by Mars)",
        "Auspicious houses, a Kendra with a Trikona: this is Maha Parivartana Yoga (its own card)",
        "A Dusthana with a Kendra or Trikona: begins with struggle or delay, then becomes success through persistence and inner growth",
        "A Dusthana with a Dusthana (e.g. 6th lord in the 8th, 8th lord in the 6th): profound, intense transformation, marked by hard lessons",
      ],
    },
    {
      title: "Maha Parivartana Yoga",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        {
          label: "Rule",
          value: "A Kendra lord and a Trikona lord exchange signs",
        },
        { label: "Nature", value: "The auspicious form of Parivartana" },
        {
          label: "Brings",
          value: "A sudden rise in status · material wealth · support from powerful people · karmic rewards from past efforts",
        },
      ],
      points: [
        "See also Raja Yoga: a Kendra-Trikona exchange is at the same time a Raja Yoga, since exchange is one of the three Raja Yoga union modes",
      ],
    },
    // ---- Pancha Mahapurusha Yoga ----
    {
      title: "Pancha Mahapurusha Yoga",
      icon: { kind: "chart", house: 1 },
      body: "",
      facts: [
        {
          label: "Rule",
          value: "A non-luminary in own sign or exaltation, in a Kendra (1, 4, 7, 10)",
        },
        { label: "Mars", value: "Ruchaka" },
        { label: "Mercury", value: "Bhadra" },
        { label: "Jupiter", value: "Hamsa" },
        { label: "Venus", value: "Malavya" },
        { label: "Saturn", value: "Sasa" },
      ],
      points: [
        "Ruchaka (Mars): courage, action, boldness",
        "Bhadra (Mercury): intellect, eloquence, versatility",
        "Hamsa (Jupiter): wisdom, integrity, spiritual strength",
        "Malavya (Venus): grace, beauty, material enjoyment",
        "Sasa (Saturn): discipline, endurance, mastery",
        "Note: assess the Kendras from the Lagna and also from the Moon (Chandra lagna). This chart's automatic detection flags Lagna Kendras only, so check the Moon count yourself",
      ],
    },
    // ---- Dhana Yogas ----
    {
      title: "Gaja Kesari Yoga",
      icon: { kind: "conjunction", a: "jupiter", b: "moon" },
      body: "",
      facts: [
        {
          label: "Rule",
          value: "Jupiter conjunct the Moon, or Jupiter in a Kendra from the Moon",
        },
        {
          label: "Counted from",
          value: "The Moon: houses 1, 4, 7, or 10",
        },
        {
          label: "Gives",
          value: "Emotional intelligence · financial stability · societal recognition",
        },
      ],
      points: [
        "Jupiter's benefic strength supports the Moon's mind, lending wisdom and public standing",
      ],
    },
    {
      title: "Venus & Mercury Conjunction",
      sanskrit: "Śukra · Budha",
      icon: { kind: "conjunction", a: "venus", b: "mercury" },
      body: "",
      facts: [
        { label: "Rule", value: "Venus and Mercury joined" },
        { label: "Best in", value: "The 2nd, 5th, 9th, or 11th house" },
        {
          label: "Promotes",
          value: "Success through art, communication, intellect, or commerce",
        },
      ],
      points: [
        "Often points to profitable work in beauty, media, or business",
      ],
    },
    {
      title: "Dhana Yoga (2nd & 11th Lords)",
      icon: { kind: "chart", house: 2 },
      body: "",
      facts: [
        {
          label: "Rule",
          value: "The 2nd and 11th lords in mutual aspect, conjunction, or occupying each other's houses",
        },
        {
          label: "Signals",
          value: "Continuous income · multiple revenue streams · material growth",
        },
      ],
      points: [
        "The classic wealth pairing: the 2nd (accumulated wealth) linked with the 11th (gains and income)",
      ],
    },
    {
      title: "Lakshmi Yoga",
      icon: { kind: "chart", house: 9 },
      body: "",
      facts: [
        {
          label: "Rule",
          value: "The 9th lord in its own sign or exalted, placed in a Kendra or Trikona",
        },
        { label: "Plus", value: "A strong ascendant lord" },
        {
          label: "Brings",
          value: "Wealth through dharma, grace, and karmic merit",
        },
      ],
      points: [
        "Associated with fortune and lasting prosperity earned through righteous action",
      ],
    },
    // ---- Budhaditya Yoga ----
    {
      title: "Budhaditya Yoga",
      sanskrit: "Budha + Āditya",
      icon: { kind: "conjunction", a: "sun", b: "mercury" },
      body: "",
      facts: [
        { label: "Rule", value: "The Sun and Mercury conjunct" },
        {
          label: "Sweet spot",
          value: "6° to 14° apart: close enough to blend, far enough that Mercury escapes combustion",
        },
        {
          label: "Hallmark",
          value: "Discernment: cutting through illusion to align with deeper truths",
        },
        { label: "More auspicious in", value: "A Kendra or Trikona" },
      ],
      points: [
        "Common, in roughly 40% of charts, since Mercury never strays far from the Sun",
        "The truly effective version, where both planets are strong and unafflicted, is much rarer",
        "Jupiter aspect: wisdom, ethics, expanded scope",
        "Venus aspect: creativity, social grace",
        "Saturn aspect: delays, but discipline, depth, longevity",
        "Mars aspect: debate, technical or engineering skill, sometimes aggressive speech",
        "Rahu or Ketu aspect: unconventional paths, foreign links, research into hidden subjects",
      ],
    },
    // ---- Neecha Bhanga Raja Yoga ----
    {
      title: "Neecha Bhanga Raja Yoga",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        {
          label: "Meaning",
          value: "Cancellation of debilitation: a debilitated planet is rescued, and its weakness can turn into strength",
        },
        {
          label: "Rescuers",
          value: "Dispositor (debilitation-sign lord) · exaltation-lord (lord of the sign where it exalts) · exalted occupant (the planet exalted in the debilitation sign)",
        },
      ],
      // the numbered conditions live on the BACK (scrollable) — the front was
      // clipping; the chart's per-condition pills land here via prefix-matched
      // point highlight ("Major 3-4" etc., flashcardLink.ts)
      points: [
        "Major 1-2: Dispositor conjunct the planet, or in a Kendra from Lagna or Moon",
        "Major 3-4: Exaltation-lord conjunct the planet, or in a Kendra from Lagna or Moon",
        "Major 5: Exalted occupant conjunct the planet",
        "Minor 6-7: Dispositor or exaltation-lord aspects the planet",
        "Saturn debilitated in Aries; Mars, the Aries lord, sits with it (1) or sits in a Kendra (2)",
        "Saturn debilitated in Aries is exalted in Libra; Venus, the Libra lord, sits with it (3) or sits in a Kendra (4)",
        "Mercury debilitated in Pisces; Venus, which is exalted in Pisces, sits with it (5)",
        "Cancellation does not guarantee a full Raja Yoga: the rescuer ideally avoids ties to the 6th, 8th, or 12th, and dignity plus dasha decide the real outcome",
        "Disambiguation: conditions 3 and 4 key off the exaltation sign's lord, while condition 5 keys off the planet exalted in the debilitation sign. Different lookups that can coincidentally both land on the same planet",
        "Resolved rescuers per debilitated planet:",
        ...SEVEN.map(rescuerRow),
        "Moon in Scorpio has no exalted occupant, since nothing exalts in Scorpio. For Mercury, the exaltation-lord is Mercury itself, so the exaltation-lord conditions do not apply",
      ],
    },
    // ---- Grahana Yoga ----
    {
      title: "Grahana Yoga (Overview)",
      icon: { kind: "planet", id: "rahu" },
      body: "",
      facts: [
        {
          label: "Rule",
          value: "A luminary (Sun or Moon) afflicted by a node (Rahu or Ketu) in the same sign",
        },
        { label: "Also called", value: "Grahan Dosha" },
        { label: "Purna (complete)", value: "Within 5°: strongest" },
        { label: "Strong", value: "Within 10°" },
        { label: "Mild", value: "Same sign, more than 10° apart" },
        {
          label: "Base pairs",
          value: "Sun + Rahu · Sun + Ketu · Moon + Rahu · Moon + Ketu",
        },
      ],
      points: [
        "Eight combinations are possible: the four base pairs; Sun, Moon, and Rahu together (new moon); Sun, Moon, and Ketu together (new moon); Sun with Rahu while the Moon is with Ketu (full moon); Sun with Ketu while the Moon is with Rahu (full moon)",
        "Closer degrees mean a more intimate blending of energies (Phaladeepika): a 3° conjunction behaves very differently from a 15° one, though both form the yoga",
        "Jupiter's moderation: when Jupiter conjoins or aspects the combination, its grace softens the dosha, reducing destructive expression and channeling the node's energy more constructively. Jupiter's aspect purifies and protects",
        "Eclipse layer: an actual eclipse is tighter and degree-based, not sign-based. A solar eclipse needs the Sun within about 18° of a node; a lunar eclipse needs the Moon within about 12°. This can be surfaced as a separate, stronger flag on top of the yoga",
      ],
    },
    {
      title: "Grahana: Moon & Rahu",
      icon: { kind: "conjunction", a: "moon", b: "rahu" },
      body: "",
      facts: [
        {
          label: "Dynamic",
          value: "The Moon perceives; Rahu blurs perception",
        },
        {
          label: "Struggle",
          value: "Separating their own sense of self from the world outside",
        },
        {
          label: "Nature",
          value: "Out of the ordinary · magnetic · often psychic or intuitive",
        },
        {
          label: "Key",
          value: "Develops the energy well with grounding, or swings to extremes without it",
        },
      ],
      points: [
        "At best: groundbreaking, popular, hypnotic, deeply perceptive",
        "At worst: emotionally unstable, “drunk on their karma,” giving themselves over to chaos",
        "Care: balanced eating, avoiding what poisons the mind, and caution with company, since they readily absorb the qualities of those around them",
        "Rahu shows what they are meant to focus on this life; they reach it only by learning not to swing to extremes, ideally with a balanced presence nearby",
      ],
    },
    {
      title: "Grahana: Moon & Ketu",
      icon: { kind: "conjunction", a: "moon", b: "ketu" },
      body: "",
      facts: [
        {
          label: "Dynamic",
          value: "Ketu's paradox: unbounded, yet fixated on minute detail",
        },
        {
          label: "At best",
          value: "Deep spiritual and psychic perception",
        },
        {
          label: "At worst",
          value: "Escapism · over-fixation on the self",
        },
        {
          label: "Nature",
          value: "Very sensitive; takes things personally and seriously",
        },
      ],
      points: [
        "Skilled at “it,” but without external validation for it",
        "Asked to flow with emotions such as grief, loss, or being hurt, yet struggles to express them in a healthy way",
        "The Moon is the capacity to perceive the world, and this person is often “off in another land”",
        "The aim is balance: fully present when present, free to lose themselves in meditation when there",
      ],
    },
    {
      title: "Grahana: Sun & Rahu",
      icon: { kind: "conjunction", a: "sun", b: "rahu" },
      body: "",
      facts: [
        {
          label: "Dynamic",
          value: "The Sun's drive to build personality and intelligence meets Rahu, a domain undeveloped in past lives",
        },
        {
          label: "Appears",
          value: "Magnetic, confident, and articulate, as if they already know",
        },
        {
          label: "Shadow",
          value: "May share little of real value while trying to prove their magnetism",
        },
        {
          label: "Meant to",
          value: "Develop genuine individuality and creativity",
        },
      ],
      points: [
        "Inventive and clever; the work is to aim that at helping others rather than self-display",
        "The Sun's need for validation turns into a need to prove it, masking insecurity and overcompensation",
        "They benefit from a guide who has truly developed their own individuality",
        "Sun in Aries (exalted): retains strength; ambitious, pioneering, with unconventional methods",
        "Sun in Libra (debilitated): struggles more; identity confusion and authority issues",
        "Rahu in comfortable signs (Gemini, Virgo, Aquarius): the distorting effect is moderated",
      ],
    },
    {
      title: "Grahana: Sun & Ketu",
      icon: { kind: "conjunction", a: "sun", b: "ketu" },
      body: "",
      facts: [
        {
          label: "Dynamic",
          value: "A strong capacity to transcend the ego, moving beyond body and mind",
        },
        {
          label: "Fine line",
          value: "Genuine spiritual realization vs being unmoored",
        },
        {
          label: "Pattern",
          value: "Accomplishes much yet feels something is always missing",
        },
      ],
      points: [
        "They chase a perfection that keeps receding, since karma is infinite and there is always a reason to claim suffering",
        "The work is to ask who the “I” really is: you are not the doer, life flows through you",
        "Looked up to in past lives, they may hold leadership now but draw no satisfaction from it",
        "Attachment to ego and external validation breeds suffering, which is exactly what this placement is built to dissolve",
        "Let go of the doubts",
      ],
    },
  ],
};
