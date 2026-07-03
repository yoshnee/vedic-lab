"use client";

/* ============================================================
   OnboardingTour.tsx — the chart page's guided-tour popup (the
   "Instructions" modal). Six slides, one looping demo each, with a
   segmented progress bar, dot nav, Back/Next, keyboard nav (Esc,
   ←/→), a focus trap and focus-return — our standard modal a11y bar.
   Auto-opens on first /chart visit and reopens from the header
   Instructions button (both wired in ChartView). Presentational;
   the demos live in onboardingDemos.tsx.
   ============================================================ */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Svg } from "@/components/Svg";
import { diamond } from "@/celestial/celestial";
import { NoteMark } from "@/components/NoteMark";
import { FlashcardIcon } from "@/components/flashcards/FlashcardIcon";
import { DEMOS, type DemoId } from "./onboardingDemos";

interface Slide {
  id: DemoId;
  eyebrow: string;
  title: string;
  body: ReactNode;
}

const SLIDES: Slide[] = [
  {
    id: "twocharts",
    eyebrow: "Two charts",
    title: "Two charts, one focus",
    body: (
      <>Work with <b>two charts at once</b>. Select from the dropdown what each should be. Planet
        panels always read Chart&nbsp;1. Chart&nbsp;2 is for comparison, overlay a transit or
        another varga without disturbing your primary chart.</>
    ),
  },
  {
    id: "panels",
    eyebrow: "Planet panels",
    title: "Every planet, at a glance",
    body: (
      <>Click on a <b>planet panel</b>{" "}to open its full reading: dignity, nakshatra, dasha,
        aspects, yogas and avasthas. A quick snapshot of the planet, always following Chart&nbsp;1.</>
    ),
  },
  {
    id: "dasha",
    eyebrow: "Daśā overlay",
    title: "Study a dasha period",
    body: (
      <>Pick a dasha on the left and switch on <b>Overlay Dashas</b>. The houses that period (and
        sub-period) activates light up on Chart&nbsp;1, giving you a fast visual read on which houses
        may see activity during that planetary period.</>
    ),
  },
  {
    id: "colors",
    eyebrow: "Color coding",
    title: "Colors carry meaning",
    body: (
      <>Every house on both charts are tinted with the color of its sign&apos;s <b>ruling planet</b>,
        and planet icons are shaded for dignity states like exaltation and debilitation. Tap{" "}
        <b>Legend</b> anytime for the full key.</>
    ),
  },
  {
    id: "flashcard",
    eyebrow: "Flashcard icon",
    title: "An instant refresher, anywhere",
    body: (
      <>See this icon?{" "}
        <span className="ob-fc-ico"><FlashcardIcon size={17} /></span> Tap it. Wherever it appears,
        beside a sign, nakshatra or house, it opens a quick refresher <b>flashcard or deck</b>{" "}
        on that concept. Close it when you&apos;re done.</>
    ),
  },
  {
    id: "sticky",
    eyebrow: "Sticky notes",
    title: "Jot as you go",
    body: (
      <>Bring up a sticky note by clicking the sticky note icon{" "}
        <span className="ob-note-ico"><NoteMark variant="chip" /></span> or{" "}
        <span className="ob-add-chip">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><path d="M7 1.8v10.4M1.8 7h10.4" /></svg>
          New sticky note
        </span>{" "}
        in the reading panel. Drag it anywhere and write observations as they come to you. When your
        reading is done, download them all as one text file.</>
    ),
  },
];

const ChevL = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
);
const ChevR = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
);
const ArrowGo = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

export function OnboardingTour({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const last = SLIDES.length - 1;
  const go = (n: number) => setI(Math.max(0, Math.min(last, n)));

  // keyboard: Esc closes, arrows navigate; focus trap + focus return
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const el = dialogRef.current;
    el?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowRight") { setI((x) => Math.min(last, x + 1)); return; }
      if (e.key === "ArrowLeft") { setI((x) => Math.max(0, x - 1)); return; }
      if (e.key === "Tab" && el) {
        const f = el.querySelectorAll<HTMLElement>(
          'button:not(:disabled),[href],[tabindex="0"]',
        );
        if (!f.length) return;
        const first = f[0], lastEl = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === el)) {
          e.preventDefault(); lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault(); first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); opener?.focus(); };
  }, [last, onClose]);

  const slide = SLIDES[i];
  const Demo = DEMOS[slide.id];

  return (
    <div className="ob-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ob-dialog" role="dialog" aria-modal="true" aria-label="Birth chart workspace — guided tour" ref={dialogRef} tabIndex={-1}>
        <div className="ob-head">
          <Svg className="mk" html={diamond(30, { glow: true })} />
          <div className="id">
            <span className="ob-eyebrow">Guided tour · {slide.eyebrow}</span>
            <b>Birth Chart Workspace</b>
          </div>
          <span className="ob-count"><b>{String(i + 1).padStart(2, "0")}</b>&thinsp;/&thinsp;{String(SLIDES.length).padStart(2, "0")}</span>
          <button className="ob-x" onClick={onClose} aria-label="Close tour">✕</button>
        </div>

        <div className="ob-prog" role="tablist" aria-label="Tour progress">
          {SLIDES.map((s, n) => (
            <button key={s.id} role="tab" aria-selected={n === i} aria-label={`Step ${n + 1}: ${s.title}`}
              className={"ob-seg" + (n < i ? " is-done" : "") + (n === i ? " is-cur" : "")} onClick={() => go(n)} />
          ))}
        </div>

        <div className="ob-body" key={i}>
          <div className="ob-demo"><Demo active={true} /></div>
          <div className="ob-text">
            <h3>{slide.title}</h3>
            <p>{slide.body}</p>
          </div>
        </div>

        <div className="ob-foot">
          <div className="ob-dots" aria-hidden="true">
            {SLIDES.map((s, n) => (
              <button key={s.id} className={"ob-dot" + (n === i ? " is-cur" : "")} onClick={() => go(n)} tabIndex={-1} aria-label={`Go to step ${n + 1}`} />
            ))}
          </div>
          <button className="ob-btn ob-btn--ghost" onClick={() => go(i - 1)} disabled={i === 0}>
            <ChevL /> Back
          </button>
          {i < last ? (
            <button className="ob-btn ob-btn--go" onClick={() => go(i + 1)}>Next <ChevR /></button>
          ) : (
            <button className="ob-btn ob-btn--go" onClick={onClose}>Start exploring <ArrowGo /></button>
          )}
        </div>
      </div>
    </div>
  );
}
