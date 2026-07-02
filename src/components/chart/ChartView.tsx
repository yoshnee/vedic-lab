"use client";

/* ============================================================
   ChartView.tsx — the birth-chart page body. Layout: a chart header (back-link +
   Legend), the hero meta, then a desktop 3-up region — a sticky Vimśottarī daśā
   rail | two charts, each with a live type selector (Chart 1: D1 + the varga
   set, the DRIVER of the planet grid; Chart 2: Transit + the same set, an
   independent secondary view) — and below it the nine planet panels in a
   2-column grid (an open panel spans full width). On mobile everything stacks
   and the daśā rail becomes a slide-in drawer. Owns the flashcard popover, the
   legend drawer, the daśā drawer, and both chart types. Natal + transit render
   through the same NorthIndianChart on the SAME natal lagna frame.
   ============================================================ */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { DateTime } from "luxon";
import { Svg } from "@/components/Svg";
import { diamond, body } from "@/celestial/celestial";
import { VARGAS, VARGA_KEYS, isVargaKey, buildVargaChart, buildVargaPanels, type VargaKey } from "@/lib/chart/varga";
import { transitFor } from "@/lib/chart/generateChart";
import { activatedHousesFor } from "@/lib/chart/activation";
import { isValidZone } from "@/lib/time";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { ChartCard, type ChartOption } from "./ChartCard";
import { type DashaSelection } from "./DashaRail";
import { useReadingNotes } from "./useReadingNotes";
import { ReadingNotesLauncher } from "./ReadingNotesLauncher";
import { NotesWorkspace } from "./NotesWorkspace";
import { ElementBalance } from "./ElementBalance";
import { DashaRail } from "./DashaRail";
import { PlanetPanel } from "./PlanetPanel";
import { Legend } from "./Legend";
import { Instructions } from "./Instructions";
import { FlashcardPopover } from "./FlashcardPopover";
import { resolveFlashcard, type FlashcardType, type FlashcardTarget } from "@/lib/flashcardLink";
import type { ChartModel } from "@/lib/chart/types";
import type { PlanetKey, TransitSet } from "@/core/types";

const PNAME: Record<PlanetKey, string> = {
  sun: "Sun", moon: "Moon", mars: "Mars", mercury: "Mercury", jupiter: "Jupiter",
  venus: "Venus", saturn: "Saturn", rahu: "Rahu", ketu: "Ketu",
};

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
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

/** A real modal slide-in drawer (the daśā + reading-notes drawers): focus
    moves in on open, Tab is trapped, Esc closes, and focus returns to the
    opener on close — the Legend's a11y bar, widened to form fields (the
    notes drawer holds textareas). Backdrop click still closes. */
function Drawer({ overlayClass, drawerClass, label, title, onClose, children }: {
  overlayClass: string;
  drawerClass: string;
  label: string;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  // latest onClose without re-running the focus effect (it must run once per open)
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const el = ref.current;
    el?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { closeRef.current(); return; }
      if (e.key === "Tab" && el) {
        const f = el.querySelectorAll<HTMLElement>(
          'button:not(:disabled),[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]',
        );
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === el)) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); opener?.focus(); };
  }, []);
  return (
    <div className={overlayClass} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <aside className={drawerClass} role="dialog" aria-modal="true" aria-label={label} ref={ref} tabIndex={-1}>
        <header className="dasha-drawer-head">
          <span>{title}</span>
          <button type="button" className="legend-close" onClick={onClose} aria-label="Close">✕</button>
        </header>
        {children}
      </aside>
    </div>
  );
}

/* The chart-type selectors. The full varga set (VARGAS registry) shows on
   either side; Transit is right-only (the natal-vs-X reading layout, and its
   "as of" caption belongs there). Chart 1 is the DRIVER: the planet grid,
   per-planet computations, and the dasha overlay all read from it. Chart 2
   is an independent secondary view. */
type Chart1Type = "d1" | VargaKey;
type Chart2Type = "transit" | Chart1Type;
const CHART1_OPTIONS: ChartOption[] = [
  { value: "d1", label: "Natal · Rāśi (D1)" },
  ...VARGA_KEYS.map((k) => ({ value: k, label: VARGAS[k].label })),
];
const CHART2_OPTIONS: ChartOption[] = [
  { value: "transit", label: "Transit · Gochara" },
  ...CHART1_OPTIONS,
];

export function ChartView({ model }: { model: ChartModel }) {
  const { chart, meta, panchanga, transit } = model;
  const [fc, setFc] = useState<FlashcardTarget | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const [instrOpen, setInstrOpen] = useState(false);
  const [dashaOpen, setDashaOpen] = useState(false); // mobile daśā drawer
  // reading-notes workspace — ONE state instance feeding the launcher dock and
  // the floating sticky notes (desktop-only; hidden on mobile)
  const notesApi = useReadingNotes(model);
  const [chart1, setChart1] = useState<Chart1Type>("d1");
  const [chart2, setChart2] = useState<Chart2Type>("transit");

  /* ---- Activated-houses overlay (dasha rail toggle, off by default) ----
     The selected (MD, AD) lord pair defaults to the RUNNING chain; tapping a
     daśā row retargets it (state lives here so the rail, the mobile drawer,
     and the chart stay in sync). Houses = rules-or-occupies per lord
     (lib/chart/activation.ts — aspects deliberately excluded), deduped into
     one accent wash on the NATAL D1 chart only. */
  const [overlayOn, setOverlayOn] = useState(false);
  const [dashaSel, setDashaSel] = useState<DashaSelection | null>(null);
  const sel: DashaSelection = dashaSel ?? { maha: chart.currentDasha.maha, antar: chart.currentDasha.antar };
  const activated = useMemo(
    () => (overlayOn ? activatedHousesFor([sel.maha, sel.antar], chart) : undefined),
    [overlayOn, sel.maha, sel.antar, chart],
  );

  /* ---- Gochar (transit) date-time scrubber ----
     The picker speaks the NATAL location's timezone (UTC when the zone is
     missing/invalid) so transits line up with the natal frame — NOT the
     browser's local zone. Luxon converts the wall-clock pick to the UTC
     instant the engine wants, the same DST-aware path as the birth input.
     Only the transit longitudes move with the chosen moment; the lagna and
     houses stay natal (transitFor is pure over (natal chart, instant)).
     null = "now", the present default behavior. */
  const tz = isValidZone(meta.ianaTz) ? meta.ianaTz : "UTC";
  const [transitWhen, setTransitWhen] = useState<string | null>(null); // "yyyy-MM-ddTHH:mm" wall clock in tz
  const [customTransit, setCustomTransit] = useState<{ when: string; set: TransitSet | null } | null>(null);
  const debouncedWhen = useDebounce(transitWhen, 300); // scrubbing recomputes once per pause
  useEffect(() => {
    // null = "now": activeTransit ignores customTransit then, so no clearing needed
    if (!debouncedWhen) return;
    const dt = DateTime.fromISO(debouncedWhen, { zone: tz });
    if (!dt.isValid) return;
    let alive = true;
    transitFor(chart, dt.toJSDate()).then((set) => {
      if (alive) setCustomTransit({ when: debouncedWhen, set });
    });
    return () => { alive = false; };
  }, [debouncedWhen, tz, chart]);
  // the picker's "now" face: the instant the default transit was computed for
  const transitNowValue = useMemo(
    () =>
      DateTime.fromISO(transit?.computedUtcISO ?? new Date().toISOString())
        .setZone(tz)
        .toFormat("yyyy-MM-dd'T'HH:mm"),
    [transit, tz],
  );
  // resolved = the compute for the CURRENT pick has landed (success or failure).
  // While pending the previous planets stay up (caption says "computing …");
  // once a pick resolves to failure the chart goes empty — never a stale "now"
  // set contradicting the failure caption.
  const resolved = transitWhen && customTransit?.when === transitWhen ? customTransit : null;
  const transitPending = !!transitWhen && !resolved;
  const activeTransit = transitWhen ? (resolved ? resolved.set : transit) : transit;
  // picker + zone + Now all live in the header row beside the dropdown
  // (owner-placed); the caption line carries only status (computing / failure)
  const transitCaption = transitWhen
    ? transitPending ? "computing …" : resolved?.set ? "" : "transit unavailable for that moment"
    : transit ? "" : "transit unavailable";

  // Lock body scroll while any overlay is open.
  useEffect(() => {
    const anyOverlay = fc || legendOpen || instrOpen || dashaOpen;
    document.body.style.overflow = anyOverlay ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [fc, legendOpen, instrOpen, dashaOpen]);

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

  /* Chart 1 is the DRIVER: toggling it re-derives the planet panels for that
     varga (avasthas, maitri, dignity … recomputed — see buildVargaPanels);
     toggling back restores the natal detail. Chart 2 never affects the grid. */
  const varga1: VargaKey | null = chart1 === "d1" ? null : chart1;
  const varga2: VargaKey | null = chart2 === "transit" || chart2 === "d1" ? null : chart2;
  const v1 = useMemo(() => (varga1 ? buildVargaChart(chart, VARGAS[varga1].map) : null), [chart, varga1]);
  const v2 = useMemo(() => (varga2 ? buildVargaChart(chart, VARGAS[varga2].map) : null), [chart, varga2]);
  const vargaPanels = useMemo(
    () => (varga1 ? buildVargaPanels(chart, VARGAS[varga1].map) : null),
    [chart, varga1],
  );
  const vargaMode = !!vargaPanels;
  const panelPlanets = vargaPanels ? vargaPanels.planets : chart.planets;
  const vargaLabel = varga1 ? VARGAS[varga1].short : undefined;
  // D2 (Horā) is the two-column wealth view, not a full chart — it carries no
  // per-planet panels and no element balance (owner-directed: the planet panels
  // stay for Chart 1 only, and even then only for the OTHER vargas, not D2).
  const horaMode = chart1 === "d2";

  /* Toggling is non-destructive; every set derives from the model already in
     memory, so switching back restores. No varga subtitle (owner-trimmed). */
  const natalData = { frame, planets: chart.planets, caption: chart.birth.dateLabel };
  const c1 = v1 ? { frame: v1.frame, planets: v1.planets, caption: "" } : natalData;
  const c2 =
    chart2 === "transit"
      ? {
          frame, // ALWAYS the natal lagna frame — scrubbing moves only the planets
          planets: activeTransit?.planets ?? [],
          caption: transitCaption,
        }
      : v2
        ? { frame: v2.frame, planets: v2.planets, caption: "" }
        : natalData;

  return (
    <>
      <header className="chart-header">
        <Link className="chart-back" href="/">
          <Svg className="chart-mark" html={diamond(30, { glow: true })} />
          <span>Vedic Astrology Lab</span>
        </Link>
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
          <div className="chart-hero-btns">
            <button type="button" className="chart-legend-btn" onClick={() => setLegendOpen(true)}>
              <span aria-hidden="true">?</span> Legend
            </button>
            <button type="button" className="chart-legend-btn" onClick={() => setInstrOpen(true)}>
              <span aria-hidden="true">?</span> Instructions
            </button>
          </div>
        </div>

        <div className="chart-layout">
          <aside className="dasha-rail" aria-label="Vimśottarī daśā">
            <DashaRail
              dasha={chart.dasha}
              current={chart.currentDasha}
              selected={sel}
              onSelect={setDashaSel}
            />
            {!horaMode && <ElementBalance planets={panelPlanets} onOpenCard={openCard} />}
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
                options={CHART1_OPTIONS}
                onChange={(v) => { if (v === "d1" || isVargaKey(v)) setChart1(v); }}
                caption={c1.caption}
                frame={c1.frame}
                planets={c1.planets}
                highlightHouses={chart1 === "d1" ? activated : undefined} // natal D1 only, never a varga
                onSelectPlanet={selectPlanet}
                controls={
                  // the overlay's home (owner-placed): under the type selection,
                  // above the chart — the only chart the wash applies to.
                  // Selection happens in the rail; no helper text, owner-trimmed.
                  chart1 === "d1" ? (
                    <div className="overlay-box">
                      <label className="overlay-toggle">
                        <input
                          type="checkbox"
                          className="dia-check"
                          checked={overlayOn}
                          onChange={() => setOverlayOn((o) => !o)}
                        />
                        <span className="overlay-title">Overlay Dashas</span>
                      </label>
                    </div>
                  ) : undefined
                }
              />
              <ChartCard
                label="Chart 2"
                value={chart2}
                options={CHART2_OPTIONS}
                onChange={(v) => { if (v === "transit" || v === "d1" || isVargaKey(v)) setChart2(v); }}
                caption={c2.caption}
                frame={c2.frame}
                planets={c2.planets}
                onSelectPlanet={selectPlanet}
                headExtra={
                  // the gochar scrubber: picker · zone · Now, all in line
                  // beside the dropdown (owner-placed)
                  chart2 === "transit" ? (
                    <span className="cc-dt-group">
                      <input
                        type="datetime-local"
                        className="cc-dt"
                        value={transitWhen ?? transitNowValue}
                        onChange={(e) => setTransitWhen(e.target.value || null)}
                        aria-label={`Transit date and time, in ${tz === "UTC" ? "UTC" : `the birth timezone (${tz})`}`}
                      />
                      <span className="ctl-tz" title="Picked in the birth location's timezone">{tz}</span>
                      <button
                        type="button"
                        className="ctl-now"
                        onClick={() => setTransitWhen(null)}
                        disabled={!transitWhen}
                      >
                        Now
                      </button>
                    </span>
                  ) : undefined
                }
              />
            </div>

            {!horaMode && <ElementBalance planets={panelPlanets} onOpenCard={openCard} inline />}

            {vargaMode && !horaMode && vargaPanels && (
              <p className="pp-context">
                Planet panels showing <b>{vargaLabel}</b> placements ·{" "}
                {vargaPanels.ascendant.signName} lagna — switch Chart 1 back to Natal for the full
                rāśi detail (nakshatra, shadbala, sade sati …)
              </p>
            )}
            {!horaMode && (
              <section className="pp-grid" aria-label="Planet details">
                {panelPlanets.map((p) => (
                  <PlanetPanel
                    key={`${chart1}-${p.key}`}
                    id={`panel-${p.key}`}
                    planet={p}
                    onOpenCard={openCard}
                    onOpenDasha={openDasha}
                    vargaLabel={vargaLabel}
                  />
                ))}
              </section>
            )}
          </div>

          {/* reading-notes launcher — a sticky right rail mirroring the daśā
              rail; the "Your Analysis" dock that spawns the floating sticky
              notes (desktop-only — hidden on mobile). onOpenDeck opens each
              tenet's relevant flashcard deck in the popover. */}
          <aside className="notes-rail" aria-label="Reading notes">
            <div className="notes-rail-in">
              <ReadingNotesLauncher
                api={notesApi}
                model={model}
                onOpenDeck={(id) => openCard("deck", id)}
              />
            </div>
          </aside>
        </div>
      </main>

      {dashaOpen && (
        <Drawer
          overlayClass="dasha-drawer-overlay"
          drawerClass="dasha-drawer"
          label="Vimśottarī daśā"
          title="Vimśottarī Daśā"
          onClose={() => setDashaOpen(false)}
        >
          <DashaRail
            dasha={chart.dasha}
            current={chart.currentDasha}
            selected={sel}
            onSelect={setDashaSel}
          />
        </Drawer>
      )}

      {/* the floating sticky-note workspace — a fixed layer above the page;
          desktop-only (hidden on mobile via CSS) */}
      <NotesWorkspace api={notesApi} />

      {legendOpen && (
        <Legend onClose={() => setLegendOpen(false)} />
      )}

      {instrOpen && (
        <Instructions onClose={() => setInstrOpen(false)} />
      )}

      {fc && <FlashcardPopover target={fc} onClose={() => setFc(null)} />}
    </>
  );
}
