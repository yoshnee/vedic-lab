/* ============================================================
   celestial.ts — shared SVG art for the Vedic Astrology Lab.
   Ported from the design-reference prototype (celestial.js) to a
   typed ES module. Returns SVG markup strings (render via <Svg/>).
   Single source of truth for planet bodies + the chart-diamond mark.

   Exports: body, diamond, glyph, colors

   Port note: the prototype hard-coded font-family="Space Mono"/"Space
   Grotesk" in SVG <text>. Fonts are now self-hosted via next/font under
   the CSS variables --font-mono / --font-display, so those are referenced
   through inline `style` (presentation attributes can't use var()).

   LATER PHASE: the dignity-state variant — body(key, size, state, retro)
   with exalted/debilitated/own halos & rings — lives only in the
   Identity.html prototype and must be ported here when the chart is built.
   ============================================================ */
import { PLANET_COLORS, ACCENT } from "@/lib/design/colors";

const COLORS: Record<string, string> = PLANET_COLORS;

let _u = 0;

function sphereDefs(u: number): string {
  return (
    '<radialGradient id="sh' + u + '" cx="35%" cy="30%" r="78%">' +
    '<stop offset="0%" stop-color="#fff" stop-opacity="0.52"/>' +
    '<stop offset="42%" stop-color="#fff" stop-opacity="0"/>' +
    '<stop offset="100%" stop-color="#000" stop-opacity="0.46"/>' +
    "</radialGradient>" +
    '<clipPath id="cp' + u + '"><circle cx="24" cy="24" r="16"/></clipPath>'
  );
}

function craters(list: number[][]): string {
  return list
    .map(function (p) {
      return (
        '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="#000" fill-opacity="0.14"/>' +
        '<circle cx="' + (p[0] - p[2] * 0.32) + '" cy="' + (p[1] - p[2] * 0.32) + '" r="' + p[2] * 0.62 + '" fill="#fff" fill-opacity="0.07"/>'
      );
    })
    .join("");
}

function band(y: number, h: number, col: string, op: number): string {
  return '<rect x="6" y="' + (y - h / 2) + '" width="36" height="' + h + '" fill="' + col + '" fill-opacity="' + op + '"/>';
}

function features(key: string): string {
  if (key === "moon") return craters([[18, 18, 3.2], [30, 28, 2.4], [22, 32, 2], [31, 16, 1.5]]);
  if (key === "mercury") return craters([[19, 19, 3.4], [31, 30, 2.6], [28, 18, 1.8], [18, 30, 2]]);
  if (key === "mars")
    return (
      craters([[20, 28, 2.1], [30, 21, 1.7]]) +
      '<ellipse cx="24" cy="11" rx="6" ry="2.5" fill="#fff" fill-opacity="0.5"/>' +
      '<ellipse cx="24" cy="37" rx="4" ry="1.8" fill="#fff" fill-opacity="0.34"/>' +
      '<ellipse cx="27" cy="26" rx="7" ry="3" fill="#000" fill-opacity="0.12" transform="rotate(20 27 26)"/>'
    );
  if (key === "jupiter")
    return (
      band(13, 3, "#000", 0.14) +
      band(18, 2, "#fff", 0.16) +
      band(24, 3.4, "#000", 0.12) +
      band(30, 2.4, "#fff", 0.14) +
      band(35, 3, "#000", 0.13) +
      '<ellipse cx="18" cy="30" rx="3.6" ry="2.3" fill="#6e2716" fill-opacity="0.6"/>'
    );
  if (key === "venus")
    return (
      '<ellipse cx="20" cy="18" rx="12" ry="3.2" fill="#fff" fill-opacity="0.17" transform="rotate(-18 20 18)"/>' +
      '<ellipse cx="27" cy="28" rx="11" ry="3" fill="#fff" fill-opacity="0.12" transform="rotate(-18 27 28)"/>' +
      '<ellipse cx="22" cy="33" rx="8" ry="2.4" fill="#000" fill-opacity="0.10" transform="rotate(-18 22 33)"/>'
    );
  return "";
}

function bodyInner(key: string, u: number): string {
  const c = COLORS[key];
  if (key === "sun") {
    return (
      "<defs>" +
      '<radialGradient id="sg' + u + '" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0%" stop-color="#FFF7DE"/><stop offset="40%" stop-color="' + c + '"/><stop offset="100%" stop-color="#D5851E"/>' +
      "</radialGradient>" +
      '<radialGradient id="gl' + u + '" cx="50%" cy="50%" r="50%">' +
      '<stop offset="52%" stop-color="' + c + '" stop-opacity="0"/><stop offset="70%" stop-color="' + c + '" stop-opacity="0.34"/><stop offset="100%" stop-color="' + c + '" stop-opacity="0"/>' +
      "</radialGradient></defs>" +
      '<circle cx="24" cy="24" r="23.5" fill="url(#gl' + u + ')"/>' +
      '<circle cx="24" cy="24" r="14.5" fill="url(#sg' + u + ')"/>' +
      '<circle cx="24" cy="24" r="14.5" fill="none" stroke="#FFEFC2" stroke-opacity="0.35" stroke-width="0.8"/>'
    );
  } else if (key === "saturn") {
    const rs = 12.5;
    return (
      '<defs><radialGradient id="sh' + u + '" cx="35%" cy="30%" r="78%">' +
      '<stop offset="0%" stop-color="#fff" stop-opacity="0.5"/><stop offset="42%" stop-color="#fff" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.46"/>' +
      "</radialGradient></defs>" +
      '<g transform="rotate(-20 24 24)"><ellipse cx="24" cy="24" rx="21" ry="6.3" fill="none" stroke="#9DC0F2" stroke-width="2.3" stroke-opacity="0.8"/></g>' +
      '<circle cx="24" cy="24" r="' + rs + '" fill="' + c + '"/>' +
      '<circle cx="24" cy="24" r="' + rs + '" fill="url(#sh' + u + ')"/>' +
      '<g transform="rotate(-20 24 24)"><path d="M3 24 A21 6.3 0 0 0 45 24" fill="none" stroke="#BDD6FA" stroke-width="2.3" stroke-opacity="0.95"/></g>'
    );
  } else if (key === "rahu") {
    return (
      "<defs>" +
      '<radialGradient id="rg' + u + '" cx="50%" cy="50%" r="50%"><stop offset="58%" stop-color="#14151C"/><stop offset="100%" stop-color="#2B2D38"/></radialGradient>' +
      '<filter id="rb' + u + '" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.7"/></filter></defs>' +
      '<circle cx="24" cy="24" r="16" fill="none" stroke="' + c + '" stroke-width="3.2" stroke-opacity="0.8" filter="url(#rb' + u + ')"/>' +
      '<circle cx="24" cy="24" r="13.4" fill="url(#rg' + u + ')"/>' +
      '<circle cx="24" cy="24" r="14.1" fill="none" stroke="' + c + '" stroke-width="1.5"/>' +
      '<circle cx="18.5" cy="18" r="1.5" fill="#fff" fill-opacity="0.7"/>'
    );
  } else if (key === "ketu") {
    return (
      "<defs>" +
      '<linearGradient id="kt' + u + '" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + c + '" stop-opacity="0.6"/><stop offset="100%" stop-color="' + c + '" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="sh' + u + '" cx="34%" cy="30%" r="80%"><stop offset="0%" stop-color="#fff" stop-opacity="0.5"/><stop offset="42%" stop-color="#fff" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.44"/></radialGradient></defs>' +
      '<path d="M9 40 Q20 29 31 18 L35 22 Q24 33 13 44 Z" fill="url(#kt' + u + ')"/>' +
      '<circle cx="31" cy="17" r="9.5" fill="' + c + '"/>' +
      '<circle cx="31" cy="17" r="9.5" fill="url(#sh' + u + ')"/>'
    );
  }
  // generic sphere
  return (
    "<defs>" +
    sphereDefs(u) +
    "</defs>" +
    '<circle cx="24" cy="24" r="16" fill="' + c + '"/>' +
    '<g clip-path="url(#cp' + u + ')">' + features(key) + "</g>" +
    '<circle cx="24" cy="24" r="16" fill="url(#sh' + u + ')"/>'
  );
}

/** Planet body SVG (neutral). `retro` adds a gold "R" superscript. */
export function body(key: string, size: number, retro?: boolean): string {
  _u++;
  const marker = retro
    ? '<g><circle cx="39.5" cy="9" r="7.6" fill="#0E1B12" fill-opacity="0.5"/><text x="39.5" y="9" dy="0.34em" text-anchor="middle" style="font-family:var(--font-mono),monospace" font-weight="700" font-size="11.5" fill="#E7C977">R</text></g>'
    : "";
  return (
    '<svg viewBox="0 0 48 48" width="' + size + '" height="' + size + '" style="display:block">' +
    bodyInner(key, _u) +
    marker +
    "</svg>"
  );
}

/** North Indian chart-diamond mark with a glowing point of light.
    Gold on dark — used for deck backs, the app header & the logo. */
export function diamond(size: number, opt?: { stroke?: string; glow?: boolean }): string {
  opt = opt || {};
  const stroke = opt.stroke || ACCENT;
  const glow = opt.glow !== false;
  _u++;
  const u = _u;
  let s = '<svg viewBox="0 0 100 100" width="' + size + '" height="' + size + '" style="display:block">';
  if (glow) {
    s +=
      "<defs>" +
      '<radialGradient id="jlg' + u + '" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0%" stop-color="#FFF6D8"/><stop offset="42%" stop-color="#F3C85A"/><stop offset="100%" stop-color="#F3C85A" stop-opacity="0"/>' +
      "</radialGradient>" +
      '<filter id="jlb' + u + '" x="-90%" y="-90%" width="280%" height="280%"><feGaussianBlur stdDeviation="3.4"/></filter>' +
      "</defs>";
  }
  s +=
    '<g fill="none" stroke="' + stroke + '" stroke-linejoin="round" stroke-linecap="round">' +
    '<rect x="9" y="9" width="82" height="82" rx="7" stroke-width="4.4"/>' +
    '<path d="M9 9 L91 91 M91 9 L9 91" stroke-width="2.3" stroke-opacity="0.78"/>' +
    '<path d="M50 9 L91 50 L50 91 L9 50 Z" stroke-width="3.5"/>' +
    "</g>";
  if (glow) {
    s +=
      '<circle cx="50" cy="50" r="23" fill="url(#jlg' + u + ')" filter="url(#jlb' + u + ')"/>' +
      '<path d="M50 38 L52.6 47.4 L62 50 L52.6 52.6 L50 62 L47.4 52.6 L38 50 L47.4 47.4 Z" fill="#FFF3CE"/>' +
      '<circle cx="50" cy="50" r="3.4" fill="#FFFBEF"/>';
  } else {
    s += '<circle cx="50" cy="50" r="5" fill="' + stroke + '"/>';
  }
  return s + "</svg>";
}

/** Diamond medallion enclosing a short label — generic icon
    (used for House numbers; reusable for any numeric/short glyph). */
export function glyph(label: string | number, color: string | undefined, size: number): string {
  color = color || ACCENT;
  const text = String(label);
  const fs = text.length > 2 ? 15 : 19;
  return (
    '<svg viewBox="0 0 48 48" width="' + size + '" height="' + size + '" style="display:block">' +
    '<rect x="9" y="9" width="30" height="30" rx="5" transform="rotate(45 24 24)" fill="none" stroke="' + color + '" stroke-width="2" stroke-opacity="0.85"/>' +
    '<rect x="14" y="14" width="20" height="20" rx="3" transform="rotate(45 24 24)" fill="' + color + '" fill-opacity="0.12"/>' +
    '<text x="24" y="24" dy="0.36em" text-anchor="middle" style="font-family:var(--font-display),system-ui,sans-serif" font-weight="600" font-size="' + fs + '" fill="' + color + '">' + text + "</text>" +
    "</svg>"
  );
}

/* North Indian chart house polygons (300×300 space, house 1 = top-centre,
   counter-clockwise). The square + diagonals + inner diamond subdivide into
   these twelve bhavas. */
const HOUSE_POLY: Record<number, string> = {
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

/* The North Indian birth-chart mark (the logo grid) with one house filled.
   Grid lines are gold (the logo); the highlighted bhava is washed in a dark
   design-system surface color. Both pull from CSS tokens so they stay on-system.
   Used by the Houses deck so flipping through walks the highlight 1 → 12. */
export function chart(
  size: number,
  opts?: { highlight?: number; fill?: string; stroke?: string },
): string {
  const fill = opts?.fill || "var(--border)";
  const line = opts?.stroke || "var(--accent)";
  const hl = opts?.highlight;
  let s =
    '<svg viewBox="-6 -6 312 312" width="' + size + '" height="' + size + '" style="display:block">';
  if (hl && HOUSE_POLY[hl]) {
    s += '<polygon points="' + HOUSE_POLY[hl] + '" fill="' + fill + '"/>';
  }
  s +=
    '<g fill="none" stroke="' + line + '" stroke-linejoin="round" stroke-linecap="round">' +
    '<rect x="0" y="0" width="300" height="300" rx="8" stroke-width="8"/>' +
    '<path d="M0 0 L300 300 M300 0 L0 300" stroke-width="4" stroke-opacity="0.78"/>' +
    '<path d="M150 0 L300 150 L150 300 L0 150 Z" stroke-width="6"/>' +
    "</g>";
  return s + "</svg>";
}

/* Zodiac sign symbol (♈–♓) as a coin-like icon: the Unicode glyph in a soft
   ruler-colored disc with a thin ring. Color is the sign's ruling-planet color,
   tying into the design system's sign/house coloring. */
export function zodiac(symbol: string, size: number, color?: string): string {
  const c = color || ACCENT;
  return (
    '<svg viewBox="0 0 48 48" width="' + size + '" height="' + size + '" style="display:block">' +
    '<circle cx="24" cy="24" r="21" fill="' + c + '" fill-opacity="0.09"/>' +
    '<circle cx="24" cy="24" r="21" fill="none" stroke="' + c + '" stroke-width="1.4" stroke-opacity="0.5"/>' +
    '<text x="24" y="24" dy="0.34em" text-anchor="middle" style="font-family:\'Apple Symbols\',\'Segoe UI Symbol\',\'Noto Sans Symbols\',sans-serif" font-size="27" fill="' +
    c +
    '">' +
    symbol +
    "</text>" +
    "</svg>"
  );
}

/* Combustion (asta) icon: a glowing Sun with a small dimmed planet hugging
   its edge — the planet "burnt up" by the Sun's glare. `planet` tints the
   trapped body (else a neutral grey); it's drawn scorched/dimmed regardless. */
export function combust(size: number, planet?: string): string {
  _u++;
  const u = _u;
  const pc = planet && COLORS[planet] ? COLORS[planet] : "#8B94A3";
  return (
    '<svg viewBox="0 0 48 48" width="' + size + '" height="' + size + '" style="display:block">' +
    "<defs>" +
    '<radialGradient id="csg' + u + '" cx="42%" cy="38%" r="62%">' +
    '<stop offset="0%" stop-color="#FFF7DE"/><stop offset="42%" stop-color="#F2C230"/><stop offset="100%" stop-color="#D5851E"/>' +
    "</radialGradient>" +
    '<radialGradient id="cgl' + u + '" cx="50%" cy="50%" r="50%">' +
    '<stop offset="46%" stop-color="#F4C84A" stop-opacity="0.55"/><stop offset="100%" stop-color="#F4C84A" stop-opacity="0"/>' +
    "</radialGradient>" +
    "</defs>" +
    '<circle cx="24" cy="24" r="23" fill="url(#cgl' + u + ')"/>' +
    '<circle cx="24" cy="24" r="13" fill="url(#csg' + u + ')"/>' +
    '<circle cx="24" cy="24" r="13" fill="none" stroke="#FFEFC2" stroke-opacity="0.35" stroke-width="0.8"/>' +
    '<circle cx="34" cy="17.5" r="5.6" fill="' + pc + '"/>' +
    '<circle cx="34" cy="17.5" r="5.6" fill="#170F04" fill-opacity="0.36"/>' +
    '<circle cx="34" cy="17.5" r="5.6" fill="none" stroke="#170F04" stroke-opacity="0.4" stroke-width="0.7"/>' +
    "</svg>"
  );
}

/* Conjunction (yuti) icon: two planet spheres overlapping — energies merging
   at one point. `a` (back, larger) and `b` (front) are planet keys; a thin dark
   separator keeps the front sphere distinct. Unknown keys fall back to grey. */
export function conjunction(size: number, a: string, b: string): string {
  _u++;
  const u = _u;
  const ca = COLORS[a] || "#8B94A3";
  const cb = COLORS[b] || "#8B94A3";
  return (
    '<svg viewBox="0 0 48 48" width="' + size + '" height="' + size + '" style="display:block">' +
    '<defs><radialGradient id="cj' + u + '" cx="36%" cy="30%" r="75%">' +
    '<stop offset="0%" stop-color="#fff" stop-opacity="0.5"/>' +
    '<stop offset="42%" stop-color="#fff" stop-opacity="0"/>' +
    '<stop offset="100%" stop-color="#000" stop-opacity="0.42"/>' +
    "</radialGradient></defs>" +
    '<circle cx="19" cy="28" r="12" fill="' + ca + '"/>' +
    '<circle cx="19" cy="28" r="12" fill="url(#cj' + u + ')"/>' +
    '<circle cx="31" cy="18" r="10.7" fill="#0B1A12"/>' +
    '<circle cx="31" cy="18" r="9.5" fill="' + cb + '"/>' +
    '<circle cx="31" cy="18" r="9.5" fill="url(#cj' + u + ')"/>' +
    "</svg>"
  );
}

export const colors = PLANET_COLORS;

const Celestial = { body, diamond, glyph, chart, zodiac, combust, conjunction, colors };
export default Celestial;
