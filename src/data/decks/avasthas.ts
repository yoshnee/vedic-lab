/* Planetary States — Avasthas. A concept deck. Content from
   avasthas_flashcards (1).md (owner-provided update): what an avastha is,
   Baladi (by degree) with the karmic-fruition reading (per Ryan Kurczak) on
   its own "Reading Baladi" card, Jagradadi (by dignity, read by LORDSHIP),
   and Lajjitadi (six conditional moods, overview). FRONT facts → `facts`;
   BACK detail → `points`; em-dashes removed per the owner's request.

   The update drops the old per-age strength fractions entirely — Baladi now
   teaches maturity-of-karma, matching the engine's deliberate no-strength
   stance (core/avastha.ts computes states, never invented numbers). The
   Lajjitadi trigger conditions vary by source — any engine computation still
   follows the Hora-Prakash reference, not these cards. Card titles are load-
   bearing: flashcardLink.ts AVASTHA_CARDS resolves "The Five Ages" /
   "Awake, Dreaming, Sleeping" / "The Six Moods" / "What an Avastha Is". */
import type { Deck } from "./types";
import { ACCENT } from "@/lib/design/colors";

export const avasthas: Deck = {
  id: "avasthas",
  title: "Planetary States",
  subtitle: "Avasthas",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  cards: [
    {
      title: "What an Avastha Is",
      sanskrit: "Avastha",
      badge: "Overview",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Avastha", value: "“State” or condition of a planet" },
        { label: "Same sign", value: "Two planets there can behave very differently" },
        { label: "Systems", value: "Several exist, each reading a different factor" },
      ],
      points: [
        "A modifier on how strongly, and in what mood, a planet delivers its results",
        "Different systems read different inputs: degree (Baladi), dignity (Jagradadi), surrounding influences (Lajjitadi)",
        "This deck covers three core systems; others exist (Deeptadi, 9 states; Shayanadi, 12 postural states) and are deferred for now",
        "Always one modifier among many: read alongside dignity, house, and aspects, never as a verdict on its own",
      ],
    },
    {
      title: "The Five Ages",
      sanskrit: "Baladi Avastha",
      badge: "By degree",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Based on", value: "The planet's degree within its sign" },
        { label: "Bands", value: "Five 6° bands per 30° sign give an “age”" },
        { label: "Shows", value: "The state of karmic fruition of that placement" },
      ],
      points: [
        "Odd signs run youngest to oldest: Bala (infant) 0°–6° · Kumara (adolescent) 6°–12° · Yuva (adult) 12°–18° · Vriddha (old) 18°–24° · Mrita (dead) 24°–30°",
        "Even signs reverse it: Mrita 0°–6° … Bala 24°–30°",
        "The age scales potency: the infant has barely begun, the adult is full force, the old is waning, the dead is settled",
        "Sets only the maturity of the karma; its direction (help vs harm) comes from dignity: see the next card",
      ],
    },
    {
      title: "Reading Baladi",
      sanskrit: "Maturity × Dignity",
      badge: "How to read",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Two axes", value: "Decide what the karma does to the occupied house" },
        { label: "Dignity", value: "Direction: help or harm" },
        { label: "Age", value: "Maturity: how potent, how shapeable" },
      ],
      points: [
        "Dignity sets the direction toward the occupied house: good (exaltation, mooltrikona, own, great friend) helps it; average (friend, neutral) is mild or mixed; bad (enemy, great enemy, debilitation) harms it",
        "Bala (infant): karma just begun this life; least potent and most workable, attention and awareness can still shape it",
        "Kumara (adolescent): nearly mature; real force, but some room left to redirect with effort",
        "Yuva (adult): fully mature; maximum force, acts on its own, least resistible, like arguing with an adult",
        "Vriddha (old): past its peak, winding down",
        "Mrita (dead): already worked through across past lifetimes; the struggle is over, so it now comes naturally and effortlessly: mastered, not depleted",
        "Key arc: potency rises to adult then settles by dead; your power to reshape the karma is greatest at infant (still unformed) and least once it is adult (fully set) or dead (already resolved)",
      ],
    },
    {
      title: "Awake, Dreaming, Sleeping",
      sanskrit: "Jagradadi Avastha",
      badge: "By dignity",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Based on", value: "The planet's dignity (the sign it occupies)" },
        { label: "Asks", value: "Can it care for the affairs of the houses it rules?" },
      ],
      points: [
        "Jagrat (awake): exaltation or own sign; fully conscious, powerfully manages the affairs of the houses it rules",
        "Swapna (dreaming): neutral or friendly sign; semi-conscious and half-functional, tends those affairs only partially",
        "Sushupti (asleep): enemy or debilitation sign; unconscious, lacks the energy to maintain the affairs of the houses it rules",
        "Read by lordship, not placement: trace the planet to the house(s) it owns; those are the affairs that thrive or languish with its wakefulness",
        "e.g. a sleeping 12th lord can't keep up the 12th's business of managing expenses",
        "Not a final verdict: Lajjitadi (inter-planetary states, deck coming later) can prop up a sleeping ruler so its houses still get handled",
      ],
    },
    {
      title: "The Six Moods",
      sanskrit: "Lajjitadi Avastha",
      badge: "Conditional",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "What", value: "Six condition-based states describing a planet's mood" },
        { label: "Why prized", value: "Show whether a planet's house delivers happily or painfully" },
      ],
      points: [
        "Garvita (proud): in exaltation or mooltrikona",
        "Mudita (delighted): in a friend's sign, or joined / aspected by Jupiter or a friend",
        "Lajjita (ashamed): in the 5th house with Rahu/Ketu, Sun, Saturn, or Mars",
        "Kshudhita (hungry): in an enemy's sign, or joined / aspected by an enemy",
        "Trishita (thirsty): in a watery sign, aspected by a malefic and not by a benefic",
        "Kshobhita (agitated): combust (with the Sun) and joined / aspected by a malefic or enemy",
        "More conditional than Baladi or Jagradadi (needs conjunctions, aspects, house, sign element)",
        "Trigger conditions vary by source: when computed, follow the reference implementation (Hora Prakash)",
      ],
    },
  ],
};
