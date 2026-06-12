"use client";

/* ============================================================
   ChartCard.tsx — a titled card around the generic NorthIndianChart. Both
   charts use the SAME header (a chart-type <select> + a caption line) so they
   line up: the caption line reserves its height on both cards. The selects are
   live: Chart 1 toggles D1/D9, Chart 2 Transit/D1/D9 (unbuilt vargas ship as
   disabled options). `headExtra` renders beside the select (the gochar
   date-time picker, owner-placed); transit's tz + Now reset live on the
   caption line under it. The card is the seam where natal / transit /
   divisionals all reuse one renderer — only frame + planets differ.
   ============================================================ */
import { NorthIndianChart, type ChartBody, type ChartFrame } from "./NorthIndianChart";
import type { PlanetKey } from "@/core/types";

export interface ChartOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export function ChartCard({
  label,
  value,
  options,
  onChange,
  caption,
  headExtra,
  controls,
  frame,
  planets,
  highlightHouses,
  onSelectPlanet,
}: {
  label: string; // "Chart 1" / "Chart 2"
  value: string;
  options: ChartOption[];
  onChange?: (v: string) => void;
  /** The line under the select row — plain text, or a node (e.g. transit's
      tz + Now controls). Height is reserved on both cards so they stay level. */
  caption?: React.ReactNode;
  /** Rendered beside the select in the header row (e.g. the gochar
      date-time picker). */
  headExtra?: React.ReactNode;
  /** Optional compact control rendered ON the caption line, beside the
      caption text (the "Overlay Dashas" pill next to Chart 1's DOB,
      owner-placed). Inside the header grid item, so the subgrid keeps the
      two cards' diamonds level. */
  controls?: React.ReactNode;
  frame: ChartFrame;
  planets: ChartBody[];
  /** Houses washed in the accent color (the activated-houses overlay). */
  highlightHouses?: number[];
  onSelectPlanet?: (key: PlanetKey) => void;
}) {
  return (
    <section className="chart-card">
      <header className="chart-card-head">
        <div className="chart-card-row">
          <label className="chart-card-select">
            <span className="cc-sel-label">{label}</span>
            <select
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              aria-label={`${label} type`}
            >
              {options.map((o) => (
                <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
              ))}
            </select>
          </label>
          {headExtra}
        </div>
        {/* reserved on both cards (see .chart-card-cap min-height) so the two grids align */}
        <span className="chart-card-cap">{caption}{controls}</span>
      </header>
      <NorthIndianChart frame={frame} planets={planets} highlightHouses={highlightHouses} onSelectPlanet={onSelectPlanet} />
    </section>
  );
}
