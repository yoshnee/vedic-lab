"use client";

/* ============================================================
   ChartCard.tsx — a titled card around the generic NorthIndianChart. Both
   charts use the SAME header (a chart-type <select> + a caption) so they line
   up: Chart 1 = "Natal · Rāśi (D1)", Chart 2 = "Transit · Gochara". Each
   dropdown carries a single option for now (divisionals come later by extending
   its `options`). The card is the seam where natal / transit / future
   divisionals all reuse one renderer — only the frame + planets differ.
   ============================================================ */
import { NorthIndianChart, type ChartBody, type ChartFrame } from "./NorthIndianChart";
import type { PlanetKey } from "@/core/types";

export interface ChartOption {
  value: string;
  label: string;
}

export function ChartCard({
  label,
  value,
  options,
  onChange,
  caption,
  frame,
  planets,
  onSelectPlanet,
}: {
  label: string; // "Chart 1" / "Chart 2"
  value: string;
  options: ChartOption[];
  onChange?: (v: string) => void;
  caption?: string;
  frame: ChartFrame;
  planets: ChartBody[];
  onSelectPlanet?: (key: PlanetKey) => void;
}) {
  return (
    <section className="chart-card">
      <header className="chart-card-head">
        <label className="chart-card-select">
          <span className="cc-sel-label">{label}</span>
          <select
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            aria-label={`${label} type`}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        {/* reserved on both cards (see .chart-card-cap min-height) so the two grids align */}
        <span className="chart-card-cap">{caption}</span>
      </header>
      <NorthIndianChart frame={frame} planets={planets} onSelectPlanet={onSelectPlanet} />
    </section>
  );
}
