"use client";

/* ============================================================
   ChartView.tsx — the birth-chart page body. Layout: a chart header (back-link +
   Legend), the hero meta, then a desktop 3-up region — a sticky Vimśottarī daśā
   rail | the natal chart | a second chart driven by a type selector (Transit
   now; divisionals later) — and below it the nine planet panels in a 2-column
   grid (an open panel spans full width). On mobile everything stacks and the
   daśā rail becomes a slide-in drawer. Owns the flashcard popover, the legend
   drawer, the daśā drawer, and the Chart-2 type. Natal + transit render through
   the same NorthIndianChart on the SAME natal lagna frame.
   ============================================================ */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Svg } from "@/components/Svg";
import { diamond, body } from "@/celestial/celestial";
import { buildD9, buildVargaPanels } from "@/lib/chart/varga";
import { ChartCard, type ChartOption } from "./ChartCard";
import { ChartRuler } from "./ChartRuler";
import { ElementBalance } from "./ElementBalance";
import { DashaRail } from "./DashaRail";
import { PlanetPanel } from "./PlanetPanel";
import { Legend } from "./Legend";
import { FlashcardPopover } from "./FlashcardPopover";
import { resolveFlashcard, type FlashcardType, type FlashcardTarget } from "@/lib/flashcardLink";
import type { ChartModel } from "@/lib/chart/types";
import type { PlanetKey } from "@/core/types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PNAME: Record<PlanetKey, string> = {
  sun: "Sun", moon: "Moon", mars: "Mars", mercury: "Mercury", jupiter: "Jupiter",
  venus: "Venus", saturn: "Saturn", rahu: "Rahu", ketu: "Ketu",
};

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Transit caption — when the present-moment positions were computed (UT). */
function fmtTransit(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `as of ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} · ${hh}:${mm} UT`;
}

/** Small crescent — opens one way for waxing, mirrored for waning (matches the panel). */
function MoonGlyph({ waxing }: { waxing: boolean }) {
  return (
    <svg className="chart-moon-glyph" width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"
      style={waxing ? undefined : { transform: "scaleX(-1)", transformOrigin: "center" }}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" />
    </svg>
  );
}

/* The chart-type selectors. Vargas can show on either side; Transit is
   right-only (the natal-vs-X reading layout, and its "as of" caption belongs
   there). Unbuilt vargas are visible-but-disabled "soon" stubs on both sides. */
type Chart1Type = "d1" | "d9";
type Chart2Type = "transit" | "d1" | "d9";
const VARGA_OPTIONS: ChartOption[] = [
  { value: "d1", label: "Natal · Rāśi (D1)" },
  { value: "d9", label: "Navāṁśa (D9)" },
  { value: "d10", label: "Daśāṁśa (D10) · soon", disabled: true },
  { value: "d60", label: "Ṣaṣṭyāṁśa (D60) · soon", disabled: true },
];
const CHART2_OPTIONS: ChartOption[] = [
  { value: "transit", label: "Transit · Gochara" },
  ...VARGA_OPTIONS,
];

export function ChartView({ model }: { model: ChartModel }) {
  const { chart, meta, panchanga, transit } = model;
  const [fc, setFc] = useState<FlashcardTarget | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const [dashaOpen, setDashaOpen] = useState(false); // mobile daśā drawer
  const [chart1, setChart1] = useState<Chart1Type>("d1");
  const [chart2, setChart2] = useState<Chart2Type>("transit");

  // Lock body scroll while any overlay is open.
  useEffect(() => {
    const anyOverlay = fc || legendOpen || dashaOpen;
    document.body.style.overflow = anyOverlay ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [fc, legendOpen, dashaOpen]);

  const openCard = (type: FlashcardType, id?: string | number) => {
    const target = resolveFlashcard(type, id);
    if (target) setFc(target);
  };
  // Daśā-lord pill: on mobile open the drawer; on desktop the rail is already
  // visible (sticky), so just bring it into view at the top.
  const openDasha = () => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 959px)").matches) {
      setDashaOpen(true);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const selectPlanet = (key: PlanetKey) =>
    document.getElementById(`panel-${key}`)?.scrollIntoView({ behavior: "smooth", block: "center" });

  const frame = { ascSign: chart.ascendant.sign, ascDegree: chart.ascendant.degree };
  const d9 = useMemo(() => buildD9(chart), [chart]);

  /* Chart 1 is the PANEL CONTEXT: toggling it re-derives the planet panels for
     that varga (sign-level facts only — see buildVargaPanels); toggling back
     restores the natal detail. Chart 2 never affects the panels. */
  const d9Panels = useMemo(() => buildVargaPanels(chart), [chart]);
  const vargaMode = chart1 !== "d1";
  const panelPlanets = vargaMode ? d9Panels.planets : chart.planets;
  const panelAscSign = vargaMode ? d9Panels.ascendant.signName : chart.ascendant.signName;
  const vargaLabel = vargaMode ? "Navāṁśa · D9" : undefined;

  /** Dataset for a selected chart type — toggling is non-destructive; every
      set derives from the model already in memory, so switching back restores. */
  const dataFor = (t: Chart1Type | Chart2Type) =>
    t === "transit"
      ? {
          frame,
          planets: transit?.planets ?? [],
          caption: transit ? fmtTransit(transit.computedUtcISO) : "transit unavailable",
        }
      : t === "d9"
        ? { frame: d9.frame, planets: d9.planets, caption: "spouse · dharma · inner nature" }
        : { frame, planets: chart.planets, caption: chart.birth.dateLabel };
  const c1 = dataFor(chart1);
  const c2 = dataFor(chart2);

  return (
    <>
      <header className="chart-header">
        <Link className="chart-back" href="/">
          <Svg className="chart-mark" html={diamond(30, { glow: true })} />
          <span>Vedic Astrology Lab</span>
        </Link>
        <button type="button" className="chart-legend-btn" onClick={() => setLegendOpen(true)}>
          <span aria-hidden="true">?</span> Legend
        </button>
      </header>

      <main className="chart-page">
        <div className="chart-hero-meta">
          <h1 className="chart-title">{meta.name ? meta.name : "Birth Chart"}</h1>
          <p className="chart-birth">
            {chart.birth.dateLabel}
            {chart.birth.placeLabel ? ` · ${chart.birth.placeLabel}` : ""}
          </p>
          <p className="chart-asc">
            Ascendant <b>{chart.ascendant.signName}</b> {chart.ascendant.degree}
            {chart.ascendant.gandanta && (
              <button
                type="button"
                className="pp-pill"
                data-kind="gandanta"
                data-deep={chart.ascendant.gandantaDeep || undefined}
                title={`Lagna ${chart.ascendant.gandantaDistance.toFixed(2)}° from the water→fire junction${chart.ascendant.gandantaDeep ? " — inside the 28°20′→1°40′ true gandanta zone" : ""}`}
                onClick={() => openCard("gandanta")}
              >
                {chart.ascendant.gandantaDeep ? "True Gandanta" : "Gandanta"}
              </button>
            )}
          </p>
          {panchanga.tithiNumber != null && (
            <p className="chart-moon">
              <MoonGlyph waxing={!!panchanga.waxing} />
              {panchanga.waxing ? "Waxing" : "Waning"} Moon · {ordinal(panchanga.tithiNumber)} tithi
            </p>
          )}
        </div>

        <div className="chart-layout">
          <aside className="dasha-rail" aria-label="Vimśottarī daśā">
            <DashaRail dasha={chart.dasha} current={chart.currentDasha} />
            <ElementBalance planets={chart.planets} onOpenCard={openCard} />
          </aside>

          <div className="chart-main">
            <button type="button" className="dasha-trigger" onClick={() => setDashaOpen(true)}>
              <span className="dt-lbl">Vimśottarī Daśā</span>
              <span className="dt-now">
                {chart.currentDasha.chain.map((pk, i) => (
                  <span className="dt-step" key={i}>
                    {i > 0 && <span className="dt-arr">→</span>}
                    <Svg html={body(pk, 16)} />
                    {PNAME[pk]}
                  </span>
                ))}
              </span>
            </button>

            <div className="chart-top">
              <ChartCard
                label="Chart 1"
                value={chart1}
                options={VARGA_OPTIONS}
                onChange={(v) => { if (v === "d1" || v === "d9") setChart1(v); }}
                caption={c1.caption}
                frame={c1.frame}
                planets={c1.planets}
                onSelectPlanet={selectPlanet}
              />
              <ChartCard
                label="Chart 2"
                value={chart2}
                options={CHART2_OPTIONS}
                onChange={(v) => { if (v === "transit" || v === "d1" || v === "d9") setChart2(v); }}
                caption={c2.caption}
                frame={c2.frame}
                planets={c2.planets}
                onSelectPlanet={selectPlanet}
              />
            </div>

            <ElementBalance planets={chart.planets} onOpenCard={openCard} inline />

            {/* The Chart Ruler (ascendant-lord) walkthrough is a natal-lagna
                reading — D1 panel context only (owner-directed). */}
            {!vargaMode && (
              <ChartRuler chart={chart} onOpenCard={openCard} onSelectPlanet={selectPlanet} />
            )}

            {vargaMode && (
              <p className="pp-context">
                Planet panels showing <b>{vargaLabel}</b> placements ·{" "}
                {d9Panels.ascendant.signName} lagna — switch Chart 1 back to Natal for the full
                rāśi detail (nakshatra, combustion, shadbala …)
              </p>
            )}
            <section className="pp-grid" aria-label="Planet details">
              {panelPlanets.map((p) => (
                <PlanetPanel
                  key={`${chart1}-${p.key}`}
                  id={`panel-${p.key}`}
                  planet={p}
                  ascendantSign={panelAscSign}
                  onOpenCard={openCard}
                  onOpenDasha={openDasha}
                  vargaLabel={vargaLabel}
                />
              ))}
            </section>
          </div>
        </div>
      </main>

      {dashaOpen && (
        <div className="dasha-drawer-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setDashaOpen(false); }}>
          <aside className="dasha-drawer" role="dialog" aria-modal="true" aria-label="Vimśottarī daśā">
            <header className="dasha-drawer-head">
              <span>Vimśottarī Daśā</span>
              <button type="button" className="legend-close" onClick={() => setDashaOpen(false)} aria-label="Close">✕</button>
            </header>
            <DashaRail dasha={chart.dasha} current={chart.currentDasha} />
          </aside>
        </div>
      )}

      {legendOpen && (
        <Legend onClose={() => setLegendOpen(false)} />
      )}

      {fc && <FlashcardPopover target={fc} onClose={() => setFc(null)} />}
    </>
  );
}
