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
        "Computed straight from the longitude — which 3°20′ quarter it falls in",
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
        { label: "Pada 1", value: "Dharma — or Moksha" },
        { label: "Pada 2", value: "Artha — or Kama" },
        { label: "Pada 3", value: "Kama — or Artha" },
        { label: "Pada 4", value: "Moksha — or Dharma" },
      ],
      points: [
        "The four aims cycle through the padas — forward in one nakshatra, reversed in the next",
        "Ashwini runs Dharma → Artha → Kama → Moksha; Bharani reverses to Moksha → Kama → Artha → Dharma",
        "The alternation counts pada-less Abhijit, so Shravana restarts the forward cycle",
        "Every nakshatra still touches all four aims — only the order changes",
        "The purushartha colors how that planet pursues its agenda: purpose, wealth, desire, or liberation",
      ],
    },
    {
      title: "Padas & the Navamsa (D9)",
      sanskrit: "Navāṁśa · D9",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Each pada", value: "= one navamsa" },
        { label: "Count", value: "108 padas = 108 navamsas" },
        { label: "Bridge", value: "Nakshatra system → the D9 chart" },
      ],
      points: [
        "A planet's pada tells you its navamsa (D9) sign",
        "The navamsa is the most important divisional chart — it refines and stress-tests the natal promise",
        "Because padas and navamsas share the same 3°20′ grid, knowing the pada places the planet in D9",
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
        "It flags the planet's aim-of-life flavor — dharma, artha, kama, or moksha",
        "And it sets the planet's D9 sign, which is essential for any deeper analysis",
      ],
    },
  ],
};
