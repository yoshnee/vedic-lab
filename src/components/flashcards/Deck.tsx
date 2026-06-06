"use client";

/* The open deck — a modal card stack. Ported from the prototype with
   its accessibility intact: arrow-key nav, space/enter to flip, Esc to
   close, focus tab-trap, swipe gestures, and an aria-live position
   announcement. Count-independent, so the 27-card Nakshatra deck works
   the same as any other. */
import { useState, useEffect, useRef, useCallback } from "react";
import { diamond } from "@/celestial/celestial";
import { Svg } from "@/components/Svg";
import { Card } from "./Card";
import type { Deck as DeckData } from "@/data/decks/types";

export function Deck({ deck, onClose }: { deck: DeckData; onClose: () => void }) {
  const n = deck.cards.length;
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const touch = useRef({ x: 0, y: 0, moved: false });

  const go = useCallback(
    (d: number) => {
      setI((p) => Math.max(0, Math.min(n - 1, p + d)));
      setFlipped(false);
    },
    [n],
  );
  const flip = useCallback(() => setFlipped((f) => !f), []);

  /* keyboard: arrows nav, space/enter flip (unless on a real button), esc close, tab trap */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
        return;
      }
      if (e.key === " " || e.key === "Spacebar" || e.key === "Enter") {
        const target = e.target as HTMLElement;
        if (target.closest && target.closest("button")) return; // let buttons activate natively
        e.preventDefault();
        flip();
        return;
      }
      if (e.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const f = dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]),[tabindex="0"]',
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
  }, [go, flip, onClose]);

  /* focus the card on open */
  useEffect(() => {
    if (cardRef.current) cardRef.current.focus();
  }, []);

  /* announce position + face */
  useEffect(() => {
    if (liveRef.current)
      liveRef.current.textContent =
        "Card " +
        (i + 1) +
        " of " +
        n +
        ". " +
        (flipped ? "Meaning" : "Term") +
        ": " +
        deck.cards[i].title +
        ".";
  }, [i, flipped, n, deck]);

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, moved: false };
  }
  function onTouchMove(e: React.TouchEvent) {
    const t = e.touches[0];
    if (Math.abs(t.clientX - touch.current.x) > 10) touch.current.moved = true;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    else if (!touch.current.moved) flip();
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
        className="fc-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={deck.title + " flashcards"}
        ref={dialogRef}
      >
        <header className="fc-bar">
          <span className="fc-bar-title">
            <Svg html={diamond(22, { glow: true })} /> {deck.title}
          </span>
          <span className="fc-progress" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
            <span> / {String(n).padStart(2, "0")}</span>
          </span>
          <button className="fc-close" onClick={onClose} aria-label="Close deck">
            ✕
          </button>
        </header>
        <div className="fc-progbar">
          <i style={{ width: ((i + 1) / n) * 100 + "%", background: accent }} />
        </div>

        <div className="fc-stage">
          <button
            className="fc-nav"
            onClick={() => go(-1)}
            disabled={i === 0}
            aria-label="Previous card"
          >
            ‹
          </button>

          <div
            className="fc-stack"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <span className="fc-ghost fc-ghost--2" aria-hidden="true" />
            <span className="fc-ghost fc-ghost--1" aria-hidden="true" />
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
              onClick={flip}
            >
              <Card card={card} deckAccent={deck.accent} flipped={flipped} />
            </div>
          </div>

          <button
            className="fc-nav"
            onClick={() => go(1)}
            disabled={i === n - 1}
            aria-label="Next card"
          >
            ›
          </button>
        </div>

        <footer className="fc-foot">
          <button
            className="fc-mininav"
            onClick={() => go(-1)}
            disabled={i === 0}
            aria-label="Previous card"
          >
            ‹ Prev
          </button>
          <span className="fc-foot-hint">Tap to flip · ← → to move</span>
          <button
            className="fc-mininav"
            onClick={() => go(1)}
            disabled={i === n - 1}
            aria-label="Next card"
          >
            Next ›
          </button>
        </footer>

        <div className="fc-sr" aria-live="polite" ref={liveRef} />
      </div>
    </div>
  );
}
