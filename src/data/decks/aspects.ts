/* Aspects — Drishti. A concept deck. Content from
   planetary_aspects_flashcards.md: the universal 7th aspect, the three
   special-aspect planets (Mars 4/8, Jupiter 5/9, Saturn 3/10), the nodes,
   how to read aspect strength, and mutual aspects / sambandha.
   FRONT facts (label/value) → `facts`; BACK notes → `points`.

   The Rahu–Ketu aspects are framed as DISPUTED, with the app's chosen
   convention stated (Rahu 5/9, Ketu none — matches the engine's DRISHTI
   table, owner-directed). The partial-strength fractions are classical
   study values, not an engine computation. */
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
      facts: [
        { label: "Cast by", value: "Every planet" },
        { label: "Aspect", value: "7th from itself (180°)" },
        { label: "Strength", value: "Full (100%)" },
        { label: "Only aspect for", value: "Sun, Moon, Mercury, Venus" },
      ],
      points: [
        "Every planet fully “looks at” the sign directly opposite it",
        "This single aspect handles the majority of chart reading",
        "Sun, Moon, Mercury, and Venus have no special aspects — only this 7th glance",
        "A planet's aspect projects its own nature onto the aspected house and any planet sitting there",
      ],
    },
    {
      title: "Mars · Special",
      sanskrit: "Mangala",
      badge: "4 · 8",
      accentColor: PLANET_COLORS.mars,
      icon: { kind: "planet", id: "mars" },
      body: "",
      facts: [
        { label: "Aspects", value: "4th, 7th, 8th" },
        { label: "Degrees", value: "90°, 180°, 210°" },
        { label: "Strength", value: "Full (100%) on all three" },
      ],
      points: [
        "Energizing but aggressive — Mars's gaze agitates, pushes, can inflame or damage",
        "The 4th aspect can disturb home and emotional peace; the 8th touches conflict, obstacles, sudden events",
        "Treated as a harsh aspect unless Mars is well-placed",
        "Also casts the standard 7th aspect like every planet",
      ],
    },
    {
      title: "Jupiter · Special",
      sanskrit: "Guru",
      badge: "5 · 9",
      accentColor: PLANET_COLORS.jupiter,
      icon: { kind: "planet", id: "jupiter" },
      body: "",
      facts: [
        { label: "Aspects", value: "5th, 7th, 9th" },
        { label: "Degrees", value: "120°, 180°, 240°" },
        { label: "Strength", value: "Full (100%) on all three" },
      ],
      points: [
        "The most benefic, protective aspect — blesses and expands what it touches",
        "The 5th and 9th (both trikonas) bring wisdom, growth, fortune, and grace",
        "A house or planet aspected by Jupiter gains protection and good judgment",
        "Also casts the standard 7th aspect",
      ],
    },
    {
      title: "Saturn · Special",
      sanskrit: "Shani",
      badge: "3 · 10",
      accentColor: PLANET_COLORS.saturn,
      icon: { kind: "planet", id: "saturn" },
      body: "",
      facts: [
        { label: "Aspects", value: "3rd, 7th, 10th" },
        { label: "Degrees", value: "60°, 180°, 270°" },
        { label: "Strength", value: "Full (100%) on all three" },
      ],
      points: [
        "Restrictive and sobering — slows, delays, disciplines, and matures what it touches",
        "Demands effort, patience, and responsibility from the aspected house or planet",
        "Generally challenging unless Saturn is well-placed, but builds lasting structure",
        "Also casts the standard 7th aspect",
      ],
    },
    {
      title: "Rahu & Ketu · The Nodes",
      sanskrit: "Chhaya Graha",
      badge: "Disputed",
      accentColor: PLANET_COLORS.rahu,
      icon: { kind: "planet", id: "rahu" },
      body: "",
      facts: [
        { label: "Aspecting power", value: "Disputed" },
        { label: "This app", value: "Rahu 5th & 9th · Ketu none" },
        { label: "Other schools", value: "None at all, or Jupiter's 5/7/9" },
      ],
      points: [
        "Classical texts disagree on whether the shadow planets cast aspects",
        "Some astrologers assign them none; others give them Jupiter's 5/7/9 pattern",
        "This app's charts give Rahu the trinal 5th and 9th gaze and Ketu no aspects",
        "Neither node casts the 7th — so the always-opposite nodes never aspect each other",
        "Rahu's gaze amplifies, obsesses, and distorts; Ketu stays inward — detached, spiritualizing",
      ],
    },
    {
      title: "Aspect Strength",
      sanskrit: "Drishti Bala",
      badge: "Full · partial",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Full (100%)", value: "7th + each planet's special pair" },
        { label: "Partial · 4th/8th", value: "75% (older texts)" },
        { label: "Partial · 5th/9th", value: "50% (older texts)" },
        { label: "Partial · 3rd/10th", value: "25% (older texts)" },
        { label: "Counting", value: "Whole sign; nearer the exact degree = stronger" },
      ],
      points: [
        "In practice, just use the full (100%) aspects; the partials can be ignored",
        "A planet aspects the entire sign, but the nearer it sits to the exact aspect degree, the more potent the effect",
        "Example: Saturn at 12° Leo onto Moon at 13° Libra ≈ 61° — almost the exact 60° (3rd aspect), so very strong",
        "A planet at the far edge of the aspected sign is still aspected, just more weakly",
      ],
    },
    {
      title: "Mutual Aspects & Sambandha",
      sanskrit: "Sambandha",
      badge: "Two-way",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "One-way aspect", value: "Influence flows in a single direction" },
        { label: "Mutual aspect", value: "Both planets fully aspect each other" },
        { label: "Sambandha", value: "A shared bond between two planets" },
      ],
      points: [
        "One-way example: Mars in the 10th aspects the Sun in the 1st (its 4th aspect), but the Sun (7th only) does not look back",
        "When two planets fully aspect each other, their energies cross-fertilize — a richer, more complex blend",
        "A mutual full aspect creates sambandha (Sanskrit: shared bond)",
        "Sambandha also forms by sign exchange (parivartana), or when planet A aspects B while B occupies A's sign",
      ],
    },
  ],
};
