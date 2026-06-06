/* Aspects — Drishti. A concept deck. Scaffolded with the universally
   agreed Parashari graha-drishti rules; bodies left empty.

   Seeded: every graha's full 7th aspect, plus the special aspects of
   Mars (4th & 8th), Jupiter (5th & 9th), Saturn (3rd & 10th).
   Intentionally NOT seeded (debated / separate systems): Rahu–Ketu
   aspects, and Jaimini rashi (sign) drishti — add later if wanted.
   Partial-aspect strengths (drishti bala) are computed values and must
   come from the reference repo, not invented here. */
import type { Deck } from "./types";
import { PLANET_COLORS, ACCENT } from "@/lib/design/colors";

export const aspects: Deck = {
  id: "aspects",
  title: "Aspects",
  subtitle: "Drishti",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  cards: [
    {
      title: "Full Aspect",
      sanskrit: "Saptama Drishti",
      badge: "All · 7th",
      icon: { kind: "diamond" },
      body: "",
    },
    {
      title: "Mars · Special",
      sanskrit: "Mangala",
      badge: "4 · 8",
      accentColor: PLANET_COLORS.mars,
      icon: { kind: "planet", id: "mars" },
      body: "",
    },
    {
      title: "Jupiter · Special",
      sanskrit: "Guru",
      badge: "5 · 9",
      accentColor: PLANET_COLORS.jupiter,
      icon: { kind: "planet", id: "jupiter" },
      body: "",
    },
    {
      title: "Saturn · Special",
      sanskrit: "Shani",
      badge: "3 · 10",
      accentColor: PLANET_COLORS.saturn,
      icon: { kind: "planet", id: "saturn" },
      body: "",
    },
  ],
};
