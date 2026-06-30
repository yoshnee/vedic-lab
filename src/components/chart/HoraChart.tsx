"use client";

/* ============================================================
   HoraChart.tsx — the D2 (Horā) chart, rendered as TWO columns instead of the
   North Indian diamond. The D2 splits every sign between the two luminaries, so
   all nine grahas fall into either the Sun's horā (Leo column, warm) or the
   Moon's horā (Cancer column, cool). Each column header shows the luminary, its
   sign, and a live graha count. Chips are NEUTRAL (planet identity art only, no
   benefic/malefic colour) and clickable: clicking one reveals that planet's
   wealth interpretation for the horā it is actually in, in a panel below the
   table (one open at a time). Ported from the Claude Design handoff
   (hora-chart/D2 Hora Chart.html); content + placement live in data/horaWealth.

   Placement reuses the validated engine: the planets passed in are already the
   D2 bodies (buildVargaChart with hora()), so the column is just the parity of
   each body's varga sign (horaLuminaryOf). No degrees are shown — only the
   column matters.
   ============================================================ */
import { useState } from "react";
import { Svg } from "@/components/Svg";
import { body } from "@/celestial/celestial";
import { PLANET_SANSKRIT } from "@/core/constants";
import { HORA_COLUMNS, HORA_WEALTH, horaLuminaryOf, type HoraKey } from "@/data/horaWealth";
import type { ChartBody } from "./NorthIndianChart";
import type { PlanetKey } from "@/core/types";

const NAVAGRAHA: PlanetKey[] = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu"];
const orderOf = (k: PlanetKey) => NAVAGRAHA.indexOf(k);

const Chevron = () => (
  <svg className="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
);

export function HoraChart({ planets }: { planets: ChartBody[] }) {
  const [selected, setSelected] = useState<PlanetKey | null>(null);

  // bucket each graha into its luminary's horā (parity of the varga sign)
  const byCol: Record<HoraKey, ChartBody[]> = { sun: [], moon: [] };
  for (const p of planets) byCol[horaLuminaryOf(p.signName)].push(p);
  byCol.sun.sort((a, b) => orderOf(a.key) - orderOf(b.key));
  byCol.moon.sort((a, b) => orderOf(a.key) - orderOf(b.key));

  const selBody = selected ? planets.find((p) => p.key === selected) ?? null : null;
  const selCol: HoraKey | null = selBody ? horaLuminaryOf(selBody.signName) : null;
  const selColDef = selCol ? HORA_COLUMNS.find((c) => c.key === selCol)! : null;

  const toggle = (k: PlanetKey) => setSelected((cur) => (cur === k ? null : k));

  return (
    <div className="hr">
      <div className="hr-grid">
        {HORA_COLUMNS.map((col) => {
          const ps = byCol[col.key];
          const noun = ps.length === 1 ? "graha" : "grahas";
          return (
            <section className="hr-col" data-theme={col.theme} key={col.key}>
              <div className="hr-colhead">
                <Svg className="lum" html={body(col.key, 28)} />
                <span className="meta">
                  <span className="k">{col.luminary}&rsquo;s Horā</span>
                  <span className="nm">
                    <b>{col.luminary}</b>
                    <span className="sign"><span className="gl">{col.glyph}</span>{col.sign}</span>
                  </span>
                </span>
                <span className="hr-count" aria-label={`${ps.length} ${noun}`}>
                  <b>{ps.length}</b><span>{noun}</span>
                </span>
              </div>

              {ps.length > 0 ? (
                <div className="hr-chips">
                  {ps.map((p) => (
                    <button
                      type="button"
                      key={p.key}
                      className="hr-chip"
                      data-selected={selected === p.key || undefined}
                      aria-pressed={selected === p.key}
                      aria-label={`Show wealth reading for ${p.name}`}
                      onClick={() => toggle(p.key)}
                    >
                      <Svg className="ico" html={body(p.key, 22)} />
                      <span className="label">
                        <span className="nm">{p.name}</span>
                        <span className="sk">{PLANET_SANSKRIT[p.key]}</span>
                      </span>
                      <Chevron />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="hr-empty">
                  <Svg className="ghost" html={body(col.key, 38)} />
                  <span className="msg">No grahas in this horā</span>
                  <span className="sub">All planets fall into the other luminary&rsquo;s horā</span>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="hr-reveal" data-open={!!selBody || undefined} data-theme={selColDef?.theme ?? "warm"} aria-live="polite">
        <div className="hr-reveal-in">
          {selBody && selColDef && selCol && (
            <article className="hr-reveal-card">
              <div className="hr-reveal-top">
                <Svg className="ico" html={body(selBody.key, 34)} />
                <span className="id">
                  <span className="k">Wealth · D2 Horā</span>
                  <span className="nm">
                    <b>{selBody.name}</b>
                    <span className="in">in <em>{selColDef.luminary}&rsquo;s Horā · {selColDef.sign}</em></span>
                  </span>
                </span>
                <button type="button" className="hr-close" onClick={() => setSelected(null)} aria-label="Close reading">×</button>
              </div>
              <p className="hr-reveal-body">{HORA_WEALTH[selBody.key][selCol]}</p>
            </article>
          )}
        </div>
      </div>

      {!selBody && (
        <div className="hr-hint"><i aria-hidden="true" />
          <span>Select a graha to reveal its wealth reading for its horā</span>
        </div>
      )}
    </div>
  );
}
