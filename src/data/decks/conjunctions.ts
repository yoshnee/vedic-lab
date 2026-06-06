/* Conjunctions & Planetary Interactions (Yuti) — a concept deck. Content from
   conjunctions_flashcards.md. Concept cards, then Sun-with-node and Rahu/Ketu
   combination cards, then planetary war (graha yuddha). Each card's icon is a
   conjunction of the two relevant planets (two spheres merging). */
import type { Deck } from "./types";
import { ACCENT } from "@/lib/design/colors";

export const conjunctions: Deck = {
  id: "conjunctions",
  title: "Conjunctions",
  subtitle: "Yuti",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  cards: [
    {
      title: "What a Conjunction Is",
      sanskrit: "Yuti",
      icon: { kind: "conjunction", a: "mars", b: "jupiter" },
      body: "",
      points: [
        "Two or more planets sharing the same sign, close in degree",
        "Always a high-voltage point in the chart",
        "Their energies blend and concentrate at one point",
        "Exact conjunction = planets at the same exact degree (most potent)",
        "A strong conjunction becomes a focal point of the whole chart",
        "Outcome depends on which planets are involved — not just the fact of conjunction",
      ],
    },
    {
      title: "Orb & Strength",
      sanskrit: "Degree Range",
      icon: { kind: "conjunction", a: "venus", b: "mercury" },
      body: "",
      facts: [
        { label: "Standard orb", value: "~8° either side" },
        { label: "Strength", value: "Closer = stronger" },
      ],
      points: [
        "Within roughly 8°, planets are considered conjunct",
        "The tighter the orb, the more powerful and noticeable the effect",
        "Very close (near-exact-degree) conjunctions can dominate the chart",
        "Wide conjunctions are still felt, but more mildly",
      ],
    },
    {
      title: "Benefic vs Malefic",
      sanskrit: "Natural Nature",
      icon: { kind: "conjunction", a: "saturn", b: "jupiter" },
      body: "",
      points: [
        "The planets' natures shape the outcome",
        "Benefics (Venus, Jupiter, Moon): smoother, positive",
        "Malefics (Mars, Saturn): intense, challenging",
        "Benefic-involved conjunctions tend to produce harmonious results",
        "Malefic-involved ones bring struggles and lessons — but real growth and resilience",
        "A malefic conjunction can toughen the spirit rather than simply harm",
      ],
    },
    {
      title: "House & Lordship",
      sanskrit: "What Decides It",
      icon: { kind: "conjunction", a: "mercury", b: "venus" },
      body: "",
      points: [
        "House placement matters (especially 6, 8, 12 vs benefic houses)",
        "But the lordships and dignity of the planets are the true essence",
        "A conjunction in the 6th may signal challenges ahead...",
        "...yet benefic lords or planets in dignity can make results unexpectedly favorable",
        "A prosperity-house lord joined with a challenge-house lord can mitigate or enhance",
        "Each planet brings its own signature — read the combination, not just the house",
      ],
    },
    {
      title: "Sun & the Nodes",
      sanskrit: "Eclipse Symbolism",
      icon: { kind: "conjunction", a: "sun", b: "rahu" },
      body: "",
      points: [
        "Sun + a node (Rahu or Ketu) carries eclipse symbolism",
        "The node “swallows” or eclipses the Sun's light",
        "Sun + Rahu carries solar-eclipse-type energy",
        "Sun + Ketu carries a more inward, lunar-eclipse-type symbolism",
        "When too close, the node significantly weakens (eclipses) the Sun's influence",
        "Note: a literal eclipse also needs the Moon and a node — this is the symbolic principle",
      ],
    },
    {
      title: "Sun + Rahu",
      icon: { kind: "conjunction", a: "sun", b: "rahu" },
      body: "",
      points: [
        "The node of ambition meets the ego and self",
        "Amplifies ego, ambition, and self-identity",
        "Drives materialistic desire, inventiveness, and challenging the status quo",
        "Risk: inflated ego, excessive pride, and conflicts",
        "Rahu eclipses and weakens the Sun when too close; can bring a rapid rise in public life and fame",
      ],
    },
    {
      title: "Sun + Ketu",
      icon: { kind: "conjunction", a: "sun", b: "ketu" },
      body: "",
      points: [
        "The node of detachment meets the ego and self",
        "Pulls inward — soul-searching, spiritual detachment, liberation",
        "Feelings of alienation, disconnection from ego or personal identity",
        "Surfaces past-life karma; illuminates old patterns needing healing",
        "Pulls away from fame and prestige toward service and spiritual paths; can unlock past-life skills",
      ],
    },
    {
      title: "Rahu + Mercury",
      icon: { kind: "conjunction", a: "rahu", b: "mercury" },
      body: "",
      points: [
        "Intellect and communication meet Rahu's amplification",
        "Sharpens intellect and communication",
        "Can also produce manipulative cunning and deceptive thinking",
      ],
    },
    {
      title: "Rahu + Venus",
      icon: { kind: "conjunction", a: "rahu", b: "venus" },
      body: "",
      points: [
        "Desire and pleasure meet Rahu's amplification",
        "Intensifies desire for love, pleasure, beauty, and finances",
        "Brings passion — but potentially dramatic or obsessive relationships",
      ],
    },
    {
      title: "Rahu + Mars",
      icon: { kind: "conjunction", a: "rahu", b: "mars" },
      body: "",
      points: [
        "Drive and aggression meet Rahu's amplification",
        "Supercharges energy, courage, and aggression",
        "A potent combination for achieving goals — needs careful channeling",
      ],
    },
    {
      title: "Rahu + Jupiter",
      sanskrit: "Guru Chandal yoga",
      icon: { kind: "conjunction", a: "rahu", b: "jupiter" },
      body: "",
      points: [
        "Wisdom and faith meet Rahu's amplification",
        "Expands spiritual ambition and the desire for knowledge and growth",
        "Can bring success, but may inflate morals and ethics into exaggeration or distortion",
        "Classic name: Guru Chandal yoga (a node conjoined with Jupiter)",
      ],
    },
    {
      title: "Ketu + Mercury",
      icon: { kind: "conjunction", a: "ketu", b: "mercury" },
      body: "",
      points: [
        "Intellect and communication meet Ketu's detachment",
        "Promotes introverted, introspective thinking",
        "Communication can turn inward and less outwardly expressed",
      ],
    },
    {
      title: "Ketu + Venus",
      icon: { kind: "conjunction", a: "ketu", b: "venus" },
      body: "",
      points: [
        "Desire and pleasure meet Ketu's detachment",
        "Prompts reassessment of relationship needs and values",
        "Often calls for letting go; favors spiritual growth over indulgence",
      ],
    },
    {
      title: "Ketu + Mars",
      icon: { kind: "conjunction", a: "ketu", b: "mars" },
      body: "",
      points: [
        "Drive and aggression meet Ketu's detachment",
        "Softens aggression and competition",
        "Redirects action toward spiritual, non-attached pursuits",
        "Can confuse direction, but favors non-material aims",
      ],
    },
    {
      title: "Ketu + Jupiter",
      sanskrit: "Guru Chandal yoga",
      icon: { kind: "conjunction", a: "ketu", b: "jupiter" },
      body: "",
      points: [
        "Wisdom and faith meet Ketu's detachment",
        "Deepens spiritual awareness and inner truth",
        "Detaches from Jupiter's worldly aims — wealth, status, conventional success",
        "Challenges inherited beliefs; may question conventional religion or spiritual authority",
        "Also a form of Guru Chandal yoga (a node conjoined with Jupiter)",
      ],
    },
    {
      title: "Planetary War",
      sanskrit: "Graha Yuddha",
      icon: { kind: "conjunction", a: "saturn", b: "mars" },
      body: "",
      facts: [
        { label: "Gap", value: "Within ~1°" },
        { label: "Combatants", value: "Mars, Mercury, Jupiter, Venus, Saturn" },
        { label: "Never", value: "Sun, Moon, Rahu, Ketu" },
      ],
      points: [
        "When two of the five star planets come within ~1°, they are “at war”",
        "The Sun is excluded — it causes combustion (burning), not war",
        "The Moon and the shadow nodes (Rahu/Ketu) are also excluded",
        "Different from combustion: combustion is closeness to the Sun; a war is closeness between two non-luminary planets",
      ],
    },
    {
      title: "War — Winner & Loser",
      sanskrit: "Graha Yuddha",
      icon: { kind: "conjunction", a: "jupiter", b: "mercury" },
      body: "",
      points: [
        "One planet wins, the other loses",
        "Most common rule: the more northern planet (higher latitude) is the victor",
        "Other texts: the brighter, larger, or higher-degree planet wins",
        "The victor keeps or gains strength and delivers fuller results",
        "The defeated planet is weakened — its significations suffer, especially in its dasha",
        "Win/lose criteria vary by text (latitude, brightness, size, longitude) — follow your source's rule",
        "Like all close contacts, the tighter the gap, the more decisive the outcome",
      ],
    },
  ],
};
