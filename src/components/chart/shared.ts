/* ============================================================
   shared.ts — the render contract shared by BOTH chart styles
   (NorthIndianChart diamond + SouthIndianChart grid) and their consumers
   (ChartCard, HoraChart, varga.ts). Lives here, not on either sibling
   component, so the two renderers can't drift (same body shape, same frame,
   same glyph order). UI-only presentation data — the engine (src/core) stays
   free of it.
   ============================================================ */
import type { Dignity, PlanetKey } from "@/core/types";

/** A planet placed in a house — the minimum either chart style renders. Both the
    engine's PlanetData and the lighter PlacedBody (transit) satisfy this structurally. */
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

// Zodiac glyphs by sign number (1 = Aries … 12 = Pisces). Sign NAMES live in the
// engine (core/constants SIGN_NAMES); the glyphs are presentation-only, so they
// sit here rather than in the UI-free engine.
export const ZODIAC = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
