"use client";

/* ============================================================
   onboardingDemos.tsx — the six looping demo animations for the
   chart-page guided tour, plus the shared mini North-Indian chart
   and timing hooks. Each demo auto-plays while its slide is
   mounted (the wizard remounts the body with key={step}) and
   freezes to a sensible frame under prefers-reduced-motion.

   Ported from the design handoff (onboarding/onboarding-demos.jsx)
   and adapted to our real components: planets render through the
   celestial body() art (not text chips), the daśā demo reuses the
   REAL Overlay Dashas pill markup/classes, and the color demo
   reflects our actual model — houses tinted by their sign's ruling
   planet. Purely presentational; nothing astrological is computed.
   ============================================================ */
import { useEffect, useState } from "react";
import { Svg } from "@/components/Svg";
import { body, diamond, glyph, colors as PCOL } from "@/celestial/celestial";
import type { PlanetKey } from "@/core/types";

/* ---- timing helpers ---- */
/** prefers-reduced-motion, read once on mount (demos are client-only, so the
    lazy initializer runs with window available — no SSR mismatch). */
function useReduced(): boolean {
  const [r] = useState(
    () => typeof window !== "undefined" && !!window.matchMedia
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  return r;
}
/** cycle a phase 0..count-1 every `ms` while active */
function usePhase(count: number, ms: number, active: boolean): number {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setP((x) => (x + 1) % count), ms);
    return () => clearInterval(t);
  }, [count, ms, active]);
  return p;
}
/** an incrementing loop counter every `ms` — restarts chained sequences */
function useLoop(ms: number, active: boolean): number {
  const [c, setC] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setC((x) => x + 1), ms);
    return () => clearInterval(t);
  }, [ms, active]);
  return c;
}

/* ---- shared mini North-Indian chart (0–100 viewBox, houses 1..12) ---- */
const OB_POLYS = [
  "50,0 75,25 50,50 25,25", "50,0 0,0 25,25", "0,0 0,50 25,25", "0,50 25,25 50,50 25,75",
  "0,50 0,100 25,75", "0,100 50,100 25,75", "50,100 25,75 50,50 75,75", "50,100 100,100 75,75",
  "100,100 100,50 75,75", "100,50 75,75 50,50 75,25", "100,50 100,0 75,25", "100,0 50,0 75,25",
];
const OB_POS: [number, number][] = [
  [50, 21], [25, 9], [9, 25], [21, 50], [9, 75], [25, 91],
  [50, 79], [75, 91], [91, 75], [79, 50], [91, 25], [75, 9],
];

interface Mark { key: PlanetKey; h: number }

function layout(planets: Mark[]): (Mark & { x: number; y: number })[] {
  const by: Record<number, Mark[]> = {};
  planets.forEach((p) => { (by[p.h] = by[p.h] || []).push(p); });
  const out: (Mark & { x: number; y: number })[] = [];
  Object.keys(by).forEach((h) => {
    const arr = by[+h]; const pos = OB_POS[+h - 1];
    arr.forEach((p, i) => out.push({ ...p, x: pos[0] + (i - (arr.length - 1) / 2) * 15, y: pos[1] }));
  });
  return out;
}

function MiniChart({
  planets = [], glow = [], tint, active, bodySize = 15, className = "",
}: {
  planets?: Mark[];
  glow?: { h: number; color: string }[];
  /** static per-house fill (the color-coding demo tints every house by its ruler) */
  tint?: Record<number, string>;
  /** houses to brighten over the static tint (the active ruler) */
  active?: number[];
  bodySize?: number;
  className?: string;
}) {
  const glowMap: Record<number, string> = {};
  glow.forEach((g) => { glowMap[g.h] = g.color; });
  const activeSet = new Set(active || []);
  const laid = layout(planets);
  return (
    <span className={"ob-chart " + className}>
      <svg viewBox="-2 -2 104 104">
        <rect x="0" y="0" width="100" height="100" className="ob-chart-frame" />
        {OB_POLYS.map((pts, i) => {
          const h = i + 1;
          const isGlow = Object.prototype.hasOwnProperty.call(glowMap, h);
          const tc = tint?.[h];
          const cls = "ob-house"
            + (isGlow ? " is-glow" : "")
            + (tc ? " is-tint" : "")
            + (tc && activeSet.has(h) ? " is-active" : "");
          const style = isGlow
            ? { "--gc": glowMap[h] } as React.CSSProperties
            : tc
              ? { "--tc": tc } as React.CSSProperties
              : undefined;
          return <polygon key={i} points={pts} className={cls} style={style} />;
        })}
        <line x1="0" y1="0" x2="100" y2="100" className="ob-chart-line" />
        <line x1="100" y1="0" x2="0" y2="100" className="ob-chart-line" />
        <polygon points="50,0 100,50 50,100 0,50" className="ob-chart-line ob-chart-diamond" />
      </svg>
      {laid.map((p, i) => (
        <span key={i} className="obd-planet" style={{ left: p.x + "%", top: p.y + "%" }}>
          <Svg html={body(p.key, bodySize)} />
        </span>
      ))}
    </span>
  );
}

function Cursor({ x, y, pressed }: { x: number; y: number; pressed?: boolean }) {
  return (
    <span className={"ob-cursor" + (pressed ? " is-press" : "")} style={{ left: x + "%", top: y + "%" }}>
      <span className="ring" aria-hidden="true" />
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" stroke="#0b1a12" strokeWidth="1.3" strokeLinejoin="round">
        <path d="M4 3l6.5 16 2.4-6.2L19 10.4 4 3z" />
      </svg>
    </span>
  );
}

/* ============================================================
   1 · TWO CHARTS — Chart 2 switches; Chart 1 and its panel hold
   ============================================================ */
const TWO_C1: Mark[] = [
  { key: "sun", h: 1 }, { key: "mars", h: 10 }, { key: "jupiter", h: 9 },
  { key: "venus", h: 7 }, { key: "saturn", h: 4 }, { key: "moon", h: 11 },
];
const TWO_C2 = [
  { sel: "Natal · Rāśi (D1)", planets: [{ key: "sun", h: 1 }, { key: "mars", h: 10 }, { key: "jupiter", h: 9 }, { key: "venus", h: 7 }] as Mark[] },
  { sel: "Navāṁśa (D9)", planets: [{ key: "sun", h: 5 }, { key: "mars", h: 2 }, { key: "jupiter", h: 11 }, { key: "venus", h: 1 }] as Mark[] },
  { sel: "Transit · Gochara", planets: [{ key: "saturn", h: 3 }, { key: "jupiter", h: 6 }, { key: "rahu", h: 9 }, { key: "ketu", h: 3 }] as Mark[] },
];
function DemoTwoCharts({ active }: { active: boolean }) {
  const reduced = useReduced();
  const phase = usePhase(TWO_C2.length, 2100, active && !reduced);
  const v = TWO_C2[phase];
  return (
    <div className="d-two">
      <div className="d-two-row">
        <div className="d-cc is-primary">
          <div className="d-cc-head"><span className="lbl">Chart 1</span><span className="d-cc-sel">Natal · Rāśi (D1)</span></div>
          <MiniChart className="d-cc-chart" planets={TWO_C1} bodySize={13} />
          <div className="d-cc-panel">
            <span className="k">Planet panels</span>
            <div className="row"><span className="dot" style={{ background: PCOL.sun }} />Sun · 1st · <b>Exalted</b></div>
            <div className="row"><span className="dot" style={{ background: PCOL.jupiter }} />Jupiter · 9th · <b>Own</b></div>
          </div>
        </div>
        <div className="d-cc">
          <div className="d-cc-head"><span className="lbl">Chart 2</span><span className="d-cc-sel" key={phase}>{v.sel}</span></div>
          <MiniChart className="d-cc-chart" planets={v.planets} bodySize={13} />
          <div className="d-cc-tag">Comparison only</div>
        </div>
      </div>
      <div className="d-two-note">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
        Planet panels always follow <b>Chart&nbsp;1</b>
      </div>
    </div>
  );
}

/* ============================================================
   2 · PLANET PANELS — tap a planet, its full reading opens
   ============================================================ */
const PAN_ROWS: { key: PlanetKey; name: string; place: string }[] = [
  { key: "sun", name: "Sun", place: "1st · Aries" },
  { key: "moon", name: "Moon", place: "4th · Cancer" },
  { key: "mars", name: "Mars", place: "10th · Capricorn" },
];
function DemoPanels({ active }: { active: boolean }) {
  const reduced = useReduced();
  const loop = useLoop(3600, active && !reduced);
  // remount each loop (key) so state resets without a sync setState in the effect
  return <PanelsInner key={loop} reduced={reduced} />;
}
function PanelsInner({ reduced }: { reduced: boolean }) {
  const [tap, setTap] = useState(false);
  const [open, setOpen] = useState(reduced);
  useEffect(() => {
    if (reduced) return;
    const t1 = setTimeout(() => setTap(true), 800);
    const t2 = setTimeout(() => setOpen(true), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [reduced]);
  // the cursor clicks the top panel's OWN HEADER (how the real panels expand) —
  // not a planet on the chart.
  return (
    <div className="d-pan">
      {PAN_ROWS.map((r, i) => {
        const isTarget = i === 0;
        return (
          <div key={r.key} className={"d-pan-p" + (isTarget && open ? " is-open" : "")}
            style={{ "--pc": `var(--p-${r.key})` } as React.CSSProperties}>
            <div className={"d-pan-phd" + (isTarget && tap ? " is-tap" : "")}>
              <span className="ico"><Svg html={body(r.key, 26, isTarget ? { state: "exalted" } : undefined)} /></span>
              <span className="id"><span className="nm">{r.name}</span><span className="pl">{r.place}</span></span>
              <svg className="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
            </div>
            {isTarget && (
              <div className="d-pan-pbody">
                <div className="d-pan-pbin">
                  <div className="d-pan-pcont">
                    <div className="place">Ruler of 5th · sits in 1st house.</div>
                    <div className="coords">14° Aries · Kṛttikā · pada 3</div>
                    <div className="pills">
                      <span className="pill is-gold">Exalted</span>
                      <span className="pill is-teal">Sun daśā</span>
                      <span className="pill">Aspected by Jupiter</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {!reduced && <Cursor x={62} y={13} pressed={tap} />}
    </div>
  );
}

/* ============================================================
   3 · DAŚĀ OVERLAY — select a daśā, flip the REAL Overlay pill,
   Chart 1's activated houses light up (accent-gold, like the app)
   ============================================================ */
const DASHAS: { key: PlanetKey; nm: string; yr: string }[] = [
  { key: "venus", nm: "Venus", yr: "20y" }, { key: "sun", nm: "Sun", yr: "6y" },
  { key: "moon", nm: "Moon", yr: "10y" }, { key: "jupiter", nm: "Jupiter", yr: "16y" },
  { key: "saturn", nm: "Saturn", yr: "19y" },
];
const DASHA_SEL = 3;            // Jupiter
const DASHA_GLOW = [2, 5, 9];   // houses it activates
function DemoDasha({ active }: { active: boolean }) {
  const reduced = useReduced();
  // phases: 0 idle · 1 hover row · 2 press pill · 3 glow (hold)
  const phase = usePhase(4, 1150, active && !reduced);
  const eff = reduced ? 3 : phase;
  const sel = eff >= 1;
  const press = eff === 2;
  const on = eff >= 3;
  const cursor = eff === 0 ? { x: 20, y: 14 } : eff === 1 ? { x: 42, y: 46 } : { x: 42, y: 84 };
  return (
    <div className="d-dasha">
      <div className="d-dasha-left">
        <div className="d-dasha-list">
          {DASHAS.map((d, i) => (
            <div key={d.key} className={"d-dasha-row" + (sel && i === DASHA_SEL ? " is-sel" : "")}
              style={{ "--pc": PCOL[d.key] } as React.CSSProperties}>
              <span className="dot" /><span className="nm">{d.nm}</span><span className="yr">{d.yr}</span>
            </div>
          ))}
        </div>
        {/* the REAL Overlay Dashas pill — same markup + classes as the chart */}
        <div className="overlay-box d-dasha-pill" style={{ pointerEvents: "none" }}>
          <label className="overlay-toggle">
            <input type="checkbox" className="dia-check" checked={press || on} readOnly tabIndex={-1} />
            <span className="overlay-title">Overlay Dashas</span>
          </label>
        </div>
        <span className="d-dasha-cap">Lights up Chart 1</span>
      </div>
      <div className="d-dasha-chartwrap">
        <span className="d-dasha-clbl">Chart 1</span>
        <MiniChart className="d-dasha-chart" planets={[{ key: "jupiter", h: 9 }]} bodySize={15}
          glow={on ? DASHA_GLOW.map((h) => ({ h, color: "var(--accent)" })) : []} />
      </div>
      {!reduced && <Cursor x={cursor.x} y={cursor.y} pressed={press} />}
    </div>
  );
}

/* ============================================================
   4 · COLOR CODING — houses tinted by their sign's ruling planet
   (Aries-ascendant sample); cycle each ruler, its houses brighten
   ============================================================ */
const RULERS: { key: PlanetKey; nm: string; signs: string; houses: number[] }[] = [
  { key: "sun", nm: "Sun", signs: "Leo", houses: [5] },
  { key: "moon", nm: "Moon", signs: "Cancer", houses: [4] },
  { key: "mars", nm: "Mars", signs: "Aries · Scorpio", houses: [1, 8] },
  { key: "mercury", nm: "Mercury", signs: "Gemini · Virgo", houses: [3, 6] },
  { key: "jupiter", nm: "Jupiter", signs: "Sagittarius · Pisces", houses: [9, 12] },
  { key: "venus", nm: "Venus", signs: "Taurus · Libra", houses: [2, 7] },
  { key: "saturn", nm: "Saturn", signs: "Capricorn · Aquarius", houses: [10, 11] },
];
// Aries-ascendant house → ruling-planet color (mirrors our real house tinting)
const HOUSE_TINT: Record<number, string> = {};
RULERS.forEach((r) => r.houses.forEach((h) => { HOUSE_TINT[h] = PCOL[r.key]; }));
function DemoColors({ active }: { active: boolean }) {
  const reduced = useReduced();
  const on = usePhase(RULERS.length, 1400, active && !reduced);
  const ruler = RULERS[on];
  return (
    <div className="d-col">
      <div className="d-col-legend">
        {RULERS.map((r, i) => (
          <div key={r.key} className={"d-col-item" + (i === on ? " is-on" : "")}
            style={{ "--sc": PCOL[r.key] } as React.CSSProperties}>
            <span className="sw" />
            <span className="lab"><span className="t">{r.nm}</span><span className="d">{r.signs}</span></span>
          </div>
        ))}
      </div>
      <MiniChart className="d-col-chart" tint={HOUSE_TINT} active={ruler.houses} bodySize={13} />
    </div>
  );
}

/* ============================================================
   5 · FLASHCARD ICON — tap the mark, the card flips open
   ============================================================ */
function DemoFlashcard({ active }: { active: boolean }) {
  const reduced = useReduced();
  const loop = useLoop(3200, active && !reduced);
  return <FlashcardInner key={loop} reduced={reduced} />;
}
function FlashcardInner({ reduced }: { reduced: boolean }) {
  const [tap, setTap] = useState(false);
  const [open, setOpen] = useState(reduced);
  useEffect(() => {
    if (reduced) return;
    const t1 = setTimeout(() => setTap(true), 700);
    const t2 = setTimeout(() => setOpen(true), 1050);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [reduced]);
  return (
    <div className="d4-wrap">
      <div className="d4-line">
        Moon in <em>Rohiṇī</em>
        <span className={"d4-ficon" + (tap ? " is-tap" : "")} aria-hidden="true">
          <span className="ring" />
          <Svg html={diamond(18, { glow: true })} />
        </span>
      </div>
      <div className={"d4-card" + (open ? " is-open" : "")}>
        <div className="d4-inner">
          <div className="d4-face d4-front"><Svg html={glyph("4", PCOL.moon, 52)} /></div>
          <div className="d4-face d4-back">
            <span className="k">Nakshatra</span>
            <span className="t">Rohiṇī</span>
            <span className="m">Growth, beauty, the Moon&apos;s favourite. Fertile and abundant.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   6 · STICKY NOTES — dragged onto the chart, typed into
   ============================================================ */
const STICKY_TEXT = "Sun in the 1st, exalted Lagna lord. Strong vitality, clear sense of self.";
function DemoSticky({ active }: { active: boolean }) {
  const reduced = useReduced();
  const loop = useLoop(6200, active && !reduced);
  return <StickyInner key={loop} reduced={reduced} />;
}
function StickyInner({ reduced }: { reduced: boolean }) {
  const [pos, setPos] = useState<"dock" | "mid" | "placed">(reduced ? "placed" : "dock");
  const [drag, setDrag] = useState(false);
  const [typed, setTyped] = useState(reduced ? STICKY_TEXT : "");
  useEffect(() => {
    if (reduced) return;
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    let iv: ReturnType<typeof setInterval> | undefined;
    timers.push(setTimeout(() => { setPos("mid"); setDrag(true); }, 500));
    timers.push(setTimeout(() => { setPos("placed"); setDrag(false); }, 1500));
    timers.push(setTimeout(() => {
      let i = 0;
      iv = setInterval(() => { i++; setTyped(STICKY_TEXT.slice(0, i)); if (i >= STICKY_TEXT.length && iv) clearInterval(iv); }, 42);
    }, 2050));
    return () => { timers.forEach(clearTimeout); if (iv) clearInterval(iv); };
  }, [reduced]);
  const coords = pos === "dock" ? { left: "6px", top: "46px" } : pos === "mid" ? { left: "40%", top: "30%" } : { left: "32%", top: "46%" };
  const done = typed.length >= STICKY_TEXT.length;
  return (
    <div className="d5-wrap">
      <span className="d5-launch"><span className="d5-ndot" style={{ margin: 0 }} />Reading Notes</span>
      <MiniChart className="d5-chart" planets={[{ key: "sun", h: 1 }]} bodySize={14} />
      <div className={"d5-note" + (drag ? " is-drag" : "")} style={coords}>
        <div className="d5-nhead">
          <span className="d5-grip"><svg width="8" height="12" viewBox="0 0 9 14" fill="currentColor"><circle cx="2" cy="2" r="1.1" /><circle cx="7" cy="2" r="1.1" /><circle cx="2" cy="7" r="1.1" /><circle cx="7" cy="7" r="1.1" /><circle cx="2" cy="12" r="1.1" /><circle cx="7" cy="12" r="1.1" /></svg></span>
          <span className="d5-ntitle"><span className="d5-ndot" />Ascendant</span>
        </div>
        <div className="d5-nwrite">
          {typed
            ? <span className="d5-ntext">{typed}{!done && <span className="d5-caret" />}</span>
            : <span className="d5-ph">Begin your reading…</span>}
        </div>
      </div>
    </div>
  );
}

export type DemoId = "twocharts" | "panels" | "dasha" | "colors" | "flashcard" | "sticky";
export const DEMOS: Record<DemoId, ({ active }: { active: boolean }) => React.JSX.Element> = {
  twocharts: DemoTwoCharts,
  panels: DemoPanels,
  dasha: DemoDasha,
  colors: DemoColors,
  flashcard: DemoFlashcard,
  sticky: DemoSticky,
};
