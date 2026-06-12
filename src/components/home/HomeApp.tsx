"use client";

/* The landing page composition: app header → analyzer hero → flashcards grid.
   Owns the open-deck and birth-details modal state, locks body scroll while a
   modal is open, and returns focus to the opener on close. */
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "./AppHeader";
import { AnalyzerHero } from "./AnalyzerHero";
import { BirthDetailsModal } from "./BirthDetailsModal";
import { DeckGrid } from "@/components/flashcards/DeckGrid";
import { Deck as DeckModal } from "@/components/flashcards/Deck";
import { DECKS } from "@/data/decks/registry";
import type { Deck } from "@/data/decks/types";
import { BIRTH_DETAILS_KEY, toEngineCivil, type BirthDetails } from "@/lib/birth";
import { useChart } from "@/lib/chart/ChartProvider";
import { generateChart } from "@/lib/chart/generateChart";

export function HomeApp() {
  const [openDeck, setOpenDeck] = useState<Deck | null>(null);
  const [analyzer, setAnalyzer] = useState(false);
  const opener = useRef<HTMLButtonElement | null>(null);
  const submitSeq = useRef(0); // invalidates an in-flight compute if the modal is closed
  const router = useRouter();
  const { setModel, setLoading, setError, loading, error } = useChart();

  // Auto-open the modal when redirected home with ?analyzer=1 (cold /chart deep-link).
  // A post-mount effect (not lazy initial state) is deliberate: reading the URL during
  // render would diverge from the SSR'd markup and cause a hydration mismatch.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("analyzer") === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot URL-driven open
      setAnalyzer(true);
    }
  }, []);

  const onOpenDeck = (deck: Deck, btn: HTMLButtonElement) => {
    opener.current = btn;
    setOpenDeck(deck);
  };
  const onOpenAnalyzer = (btn: HTMLButtonElement) => {
    opener.current = btn;
    setError(null);
    setAnalyzer(true);
  };
  const onCloseDeck = () => setOpenDeck(null);
  const closeAnalyzer = () => {
    submitSeq.current++; // discard any in-flight compute
    setLoading(false);
    setError(null);
    setAnalyzer(false);
  };

  const handleGenerate = async (details: BirthDetails) => {
    const civil = toEngineCivil(details);
    // Persist the engine-ready civil shape so /chart can recompute on refresh.
    try {
      sessionStorage.setItem(BIRTH_DETAILS_KEY, JSON.stringify(civil));
    } catch {
      /* sessionStorage unavailable (private mode) — non-fatal */
    }
    const seq = ++submitSeq.current;
    setError(null);
    setLoading(true);
    try {
      const model = await generateChart(civil);
      if (seq !== submitSeq.current) return; // modal was closed mid-compute
      setModel(model);
      setLoading(false);
      setAnalyzer(false);
      router.push("/chart");
    } catch (e) {
      if (seq !== submitSeq.current) return;
      setLoading(false);
      setError(
        e instanceof Error && e.message
          ? `Could not cast the chart: ${e.message}`
          : "Could not cast the chart. Please try again.",
      );
      // keep the modal open; do NOT navigate to a broken page
    }
  };

  useEffect(() => {
    const anyOpen = openDeck || analyzer;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    if (!anyOpen && opener.current) {
      opener.current.focus();
      opener.current = null;
    }
  }, [openDeck, analyzer]);

  return (
    <>
      <AppHeader />
      <main className="home">
        <AnalyzerHero onOpen={onOpenAnalyzer} />
        <div id="flashcards">
          {/* hidden decks stay registered (chart-page flashcard links) but
              never tile on the landing grid */}
          <DeckGrid decks={DECKS.filter((d) => !d.hidden)} onOpen={onOpenDeck} />
        </div>
      </main>
      {openDeck && <DeckModal deck={openDeck} onClose={onCloseDeck} />}
      {analyzer && (
        <BirthDetailsModal
          onClose={closeAnalyzer}
          onGenerate={handleGenerate}
          submitting={loading}
          error={error}
        />
      )}
    </>
  );
}
