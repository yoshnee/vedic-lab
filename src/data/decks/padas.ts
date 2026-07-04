/* Nakshatra Padas — a small concept deck (not one card per pada). Content from
   nakshatra_padas_flashcards.md: FRONT = compact facts, BACK = points. A pada is
   a quarter of a nakshatra (3°20′); the four padas cycle through the four purusharthas
   (aims of life) — forward (Dharma → Artha → Kama → Moksha) in one nakshatra, reversed
   in the next (see PADA_PURUSHARTHAS in src/core/constants.ts, vendored from Komilla
   Sutton's "The Nakshatras: The Stars Beyond the Zodiac").

   The chart's placement-line `pada N (purushartha)` link opens the "The Four Padas
   & the Purusharthas" card and highlights the tapped pada's row (see
   src/lib/flashcardLink.ts → PADA_CONCEPT_CARD). The mapping card's fact labels
   are "Pada 1"…"Pada 4" — the resolver highlights by that exact label, so keep
   them in sync if the facts are edited. */
import type { Deck } from "./types";
import { ACCENT } from "@/lib/design/colors";

export const padas: Deck = {
  id: "padas",
  title: "Nakshatra Padas",
  subtitle: "Charaṇa · Quarters",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  cards: [
    {
      title: "What a Pada Is",
      sanskrit: "Pāda · Charaṇa",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Nakshatra", value: "13°20′ → 4 padas (quarters)" },
        { label: "Pada width", value: "3°20′" },
        { label: "Zodiac", value: "108 padas (27 × 4)" },
      ],
      points: [
        "A pada pinpoints where within a nakshatra a planet actually sits",
        "Computed straight from the longitude: which 3°20′ quarter it falls in",
        "The finest standard subdivision used in natal reading",
        "108 padas works out to 9 per sign (9 × 12 = 108)",
      ],
    },
    {
      title: "The Four Padas & the Purusharthas",
      sanskrit: "Puruṣārtha",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Pada 1", value: "Dharma or Moksha" },
        { label: "Pada 2", value: "Artha or Kama" },
        { label: "Pada 3", value: "Kama or Artha" },
        { label: "Pada 4", value: "Moksha or Dharma" },
      ],
      points: [
        "Every nakshatra's four padas touch all four aims of life; the order depends on the nakshatra",
        "Dharma: purpose and right action",
        "Artha: wealth and security",
        "Kama: desire and creativity",
        "Moksha: liberation",
        "The purushartha colors how that planet pursues its agenda: purpose, wealth, desire, or liberation",
      ],
    },
    {
      title: "The Alternating Cycle",
      sanskrit: "Puruṣārtha krama",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Odd nakshatras", value: "Dharma → Artha → Kama → Moksha" },
        { label: "Even nakshatras", value: "Moksha → Kama → Artha → Dharma" },
        { label: "From Shravana", value: "Parity flips (Abhijit counts)" },
      ],
      points: [
        "Ashwini (1st) runs forward: Dharma, Artha, Kama, Moksha; Bharani (2nd) reverses, so Bharani pada 2 is Kama",
        "The zigzag holds through Uttara Ashadha (21st)",
        "Pada-less Abhijit is next in the cycle, so Shravana restarts forward and the odd/even rule flips for the last six",
        "From Shravana on: Shravana, Shatabhisha and Uttara Bhadrapada run forward; Dhanishta, Purva Bhadrapada and Revati reverse",
      ],
    },
    {
      title: "Why Padas Matter",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Refines", value: "A planet's expression within its nakshatra" },
        { label: "Reveals", value: "Purushartha drive + navamsa placement" },
      ],
      points: [
        "Two planets in the same nakshatra but different padas express quite differently",
        "The pada narrows the nakshatra's broad traits down to a specific quarter",
        "It flags the planet's aim-of-life flavor: dharma, artha, kama, or moksha",
        "A planet's pada tells you its navamsa (D9) sign, because padas and navamsas share the same 3°20′ grid",
        "And it sets the planet's D9 sign, which is essential for any deeper analysis",
      ],
    },
  ],
};
