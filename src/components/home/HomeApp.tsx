"use client";

/* The landing page composition: app header → analyzer hero → flashcards
   grid. Owns the open-deck and analyzer-modal state, locks body scroll
   while a modal is open, and returns focus to the opener on close. */
import { useState, useEffect, useRef } from "react";
import { AppHeader } from "./AppHeader";
import { AnalyzerHero } from "./AnalyzerHero";
import { AnalyzerStub } from "./AnalyzerStub";
import { DeckGrid } from "@/components/flashcards/DeckGrid";
import { Deck as DeckModal } from "@/components/flashcards/Deck";
import { DECKS } from "@/data/decks/registry";
import type { Deck } from "@/data/decks/types";

export function HomeApp() {
  const [openDeck, setOpenDeck] = useState<Deck | null>(null);
  const [analyzer, setAnalyzer] = useState(false);
  const opener = useRef<HTMLButtonElement | null>(null);

  const onOpen = (deck: Deck, btn: HTMLButtonElement) => {
    opener.current = btn;
    setOpenDeck(deck);
  };
  const onClose = () => setOpenDeck(null);

  useEffect(() => {
    document.body.style.overflow = openDeck || analyzer ? "hidden" : "";
    if (!openDeck && opener.current) {
      opener.current.focus();
      opener.current = null;
    }
  }, [openDeck, analyzer]);

  return (
    <>
      <AppHeader />
      <main className="home">
        <AnalyzerHero onOpen={() => setAnalyzer(true)} />
        <DeckGrid decks={DECKS} onOpen={onOpen} />
      </main>
      {openDeck && <DeckModal deck={openDeck} onClose={onClose} />}
      {analyzer && <AnalyzerStub onClose={() => setAnalyzer(false)} />}
    </>
  );
}
