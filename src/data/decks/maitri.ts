/* Planetary Conditions (Panchadha Maitri) — a concept deck on the three layers of
   planetary friendship and how they combine to judge a planet against its dispositor
   (the "landlord" — lord of the sign it occupies). Content from maitri_flashcards.md:
   FRONT = compact facts, BACK = points.

   Tables follow the classics (BPHS Graha Maitri): Tatkalika (temporal) friend = a
   planet in the 2/3/4/10/11/12 from it, enemy = 1/5/6/7/8/9; Panchadha (compound)
   overlays natural + temporal into the five-step scale Adhi Mitra · Mitra · Sama ·
   Shatru · Adhi Shatru. The Naisargika card's back is the full per-planet
   friend/neutral/enemy table, GENERATED from the engine's canonical
   NAISARGIKA_FRIENDS/ENEMIES (constants.ts; neutral = the rest) so card and
   chart can never disagree — note the table is asymmetric by design (e.g.
   Mercury counts the Sun a friend; the Sun counts Mercury neutral). */
import type { Deck } from "./types";
import { ACCENT } from "@/lib/design/colors";
import { PLANET_NAMES, NAISARGIKA_FRIENDS, NAISARGIKA_ENEMIES } from "@/core/constants";
import type { PlanetKey } from "@/core/types";

/** One table row per planet: its own outlook on the other six. */
const SEVEN: PlanetKey[] = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"];
const names = (arr: PlanetKey[]) =>
  arr.length ? arr.map((k) => PLANET_NAMES[k]).join(", ") : "None";
function naisargikaRow(p: PlanetKey): string {
  const friends = NAISARGIKA_FRIENDS[p] ?? [];
  const enemies = NAISARGIKA_ENEMIES[p] ?? [];
  const neutrals = SEVEN.filter((o) => o !== p && !friends.includes(o) && !enemies.includes(o));
  return `${PLANET_NAMES[p]} · Friends: ${names(friends)} · Neutral: ${names(neutrals)} · Enemies: ${names(enemies)}`;
}

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
        "Naisargika (natural): permanent, fixed friend / neutral / enemy (in the Nine Grahas deck)",
        "Tatkalika (temporal): temporary, depends on positions in this specific chart",
        "Panchadha (compound): natural + temporal combined into a five-step scale",
        "Practical use: judge a planet against its dispositor, the lord of the sign it occupies, its “landlord”",
        "The compound relationship tells you whether the planet sits comfortably in its landlord's house",
        "A planet in its great friend's sign gains real strength; in its great enemy's sign it's strained",
        "A planet in its own sign is its own landlord, automatically at home",
      ],
    },
    {
      title: "Naisargika (Natural) Maitri",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Type", value: "Fixed, permanent friendships set by each planet's nature" },
        { label: "Stability", value: "Never changes from chart to chart" },
      ],
      points: SEVEN.map(naisargikaRow),
    },
    {
      title: "Tatkalika (Temporal) Maitri",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Basis", value: "House position relative to the planet (chart-specific)" },
        { label: "Scale", value: "Binary: friend or enemy only" },
        { label: "Stability", value: "Changes every chart" },
      ],
      points: [
        "Counting from the planet's own house:",
        "Temporary FRIEND: any planet in the 2nd, 3rd, 4th, 10th, 11th, or 12th from it",
        "Temporary ENEMY: any planet in the 1st (same house), 5th, 6th, 7th, 8th, or 9th from it",
        "This is the second input to the compound relationship",
      ],
    },
    {
      title: "Panchadha (Compound) Maitri",
      icon: { kind: "diamond" },
      body: "",
      facts: [
        { label: "Method", value: "Overlay natural + temporal into a five-step scale" },
        { label: "Used for", value: "The refined relationship in judgment" },
      ],
      // the six combinations only, English results (owner-directed; these match
      // the chart's maitri pill words exactly)
      points: [
        "Natural friend + temporal friend = Great Friend",
        "Natural friend + temporal enemy = Neutral",
        "Natural neutral + temporal friend = Friend",
        "Natural neutral + temporal enemy = Enemy",
        "Natural enemy + temporal friend = Neutral",
        "Natural enemy + temporal enemy = Great Enemy",
      ],
    },
  ],
};
