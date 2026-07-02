/* ============================================================
   flashcardLink.ts — resolve a chart deep-link to a real deck card.
   - "house"     → Houses deck card (1–12)
   - "nakshatra" → Nakshatras deck card (by name)
   - "sign" /
     "ascendant" → Ascendants deck card (by sign name) — the rising-sign card,
                   opened by the Ascendant-Lord pill and the functional-nature badge
   - "pada"      → Nakshatra Padas concept deck → the "The Four Padas & the
                   Purusharthas" card, with the tapped pada's row highlighted
   - "gandanta"  → Gandanta concept deck → the "What Gandanta Is" card (no id)
   - "maitri"    → the WHOLE Planetary Conditions deck, browsable from card 1
                   (owner-directed: a maitri pill opens all 4 cards, not one)
   - "avastha"   → Planetary States deck → the tapped system's card
                   (id "baladi" | "jagradadi" | "lajjitadi")
   - "yoga"      → Yogas deck → the tapped yoga family's card
                   (id "pancha-mahapurusha" | "gaja-kesari"; the panel yoga pills)
   - "deck"      → ANY whole deck, browsable from its first card
                   (id = deck id, e.g. "houses"; the reading-notes step links)
   Returns the deck, the card index, and the resolved card for the popover.
   ============================================================ */
import { DECKS } from "@/data/decks/registry";
import type { Deck, Card } from "@/data/decks/types";

export type FlashcardType = "house" | "nakshatra" | "sign" | "ascendant" | "pada" | "gandanta" | "maitri" | "avastha" | "planet" | "element" | "shadbala" | "yoga" | "deck";

export interface FlashcardTarget {
  deck: Deck;
  index: number;
  card: Card;
  /** Optional emphasis target: a front fact-row label (exact match, e.g. "Pada 2")
      or the prefix of a back point (e.g. "Major 3-4"). */
  highlightFact?: string;
  /** Open the popover already flipped — for targets whose highlight lives on the back. */
  flip?: boolean;
  /** When set, the popover lets the user browse the whole deck (prev/next + ←/→)
      starting at `index`, instead of pinning a single card. */
  browse?: boolean;
}

/** Concept cards opened by a flag link, resolved by title (case-insensitive) so deck
    order can change freely. Must match the card titles in the respective deck files. */
const PADA_CONCEPT_CARD = "The Four Padas & the Purusharthas";
const GANDANTA_CONCEPT_CARD = "What Gandanta Is";
/** Avastha system key → its card title in the "Planetary States" (avasthas) deck. */
const AVASTHA_CARDS: Record<string, string> = {
  baladi: "The Five Ages",
  jagradadi: "Awake, Dreaming, Sleeping",
  lajjitadi: "The Six Moods",
};
const AVASTHA_OVERVIEW_CARD = "What an Avastha Is";

function byTitle(deck: Deck | undefined, title: string): FlashcardTarget | null {
  if (!deck) return null;
  const t = title.toLowerCase();
  const index = deck.cards.findIndex((c) => c.title.toLowerCase() === t);
  return index >= 0 ? { deck, index, card: deck.cards[index] } : null;
}

export function resolveFlashcard(
  type: FlashcardType,
  id?: string | number,
): FlashcardTarget | null {
  if (type === "house") {
    const deck = DECKS.find((d) => d.id === "houses");
    const n = Number(id);
    if (!deck || !Number.isInteger(n) || n < 1 || n > 12) return null;
    return { deck, index: n - 1, card: deck.cards[n - 1] }; // houses ordered 1 → 12
  }
  if (type === "nakshatra") {
    return byTitle(DECKS.find((d) => d.id === "nakshatras"), String(id));
  }
  if (type === "sign" || type === "ascendant") {
    // the twelve rising-sign cards live in the Zodiacs deck (id "zodiacs");
    // both the Ascendant-Lord pill and the functional-nature badge open the rising-sign card
    return byTitle(DECKS.find((d) => d.id === "zodiacs"), String(id));
  }
  if (type === "pada") {
    // concept deck: always open the purushartha card, highlighting the tapped pada's row
    const n = Number(id);
    if (!Number.isInteger(n) || n < 1 || n > 4) return null;
    const target = byTitle(DECKS.find((d) => d.id === "padas"), PADA_CONCEPT_CARD);
    return target ? { ...target, highlightFact: `Pada ${n}` } : null;
  }
  if (type === "gandanta") {
    // concept deck: open the intro card (no id — the marker is a single flag)
    return byTitle(DECKS.find((d) => d.id === "gandanta"), GANDANTA_CONCEPT_CARD);
  }
  if (type === "maitri") {
    // a maitri pill opens the whole Planetary Conditions deck, browsable from
    // the first card (owner-directed — the concept needs all 4 cards, not one)
    const deck = DECKS.find((d) => d.id === "maitri");
    return deck ? { deck, index: 0, card: deck.cards[0], browse: true } : null;
  }
  if (type === "avastha") {
    // a panel avastha row opens that system's card; fall back to the overview card
    const title = AVASTHA_CARDS[String(id)] ?? AVASTHA_OVERVIEW_CARD;
    return byTitle(DECKS.find((d) => d.id === "avasthas"), title);
  }
  if (type === "shadbala") {
    // a panel shadbala row opens that bala's card; "total"/"ratio" → the
    // reading card; no id → the overview card
    const SHADBALA_CARDS: Record<string, string> = {
      sthana: "Sthana Bala", dig: "Dig Bala", kala: "Kala Bala", chesta: "Cheshta Bala",
      naisargika: "Naisargika Bala", drik: "Drik Bala",
      total: "Reading the Numbers", ratio: "Reading the Numbers", required: "Minimum Strength Thresholds",
      ishta: "Ishta & Kashta Phala", kashta: "Ishta & Kashta Phala",
    };
    const deck = DECKS.find((d) => d.id === "shadbala");
    if (!deck) return null;
    const title = SHADBALA_CARDS[String(id)];
    return (title && byTitle(deck, title)) || { deck, index: 0, card: deck.cards[0] };
  }
  if (type === "yoga") {
    // a planet-panel yoga pill opens its yoga family's card; fall back to the
    // deck's first card (all five Mahapurusha yogas share one card)
    const YOGA_CARDS: Record<string, string> = {
      "pancha-mahapurusha": "Pancha Mahapurusha Yoga",
      "gaja-kesari": "Gaja Kesari Yoga",
      budhaditya: "Budhaditya Yoga",
      "venus-mercury": "Venus & Mercury Conjunction",
      "dhana-2-11": "Dhana Yoga (2nd & 11th Lords)",
      // each Grahana pair opens ITS OWN card (the deck also holds the overview)
      "grahana-sun-rahu": "Grahana: Sun & Rahu",
      "grahana-sun-ketu": "Grahana: Sun & Ketu",
      "grahana-moon-rahu": "Grahana: Moon & Rahu",
      "grahana-moon-ketu": "Grahana: Moon & Ketu",
    };
    const deck = DECKS.find((d) => d.id === "yogas");
    if (!deck) return null;
    // "neecha-bhanga-c<N>" → the Neecha Bhanga card, opened FLIPPED with that
    // condition's back point highlighted (the conditions live on the scrollable
    // back, grouped "Major 1-2" … "Minor 6-7")
    const nb = /^neecha-bhanga-c([1-7])$/.exec(String(id));
    if (nb) {
      const n = Number(nb[1]);
      const fact = n <= 2 ? "Major 1-2" : n <= 4 ? "Major 3-4" : n === 5 ? "Major 5" : "Minor 6-7";
      const target = byTitle(deck, "Neecha Bhanga Raja Yoga");
      return target ? { ...target, highlightFact: fact, flip: true } : null;
    }
    const title = YOGA_CARDS[String(id)];
    return (title && byTitle(deck, title)) || { deck, index: 0, card: deck.cards[0] };
  }
  if (type === "deck") {
    // a whole deck, browsable from card 1 (e.g. the reading-notes step links)
    const deck = DECKS.find((d) => d.id === String(id));
    return deck && deck.cards.length
      ? { deck, index: 0, card: deck.cards[0], browse: true }
      : null;
  }
  if (type === "element") {
    // the chart's element-balance rows open the matching Elements deck card
    // (id "Fire" | "Earth" | "Air" | "Water"); no id → the overview card
    const deck = DECKS.find((d) => d.id === "elements");
    if (!deck) return null;
    if (id != null) {
      const byName = byTitle(deck, String(id));
      if (byName) return byName;
    }
    return { deck, index: 0, card: deck.cards[0] };
  }
  if (type === "planet") {
    // the legend's planet-colors / dignity rows open the Planets (grahas) deck;
    // by planet name when given (e.g. "Mars"), else the deck's first card
    const deck = DECKS.find((d) => d.id === "planets");
    if (!deck) return null;
    if (id != null) {
      const byName = byTitle(deck, String(id));
      if (byName) return byName;
    }
    return { deck, index: 0, card: deck.cards[0] };
  }
  return null;
}
