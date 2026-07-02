"use client";

/* ============================================================
   FlashcardPopover.tsx — single-card popover. When a house / nakshatra / sign
   link in a panel is tapped, the matching real deck card pops up (flip to read).
   Reuses the existing <Card> so it's the same card the flashcard decks show.
   A target with `browse` set (e.g. the maitri pills) unlocks the whole deck:
   prev/next buttons + ←/→ keys page through every card from `index`.
   Cards with a `diagramLink` keep their "View the diagram" button here too —
   it swaps the popover into the same wide DiagramCard view the Deck shows
   (Esc/back returns to the card), so a deck reads identically wherever it
   opens.
   ============================================================ */
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/flashcards/Card";
import { DiagramCard } from "@/components/flashcards/DiagramCard";
import { FlashcardIcon } from "@/components/flashcards/FlashcardIcon";
import type { FlashcardTarget } from "@/lib/flashcardLink";
import type { CardDiagramLink } from "@/data/decks/types";

export function FlashcardPopover({
  target,
  onClose,
}: {
  target: FlashcardTarget;
  onClose: () => void;
}) {
  const [flipped, setFlipped] = useState(!!target.flip); // flip-on-open for back-side highlights
  const [index, setIndex] = useState(target.index);
  // the diagram view (a card back's diagramLink button) — same behavior as
  // the full Deck, so a deck reads identically wherever it opens
  const [diagramView, setDiagramView] = useState<CardDiagramLink | null>(null);
  // a new tap (different target) re-anchors the popover — the sanctioned
  // derive-state-from-props pattern (adjust during render, no effect)
  const [anchor, setAnchor] = useState(target);
  if (anchor !== target) {
    setAnchor(target);
    setIndex(target.index);
    setFlipped(!!target.flip);
    setDiagramView(null);
  }
  const ref = useRef<HTMLDivElement>(null);
  const diagramRef = useRef(diagramView); // for the keydown handler
  useEffect(() => { diagramRef.current = diagramView; }, [diagramView]);

  const browse = !!target.browse && target.deck.cards.length > 1;
  const count = target.deck.cards.length;
  const go = (delta: number) => {
    setIndex((i) => Math.min(count - 1, Math.max(0, i + delta)));
    setFlipped(false);
    setDiagramView(null);
  };

  useEffect(() => {
    ref.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (diagramRef.current) setDiagramView(null);
        else onClose();
      } else if (browse && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        // let native controls (the diagram's day slider, etc.) keep their arrows
        if ((e.target as HTMLElement).closest?.("input, select, textarea, button")) return;
        e.preventDefault();
        go(e.key === "ArrowLeft" ? -1 : 1);
      } else if (e.key === " " || e.key === "Enter") {
        // let real controls (close/nav + the diagram's slider/toggle/buttons) activate natively
        if ((e.target as HTMLElement).closest?.(".fcpop-close, .fcpop-nav-btn, button, input, label")) return;
        if (diagramRef.current) return; // the diagram view has no card to flip
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
      <div
        className={"fcpop-dialog" + (diagramView ? " fcpop-dialog--wide" : "")}
        role="dialog"
        aria-modal="true"
        aria-label={`${card.title} flashcard`}
      >
        <header className="fcpop-bar">
          <span className="fcpop-title">
            <FlashcardIcon size={20} /> Flashcard
          </span>
          <span className="fcpop-kind">{deck.title}</span>
          <button className="fcpop-close" onClick={onClose} aria-label="Close flashcard">
            ✕
          </button>
        </header>
        {diagramView ? (
          <DiagramCard link={diagramView} onBack={() => setDiagramView(null)} />
        ) : (
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
              onOpenDiagram={setDiagramView}
            />
          </div>
        )}
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
