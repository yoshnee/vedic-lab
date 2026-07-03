"use client";

/* The dedicated /flashcards route — a full grid of every (non-hidden) deck in
   the registry, opening the same deck overlay used on the landing. Ported from
   the design handoff's flashcards-page.jsx; the global SiteHeader/Footer come
   from app/layout.tsx, so this renders only the page body + the deck modal. */
import { useState, useEffect, useRef } from "react";
import { diamond } from "@/celestial/celestial";
import { Svg } from "@/components/Svg";
import { DeckTile } from "./DeckTile";
import { Deck as DeckModal } from "./Deck";
import { DECKS } from "@/data/decks/registry";
import type { Deck } from "@/data/decks/types";

export function FlashcardsApp() {
  const decks = DECKS.filter((d) => !d.hidden);
  const totalCards = decks.reduce((n, d) => n + d.cards.length, 0);
  const [openDeck, setOpenDeck] = useState<Deck | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const onOpen = (deck: Deck, btn: HTMLButtonElement) => {
    opener.current = btn;
    setOpenDeck(deck);
  };
  const onClose = () => setOpenDeck(null);

  useEffect(() => {
    document.body.style.overflow = openDeck ? "hidden" : "";
    if (!openDeck && opener.current) {
      opener.current.focus();
      opener.current = null;
    }
    // never leave the scroll lock behind if this unmounts while a deck is open
    return () => {
      document.body.style.overflow = "";
    };
  }, [openDeck]);

  return (
    <>
      <main className="page fc-page">
        <header className="page-hero">
          <span className="page-eyebrow">
            <Svg html={diamond(22, { glow: true })} /> The study hall
          </span>
          <h1 className="page-title">Flashcards</h1>
          <p className="page-lede">
            Flashcard decks for every core concept in Jyotish. Flip, learn, repeat until it sticks.
          </p>
          <p className="page-lede">
            <b>
              These decks may evolve over time. Some may feel dense right now, and they may
              eventually get refined. More decks will be added as new concepts make their way into
              the Lab.
            </b>
          </p>
          <p className="fc-page-stat">
            <b>{decks.length}</b> decks<span>·</span>
            <b>{totalCards}</b> cards<span>·</span>
            more on the way
          </p>
        </header>

        <div className="fc-page-grid">
          {decks.map((d) => (
            <DeckTile key={d.id} deck={d} onOpen={onOpen} />
          ))}
        </div>
      </main>
      {openDeck && <DeckModal deck={openDeck} onClose={onClose} />}
    </>
  );
}
