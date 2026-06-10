/* Gandanta — a concept deck on the karmic "knots" where a water sign dissolves
   into the following fire sign. Content from gandanta_flashcards.md: FRONT = compact
   facts, BACK = points. The three junctions (Pisces→Aries, Cancer→Leo, Scorpio→Sag)
   are each the last pada of a Mercury-ruled water nakshatra (Revati / Ashlesha /
   Jyeshtha) handing off to the first pada of a Ketu-ruled fire nakshatra (Ashwini /
   Magha / Mula) — Mercury being the 9th/last and Ketu the 1st Vimshottari lord, so
   the dasha cycle resets at the knot. (Rulers verified against src/core/constants.ts.)
   The soul-stage card ("Three Knots, Three Soul Stages"), the named gandanta types
   (nakshatra ±48′ / lagna ±14′ / tithi), the daśā-changeover-birth point, and the
   contrary-elements framing are sourced from Komilla Sutton (komilla.com/lib-gandanta).
   Zone math matches the engine's two tiers: flag = junction padas (GANDANTA_ORB,
   3°20′/side), deep = the 28°20′→1°40′ zone (GANDANTA_DEEP_ORB, 1°40′/side). */
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
        "“A knot within ourselves — a deep issue the soul is trying to reconcile” (Komilla Sutton)",
        "The only places where the solar zodiac (a sign) and the lunar zodiac (a nakshatra) end together",
        "Marks the meeting of an ending and a beginning: dissolution giving way to ignition",
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
        "Widest reading: the full junction padas — the water sign's last pada + the fire sign's first, 3°20′ either side (the chart's gandanta flag)",
        "Narrower reading: 28°20′ → 1°40′, just 1°40′ either side — the chart marks this “true gandanta” zone as deep",
        "Schools differ on the width; all agree the knot tightens toward the exact boundary",
      ],
    },
    {
      title: "Three Knots, Three Soul Stages",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Revati → Ashwini", value: "One soul cycle ends; a new journey begins" },
        { label: "Ashlesha → Magha", value: "The search ends; the soul turns to material life" },
        { label: "Jyeshtha → Mula", value: "The deepest knot — the turn toward liberation" },
      ],
      points: [
        "Pisces → Aries: the soul completes one full cycle of growth and stands at the threshold of the next",
        "Cancer → Leo: Ashlesha's serpent deities (the Nagas) shed the old skin — painful, but the only way to grow — before Magha's full step into material life",
        "Scorpio → Sagittarius: Jyeshtha churns the emotions until the material sheaths break; Mula — “the root” — must break through the crust to rise",
        "Sutton holds Jyeshtha → Mula the most difficult of the three; navigated consciously, it is said to awaken latent (kundalini) energy",
        "All three knots carry the past life across the threshold — the confusion of standing in two worlds at once",
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
        "A Moon-in-gandanta birth is therefore a daśā-changeover birth — the daśā flips right around birth, an unsettled opening chapter of life",
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
        "Fire heats water and water extinguishes fire — contrary elements, which is why the knot is volatile",
        "Yet the same friction makes it the zone of maximum spiritual development — the knot opens through conscious reconciliation",
        "The soul is pushed to adapt quickly across the threshold",
      ],
    },
    {
      title: "Planets & Lagna in Gandanta",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Trigger", value: "A planet or the ascendant (Lagna) in a gandanta zone" },
        { label: "Nakshatra gandanta", value: "The Moon within ±48′" },
        { label: "Lagna gandanta", value: "The ascendant within ±14′" },
        { label: "Tithi gandanta", value: "Born at the turn of a tithi" },
      ],
      points: [
        "The affected significations face turbulence, instability, or accelerated soul-growth — e.g. Venus in gandanta puts relationships and finances at the knot",
        "The Moon and the Lagna in gandanta are the most emphasized placements, with their own named (tighter) definitions",
        "The closer to the exact boundary, the more acute the effect — the chart's deep band (±1°40′)",
        "Best read as an area calling for conscious work and remedy, not simply as “bad”",
      ],
    },
  ],
};
