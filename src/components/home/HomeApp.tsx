"use client";

/* The landing page composition: rotating hero → analyzer hero → flashcards
   teaser (five featured decks + a "…and more" link to the full /flashcards page).
   Owns the open-deck and birth-details modal state, locks body scroll while a
   modal is open, and returns focus to the opener on close. */
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { HeroRotator } from "./HeroRotator";
import { AnalyzerHero } from "./AnalyzerHero";
import { FCTeaser } from "./FCTeaser";
import { BirthDetailsModal } from "./BirthDetailsModal";
import { Deck as DeckModal } from "@/components/flashcards/Deck";
import { DECKS } from "@/data/decks/registry";
import type { Deck } from "@/data/decks/types";
import { BIRTH_DETAILS_KEY, toEngineCivil, type BirthDetails } from "@/lib/birth";
import { useChart } from "@/lib/chart/ChartProvider";
import { generateChart } from "@/lib/chart/generateChart";

/* The decks previewed on the landing teaser, in display order — the five
   fundamentals a student learns first. With the trailing "…and more" tile that
   makes six cells (two rows of three). The rest live on /flashcards. Ids that
   don't resolve are skipped, so this is safe to edit. */
const FEATURED_DECK_IDS = ["houses", "planets", "zodiacs", "rahu-ketu", "maitri"];

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

  // The landing grid teases five fundamentals (+ a "…and more" tile); the rest
  // live on /flashcards. Hidden decks stay registered (chart-page links) but never tile.
  const visibleDecks = DECKS.filter((d) => !d.hidden);
  const featured = FEATURED_DECK_IDS.map((id) => visibleDecks.find((d) => d.id === id)).filter(
    (d): d is Deck => Boolean(d),
  );

  return (
    <>
      <HeroRotator />
      <main className="home">
        <AnalyzerHero onOpen={onOpenAnalyzer} />
        <FCTeaser decks={visibleDecks} featured={featured} onOpen={onOpenDeck} />
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
