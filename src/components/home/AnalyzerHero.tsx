"use client";

/* The Birth Chart Workspace hero — the primary tool, visually distinct from the
   deck tiles. A full-width title header sits above a two-column body: the study
   pitch + tappable "moments" + CTA on the left, and an auto-playing demo on the
   right. The demo cycles three beats over our REAL chart art — house 1 glows and
   the real Ashwinī nakshatra card flips open, then house 10 with the real
   10th-house card, then a sticky note is jotted (our reading-notes look). Both
   the CTA and the demo open the Birth Details popup, which collects birth
   date/time/place and feeds the live chart at /chart. */
import { useEffect, useRef, useState } from "react";
import { Svg } from "@/components/Svg";
import { NoteMark } from "@/components/NoteMark";
import { Card } from "@/components/flashcards/Card";
import { FlashcardIcon } from "@/components/flashcards/FlashcardIcon";
import { DECKS } from "@/data/decks/registry";
import { chart } from "@/celestial/celestial";
import type { Card as CardData } from "@/data/decks/types";

// The demo flips our ACTUAL deck cards, not lookalikes — pulled straight from the
// registry so they stay in lockstep with the real decks.
const deckById = (id: string) => DECKS.find((d) => d.id === id)!;
const NAK = deckById("nakshatras");
const HOUSES = deckById("houses");
const ASHWINI = NAK.cards[0]; // the deck leads with Ashwinī (nakshatra 01)
const HOUSE_10 = HOUSES.cards.find((c) => c.title === "10th House")!;

type Beat =
  | { kind: "card"; house: number; card: CardData; accent: string; flip: boolean }
  | { kind: "note"; house: number };

// Three beats, mirroring the three study "moments". Ashwinī stays FRONT-only
// (its ruler is on the card front); the 10th house flips to its affairs (the
// significations back); then a sticky note is jotted.
const BEATS: Beat[] = [
  { kind: "card", house: 1, card: ASHWINI, accent: ASHWINI.accentColor ?? NAK.accent, flip: false },
  { kind: "card", house: 10, card: HOUSE_10, accent: HOUSE_10.accentColor ?? HOUSES.accent, flip: true },
  { kind: "note", house: 7 },
];

// The tappable study cues beneath the pitch — a hook question and the answer.
// Uniform gold-accent styling (see .az-moment); card moments show the shared
// FlashcardIcon (the brand diamond used everywhere on the chart page), the note
// moment shows our sticky-note mark.
const MOMENTS: { q: string; a: string; note?: boolean }[] = [
  { q: "Ascendant in Ashwinī?", a: "Flip its nakshatra card to recall its ruler" },
  { q: "Mars in the 10th?", a: "Flip the 10th house card to recall its affairs" },
  { q: "Śani daśā ahead?", a: "Jot the activated houses on a sticky note", note: true },
];

const BEAT_MS = 3400;
const FLIP_DELAY = 1150;

function prefersReduced(): boolean {
  return typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

function AnalyzerDemo() {
  const [step, setStep] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const reduce = useRef(prefersReduced());

  // Advance beats on a loop (frozen for reduced-motion, resting on the first beat).
  useEffect(() => {
    if (reduce.current) return;
    const adv = setInterval(() => setStep((p) => (p + 1) % BEATS.length), BEAT_MS);
    return () => clearInterval(adv);
  }, []);

  // Each beat starts front-facing; only a beat marked flip flips a moment later.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate per-beat reset
    setFlipped(false);
    if (reduce.current) return;
    const b = BEATS[step];
    if (b.kind !== "card" || !b.flip) return;
    const t = setTimeout(() => setFlipped(true), FLIP_DELAY);
    return () => clearTimeout(t);
  }, [step]);

  const beat = BEATS[step];
  return (
    <span className="az-demo" aria-hidden="true">
      <span className="az-chart" key={"chart-" + step}>
        <Svg
          className="az-chart-svg"
          html={chart(200, { highlight: beat.house, fill: "rgba(228,194,87,0.34)" })}
        />
      </span>
      <span className="az-artifact" key={"art-" + step}>
        {beat.kind === "card" ? (
          <span className="az-card-wrap">
            <Card card={beat.card} deckAccent={beat.accent} flipped={flipped} />
          </span>
        ) : (
          <NoteMark variant="demo" />
        )}
      </span>
    </span>
  );
}

export function AnalyzerHero({ onOpen }: { onOpen: (btn: HTMLButtonElement) => void }) {
  return (
    <section className="analyzer" id="analyzer" aria-labelledby="analyzer-title">
      <div className="analyzer-tile">
        <div className="analyzer-head">
          <span className="analyzer-eyebrow">Hands-on study · Birth Chart Workspace</span>
          <h2 className="analyzer-title" id="analyzer-title">
            The only birth chart tool with your study materials built in.
          </h2>
        </div>

        <div className="analyzer-copy">
          <p className="analyzer-desc">
            This one teaches while you analyze a chart, flashcards for quick recall and sticky
            notes to jot down your scattered thoughts.
          </p>

          <ul className="az-moments">
            {MOMENTS.map((m) => (
              <li className={"az-moment" + (m.note ? " az-moment--note" : "")} key={m.q}>
                <span className="az-moment-thumb">
                  {m.note ? <NoteMark variant="chip" /> : <FlashcardIcon size={22} />}
                </span>
                <span className="az-moment-text">
                  <span className="az-moment-q">{m.q}</span>
                  <span className="az-moment-a">{m.a}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          className="analyzer-demo-btn"
          onClick={(e) => onOpen(e.currentTarget)}
          aria-label="Open the Birth Chart Workspace to enter birth details"
        >
          <AnalyzerDemo />
        </button>

        <button type="button" className="analyzer-cta" onClick={(e) => onOpen(e.currentTarget)}>
          Study a Chart
        </button>
      </div>
    </section>
  );
}
