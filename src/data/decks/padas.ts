/* Nakshatra Padas — a small concept deck (not one card per pada). Content from
   nakshatra_padas_flashcards.md: FRONT = compact facts, BACK = points. A pada is
   a quarter of a nakshatra (3°20′); the four padas run through the four purusharthas
   (aims of life) in the fixed order Dharma → Artha → Kama → Moksha, taken from the
   element of each pada's navamsa sign (fire/earth/air/water).

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
        { label: "Pada 1", value: "Dharma (fire)" },
        { label: "Pada 2", value: "Artha (earth)" },
        { label: "Pada 3", value: "Kama (air)" },
        { label: "Pada 4", value: "Moksha (water)" },
      ],
      points: [
        "The four padas always map to the four aims of life in this fixed order",
        "Each pada's purushartha comes from the element of its navamsa sign (fire / earth / air / water)",
        "It is fixed by pada number — pada 1 is always dharma, pada 4 always moksha, in every nakshatra",
        "Same fire → dharma, earth → artha, air → kama, water → moksha logic as the house purushartha grouping",
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
        "The element of that navamsa sign is what assigns the pada's purushartha",
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
