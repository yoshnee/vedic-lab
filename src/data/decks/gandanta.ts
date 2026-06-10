/* Gandanta — a concept deck on the karmic "knots" where a water sign dissolves
   into the following fire sign. Content from gandanta_flashcards.md: FRONT = compact
   facts, BACK = points. The three junctions (Pisces→Aries, Cancer→Leo, Scorpio→Sag)
   are each the last pada of a Mercury-ruled water nakshatra (Revati / Ashlesha /
   Jyeshtha) handing off to the first pada of a Ketu-ruled fire nakshatra (Ashwini /
   Magha / Mula) — Mercury being the 9th/last and Ketu the 1st Vimshottari lord, so
   the dasha cycle resets at the knot. (Rulers verified against src/core/constants.ts.) */
import type { Deck } from "./types";
import { ACCENT } from "@/lib/design/colors";

export const gandanta: Deck = {
  id: "gandanta",
  title: "Gandanta",
  subtitle: "Karmic Knots",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  cards: [
    {
      title: "What Gandanta Is",
      sanskrit: "Gaṇḍānta",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Name", value: "ganda “knot” + anta “end” → “the knot of the end”" },
        { label: "Nature", value: "A highly sensitive zodiac junction" },
        { label: "Where", value: "A water sign dissolves and a fire sign begins" },
      ],
      points: [
        "A karmic threshold — among the most spiritually charged degrees of the zodiac",
        "Marks the meeting of an ending and a beginning: dissolution giving way to ignition",
        "Falls exactly at the water-sign / fire-sign boundaries",
        "Treated as volatile, transformative, and karmically loaded",
      ],
    },
    {
      title: "The Three Junctions",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Junction 1", value: "Pisces → Aries" },
        { label: "Junction 2", value: "Cancer → Leo" },
        { label: "Junction 3", value: "Scorpio → Sagittarius" },
      ],
      points: [
        "Pisces → Aries: last pada of Revati (water) into the first pada of Ashwini (fire)",
        "Cancer → Leo: last pada of Ashlesha (water) into the first pada of Magha (fire)",
        "Scorpio → Sagittarius: last pada of Jyeshtha (water) into the first pada of Mula (fire)",
        "The zone runs 28°20′ of the water sign to 1°40′ of the fire sign — 1°40′ either side of the boundary, 3°20′ in all",
        "The knot is tightest right at the exact boundary — within ±48′ it reads as deep gandanta",
        "Exact width varies by school — some flag the full junction padas (3°20′ either side)",
      ],
    },
    {
      title: "The Mercury-to-Ketu Handoff",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Pattern", value: "The same nakshatra-ruler handoff every time" },
        { label: "Handoff", value: "Water-enders = Mercury → fire-starters = Ketu" },
      ],
      points: [
        "Revati, Ashlesha, and Jyeshtha (the water ends) are all Mercury-ruled — Mercury is the 9th and final lord of a Vimshottari cycle",
        "Ashwini, Magha, and Mula (the fire starts) are all Ketu-ruled — Ketu is the 1st lord, opening a new cycle",
        "So a gandanta is also where the dasha cycle resets: an ending lord (Mercury) handing off to a beginning lord (Ketu)",
        "This reinforces the “knot of the end” theme — a death-and-rebirth point built into the cycle itself",
      ],
    },
    {
      title: "Why It Matters — Karmic Knots",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Acts like", value: "Karmic knots" },
        { label: "Forces", value: "A rapid shift from water energy to fire energy" },
      ],
      points: [
        "Issues or patterns that are difficult to unravel, often tied to past-life or ancestral themes",
        "Water (emotional, intuitive, passive) gives way to fire (active, impulsive, creative)",
        "The soul is pushed to adapt quickly across the threshold",
        "Associated with turbulence, uncertainty, and intense spiritual growth",
      ],
    },
    {
      title: "Planets & Lagna in Gandanta",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Trigger", value: "A planet or the ascendant (Lagna) in a gandanta zone" },
        { label: "Effect", value: "Those areas of life feel the knot most" },
      ],
      points: [
        "The affected significations face turbulence, instability, or accelerated soul-growth",
        "The Moon and the Lagna in gandanta are the most emphasized placements",
        "The closer to the exact boundary, the more acute the effect",
        "Best read as an area calling for conscious work and remedy, not simply as “bad”",
      ],
    },
  ],
};
