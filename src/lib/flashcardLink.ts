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
   - "maitri"    → Planetary Conditions deck → the Panchadha (compound) card
   - "avastha"   → Planetary States deck → the tapped system's card
                   (id "baladi" | "jagradadi" | "lajjitadi")
   Returns the deck, the card index, and the resolved card for the popover.
   ============================================================ */
import { DECKS } from "@/data/decks/registry";
import type { Deck, Card } from "@/data/decks/types";

export type FlashcardType = "house" | "nakshatra" | "sign" | "ascendant" | "pada" | "gandanta" | "maitri" | "avastha" | "planet";

export interface FlashcardTarget {
  deck: Deck;
  index: number;
  card: Card;
  /** Optional fact-row label to emphasize on the card front (e.g. the tapped "Pada 2"). */
  highlightFact?: string;
}

/** Concept cards opened by a flag link, resolved by title (case-insensitive) so deck
    order can change freely. Must match the card titles in the respective deck files. */
const PADA_CONCEPT_CARD = "The Four Padas & the Purusharthas";
const GANDANTA_CONCEPT_CARD = "What Gandanta Is";
const MAITRI_PANCHADHA_CARD = "Panchadha (Compound) Maitri — Combining the Two";
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
    // the Ascendants deck (id "signs") holds 3 concept cards then the 12 signs;
    // both the Ascendant-Lord pill and the functional-nature badge open the rising-sign card
    return byTitle(DECKS.find((d) => d.id === "signs"), String(id));
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
    // the dispositor badge opens the compound (panchadha) card (id reserved for future cards)
    return byTitle(DECKS.find((d) => d.id === "maitri"), MAITRI_PANCHADHA_CARD);
  }
  if (type === "avastha") {
    // a panel avastha row opens that system's card; fall back to the overview card
    const title = AVASTHA_CARDS[String(id)] ?? AVASTHA_OVERVIEW_CARD;
    return byTitle(DECKS.find((d) => d.id === "avasthas"), title);
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
