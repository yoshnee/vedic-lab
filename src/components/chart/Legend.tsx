"use client";

/* ============================================================
   Legend.tsx — the global symbol key for the chart page, in a slide-in drawer
   (full-screen on mobile) opened from the chart header. Zero layout footprint
   when closed. EVERY symbol is rendered from the same tokens/components the
   charts + panels use (body() glyphs, .pp-fn / .pp-pill badges, .nic-sign,
   combust()), so the legend can never drift from the live UI. It is a purely
   read-only visual key — nothing here is interactive and no row opens a
   flashcard.
   ============================================================ */
import { useEffect, useRef } from "react";
import { Svg } from "@/components/Svg";
import { body, combust } from "@/celestial/celestial";
import { PLANET_COLORS } from "@/lib/design/colors";
import type { Dignity, PlanetKey, Maitri, FunctionalNature } from "@/core/types";

const PLANETS: { key: PlanetKey; name: string }[] = [
  { key: "sun", name: "Sun" }, { key: "moon", name: "Moon" }, { key: "mars", name: "Mars" },
  { key: "mercury", name: "Mercury" }, { key: "jupiter", name: "Jupiter" }, { key: "venus", name: "Venus" },
  { key: "saturn", name: "Saturn" }, { key: "rahu", name: "Rahu" }, { key: "ketu", name: "Ketu" },
];

const DIGNITIES: { state: Dignity; label: string }[] = [
  { state: "exalted", label: "Exalted (Uccha)" },
  { state: "debilitated", label: "Debilitated (Nīcha)" },
  { state: "own", label: "Own sign (Svakṣetra)" },
  { state: "neutral", label: "Neutral" },
];

const FUNCTIONAL: { fn: FunctionalNature; letter: string; label: string }[] = [
  { fn: "benefic", letter: "B", label: "Functional benefic" },
  { fn: "malefic", letter: "M", label: "Functional malefic" },
  { fn: "neutral", letter: "N", label: "Functional neutral" },
  { fn: "yogakaraka", letter: "Y", label: "Yogakāraka" },
];

const MAITRI: { key: Maitri; label: string }[] = [
  { key: "adhi_mitra", label: "Great Friend" },
  { key: "mitra", label: "Friend" },
  { key: "sama", label: "Neutral" },
  { key: "shatru", label: "Enemy" },
  { key: "adhi_shatru", label: "Great Enemy" },
  { key: "own_sign", label: "Own Sign" },
];

/** One read-only legend item: a swatch and its label/hint. */
function Item({ swatch, label, hint }: {
  swatch: React.ReactNode; label: string; hint?: string;
}) {
  return (
    <div className="lg-item">
      <span className="lg-swatch">{swatch}</span>
      <span className="lg-text">
        <span className="lg-label">{label}</span>
        {hint && <span className="lg-hint">{hint}</span>}
      </span>
    </div>
  );
}

export function Legend({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    el?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Tab" && el) {
        const f = el.querySelectorAll<HTMLElement>('button,[href],[tabindex="0"]');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="legend-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <aside className="legend" role="dialog" aria-modal="true" aria-labelledby="legend-title" ref={ref} tabIndex={-1}>
        <header className="legend-head">
          <h2 id="legend-title">Legend</h2>
          <button type="button" className="legend-close" onClick={onClose} aria-label="Close legend">✕</button>
        </header>

        <div className="legend-body">
          <section className="lg-sec">
            <h3>Planet colors</h3>
            <div className="lg-grid">
              {PLANETS.map((p) => (
                <Item key={p.key} label={p.name}
                  swatch={<Svg html={body(p.key, 28)} />} />
              ))}
            </div>
          </section>

          <section className="lg-sec">
            <h3>Dignity <span className="lg-sec-sub">on the glyph</span></h3>
            <div className="lg-grid">
              {DIGNITIES.map((d) => (
                <Item key={d.state} label={d.label}
                  swatch={<Svg html={body("mars", 30, { state: d.state })} />} />
              ))}
              <Item label="Retrograde (Vakrī)" hint="gold ℞, stacks on any dignity"
                swatch={<Svg html={body("mars", 30, { retro: true })} />} />
            </div>
            <p className="lg-note">Identity color never changes — a debilitated Mars is still red.</p>
          </section>

          <section className="lg-sec">
            <h3>Functional nature <span className="lg-sec-sub">badge, for this lagna</span></h3>
            <div className="lg-grid">
              {FUNCTIONAL.map((f) => (
                <Item key={f.fn} label={f.label}
                  swatch={<span className="pp-fn" data-fn={f.fn}>{f.letter}</span>} />
              ))}
            </div>
          </section>

          <section className="lg-sec">
            <h3>Friendship <span className="lg-sec-sub">to the dispositor</span></h3>
            <div className="lg-grid">
              {MAITRI.map((m) => (
                <Item key={m.key} label={m.label}
                  swatch={<span className="pp-pill" data-kind="maitri" data-maitri={m.key}>{m.label}</span>} />
              ))}
            </div>
          </section>

          <section className="lg-sec">
            <h3>Markers</h3>
            <div className="lg-grid">
              <Item label="Gandanta" hint="water→fire knot; brighter when deep"
                swatch={<span className="pp-pill" data-kind="gandanta">Gandanta</span>} />
              <Item label="Combust (Asta)" hint="within the Sun's glare"
                swatch={<Svg html={combust(34)} />} />
            </div>
          </section>

          <section className="lg-sec">
            <h3>Daśā pills</h3>
            <div className="lg-grid">
              <Item label="Mahādaśā lord" swatch={<span className="pp-pill" data-kind="maha">Mahādaśā lord</span>} />
              <Item label="Antardaśā lord" swatch={<span className="pp-pill" data-kind="antar">Antardaśā lord</span>} />
            </div>
          </section>

          <section className="lg-sec">
            <h3>Chart notation</h3>
            <div className="lg-grid">
              <Item label="Ascendant marker" hint="the Lagna, in house 1"
                swatch={<span className="lg-asc">Asc 12°34′</span>} />
              <Item label="Sign glyph + rāśi no." hint="1 Aries … 12 Pisces"
                swatch={
                  <span className="nic-sign">
                    <span className="nic-sign-gl" style={{ color: PLANET_COLORS.mars }} aria-hidden="true">♈</span>
                    <span className="nic-sign-no">1</span>
                  </span>
                } />
              <Item label="Retrograde" hint="shown as ℞" swatch={<span className="lg-mono">℞</span>} />
              <Item label="Degree" hint="degrees°minutes′ in the sign" swatch={<span className="lg-mono">20°10′</span>} />
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
