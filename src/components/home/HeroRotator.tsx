"use client";

/* The landing hero — a rotating sequence of pain → promise phrases, the
   centrepiece of the page. It auto-advances, pauses on hover/focus, respects
   prefers-reduced-motion, and mirrors the live phrase into an aria-live region
   for screen readers. Dots let the reader jump between messages.
   Ported from the design-reference prototype (flashcards/home.jsx HeroRotator). */
import { useState, useEffect, useRef } from "react";
import { diamond } from "@/celestial/celestial";
import { Svg } from "@/components/Svg";
import { SITE } from "@/lib/site";

const HERO_PHRASES = [
  {
    pain: "A hundred tabs, twelve books, one confused student.",
    promise: "Crystallize the foundation first.",
  },
  {
    pain: "Jyotish is a science, but reading a chart takes intuition.",
    promise: "Intuition doesn’t flow from a shaky foundation.",
  },
  {
    pain: "Planets, houses, nakshatras, dashas. You know the pieces.",
    promise: "Synthesis is the hard part.",
  },
  {
    pain: "No teacher looking over your shoulder?",
    promise: "The Lab is your study hall.",
  },
  {
    pain: "You can’t synthesize what you haven’t internalized.",
    promise: "Drill it until it’s yours.",
  },
  {
    pain: "Jyotish means light. Scattered light illuminates nothing.",
    promise: "Focused, it reveals everything.",
  },
];
const HERO_INTERVAL = 6200;

export function HeroRotator() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useRef(false);

  // Read the reduced-motion preference after mount (window isn't available
  // during SSR) so the auto-advance effect can honour it.
  useEffect(() => {
    reduce.current =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;
  }, []);

  useEffect(() => {
    if (paused || reduce.current) return undefined;
    const t = setInterval(() => setI((p) => (p + 1) % HERO_PHRASES.length), HERO_INTERVAL);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <header className="hero">
      <div className="hero-lockup">
        <Svg className="hero-mark" html={diamond(60, { glow: true })} />
        <h1 className="hero-wordmark">{SITE.name}</h1>
        <p className="hero-tagline">{SITE.tagline}</p>
      </div>

      <div
        className="hero-stage"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        {HERO_PHRASES.map((ph, idx) => (
          <p
            key={idx}
            className={"hero-phrase" + (idx === i ? " is-active" : "")}
            aria-hidden={idx === i ? undefined : true}
          >
            <span className="hero-pain">{ph.pain}</span>
            <span className="hero-promise">{ph.promise}</span>
          </p>
        ))}
        <div className="hero-sr" aria-live="polite" aria-atomic="true">
          {HERO_PHRASES[i].pain + " " + HERO_PHRASES[i].promise}
        </div>
      </div>

      <div className="hero-dots" role="tablist" aria-label="Hero messages">
        {HERO_PHRASES.map((ph, idx) => (
          <button
            key={idx}
            type="button"
            role="tab"
            className={"hero-dot" + (idx === i ? " is-active" : "")}
            aria-selected={idx === i}
            aria-label={"Message " + (idx + 1) + ": " + ph.promise}
            onClick={() => setI(idx)}
          />
        ))}
      </div>
    </header>
  );
}
