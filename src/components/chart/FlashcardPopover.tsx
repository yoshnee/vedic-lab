"use client";

/* ============================================================
   FlashcardPopover.tsx — single-card popover. When a house / nakshatra / sign
   link in a panel is tapped, the matching real deck card pops up (flip to read).
   Reuses the existing <Card> so it's the same card the flashcard decks show.
   A target with `browse` set (e.g. the maitri pills) unlocks the whole deck:
   prev/next buttons + ←/→ keys page through every card from `index`.
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
  const [flipped, setFlipped] = useState(!!target.flip); // flip-on-open for back-side highlights
  const [index, setIndex] = useState(target.index);
  // a new tap (different target) re-anchors the popover — the sanctioned
  // derive-state-from-props pattern (adjust during render, no effect)
  const [anchor, setAnchor] = useState(target);
  if (anchor !== target) {
    setAnchor(target);
    setIndex(target.index);
    setFlipped(!!target.flip);
  }
  const ref = useRef<HTMLDivElement>(null);

  const browse = !!target.browse && target.deck.cards.length > 1;
  const count = target.deck.cards.length;
  const go = (delta: number) => {
    setIndex((i) => Math.min(count - 1, Math.max(0, i + delta)));
    setFlipped(false);
  };

  useEffect(() => {
    ref.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (browse && e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (browse && e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === " " || e.key === "Enter") {
        if ((e.target as HTMLElement).closest?.(".fcpop-close, .fcpop-nav-btn")) return;
        e.preventDefault();
        setFlipped((f) => !f);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, browse, count]);

  const { deck } = target;
  const card = deck.cards[index];
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
          <Card
            card={card}
            deckAccent={deck.accent}
            flipped={flipped}
            highlightFact={index === target.index ? target.highlightFact : undefined}
          />
        </div>
        {browse && (
          <div className="fcpop-nav">
            <button
              type="button"
              className="fcpop-nav-btn"
              onClick={() => go(-1)}
              disabled={index === 0}
              aria-label="Previous card"
            >
              ‹
            </button>
            <span className="fcpop-count" aria-live="polite">
              {index + 1} / {count}
            </span>
            <button
              type="button"
              className="fcpop-nav-btn"
              onClick={() => go(1)}
              disabled={index === count - 1}
              aria-label="Next card"
            >
              ›
            </button>
          </div>
        )}
        <p className="fcpop-hint">
          Tap card to flip{browse && " · ← → to browse"} · Esc to close
        </p>
      </div>
    </div>
  );
}
