/* Planetary Conditions (Panchadha Maitri) — a concept deck on the three layers of
   planetary friendship and how they combine to judge a planet against its dispositor
   (the "landlord" — lord of the sign it occupies). Content from maitri_flashcards.md:
   FRONT = compact facts, BACK = points.

   Tables follow the classics (BPHS Graha Maitri): Tatkalika (temporal) friend = a
   planet in the 2/3/4/10/11/12 from it, enemy = 1/5/6/7/8/9; Panchadha (compound)
   overlays natural + temporal into the five-step scale Adhi Mitra · Mitra · Sama ·
   Shatru · Adhi Shatru. The naisargika (natural) table itself lives in the Planets
   deck; this is also a Shadbala input (sthana bala) when that lands. */
import type { Deck } from "./types";
import { ACCENT } from "@/lib/design/colors";

export const maitri: Deck = {
  id: "maitri",
  title: "Planetary Conditions",
  subtitle: "Panchadha Maitri",
  motif: "diamond",
  accent: ACCENT,
  status: "available",
  cards: [
    {
      title: "The Three Layers (and the “Landlord” Idea)",
      sanskrit: "Graha Maitri",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Levels", value: "Three layers of planetary relationship" },
        { label: "The question", value: "Is a planet comfortable in the sign it sits in?" },
      ],
      points: [
        "Naisargika (natural) — permanent, fixed friend / neutral / enemy (in the Nine Grahas deck)",
        "Tatkalika (temporal) — temporary, depends on positions in this specific chart",
        "Panchadha (compound) — natural + temporal combined into a five-step scale",
        "Practical use: judge a planet against its dispositor — the lord of the sign it occupies, i.e. its “landlord”",
        "The compound relationship tells you whether the planet sits comfortably in its landlord's house",
        "A planet in its own sign is its own landlord — automatically at home",
      ],
    },
    {
      title: "Naisargika (Natural) Maitri — Recap",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Type", value: "Fixed, permanent friendships set by each planet's nature" },
        { label: "Stability", value: "Never changes from chart to chart" },
      ],
      points: [
        "Each planet has a standing friend / neutral / enemy toward every other planet",
        "This is the first of the two inputs to the compound relationship",
        "Full friend / neutral / enemy table lives in the Nine Grahas deck",
      ],
    },
    {
      title: "Tatkalika (Temporal) Maitri — the Positional Rule",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Basis", value: "House position relative to the planet (chart-specific)" },
        { label: "Scale", value: "Binary — only friend or enemy" },
        { label: "Stability", value: "Changes every chart" },
      ],
      points: [
        "Counting from the planet's own house:",
        "Temporary FRIEND — any planet in the 2nd, 3rd, 4th, 10th, 11th, or 12th from it",
        "Temporary ENEMY — any planet in the 1st (same house), 5th, 6th, 7th, 8th, or 9th from it",
        "This is the second input to the compound relationship",
      ],
    },
    {
      title: "Panchadha (Compound) Maitri — Combining the Two",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Method", value: "Overlay natural + temporal → a five-step scale" },
        { label: "Used for", value: "The refined relationship in judgment" },
      ],
      points: [
        "Natural friend + temporal friend → Adhi Mitra (great friend)",
        "Natural friend + temporal enemy → Sama (neutral)",
        "Natural neutral + temporal friend → Mitra (friend)",
        "Natural neutral + temporal enemy → Shatru (enemy)",
        "Natural enemy + temporal friend → Sama (neutral)",
        "Natural enemy + temporal enemy → Adhi Shatru (great enemy)",
        "Five results: Adhi Mitra, Mitra, Sama, Shatru, Adhi Shatru",
        "A planet in its great friend's sign gains real strength; in its great enemy's sign it's strained",
        "Also a component of Shadbala later",
      ],
    },
  ],
};
