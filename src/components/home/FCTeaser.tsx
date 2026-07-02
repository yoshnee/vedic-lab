"use client";

/* The flashcards teaser on the landing page — sells the study method and
   previews a handful of featured decks, linking out to the full deck browser
   (/flashcards) for the rest. Face-down deck backs; tapping one opens the deck.
   Ported from the design-reference prototype (flashcards/home.jsx FCTeaser). */
import type { CSSProperties } from "react";
import Link from "next/link";
import { diamond } from "@/celestial/celestial";
import { Svg } from "@/components/Svg";
import type { Deck } from "@/data/decks/types";

export function FCTeaser({
  decks,
  featured,
  onOpen,
}: {
  /** Every landing-grid deck — drives the deck/card totals. */
  decks: Deck[];
  /** The subset shown as preview tiles (falls back to the first six). */
  featured: Deck[];
  onOpen: (deck: Deck, opener: HTMLButtonElement) => void;
}) {
  const shown = featured.length ? featured : decks.slice(0, 6);

  return (
    <section className="teaser" id="flashcards" aria-labelledby="teaser-title">
      <div className="teaser-head">
        <span className="teaser-eyebrow">The study method</span>
        <h2 className="teaser-title" id="teaser-title">
          Drill the fundamentals until they’re yours.
        </h2>
        <p className="teaser-lede">
          Synthesis begins with recall. Each deck turns a corner of Jyotish (houses, grahas, signs,
          nakshatras, dashas) into cards you flip until the meanings are second nature. Scattered
          notes become one focused study hall.
        </p>
        <p className="teaser-stat">
          <b>100s</b> of flashcards organized by concept decks. Free, in your browser.
        </p>
      </div>

      <div className="teaser-grid">
        {shown.map((d) => (
          <button
            key={d.id}
            className="fc-deckback"
            style={{ "--deck-accent": d.accent } as CSSProperties}
            onClick={(e) => onOpen(d, e.currentTarget)}
            aria-label={"Open " + d.title + " deck, " + d.cards.length + " cards"}
          >
            <span className="fc-deckback-art">
              <Svg html={diamond(112, { glow: true })} />
            </span>
            <span className="fc-deckback-meta">
              <span className="fc-deckback-kicker">{d.subtitle}</span>
              <span className="fc-deckback-title">{d.title}</span>
              <span className="fc-deckback-count">{d.cards.length} cards</span>
            </span>
          </button>
        ))}

        <Link
          className="deck-more"
          href="/flashcards"
          aria-label="View all flashcard decks"
        >
          <span className="deck-more-dots" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span className="deck-more-title">…and more</span>
          <span className="deck-more-cta">
            View all decks <span aria-hidden="true">→</span>
          </span>
        </Link>
      </div>
    </section>
  );
}
