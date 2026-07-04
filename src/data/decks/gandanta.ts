/* Gandanta — a concept deck on the karmic "knots" where a water sign dissolves
   into the following fire sign. Content from gandanta_flashcards.md: FRONT = compact
   facts, BACK = points, except "The Three Knots" card, which consolidates the two
   old junction cards ("The Three Junctions" + "Three Knots, Three Soul Stages")
   onto a reusable TABBED back (one tab per water→fire junction, owner-directed
   2026-07). The three junctions (Pisces→Aries, Cancer→Leo, Scorpio→Sag)
   are each the last pada of a Mercury-ruled water nakshatra (Revati / Ashlesha /
   Jyeshtha) handing off to the first pada of a Ketu-ruled fire nakshatra (Ashwini /
   Magha / Mula) — Mercury being the 9th/last and Ketu the 1st Vimshottari lord, so
   the dasha cycle resets at the knot. (Rulers verified against src/core/constants.ts.)
   The soul-stage content (now the tabbed "The Three Knots" card), the named gandanta
   types (nakshatra ±48′ / lagna ±14′ / tithi), the daśā-changeover-birth point, and the
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
        "A karmic threshold, among the most spiritually charged degrees of the zodiac",
        "“A knot within ourselves, a deep issue the soul is trying to reconcile” (Komilla Sutton)",
        "The only places where the solar zodiac (a sign) and the lunar zodiac (a nakshatra) end together",
        "Marks the meeting of an ending and a beginning: dissolution giving way to ignition",
        "Treated as volatile, transformative, and karmically loaded",
      ],
    },
    {
      // Consolidates the old "The Three Junctions" + "Three Knots, Three Soul
      // Stages" cards onto one TABBED back (owner-directed 2026-07). Tab labels
      // use 3-letter sign codes so the three water→fire junctions fit the tab row
      // (full "Scorpio → Sagittarius" overflows a 3-up row); the bullets name the
      // nakshatras in full.
      title: "The Three Knots",
      sanskrit: "Gaṇḍānta",
      icon: { kind: "diamond" },
      body: "",
      tabsIntro:
        "The karmic knots where water meets fire. Widest reading: the water sign's last pada plus the fire sign's first, 3°20′ either side (the chart's gandanta flag). Narrower reading: 28°20′ → 1°40′, just 1°40′ either side.",
      tabs: [
        {
          label: "Pis → Ari",
          bullets: [
            "Last pada of Revati (water) into first pada of Ashwini (fire)",
            "The soul completes one full cycle of growth and stands at the threshold of the next",
          ],
        },
        {
          label: "Can → Leo",
          bullets: [
            "Last pada of Ashlesha (water) into first pada of Magha (fire)",
            "Ashlesha's serpent deities shed the old skin (painful, but the only way to grow) before Magha's full step into material life",
          ],
        },
        {
          label: "Sco → Sag",
          bullets: [
            "Last pada of Jyeshtha (water) into first pada of Mula (fire)",
            "Jyeshtha churns the emotions until the material sheaths break; Mula, the root, must break through the crust to rise",
            "Sutton holds this the hardest of the three; navigated consciously, it is said to awaken deeper spiritual growth",
          ],
        },
      ],
    },
    {
      title: "The Mercury-to-Ketu Handoff",
      icon: { kind: "diamond" },
      body: "",
      hideBackTitle: true,
      points: [
        "Every gandanta follows the same nakshatra-ruler pattern: water-enders are Mercury-ruled, fire-starters are Ketu-ruled",
        "Revati, Ashlesha, Jyeshtha (water ends) to Ashwini, Magha, Mula (fire starts), opening a new cycle",
        "So a gandanta is also where the dasha cycle resets: an ending lord handing off to a beginning lord",
        "A Moon-in-gandanta birth is a dasha-changeover birth: the dasha flips right around birth, giving an unsettled opening chapter of life",
        "This builds the death-and-rebirth theme into the cycle itself: the knot of the end",
      ],
    },
    {
      title: "Why It Matters",
      icon: { kind: "diamond" },
      body: "",
      hideBackTitle: true,
      points: [
        "Karmic knots: issues or patterns difficult to unravel, often tied to past-life or ancestral themes",
        "A rapid shift from water energy (emotional, intuitive, passive) to fire energy (active, impulsive, creative)",
        "Fire heats water, water extinguishes fire: contrary elements make the knot volatile",
        "Yet that same friction makes it the zone of maximum spiritual development: the knot opens through conscious reconciliation",
      ],
    },
    {
      title: "Planets & Lagna in Gandanta",
      icon: { kind: "diamond" },
      body: "",
      hideBackTitle: true,
      facts: [
        { label: "Trigger", value: "A planet or the ascendant (Lagna) in a gandanta zone" },
        { label: "Nakshatra gandanta", value: "The Moon within ±48′" },
        { label: "Lagna gandanta", value: "The ascendant within ±14′" },
        { label: "Tithi gandanta", value: "Born at the turn of a tithi" },
      ],
      points: [
        "The affected significations face turbulence, instability, or accelerated soul-growth; e.g. Venus in gandanta puts relationships and finances at the knot",
        "The Moon and the Lagna in gandanta are the most emphasized placements, with their own named (tighter) definitions",
        "The closer to the exact boundary, the more acute the effect; within ±1°40′ the chart shows “True Gandanta”",
        "Best read as an area calling for conscious work and remedy, not simply as “bad”",
      ],
    },
  ],
};
