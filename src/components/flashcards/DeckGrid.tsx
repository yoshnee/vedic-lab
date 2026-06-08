"use client";

/* The flashcards landing grid — face-down deck backs. Driven by the
   deck registry, so new decks appear automatically. "coming-soon" decks
   render as non-interactive roadmap tiles with a pill instead of a count. */
import { diamond } from "@/celestial/celestial";
import { Svg } from "@/components/Svg";
import type { Deck } from "@/data/decks/types";

export function DeckGrid({
  decks,
  onOpen,
}: {
  decks: Deck[];
  onOpen: (deck: Deck, opener: HTMLButtonElement) => void;
}) {
  return (
    <div className="fc-landing">
      <header className="fc-landing-head">
        <Svg html={diamond(46, { glow: true })} />
        <div>
          <h1>Flashcards</h1>
          <p>Tap a deck to study. Flip each card to reveal its meaning.</p>
        </div>
      </header>
      <div className="fc-decks">
        {decks.map((d) => {
          const soon = d.status === "coming-soon";
          const art = (
            <span className="fc-deckback-art">
              <Svg html={diamond(120, { glow: true })} />
            </span>
          );

          if (soon) {
            return (
              <div
                key={d.id}
                className="fc-deckback fc-deckback--soon"
                aria-label={d.title + " deck — coming soon"}
              >
                {art}
                <span className="fc-deckback-meta">
                  <span className="fc-deckback-kicker">{d.subtitle}</span>
                  <span className="fc-deckback-title">{d.title}</span>
                  <span className="fc-soon-pill">Coming soon</span>
                </span>
              </div>
            );
          }

          return (
            <button
              key={d.id}
              className="fc-deckback"
              onClick={(e) => onOpen(d, e.currentTarget)}
              aria-label={"Open " + d.title + " deck, " + d.cards.length + " cards"}
            >
              {art}
              <span className="fc-deckback-meta">
                <span className="fc-deckback-kicker">{d.subtitle}</span>
                <span className="fc-deckback-title">{d.title}</span>
                <span className="fc-deckback-count">{d.cards.length} cards</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="fc-landing-foot">More concepts will be added soon.</p>
    </div>
  );
}
