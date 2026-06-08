"use client";

/* ============================================================
   FlashcardPopover.tsx — single-card popover. When a house / nakshatra / sign
   link in a panel is tapped, the matching real deck card pops up (flip to read).
   Reuses the existing <Card> so it's the same card the flashcard decks show.
   ============================================================ */
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/flashcards/Card";
import { Svg } from "@/components/Svg";
import { diamond } from "@/celestial/celestial";
import type { FlashcardTarget } from "@/lib/flashcardLink";

export function FlashcardPopover({
  target,
  onClose,
}: {
  target: FlashcardTarget;
  onClose: () => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === " " || e.key === "Enter") {
        if ((e.target as HTMLElement).closest?.(".fcpop-close")) return;
        e.preventDefault();
        setFlipped((f) => !f);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const { card, deck } = target;
  return (
    <div
      className="fcpop-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="fcpop-dialog" role="dialog" aria-modal="true" aria-label={`${card.title} flashcard`}>
        <header className="fcpop-bar">
          <span className="fcpop-title">
            <Svg html={diamond(20, { glow: true })} /> Flashcard
          </span>
          <span className="fcpop-kind">{deck.title}</span>
          <button className="fcpop-close" onClick={onClose} aria-label="Close flashcard">
            ✕
          </button>
        </header>
        <div
          className="fcpop-stack"
          role="button"
          tabIndex={0}
          ref={ref}
          aria-pressed={flipped}
          aria-label={
            card.title +
            (card.sanskrit ? ", " + card.sanskrit : "") +
            ". " +
            (flipped ? "Showing meaning." : "Showing term.") +
            " Activate to flip."
          }
          onClick={() => setFlipped((f) => !f)}
        >
          <Card card={card} deckAccent={deck.accent} flipped={flipped} highlightFact={target.highlightFact} />
        </div>
        <p className="fcpop-hint">Tap card to flip · Esc to close</p>
      </div>
    </div>
  );
}
