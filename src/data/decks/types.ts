/* ============================================================
   types.ts — the shape of flashcard data.

   Decks are data files (see ./registry.ts). Adding a deck =
   create a file + add one entry to the registry — NO component
   changes. Card bodies may be empty ("") while a deck is being
   scaffolded; the UI renders a tasteful "coming soon" placeholder.
   ============================================================ */

export type CardIcon =
  | { kind: "planet"; id: string; retro?: boolean } // celestial body, e.g. id:'sun'; retro adds the "R"
  | { kind: "house"; n: number } // diamond medallion with the house number
  | { kind: "diamond" } // the chart-diamond mark (default deck motif)
  | { kind: "chart"; house: number } // North Indian chart with one house highlighted
  | { kind: "zodiac"; symbol: string } // zodiac sign glyph (colored by the card's accent)
  | { kind: "combust"; planet?: string } // Sun with a dimmed planet (combustion / asta)
  | { kind: "conjunction"; a: string; b: string }; // two planet spheres merging (yuti)

/** A label/value pair shown on the card FRONT (e.g. planet placement data). */
export interface CardFact {
  label: string;
  value: string;
}

/** A weighted term in a significations cloud (three visual size tiers). */
export type CloudWeight = "big" | "medium" | "small";
export interface CloudTerm {
  label: string;
  weight: CloudWeight;
}
/** The "wordsmith" word-cloud BACK face (houses; planets later). When present
    it replaces the prose/points back ENTIRELY — the back shows only the card
    title and the weighted words, nothing else (owner-directed). The front is
    untouched. Sizing is editorial (a memorization aid), not canonical. */
export interface CardCloud {
  terms: CloudTerm[];
}

export interface Card {
  title: string;
  sanskrit?: string;
  /** Prose meaning on the back. Empty AND no `points`/`cloud` → "coming soon" placeholder. */
  body: string;
  badge?: string;
  /** Overrides the deck accent for this card (e.g. a planet's color). */
  accentColor?: string;
  icon?: CardIcon;
  /** Reference data shown on the card FRONT (under the icon/title). */
  facts?: CardFact[];
  /** Characteristics shown on the card BACK as a bulleted list (used instead of `body`). */
  points?: string[];
  /** Significations word-cloud BACK (used instead of `points`/`body`). */
  cloud?: CardCloud;
}

export type DeckStatus = "available" | "coming-soon";

export interface Deck {
  id: string;
  title: string;
  subtitle?: string;
  motif: "diamond";
  accent: string;
  /** Defaults to "available". "coming-soon" tiles are non-interactive. */
  status?: DeckStatus;
  cards: Card[];
}
