"use client";

/* ============================================================
   NorthIndianChart.tsx — the generic D1-style diamond chart, reused for natal,
   transit, and (later) divisionals. It draws the 12 fixed houses (house 1 = top
   centre) tinted by the color of the planet ruling the sign each holds — seven
   ruler colors across twelve houses, per the design system's "house coloring"
   (Identity prototype: SIGN_RULER → palette). The frame (ascendant sign) drives
   the house tints, the zodiac glyph + muted rashi number in each house, and the
   Asc marker; the planets are whatever dataset is passed (natal placements, or
   transiting bodies on the natal frame). Whole-sign: house 1 holds the frame's
   ascendant sign and each house steps one sign on.
   ============================================================ */
import { Svg } from "@/components/Svg";
import { body } from "@/celestial/celestial";
import { PLANET_COLORS } from "@/lib/design/colors";
import { SIGN_RULER } from "@/core/constants";
import type { Dignity, PlanetKey } from "@/core/types";

/** A planet placed in a house — the minimum the chart renders. Both the engine's
    PlanetData and the lighter PlacedBody (transit) satisfy this structurally. */
export interface ChartBody {
  key: PlanetKey;
  name: string;
  house: number; // 1–12 on this chart's frame
  signName: string;
  degree: string;
  degreeValue: number;
  dignity: Dignity;
  retro: boolean;
}

/** The reference frame: which sign sits in house 1 (and its degree, for the marker). */
export interface ChartFrame {
  ascSign: number; // 1–12
  ascDegree: string; // e.g. "28°28′"
}

// House-cell content centroids in the 300×300 grid space (house 1 = top centre).
const CENTROID: Record<number, [number, number]> = {
  1: [150, 70], 2: [75, 28], 3: [28, 75], 4: [70, 150], 5: [28, 225], 6: [75, 272],
  7: [150, 230], 8: [225, 272], 9: [272, 225], 10: [230, 150], 11: [272, 75], 12: [225, 28],
};

// House polygons (0–300 space) — the classic North Indian layout, house 1 =
// the top-centre diamond, counted counter-clockwise. From the Identity prototype.
const POLY: Record<number, string> = {
  1: "150,0 225,75 150,150 75,75",
  2: "0,0 150,0 75,75",
  3: "0,0 75,75 0,150",
  4: "75,75 150,150 75,225 0,150",
  5: "0,150 75,225 0,300",
  6: "0,300 75,225 150,300",
  7: "75,225 150,150 225,225 150,300",
  8: "150,300 225,225 300,300",
  9: "300,300 225,225 300,150",
  10: "150,150 225,75 300,150 225,225",
  11: "300,150 225,75 300,0",
  12: "300,0 225,75 150,0",
};

// Zodiac glyphs by sign number (1 = Aries … 12 = Pisces).
const ZODIAC = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

/** Whole-sign: house 1 holds the ascendant sign, each later house the next sign. */
function signOfHouse(ascSign: number, house: number): number {
  return ((ascSign - 1 + (house - 1)) % 12) + 1;
}

/** The color of the planet that rules a sign (1–12) — the house tint. */
function rulerColor(sign: number): string {
  return PLANET_COLORS[SIGN_RULER[sign - 1]];
}

/** The full chart SVG: ruler-tinted house polygons, then the structural grid on top. */
function buildGrid(ascSign: number): string {
  let s =
    '<svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block">';
  for (let h = 1; h <= 12; h++) {
    const col = rulerColor(signOfHouse(ascSign, h));
    s +=
      '<polygon points="' + POLY[h] + '" fill="' + col +
      '" fill-opacity="0.3" stroke="' + col +
      '" stroke-opacity="0.75" stroke-width="1.2" stroke-linejoin="round"/>';
  }
  s +=
    '<g fill="none" stroke="var(--border)" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">' +
    '<rect x="0.7" y="0.7" width="298.6" height="298.6"/>' +
    '<path d="M0 0 L300 300 M300 0 L0 300"/>' +
    '<path d="M150 0 L300 150 L150 300 L0 150 Z"/>' +
    "</g>";
  return s + "</svg>";
}

export function NorthIndianChart({
  frame,
  planets,
  onSelectPlanet,
}: {
  frame: ChartFrame;
  planets: ChartBody[];
  onSelectPlanet?: (key: PlanetKey) => void;
}) {
  const ascSign = frame.ascSign;
  const byHouse = new Map<number, ChartBody[]>();
  for (const p of planets) {
    const arr = byHouse.get(p.house) ?? [];
    arr.push(p);
    byHouse.set(p.house, arr);
  }

  return (
    <div className="nic" role="img" aria-label="North Indian chart, houses colored by sign ruler">
      <Svg className="nic-grid" html={buildGrid(ascSign)} />
      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
        const [cx, cy] = CENTROID[h];
        const sign = signOfHouse(ascSign, h);
        const housePlanets = byHouse.get(h) ?? [];
        return (
          <div
            className="nic-house"
            key={h}
            style={{ left: `${(cx / 300) * 100}%`, top: `${(cy / 300) * 100}%` }}
          >
            <span className="nic-sign">
              <span className="nic-sign-gl" style={{ color: rulerColor(sign) }} aria-hidden="true">
                {ZODIAC[sign - 1]}
              </span>
              <span className="nic-sign-no">{sign}</span>
            </span>
            {h === 1 && <span className="nic-asc">Asc {frame.ascDegree}</span>}
            {housePlanets.map((p) => (
              <button
                type="button"
                className="nic-planet"
                key={p.key}
                onClick={() => onSelectPlanet?.(p.key)}
                title={`${p.name} — ${p.degree} ${p.signName}`}
                aria-label={`${p.name}, ${p.degree} ${p.signName}`}
              >
                <Svg html={body(p.key, 26, { state: p.dignity, retro: p.retro })} />
                <span className="nic-deg">{Math.floor(p.degreeValue)}°</span>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}
