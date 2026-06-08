/* The Birth Chart Analyzer hero — the primary tool, visually distinct from the
   deck tiles. Opens the Birth Details popup, which collects birth date/time/place
   and (later) feeds the live chart at /chart. */
import { diamond } from "@/celestial/celestial";
import { Svg } from "@/components/Svg";

export function AnalyzerHero({ onOpen }: { onOpen: (btn: HTMLButtonElement) => void }) {
  return (
    <section className="analyzer" id="analyzer" aria-labelledby="analyzer-title">
      <button
        type="button"
        className="analyzer-tile"
        onClick={(e) => onOpen(e.currentTarget)}
        aria-label="Open the Birth Chart Analyzer — enter birth details"
      >
        <span className="analyzer-copy">
          <span className="analyzer-eyebrow">Primary tool</span>
          <span className="analyzer-title" id="analyzer-title">
            Birth Chart Analyzer
          </span>
          <span className="analyzer-desc">
            Enter a birth date, time and place to generate an interactive birth
            chart. It&apos;s color-coded and explorable, with each component linked
            to the concept behind it.
          </span>
          <span className="analyzer-cta">Generate your chart</span>
        </span>
        <span className="analyzer-art" aria-hidden="true">
          <Svg html={diamond(220, { glow: true })} />
        </span>
      </button>
    </section>
  );
}
