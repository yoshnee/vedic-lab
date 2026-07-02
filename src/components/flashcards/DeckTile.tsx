"use client";

/* A single face-down deck back, shared by the landing grid (DeckGrid) and the
   dedicated /flashcards page (FlashcardsApp) so both render identical tiles.
   "coming-soon" decks render as a non-interactive roadmap tile with a pill
   instead of a card count. */
import { diamond } from "@/celestial/celestial";
import { Svg } from "@/components/Svg";
import type { Deck } from "@/data/decks/types";

export function DeckTile({
  deck,
  onOpen,
}: {
  deck: Deck;
  onOpen: (deck: Deck, opener: HTMLButtonElement) => void;
}) {
  const art = (
    <span className="fc-deckback-art">
      <Svg html={diamond(120, { glow: true })} />
    </span>
  );

  if (deck.status === "coming-soon") {
    return (
      <div className="fc-deckback fc-deckback--soon" aria-label={deck.title + " deck — coming soon"}>
        {art}
        <span className="fc-deckback-meta">
          <span className="fc-deckback-kicker">{deck.subtitle}</span>
          <span className="fc-deckback-title">{deck.title}</span>
          <span className="fc-soon-pill">Coming soon</span>
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="fc-deckback"
      onClick={(e) => onOpen(deck, e.currentTarget)}
      aria-label={"Open " + deck.title + " deck, " + deck.cards.length + " cards"}
    >
      {art}
      <span className="fc-deckback-meta">
        <span className="fc-deckback-kicker">{deck.subtitle}</span>
        <span className="fc-deckback-title">{deck.title}</span>
        <span className="fc-deckback-count">{deck.cards.length} cards</span>
      </span>
    </button>
  );
}
