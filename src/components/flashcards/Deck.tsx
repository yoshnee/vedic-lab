"use client";

/* The ONE flashcard modal — a single reusable card stack used everywhere a card
   opens: the /flashcards grid, the landing deck grid, AND the chart page's panel
   links (this replaced the old separate chart-only FlashcardPopover, so a card
   looks and behaves identically wherever it launches). Accessibility intact:
   arrow-key nav, space/enter to flip, Esc to close, focus tab-trap, swipe
   gestures, aria-live position announcement.

   Two modes off one component:
   - browse (default, the /flashcards + landing decks): page the whole deck —
     side nav arrows, progress bar, ←/→ keys, swipe.
   - single (browse=false, the chart's link to one specific card): pin the
     `initialCard`, no nav/progress. `flip` opens it already flipped and
     `highlightFact` emphasizes a row (chart deep-links land on the exact fact).
     To re-target while open, key the element so it remounts fresh.
   Count-independent, so the 27-card Nakshatra deck works like any other. */
import { useState, useEffect, useRef, useCallback } from "react";
import { diamond } from "@/celestial/celestial";
import { Svg } from "@/components/Svg";
import { Card } from "./Card";
import { DiagramCard } from "./DiagramCard";
import type { Deck as DeckData, CardDiagramLink } from "@/data/decks/types";

export function Deck({
  deck,
  onClose,
  initialCard = 0,
  flip = false,
  highlightFact,
  browse = true,
}: {
  deck: DeckData;
  onClose: () => void;
  initialCard?: number;
  /** Open already flipped — chart deep-links whose highlight lives on the back. */
  flip?: boolean;
  /** Emphasize a front fact-row / back point on the INITIAL card only (chart links). */
  highlightFact?: string;
  /** Browse the whole deck (nav arrows, progress bar, ←/→, swipe). When false,
      pin the single `initialCard` with no nav — the chart's link to one specific
      card. Default true (the /flashcards + landing decks). */
  browse?: boolean;
}) {
  const n = deck.cards.length;
  const [i, setI] = useState(() => Math.max(0, Math.min(n - 1, initialCard)));
  const [flipped, setFlipped] = useState(flip);
  // the in-deck diagram view (opened from a card back's diagramLink button);
  // navigating away or Esc returns to the cards
  const [diagramView, setDiagramView] = useState<CardDiagramLink | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const touch = useRef({ x: 0, y: 0 });
  const swiped = useRef(false); // set on a swipe so the trailing click doesn't also flip
  const diagramRef = useRef(diagramView); // for the keydown handler
  useEffect(() => { diagramRef.current = diagramView; }, [diagramView]);

  const go = useCallback(
    (d: number) => {
      setI((p) => Math.max(0, Math.min(n - 1, p + d)));
      setFlipped(false);
      setDiagramView(null);
    },
    [n],
  );
  const toggleFlip = useCallback(() => setFlipped((f) => !f), []);

  /* keyboard: arrows nav (browse only), space/enter flip (unless on a real
     button), esc closes the diagram view first, then the modal; tab trap */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (diagramRef.current) setDiagramView(null);
        else onClose();
        return;
      }
      if (browse && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        e.preventDefault();
        go(e.key === "ArrowRight" ? 1 : -1);
        return;
      }
      if (e.key === " " || e.key === "Spacebar" || e.key === "Enter") {
        const target = e.target as HTMLElement;
        // let real controls (buttons, the diagram's slider/toggle) activate natively
        if (target.closest && target.closest("button,input,label")) return;
        if (diagramRef.current) return; // the diagram view has no card to flip
        e.preventDefault();
        toggleFlip();
        return;
      }
      if (e.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const f = dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]),input:not([disabled]),[tabindex="0"]',
        );
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, toggleFlip, onClose, browse]);

  /* focus the card on open; re-focus when the diagram view toggles (the
     clicked button unmounts, so focus would fall to the body) */
  useEffect(() => {
    if (cardRef.current) cardRef.current.focus();
    else dialogRef.current?.focus();
  }, [diagramView]);

  /* announce position + face */
  useEffect(() => {
    if (!liveRef.current) return;
    liveRef.current.textContent = diagramView
      ? "Diagram: How Rahu and Ketu Form."
      : (browse ? "Card " + (i + 1) + " of " + n + ". " : "") +
        (flipped ? "Meaning" : "Term") + ": " + deck.cards[i].title + ".";
  }, [i, flipped, n, deck, diagramView, browse]);

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
    swiped.current = false;
  }
  // Touch only NAVIGATES (horizontal swipe, browse mode). The flip happens on the
  // click the browser synthesizes from a tap — see the card's onClick. (Previously
  // a tap flipped here AND on that synthesized click, double-flipping so the card
  // looked like it never flipped on mobile.) A vertical scroll on a long card
  // moves the touch, so the browser fires no click and nothing flips.
  function onTouchEnd(e: React.TouchEvent) {
    if (!browse) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
      swiped.current = true; // tell the trailing click to skip the flip
      go(dx < 0 ? 1 : -1);
    }
  }

  const card = deck.cards[i];
  const accent = card.accentColor || deck.accent;

  return (
    <div
      className="fc-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={
          "fc-dialog" +
          (diagramView ? " fc-dialog--wide" : browse ? "" : " fc-dialog--single")
        }
        role="dialog"
        aria-modal="true"
        aria-label={deck.title + " flashcards"}
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="fc-bar">
          <span className="fc-bar-title">
            <Svg html={diamond(22, { glow: true })} /> {deck.title}
          </span>
          {browse && (
            <span className="fc-progress" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
              <span> / {String(n).padStart(2, "0")}</span>
            </span>
          )}
          <button className="fc-close" onClick={onClose} aria-label="Close deck">
            ✕
          </button>
        </header>
        {browse && (
          <div className="fc-progbar">
            <i style={{ width: ((i + 1) / n) * 100 + "%", background: accent }} />
          </div>
        )}

        <div className="fc-stage">
          {browse && (
            <button
              className="fc-nav"
              onClick={() => go(-1)}
              disabled={i === 0}
              aria-label="Previous card"
            >
              ‹
            </button>
          )}

          {diagramView ? (
            /* the diagram view (a card-back button, with a preset frame):
               wide, non-flipping — no swipe nav (the day slider IS a
               horizontal drag); arrows + side buttons navigate (and close it) */
            <DiagramCard link={diagramView} onBack={() => setDiagramView(null)} />
          ) : (
            <div
              className="fc-stack"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {browse && <span className="fc-ghost fc-ghost--2" aria-hidden="true" />}
              {browse && <span className="fc-ghost fc-ghost--1" aria-hidden="true" />}
              <div
                className="fc-cardbtn"
                role="button"
                tabIndex={0}
                ref={cardRef}
                aria-pressed={flipped}
                aria-label={
                  card.title +
                  (card.sanskrit ? ", " + card.sanskrit : "") +
                  ". " +
                  (flipped ? "Showing meaning." : "Showing term.") +
                  " Activate to flip."
                }
                onClick={() => {
                  // a swipe just navigated; don't let its trailing click also flip
                  if (swiped.current) { swiped.current = false; return; }
                  toggleFlip();
                }}
              >
                <Card
                  card={card}
                  deckAccent={deck.accent}
                  flipped={flipped}
                  highlightFact={i === initialCard ? highlightFact : undefined}
                  onOpenDiagram={setDiagramView}
                />
              </div>
            </div>
          )}

          {browse && (
            <button
              className="fc-nav"
              onClick={() => go(1)}
              disabled={i === n - 1}
              aria-label="Next card"
            >
              ›
            </button>
          )}
        </div>

        <div className="fc-sr" aria-live="polite" ref={liveRef} />
      </div>
    </div>
  );
}
