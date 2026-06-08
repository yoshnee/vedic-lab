/* Planetary States — Avasthas. A concept deck. Content from
   avasthas_flashcards.md: what an avastha is, then the three core systems
   — Baladi (by degree), Jagradadi (by dignity), Lajjitadi (six conditional
   moods). FRONT facts (label/value) → `facts`; BACK detail → `points`.

   Baladi degree-bands / strength fractions and the Lajjitadi trigger
   conditions are classical study values (and vary by source) — any engine
   computation of avasthas still follows the Hora-Prakash reference, not
   these cards. */
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
        "This deck covers three core systems; others exist (Deeptadi — 9 states; Shayanadi — 12 postural states) and are deferred for now",
        "Always one modifier among many — read alongside dignity, house, and aspects, never a verdict on its own",
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
        { label: "Bands", value: "Each 30° sign splits into five 6° bands" },
        { label: "Gives", value: "The planet an “age”" },
      ],
      points: [
        "Bala (infant) — ~¼ strength",
        "Kumara (child) — ~½ strength",
        "Yuva (youth / prime) — full strength",
        "Vriddha (old) — waning",
        "Mrita (dead) — nil",
        "In odd signs the ages run youngest → oldest (Bala 0–6° … Mrita 24–30°)",
        "In even signs the order reverses (Mrita 0–6° … Bala 24–30°)",
        "Strength fractions vary slightly by source",
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
        { label: "States", value: "Three — how “switched on” the planet is" },
      ],
      points: [
        "Jagrat (awake) — in exaltation or own sign → fully alert, delivers clearly",
        "Swapna (dreaming) — in a neutral or friendly sign → partial, dreamlike, inconsistent",
        "Sushupti (sleeping) — in an enemy or debilitation sign → dormant, results muted",
        "A fast read of whether a planet is actively engaged or asleep at the wheel",
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
        "Garvita (proud) — in exaltation or mooltrikona",
        "Mudita (delighted) — in a friend's sign, or joined / aspected by Jupiter or a friend",
        "Lajjita (ashamed) — in the 5th house with Rahu/Ketu, Sun, Saturn, or Mars",
        "Kshudhita (hungry) — in an enemy's sign, or joined / aspected by an enemy",
        "Trishita (thirsty) — in a watery sign, aspected by a malefic and not by a benefic",
        "Kshobhita (agitated) — combust (with the Sun) and joined / aspected by a malefic or enemy",
        "More conditional than Baladi or Jagradadi (needs conjunctions, aspects, house, sign element)",
        "Trigger conditions vary by source — when computed, follow the reference implementation (Hora Prakash)",
      ],
    },
  ],
};
