/* Retrogression (Vakri) — a concept deck. Content from retrogression_vakri_flashcards.md.
   Each card's icon is a planet shown with the design system's retrograde "R" marker
   (body(..., retro)); the planet varies per card. */
import type { Deck } from "./types";
import { ACCENT } from "@/lib/design/colors";

export const retrogression: Deck = {
  id: "retrogression",
  title: "Retrogression",
  subtitle: "Vakri",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  cards: [
    {
      title: "What Retrogression Is",
      sanskrit: "Vakri",
      icon: { kind: "planet", id: "mercury", retro: true },
      body: "",
      hideBackTitle: true,
      points: [
        "A planet appears to move backward through the zodiac (from Earth's viewpoint)",
        "An optical illusion, not an actual reversal",
        "Cycle: slows → stations (appears to stop) → moves backward → stations → resumes forward",
        "The “two cars” analogy: as the faster Earth overtakes a slower planet, it seems to drift backward",
        "Nothing physically reverses — but the apparent motion still carries real symbolic weight",
        "The slowing and stationing points are themselves significant moments",
      ],
    },
    {
      title: "Which Planets Retrograde",
      sanskrit: "& How Often",
      icon: { kind: "planet", id: "saturn", retro: true },
      body: "",
      hideBackTitle: true,
      facts: [
        { label: "Mercury", value: "~3–4×/yr · 3 wks" },
        { label: "Venus", value: "~18 mo · 40–43 days" },
        { label: "Mars", value: "~2 yrs · 2 mo" },
        { label: "Jupiter", value: "~yearly · 4 mo" },
        { label: "Saturn", value: "~yearly · 4.5–5 mo" },
      ],
      points: [
        "These five “true” planets are the ones that retrograde",
        "The Sun and Moon never retrograde",
        "Rahu and Ketu are always retrograde — backward motion is their natural state",
        "The slower / more distant the planet, the longer its retrograde lasts",
      ],
    },
    {
      title: "Strength & Expression",
      sanskrit: "Turned Inward",
      icon: { kind: "planet", id: "mars", retro: true },
      body: "",
      hideBackTitle: true,
      points: [
        "Turns the planet's expression inward",
        "Retrograde does NOT mean weak",
        "Often carries karmic / past-life themes",
        "Energy moves inward — encouraging reflection, revision, and deeper thought",
        "Keeps full power, but needs more intentional, conscious engagement to express",
        "Suggests the soul is revisiting themes not fully integrated in past lives",
        "Reorients the planet's function rather than weakening it; acts unconventionally and introspectively",
      ],
    },
    {
      title: "Signatures by Planet",
      sanskrit: "By Planet",
      icon: { kind: "planet", id: "venus", retro: true },
      body: "",
      hideBackTitle: true,
      points: [
        "Mercury Rx: reflective deep thinker; unconventional communication",
        "Venus Rx: unique values in love and money; inward processing of relationships",
        "Mars Rx: hesitant action; internalized courage or anger",
        "Jupiter Rx: an inner philosophical search; intuitive moral compass",
        "Saturn Rx: revisiting and reworking structures, boundaries, and responsibilities",
      ],
    },
    {
      title: "Working With Retrograde",
      sanskrit: "Revisit & Realign",
      icon: { kind: "planet", id: "jupiter", retro: true },
      body: "",
      hideBackTitle: true,
      points: [
        "A time to revisit unfinished business",
        "Setbacks are often opportunities in disguise",
        "Optimal windows for resolving old, unfinished matters — past issues resurface for resolution",
        "Apparent slowdowns are invitations to inner work, reassessment, and realignment",
        "Helps ensure actions align with deeper truths",
        "Obstacles often lead to innovative solutions and alternative approaches",
      ],
    },
  ],
};
