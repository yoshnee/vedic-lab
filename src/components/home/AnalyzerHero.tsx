"use client";

/* The Birth Chart Analyzer hero — the primary tool, visually distinct
   from the deck tiles. Its CTA opens the stub modal (engine is a later
   phase). */
import { diamond } from "@/celestial/celestial";
import { Svg } from "@/components/Svg";

export function AnalyzerHero({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="analyzer" aria-labelledby="analyzer-title">
      <button
        className="analyzer-tile"
        onClick={onOpen}
        aria-label="Open the Birth Chart Analyzer — enter birth details"
      >
        <span className="analyzer-copy">
          <span className="analyzer-eyebrow">Primary tool</span>
          <span className="analyzer-title" id="analyzer-title">
            Birth Chart Analyzer
          </span>
          <span className="analyzer-desc">
            Enter a birth date, time and place to generate an interactive North
            Indian chart — planets, houses, nakshatras and dasha, color-coded and
            explorable.
          </span>
          <span className="analyzer-cta">
            Generate your chart <span aria-hidden="true">→</span>
          </span>
        </span>
        <span className="analyzer-art" aria-hidden="true">
          <Svg html={diamond(220, { glow: true })} />
        </span>
      </button>
    </section>
  );
}
