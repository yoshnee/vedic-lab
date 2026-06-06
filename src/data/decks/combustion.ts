/* Combustion (Asta) — a concept deck. Content from combustion_asta_flashcards.md.
   FRONT data → facts where it's tabular (orbs, tiers); FRONT + BACK detail → points.
   Each card's icon is the Sun engulfing a small dimmed planet (the combust body),
   with the trapped planet's color varied per card. */
import type { Deck } from "./types";
import { ACCENT } from "@/lib/design/colors";

export const combustion: Deck = {
  id: "combustion",
  title: "Combustion",
  subtitle: "Asta",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  cards: [
    {
      title: "What Combustion Is",
      sanskrit: "Asta",
      icon: { kind: "combust" },
      body: "",
      points: [
        "Combustion (asta): a planet sitting too close to the Sun",
        "General range: within about 10° on either side of the Sun",
        "Overwhelmed by the Sun's glare, the planet struggles to shine",
        "A combust planet can't fully protect or express its significations",
        "Its light is “burnt up” — the energy comes through muffled and weakened",
        "The Sun itself is never combust — it is the source of the glare",
        "Rahu and Ketu (shadow planets) are not counted for combustion",
      ],
    },
    {
      title: "Benefic vs Malefic",
      sanskrit: "Natural Nature",
      icon: { kind: "combust", planet: "jupiter" },
      body: "",
      points: [
        "The impact depends on the planet's natural nature",
        "Benefics: lose their sparkle and positive attributes",
        "Malefics: harsh edges soften, but their strengths dull too",
        "Venus combust → strain in relationship harmony and finances",
        "Jupiter combust → a fogged inner compass; blocked wisdom, growth, clarity",
        "Mars combust → loses its edge; assertiveness, energy, courage dimmed",
        "Saturn combust → discipline falters; procrastination, heaviness, resistance",
      ],
    },
    {
      title: "Combustion Orbs",
      sanskrit: "By Planet",
      icon: { kind: "combust", planet: "mercury" },
      body: "",
      facts: [
        { label: "Venus", value: "~8°" },
        { label: "Mars", value: "~10°" },
        { label: "Jupiter", value: "~10°" },
        { label: "Saturn", value: "~10°" },
        { label: "Mercury", value: "~1°" },
      ],
      points: [
        "Venus (~8°): affects love, pleasure, beauty, and financial matters",
        "Mars (~10°): energy and courage lose their edge",
        "Jupiter (~10°): wisdom clouded — the “fogging” feeling",
        "Saturn (~10°): resistance and difficulty fulfilling duties",
        "Mercury (~1°): hinders communication, analytical thinking, and clarity",
        "Mercury's tight orbit keeps it near the Sun, so a much smaller orb is used",
      ],
    },
    {
      title: "Tiers of Combustion",
      sanskrit: "Combust · Deep",
      icon: { kind: "combust", planet: "mars" },
      body: "",
      facts: [
        { label: "Combust", value: "Within the planet's orb" },
        { label: "Deep combust", value: "0–3° from the Sun" },
      ],
      points: [
        "In the general combust zone, the planet's glow is dimmed by the Sun's radiance",
        "Deep combustion (0–3°) is the most intense — the planet practically hugs the Sun",
        "Mercury is the outlier: its close orbit keeps it near the Sun, so a tighter orb applies",
      ],
    },
    {
      title: "Why It Matters",
      sanskrit: "Dasha & Strength",
      icon: { kind: "combust", planet: "saturn" },
      body: "",
      points: [
        "It dramatically alters how strongly a planet can express its energy",
        "Most pronounced during the combust planet's dasha (period)",
        "A combust planet feels muffled — its results come through weakened",
        "The effect peaks when that planet's dasha, or the Sun's influence, dominates the chart",
        "Exception: if the combust planet rules the current dasha, it stays the active agent of time — dimmed, yet still “in charge”",
      ],
    },
  ],
};
