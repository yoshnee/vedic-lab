/* ============================================================
   colors.ts — the canonical Navagraha (planet) palette.
   Single source of truth for planet colors, mirrored by
   celestial.ts (Celestial.colors). Seven sign-rulers are tuned to
   stay distinct (they tint the chart's houses); Rahu & Ketu are
   muted shadow nodes that rule nothing.

   Jupiter #C6701C (owner nudged it a tad more orange 2026-07, from
   the earlier #B26A24, so its house tint reads clearly and separates
   from the Sun's gold) and Saturn #3E78E0 are the confirmed canonical
   values (the design-prototype's --p-* CSS vars are stale; ignore).
   ============================================================ */

export type PlanetKey =
  | "sun" | "moon" | "mars" | "mercury" | "jupiter"
  | "venus" | "saturn" | "rahu" | "ketu";

export const PLANET_COLORS: Record<PlanetKey, string> = {
  sun: "#F2C230",
  moon: "#C2D2E0",
  mars: "#E2503C",
  mercury: "#36B97A",
  jupiter: "#C6701C",
  venus: "#B97FD6",
  saturn: "#3E78E0",
  rahu: "#969CB0",
  ketu: "#AC9B79",
};

/** The single warm gold accent (— matches --accent in tokens.css). */
export const ACCENT = "#E4C257";
