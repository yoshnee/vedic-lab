/* Dashas — Vimshottari Dasha, the app's timing system. Full content from
   vimshottari-dasha-flashcards.md (owner-provided): six concept cards (what
   it is · the 120-year cycle · the three timing layers · what makes a dasha
   deliver · marriage · career) + the nine Mahadasha cards in the source's
   order. FRONT = facts, BACK = points; no em-dashes. The 120-Year Cycle
   card's order/duration rows are GENERATED from the engine's validated
   DASHA_SEQUENCE (constants.ts — the table the live dasha rail runs on), so
   card and chart can never disagree. Mahadasha cards carry their planet's
   icon + accent (these ARE fixed planets, unlike the chara karakas).
   NB the owner's cards call the third level "Antara" (the chart rail labels
   it Pratyantar — same layer, both names are classical). */
import type { Deck, Card } from "./types";
import { ACCENT, PLANET_COLORS, type PlanetKey } from "@/lib/design/colors";
import { DASHA_SEQUENCE, PLANET_NAMES } from "@/core/constants";

/** The fixed cycle rows, straight from the engine's table. */
const CYCLE_FACTS = [
  ...DASHA_SEQUENCE.map(({ lord, years }) => ({
    label: PLANET_NAMES[lord],
    value: `${years} years`,
  })),
  { label: "Total", value: "120 years, then back to Ketu" },
];

/** A Mahadasha card: planet icon + identity accent, facts front, points back. */
function mahadasha(id: PlanetKey, years: number, facts: Card["facts"], points: string[]): Card {
  return {
    title: `${PLANET_NAMES[id as keyof typeof PLANET_NAMES]} Mahadasha`,
    sanskrit: `${years} years`,
    accentColor: PLANET_COLORS[id],
    icon: { kind: "planet", id },
    body: "",
    facts,
    points,
  };
}

export const dashas: Deck = {
  id: "dashas",
  title: "Vimshottari Dasha",
  subtitle: "Planetary Periods",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  cards: [
    {
      title: "What Is Vimshottari Dasha",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "What", value: "A 120-year planetary timing cycle, the main dasha system in Jyotish" },
        { label: "Structure", value: "Nine planets each rule a period (Mahadasha) in fixed order and length" },
        { label: "Effect", value: "The running planet brings its themes and houses to the foreground" },
        { label: "Start point", value: "Set by the Moon's nakshatra at birth" },
      ],
      points: [
        "Not a switch: it activates potential already in the chart, never new potential",
        "The same event lands differently in different periods",
        "Source: Brihat Parashara Hora Shastra; also the dasha system used in KP",
      ],
    },
    {
      title: "The 120-Year Cycle",
      icon: { kind: "diamond" },
      body: "",
      facts: CYCLE_FACTS,
      points: [
        "Order and lengths never change; only the entry point varies, set by the birth Moon's nakshatra",
        "The birth period's remaining years are proportional to how far the Moon has moved through its nakshatra",
        "Most lives hold only five to seven full periods; Rahu and Saturn alone span 37 years",
      ],
    },
    {
      title: "The Three Timing Layers",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Mahadasha", value: "The great period, 6 to 20 years" },
        { label: "Bhukti (Antardasha)", value: "The sub-period inside it" },
        { label: "Antara", value: "The sub-sub-period, where events crystallize" },
        {
          label: "Notation",
          value: "Stacked lords: “Moon-Moon” is the Moon Bhukti in the Moon Mahadasha; “Ketu-Sun-Moon” is Ketu maha, Sun bhukti, Moon antara",
        },
      ],
      points: [
        "The layers work as a team; a strong Mahadasha lord cannot force what the Bhukti lord denies",
        "All levels should point at the same houses, with a transit confirming the moment",
        "Events cluster at junctions between sub-periods",
        "KP adds finer levels, Sookshma and Prana, for exact dates",
      ],
    },
    {
      title: "What Determines Whether a Dasha Delivers",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Principle", value: "A dasha only delivers what the natal chart already promises" },
        { label: "Action", value: "It brings a promise forward, it does not create one" },
        { label: "Method", value: "Read chart and dasha together: find the promise, then the period that delivers it" },
      ],
      points: [
        "Two people in the same period can have opposite results",
        "The planet's nakshatra, its star lord, filters how it expresses",
        "In KP the sub-lord decides whether the event is permitted at all",
        "House connections matter far more than the planet's name",
      ],
    },
    {
      title: "Dasha and Marriage",
      icon: { kind: "chart", house: 7 },
      body: "",
      facts: [
        { label: "Houses", value: "2 (family) · 7 (partner and union) · 11 (fulfillment); the 7th is central" },
        { label: "Timing", value: "Marriage comes when the running lords signify these houses" },
        { label: "Common lords", value: "Venus, Jupiter, and the Moon, but only when the chart supports it" },
      ],
      points: [
        "Happens across many combinations: Saturn (often late), Rahu (sudden or unconventional), Mars (when it rules the 2nd or 7th)",
        "House connections outweigh the planet's name",
        "Often lands near a Bhukti junction when the incoming sub-period strengthens the marriage significators",
      ],
    },
    {
      title: "Dasha and Career",
      icon: { kind: "chart", house: 10 },
      body: "",
      facts: [
        { label: "Houses", value: "6 (employment) · 10 (profession) · 11 (income); the 2nd (wealth) is also relevant" },
        { label: "Timing", value: "Career events come when the running lords signify these houses" },
        { label: "Common lords", value: "Saturn, Mercury, and the Sun" },
      ],
      points: [
        "Beginnings: 6 and 10. Job changes: 6, 10, 11. Promotions: 10 and 11. Business: 7, 10, 11",
        "Stagnation in a good period usually traces to a Bhukti lord tied to the 8th or 12th",
        "Chart-specific significations override the planet's reputation",
      ],
    },
    // ---- the nine Mahadashas (source order) ----
    mahadasha("sun", 6, [
      { label: "Length", value: "6 years, the shortest; effects concentrated and clear" },
      { label: "Brings", value: "Recognition · advancement · clarity of purpose" },
      { label: "Opens", value: "Authority, administrative, and government roles" },
      { label: "Also", value: "Father-related events" },
    ], [
      "Ego friction: clashes with authority figures and institutions",
      "Watch areas: eyes, heart, bones",
      "Outcome swings on the natal Sun's strength",
    ]),
    mahadasha("moon", 10, [
      { label: "Length", value: "10 years" },
      { label: "Brings", value: "Heightened emotional sensitivity throughout" },
      { label: "Events", value: "Changes of residence · travel · public-facing work" },
      { label: "Also", value: "Mother-related events · real domestic and public progress" },
    ], [
      "Enriching for a strong Moon, draining for a troubled one",
      "The relationally active and the heavier domestic stretches depend on the sub-period",
    ]),
    mahadasha("mars", 7, [
      { label: "Length", value: "7 years" },
      { label: "Nature", value: "Rarely quiet; pushes hard toward action" },
      { label: "Active areas", value: "Property and real estate · engineering, military, medicine, sport" },
      { label: "Also", value: "Sibling matters more active" },
    ], [
      "Accidents and surgery are possible when difficult houses are involved",
      "Most turbulent in Rahu sub-periods, steadier in Jupiter",
    ]),
    mahadasha("rahu", 18, [
      { label: "Length", value: "18 years, long enough to define a life stage; rarely passes without major change" },
      { label: "Well-placed", value: "Sudden opportunity · foreign links · tech or unconventional fields · ambition rewarded" },
      { label: "Poorly placed", value: "Obsession · identity confusion · reversals" },
    ], [
      "No sign of its own; acts through its sign lord and star lord, so it is highly chart-dependent",
      "Almost always contains at least one major upheaval",
      "A few sub-periods are far more productive than the rest",
    ]),
    mahadasha("jupiter", 16, [
      { label: "Length", value: "16 years" },
      { label: "Nature", value: "Gradual expansion across several areas at once" },
      { label: "Prospers", value: "Teaching · law · finance · advisory work" },
      { label: "Also", value: "Children often born in this period · higher education and philosophical growth" },
    ], [
      "The risk is complacency; the Bhukti lord quietly shapes results",
      "The hardest stretch pairs Jupiter with Saturn, expansion against restriction",
    ]),
    mahadasha("saturn", 19, [
      { label: "Length", value: "19 years, the longest alongside Rahu" },
      { label: "Opens with", value: "A tightening: rising duties, slower results" },
      { label: "Rewards", value: "Sustained effort, not sudden luck" },
      { label: "Peaks careers in", value: "Real estate · law · administration · engineering" },
    ], [
      "The early heaviness is rebuilding on firmer ground, not failure",
      "The second half is usually steadier and more prosperous than the first",
    ]),
    mahadasha("mercury", 17, [
      { label: "Length", value: "17 years" },
      { label: "Favours", value: "Mental, adaptable, precise work" },
      { label: "Active areas", value: "Business in trade, communication, media · education, formal or self-directed" },
      { label: "Also", value: "Sibling matters and travel" },
    ], [
      "Highly variable: Mercury takes on the planets it joins or is influenced by",
      "The same period brings sharp success for one person and scattered activity for another",
    ]),
    mahadasha("ketu", 7, [
      { label: "Length", value: "7 years" },
      { label: "Nature", value: "Energy moves inward" },
      { label: "Brings", value: "Detachment · spiritual inclination · a loosening of old attachments" },
      { label: "Watch", value: "Sudden separations from relationships, jobs, or places" },
      { label: "Work", value: "Research, occult, or behind-the-scenes fields" },
    ], [
      "Freeing for some, disorienting for the materially attached",
      "No sign of its own; acts through the planets it associates with",
      "Health: hidden or hard-to-diagnose conditions",
    ]),
    mahadasha("venus", 20, [
      { label: "Length", value: "20 years, the longest" },
      { label: "Most tied to", value: "Relationships and material pleasure" },
      { label: "Brings", value: "Relationship events · comfort · creative expression" },
      { label: "Prospers", value: "Art · design · fashion · hospitality · finance" },
    ], [
      "The risk is excess: overindulgence, extravagance, entanglements",
      "Health: kidneys, reproductive organs, skin, sugar metabolism",
    ]),
  ],
};
