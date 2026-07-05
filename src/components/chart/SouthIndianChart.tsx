"use client";

/* ============================================================
   SouthIndianChart.tsx — the D1-style South Indian chart, the fixed-sign
   counterpart to NorthIndianChart (which stays untouched). Same props, same
   nine grahas, same ruler colors + dignity coding — only the layout differs:
   here the twelve SIGNS sit in FIXED 4×4 cells (canonical layout, Pisces in
   the top-left, ring clockwise) and the HOUSES rotate with the ascendant. The
   lagna's cell is marked by a bordered square with a diagonal slash in its
   top-left corner (convention). The centre 2×2 is merged into a focal panel
   (mark + ascendant read-out). Ported from the Claude Design handoff
   (rasi-chart/chart.jsx + chart.css), adapted to the app's data path
   (ChartFrame + ChartBody) and owner nits: symbols only (no sign names),
   ruler-colored cell borders so similar hues (Sun/Jupiter, Saturn/Venus) stay
   distinct, H-labels on every house.
   ============================================================ */
import { Svg } from "@/components/Svg";
import { body, diamond } from "@/celestial/celestial";
import { PLANET_COLORS } from "@/lib/design/colors";
import { SIGN_RULER, SIGN_NAMES } from "@/core/constants";
import type { PlanetKey } from "@/core/types";
import { ZODIAC, type ChartBody, type ChartFrame } from "./shared";

// Fixed South Indian cell for each sign — [row, col], 1-indexed on a 4×4 grid.
// Canonical layout (owner-directed): Pisces top-left, the ring runs CLOCKWISE
// (Pisces → Aries → Taurus → Gemini across the top, down the right, back along
// the bottom, up the left). The centre 2×2 (rows 2–3, cols 2–3) is merged.
const CELL: Record<number, [number, number]> = {
  12: [1, 1], 1: [1, 2], 2: [1, 3], 3: [1, 4], // Pisces · Aries · Taurus · Gemini
  4: [2, 4], 5: [3, 4], 6: [4, 4],              // Cancer · Leo · Virgo (down the right)
  7: [4, 3], 8: [4, 2], 9: [4, 1],              // Libra · Scorpio · Sagittarius (bottom)
  10: [3, 1], 11: [2, 1],                        // Capricorn · Aquarius (up the left)
};

/** Whole-sign: the house a sign holds for a given ascendant (both 1–12). */
function houseOf(sign: number, ascSign: number): number {
  return ((sign - ascSign + 12) % 12) + 1;
}

/** The color of the planet that rules a sign (1–12) — the cell's ruler tint. */
function rulerColor(sign: number): string {
  return PLANET_COLORS[SIGN_RULER[sign - 1]];
}

export function SouthIndianChart({
  frame,
  planets,
  centerLabel = "Rāśi · D1",
  highlightHouses,
  onSelectPlanet,
}: {
  frame: ChartFrame;
  planets: ChartBody[];
  /** The chart-type kicker shown in the centre (e.g. "Rāśi · D1",
      "Navāṁśa · D9", "Gochara · Transit") — so each varga is identifiable. */
  centerLabel?: string;
  /** Houses to wash in the accent color (the activated-houses overlay). */
  highlightHouses?: number[];
  onSelectPlanet?: (key: PlanetKey) => void;
}) {
  const ascSign = frame.ascSign;
  const hot = new Set(highlightHouses ?? []);
  // Group planets by house; each cell knows its own house (from the frame), so
  // matching by house places every graha in the sign cell it actually occupies.
  const byHouse = new Map<number, ChartBody[]>();
  for (const p of planets) {
    const arr = byHouse.get(p.house) ?? [];
    arr.push(p);
    byHouse.set(p.house, arr);
  }

  const ascName = SIGN_NAMES[ascSign - 1];

  return (
    <div className="si" role="group" aria-label={`South Indian chart, ${ascName} ascendant`}>
      <div className="si-grid">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((sign) => {
          const [row, col] = CELL[sign];
          const house = houseOf(sign, ascSign);
          const isLagna = sign === ascSign;
          const rc = rulerColor(sign);
          const housePlanets = byHouse.get(house) ?? [];
          return (
            <div
              key={sign}
              className={`si-box${isLagna ? " is-lagna" : ""}${hot.has(house) ? " is-hot" : ""}`}
              style={{ ["--rc" as string]: rc, gridRow: row, gridColumn: col }}
            >
              {/* header strip (top): zodiac glyph + house label together, so the
                  body below is free for the grahas (owner-directed layout). */}
              <div className="si-head">
                <span className="si-gl" style={{ color: rc }} aria-hidden="true">{ZODIAC[sign - 1]}</span>
                {/* the lagna is house 1, so it reads "H1" like the rest — the
                    white corner diagonal is what marks it as the ascendant. */}
                <span className="si-house">{"H" + house}</span>
              </div>
              <div className="si-planets">
                {housePlanets.map((p) => (
                  <button
                    type="button"
                    className="si-chip"
                    key={p.key}
                    onClick={() => onSelectPlanet?.(p.key)}
                    title={`${p.name} — ${p.degree} ${p.signName}`}
                    aria-label={`${p.name}, ${p.degree} ${p.signName}`}
                  >
                    <Svg html={body(p.key, 24, { state: p.dignity, retro: p.retro })} />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        <div className="si-center">
          <Svg className="si-mk" html={diamond(30, { glow: true })} />
          <span className="si-k">{centerLabel}</span>
          <span className="si-asc">
            <span className="gl" aria-hidden="true">{ZODIAC[ascSign - 1]}</span>
            {ascName}
          </span>
          <span className="si-asc-deg">{frame.ascDegree}</span>
          <span className="si-asc-sub">Ascendant · Lagna</span>
        </div>
      </div>
    </div>
  );
}
