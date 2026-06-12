/* Planetary Groupings — the seven classical planets as three functional teams
   ("couple & throuple" cards): survival → comfort → achievement. Content from
   the owner's planetary_groupings_cards.md, VERBATIM (titles and back lines —
   don't reword; the hyphen and the "they isn't" phrasing are as provided).
   Each card shows its planets' symbols on BOTH faces (owner-directed "give it
   some rizz" — the planet reveal is deliberately not hidden; this overrode
   the earlier all-diamond quiz-style fronts) via the `planets` icon row +
   `backIcon`.

   HIDDEN from the landing flashcards grid (owner-directed) — registered so
   flashcardLink can resolve it; surfaced as the /chart Reading-Notes Planets
   step's deck refresher. */
import type { Deck } from "./types";
import { ACCENT } from "@/lib/design/colors";

export const planetaryGroupings: Deck = {
  id: "planetary-groupings",
  title: "Planetary Groupings",
  subtitle: "Couple & Throuple",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  hidden: true,
  cards: [
    {
      title: "Difficulty and Survival",
      icon: { kind: "planets", ids: ["mars", "saturn"] },
      backIcon: { kind: "planets", ids: ["mars", "saturn"] },
      body: "",
      points: [
        "Mars fixes dangers that are immediate and responds on instinct to prevent a difficulty.",
        "Saturn helps deal with unavoidable trouble and gives an individual the ability to persevere and endure.",
      ],
    },
    {
      title: "Comfort, Joy & Fulfillment",
      icon: { kind: "planets", ids: ["venus", "moon"] },
      backIcon: { kind: "planets", ids: ["venus", "moon"] },
      body: "",
      points: [
        "Venus knows what a person needs to thrive and where to go to get it.",
        "The Moon deals with emotional satisfaction and ability to discern - this is right, they isn't.",
      ],
    },
    {
      title: "Goals, Ambition, Achievement",
      icon: { kind: "planets", ids: ["sun", "jupiter", "mercury"] },
      backIcon: { kind: "planets", ids: ["sun", "jupiter", "mercury"] },
      body: "",
      points: [
        "Sun tells to whether we are confident, inspired, and have capacity to be steadfast.",
        "Jupiter is our sense of happiness, and pulls us towards what makes us happy.",
        "Mercury is the ability to practically manage situations. So even if we are not inspired, we know what the practical thing to do is.",
      ],
    },
  ],
};
