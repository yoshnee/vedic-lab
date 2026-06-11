/* Shadbala — the six sources of planetary strength. Full content from
   shadbala_flashcards.md (owner-provided): the overview, the six balas, the
   BPHS minimums, Ishta/Kashta Phala, and how to read the numbers. FRONT =
   facts, BACK = points; em-dashes removed per the owner's request.
   The chart's per-planet Shadbala drawer (PlanetPanel) links its rows here by
   card title (flashcardLink.ts → "shadbala"). The engine computation is the
   Hora-Prakash reference's simplified scheme (src/core/shadbala.ts) — one
   deliberate content alignment: the source md said Sun/Moon Chesta is "always
   0"; the engine (per the reference) gives them their Ayana Bala as Chesta,
   so the card teaches that instead. */
import type { Deck } from "./types";
import { ACCENT } from "@/lib/design/colors";

export const shadbala: Deck = {
  id: "shadbala",
  title: "Shadbala",
  subtitle: "Six Strengths",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  cards: [
    {
      title: "What Shadbala Is",
      sanskrit: "Ṣaḍbala",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Name", value: "Shad + bala: six strengths" },
        { label: "Measures", value: "A planet's composite strength" },
        { label: "Unit", value: "Virupas (60 = 1 Rupa)" },
      ],
      points: [
        "Six components summed: Sthana, Dig, Kala, Chesta, Naisargika, Drik Bala",
        "60 Virupas = 1 Rupa",
        "Each planet has a minimum Rupa requirement (per BPHS) to count as strong",
        "Strength is not the same as a good outcome: whether that strength helps is a separate question (Ishta vs Kashta Phala)",
      ],
    },
    {
      title: "Sthana Bala",
      sanskrit: "Positional",
      badge: "01",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Source", value: "Where the planet sits in the zodiac" },
        { label: "Draws on", value: "Sign · exaltation degree · vargas · dignity" },
      ],
      points: [
        "Own sign (swakshetra) or exaltation (uccha) scores the highest Sthana Bala",
        "Pulls from multiple sub-factors, including divisional-chart placement and dignity",
        "Example: Jupiter in Sagittarius (own sign) scores near-maximum",
      ],
    },
    {
      title: "Dig Bala",
      sanskrit: "Directional",
      badge: "02",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Sun & Mars", value: "10th house (south)" },
        { label: "Jupiter & Mercury", value: "1st house (east)" },
        { label: "Moon & Venus", value: "4th house (north)" },
        { label: "Saturn", value: "7th house (west)" },
      ],
      points: [
        "Strength from direction: each planet has one favoured quadrant house",
        "Maximum at its sweet spot, falling to zero at the opposite house",
        "The further from its preferred angle, the weaker the directional power",
      ],
    },
    {
      title: "Kala Bala",
      sanskrit: "Temporal",
      badge: "03",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Source", value: "When the birth happened" },
        { label: "Day planets", value: "Sun · Jupiter · Venus" },
        { label: "Night planets", value: "Moon · Mars · Saturn" },
        { label: "Mercury", value: "Strong both day & night" },
      ],
      points: [
        "The most complex component, with several sub-balas",
        "Classically draws on hour, half of day, lunar fortnight, month, season, solstice period (Nathonnatha, Paksha, Tribhaga and more)",
        "This app computes the reference engine's reduced set: Nathonnatha (day/night) + Paksha (fortnight) + Ayana (solstice), so the chart's Kala number reflects those three",
      ],
    },
    {
      title: "Cheshta Bala",
      sanskrit: "Motional",
      badge: "04",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Source", value: "Motion: speed vs mean, and direction" },
        { label: "Retrograde", value: "Highly energised, highest score (60)" },
        { label: "Direct motion", value: "Above mean speed 45 · below 15" },
      ],
      points: [
        "Retrograde (vakri) reads as highly energised: the maximum Chesta Bala (60)",
        "In direct motion the engine scores by speed bracket: faster than its mean speed 45, slower than mean 15, near-stationary 30",
        "A retrograde Mars, moving against the current, scores highest",
        "Sun and Moon never retrograde; their Chesta is taken from their Ayana (solstice) strength instead, by classical design",
      ],
    },
    {
      title: "Naisargika Bala",
      sanskrit: "Natural",
      badge: "05",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Sun", value: "60.00 · 7 × 60⁄7" },
        { label: "Moon", value: "51.43 · 6×" },
        { label: "Venus", value: "42.86 · 5×" },
        { label: "Jupiter", value: "34.28 · 4×" },
        { label: "Mercury", value: "25.71 · 3×" },
        { label: "Mars", value: "17.14 · 2×" },
        { label: "Saturn", value: "8.57 · 1×" },
      ],
      points: [
        "Fixed, innate luminosity: the one component that never changes from chart to chart",
        "The whole table is just multiples of 60 ÷ 7 (about 8.57), stepping up one notch per rank (the reference rounds 4× to 34.28, which the engine keeps verbatim)",
        "A permanent ranking set by BPHS, shared by every horoscope",
        "Order, strongest to weakest: Sun, Moon, Venus, Jupiter, Mercury, Mars, Saturn",
        "The baseline every planet carries in",
      ],
    },
    {
      title: "Drik Bala",
      sanskrit: "Aspectual",
      badge: "06",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Source", value: "Net aspects received" },
        { label: "Benefic aspects", value: "Add strength" },
        { label: "Malefic aspects", value: "Subtract strength" },
      ],
      points: [
        "Benefic gazes (Jupiter, Venus, Mercury, the Moon) push Drik Bala positive; in this engine the Moon and Mercury count as benefic unconditionally, per the reference",
        "Malefic gazes (Sun, Saturn, Mars) pull it negative; Rahu and Ketu cast no shadbala drik",
        "It can go negative: a planet under net malefic pressure",
        "A negative value must never be clamped to zero; it carries real interpretive weight",
      ],
    },
    {
      title: "Minimum Strength Thresholds",
      sanskrit: "Parashara",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Mercury", value: "7 rupas (420 virupas)" },
        { label: "Sun · Jupiter", value: "6.5 rupas (390)" },
        { label: "Moon", value: "6 rupas (360)" },
        { label: "Venus", value: "5.5 rupas (330)" },
        { label: "Mars · Saturn", value: "5 rupas (300)" },
      ],
      points: [
        "BPHS defines a minimum total strength per planet",
        "Above it the planet counts as strong (Bal-Yukta); below, weak (Balaheena)",
        "Mercury demands the most; Mars and Saturn the least",
        "Compare each planet's total against its own bar, not a shared one",
      ],
    },
    {
      title: "Ishta & Kashta Phala",
      sanskrit: "Iṣṭa · Kaṣṭa",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Shadbala asks", value: "How strong?" },
        { label: "This pair asks", value: "Is the strength helping?" },
      ],
      points: [
        "Ishta Phala: the capacity to grant blessings; rises with brightness, speed, benefic dignity",
        "Kashta Phala: the capacity to create difficulty; rises with dimness, slowness, malefic pressure",
        "High Kashta does not mean an evil planet: it is carrying more weight than it can easily bear",
        "Healthiest: high Ishta relative to Kashta",
        "Strong with high Kashta reads as powerful but stressed: it acts, but not smoothly",
      ],
    },
    {
      title: "Reading the Numbers",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Step 1", value: "Add the six balas → total points (virupas)" },
        { label: "Step 2", value: "Divide by 60 → rupas" },
        { label: "Step 3", value: "Compare to that planet's pass mark" },
      ],
      points: [
        "Virupas are just points: a planet earns them from each of the six strength sources, and you add them all up",
        "60 points make 1 rupa, the way 100 cents make a dollar; a total of 360 virupas is 6 rupas",
        "Every planet has its own pass mark (the Sun needs 390 points, Mars only 300)",
        "Score above the pass mark: the planet is strong (Bal-Yukta). Below it: weak (Balaheena)",
        "The ratio is simply score ÷ pass mark: 1.15× means 15% above the bar, 0.80× means 20% short",
        "The chart grades the total in four tiers: Strong (20% or more above the pass mark) · Adequate (at or above it) · Borderline (within 10% below) · Weak (further short)",
        "That tier and the ratio are what the chart shows next to each planet's Shadbala",
      ],
    },
  ],
};
