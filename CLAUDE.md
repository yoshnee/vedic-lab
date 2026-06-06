# Vedic Astrology Lab

A client-side web app that is **both a study tool and an interactive birth-chart generator for
Vedic astrology (Jyotish)**. It runs entirely in the browser (no backend) and deploys to Vercel at
**studyvedicastrology.kerjasama.dev**.

> **This file is the single source of context for every session.** Keep it current as the project
> evolves — when architecture, conventions, the design system, or the build state change, update
> this file in the same change.

---

## ⛔ Working rules — read first, never break these

1. **Never invent astrological math.** For *any* algorithm, formula, lookup table, or computation
   (positions, ayanamsa, nakshatra/pada, dignity, dasha, sade sati, aspects, divisional charts),
   consult the **Hora Prakash reference repo** (see [Reference repo](#reference-repo)) and follow its
   established method. **If you are unsure of a formula or rule, STOP and check the reference — do not
   improvise. Accuracy matters more than progress.**
2. **Always use the design system.** No ad-hoc colors, fonts, spacing, or icons. Every visual decision
   pulls from the encoded design tokens. See [Design system](#design-system).
3. **Everything stays client-side.** No backend, no server-side calculation, no secrets. External
   calls are limited to the two free geocoding/timezone services below.
4. **Keep the engine longitude-based.** Expose each planet's raw **sidereal longitude** so divisional
   charts (D9, D60, …) can be layered in later. Build **D1 (Rasi) only** for now.
5. **Components stay data-driven and reusable.** Content lives in data files; components render data.
   Adding content (a new flashcard deck, a new planet panel) should not require new component code.
6. **License is AGPL-3.0.** The repo is public under AGPL-3.0 (required once Swiss Ephemeris is added).
   When the engine lands, **preserve all upstream copyright notices** (e.g. Swiss Ephemeris ©
   Astrodienst AG). Owner: **Kerjasama LLC**. Source: **https://github.com/yoshnee/vedic-lab**.

---

## What the app is

### Study side
- Data-driven **flashcard decks**. **Planets** and **Houses** have full content; **Signs (12)**,
  **Nakshatras (27)**, **Aspects (4 rules)**, and **Shadbala (6)** are scaffolded (canonical titles
  seeded, card bodies empty to fill in later); **Karakas / Dashas / Yogas** are registered as
  "coming soon" roadmap tiles.
- **English-primary** with optional subtle Sanskrit.
- Built on a reusable **Card / Deck** system: flip to reveal the meaning, swipe / arrow-key to advance.

### Chart side
- A **Birth Chart Analyzer**: takes birth **date / time / place**, generates an interactive,
  color-coded **North Indian chart**, and shows **nine collapsible planet panels** — each with
  dignity, nakshatra + lord, dasha timing, sade sati, and aspects (drishti).

---

## Tech & architecture

- **Next.js (App Router) + React 19 + TypeScript** (strict), **client-side only**, deployed on **Vercel**.
- **Styling: plain CSS with CSS custom-property tokens** — no Tailwind. The design tokens in
  `src/lib/design/tokens.css` are the single source of truth.
- **Fonts: `next/font/google`** (self-hosted) — Space Grotesk (`--font-display`), Outfit
  (`--font-body`), Space Mono (`--font-mono`). Self-hosting keeps the later COOP/COEP isolation safe.
- Primary devices: **desktop and iPad**; must still present well on **mobile**.
- The sidereal engine (later phase) runs **in the browser** via WebAssembly.
- Engine output is **longitude-based** — every planet exposes its raw sidereal longitude so the
  Vedic derivation layer (and future divisional charts) read from one source of truth.

### Code layout (actual)
```
app/
  layout.tsx              root layout: next/font vars, globals.css, site <Footer/>
  page.tsx                "/" → renders <HomeApp/>
  globals.css             @import tokens.css; @import app.css
src/
  lib/
    design/tokens.css     SINGLE SOURCE OF TRUTH — color tokens (font vars come from next/font)
    design/app.css        all component styles (ported verbatim) + footer + coming-soon + empty-card
    design/colors.ts      canonical 9 planet colors + ACCENT (JS mirror of celestial colors)
    site.ts               site-wide constants (name, owner, repoUrl, liveUrl, tagline)
  celestial/celestial.ts  SVG-art module: body / diamond / glyph / colors (returns markup strings)
  components/
    Svg.tsx               client bridge: renders art strings via dangerouslySetInnerHTML
    flashcards/           Card (empty→"coming soon"), Deck (modal a11y), DeckGrid (coming-soon tiles)
    home/                 AppHeader, AnalyzerHero, AnalyzerStub (stub modal), Footer, HomeApp
  data/decks/
    types.ts              Deck / Card / CardIcon / DeckStatus
    registry.ts           ordered DECKS array — add a deck = file + one entry, no component change
    {planets,houses,signs,nakshatras,aspects,shadbala,karakas,dashas,yogas}.ts
design-reference/         read-only design-tool prototypes (visual source of truth)
```
**Later phase:** the sidereal engine + Vedic derivation layer goes in `src/core/` (mirroring the
reference repo), kept UI-free so it can be tested against the reference's ground-truth fixtures.
Swiss Ephemeris data files (if needed) go in `public/`. The chart/analyzer becomes a `/chart` route
(or inline results); the analyzer is currently a stub (`src/components/home/AnalyzerStub.tsx`).

---

## Current state (2026-06)

**Built and shipping (in Next.js):**
- **Repo scaffold** — Next.js 16 + React 19 + TypeScript, AGPL-3.0 `LICENSE`, `README.md`, `.gitignore`,
  `next.config.ts` (COOP/COEP headers reserved-but-commented for the engine phase).
- **Design system as code** — `src/lib/design/tokens.css` (color tokens, single source of truth),
  `app.css` (component styles ported verbatim), `colors.ts`; `src/celestial/celestial.ts` (the art
  module) rendered through `src/components/Svg.tsx`.
- **Landing page** (`/`) — `HomeApp` composes `AppHeader` + `AnalyzerHero` (CTA opens `AnalyzerStub`,
  the disabled birth-data modal) + `DeckGrid`; site-wide `Footer`.
- **Flashcards** — full reusable `Card` / `Deck` / `DeckGrid` with the prototype's a11y intact
  (←/→ nav, space/enter flip, Esc close, tab-trap, swipe, `aria-live`). Empty card bodies show a
  tasteful "coming soon"; coming-soon decks render as non-interactive tiles.
- **Decks** — `Planets` + `Houses` (full content); `Signs`/`Nakshatras`/`Aspects`/`Shadbala`
  (titles seeded, bodies empty); `Karakas`/`Dashas`/`Yogas` (coming-soon). Registry: `src/data/decks/registry.ts`.

**Not yet built (later phases):** the sidereal **engine** and the real **Birth Chart Analyzer**
(chart, planet panels, dasha timeline) — the analyzer is a stub for now. Automated yoga detection and
divisional charts beyond D1 remain out of scope.

### Design prototypes — `design-reference/` (read-only visual source of truth)
The original design-tool exports (HTML/CSS/JS) live in [`design-reference/`](design-reference/):
the visual identity (`Vedic Astrology Lab - Identity.html`) and the flashcard/landing prototypes
(`flashcards/*`). The shipped code is ported from these — **match their visual output**. Keep them as
the reference when building new UI; `HANDOFF-README.md` is the original handoff note.

### Ported module APIs (reuse these; don't reinvent)
- **`src/celestial/celestial.ts`** — `body(key, size, retro?)`, `diamond(size, {glow, stroke})`,
  `glyph(label, color, size)`, `colors`. Returns SVG **markup strings**; render via `<Svg/>`.
  ⚠️ Renders **neutral + retrograde only**. The **dignity-state rendering (exalted / debilitated /
  own)** lives only in the prototype `body(key,size,state,retro)` in `Vedic Astrology Lab -
  Identity.html` — **port it here** when the chart is built. (Determination of *which* state a planet
  is in is engine logic; the art only *draws* a known state.)
- **`src/data/decks/types.ts`** — `Deck = {id,title,subtitle?,motif,accent,status?,cards[]}`;
  `Card = {title,sanskrit?,body,badge?,accentColor?,icon?}`; `icon = {kind:'planet',id} |
  {kind:'house',n} | {kind:'diamond'}`; `status?: 'available' | 'coming-soon'`. **Add a deck = new
  data file + one entry in `registry.ts`. No component changes.**
- **Flashcard components** (`src/components/flashcards/`) and **home components**
  (`src/components/home/`) — fully accessible; preserve that bar when extending.

---

## Calculations

### Engine (do not reimplement — wrap it)
- **Swiss Ephemeris via `swisseph-wasm` (prolaxu)** for planetary positions and the Lagna (ascendant).
- **Ayanamsa: Lahiri.**
- **Ketu = Rahu + 180°.**

### Vedic derivation layer (build on top of the engine)
Build these ourselves, **following the reference repo's methods**:
- Sign + degree (from sidereal longitude).
- Nakshatra + pada + nakshatra lord.
- **Whole-sign houses** counted from the Lagna.
- **Dignity** — exalted / debilitated / own — via lookup table. *(This is the **determination**
  logic: deciding which state a placed planet is in. The design system does **not** decide this — it
  only specifies how each state is **drawn**, see [Iconography](#iconography-rules-key-visual-logic).)*
- **Vimshottari dasha** — seeded from the **Moon's nakshatra**, with the **balance** of the first
  dasha at birth. Rendered as a **Maha → Antar → Pratyantar** tree/timeline.
- **Sade Sati** — derived from **Saturn's position over time** relative to the natal Moon (Saturn
  transiting the sign before, over, and after the Moon). Heavier than a birth snapshot.
- **Aspects (drishti)** — graha drishti including the special aspects of Mars, Jupiter, Saturn.

### Reference repo
**https://github.com/PriyankGahtori/hora-prakash** — a working client-side Vedic app on the **same
engine**. **Whenever you need an algorithm or computation, consult this repo and follow its established
methods.** Its engine + derivation logic lives in `src/core/`:

| Need | Reference file(s) |
|---|---|
| Swiss Ephemeris wrapper (positions, Lagna, ayanamsa setup) | `src/core/swisseph.js` |
| Sign/degree, nakshatra/pada/lord, houses, dignity, core derivation | `src/core/calculations.js` |
| Vimshottari dasha (Maha/Antar/Pratyantar, balance) | `src/core/dasha.js`, `src/core/dasha.test.js`, `DASHA_CALCULATION_METHODS.md` |
| Aspects / drishti | `src/core/aspects.js` |
| Panchang | `src/core/panchang.js` |
| Sade sati / transits | `src/core/transit.js`, `transitForecast.js`, `transitTara.js` |
| Divisional charts (D9, D60, … — **later**) | `src/core/divisional.js`, `JHORA_DIVISIONAL_SPEC.md` |
| Strength systems (out of scope, but available) | `src/core/shadbala.js`, `src/core/ashtakavarga.js` |
| Calculation write-ups | `docs/CALCULATIONS.md`, repo root `*.md` analysis files |
| **Ground-truth test fixtures (JHora)** | `src/core/__fixtures__/jhora-ground-truth/*.json` |

> Use the JHora ground-truth fixtures to validate our engine output. If our numbers diverge from the
> reference, the reference (and the fixtures) win.

### External services (client-side, free, no key)
- **Geocoding (place → lat/lon):** OpenStreetMap **Nominatim**. (Respect its usage policy — debounce,
  set a descriptive `User-Agent`/`Referer` where possible, don't hammer it.)
- **Timezone by coordinates:** **timeapi.io**.

---

## Design system

**The design system is the single source of truth for all visual decisions.** Encode the tokens in
the codebase (`src/lib/design/`) and pull from them everywhere. Source files:
`design-reference/Vedic Astrology Lab - Identity.html` (full spec) and
`design-reference/flashcards/{styles.css, celestial.js}` (the shipped tokens & art).

**Theme: "Verdant Night"** — dark-only, a deep pine-green canvas lit by a single warm gold accent.

### Core UI palette (canonical — from shipped `styles.css`)
```
--bg          #081410   canvas
--bg-2        #0C1C15   base
--surface     #10271C   surface
--surface-2   #173626   raised surface
--border      #274F38   border
--border-soft #16331F   soft border
--accent      #E4C257   gold accent
--accent-deep #B8923A   deep gold
--text        #ECF3EC   text
--text-2      #A6BBAB   secondary text
--text-3      #67806F   muted text
```

### Navagraha (planet) palette — canonical, from `Celestial.colors`
Seven sign-rulers are tuned to stay clearly distinct (they tint the chart's houses); the two shadow
nodes are muted and **rule nothing**.
```
Sun     #F2C230   Moon    #C2D2E0   Mars    #E2503C
Mercury #36B97A   Jupiter #B26A24   Venus   #B97FD6
Saturn  #3E78E0   Rahu    #969CB0   Ketu    #AC9B79
```
> ✅ **Color authority (confirmed):** `celestial.js` `Celestial.colors` (above) is **canonical** —
> it drives all rendered art and the flashcards. In particular **Jupiter is `#B26A24` and Saturn is
> `#3E78E0`** (user-confirmed). The `--p-*` CSS variables at the top of the *Identity.html* prototype
> are **stale and wrong** (they list Jupiter `#E8913A`, Saturn `#6473E6`) — **discard them**; encode
> tokens from `Celestial.colors`.

### Typography
- **Display / headings:** `Space Grotesk` (600).
- **Body / interface:** `Outfit`. *(The Identity prototype labels body as "Manrope" in one spot, but
  the shipped CSS uses `Outfit` — Outfit is canonical.)*
- **Data / "lab instrument" voice:** `Space Mono` — for longitudes, degrees, dasha dates, eyebrows,
  and labels (uppercase, wide letter-spacing).

### Iconography rules (key visual logic)
- **Houses are colored by their sign's ruling planet** → **7 ruler colors across 12 houses**. Two
  houses sharing a color is expected and meaningful (Sun/Moon rule one sign each; Mars, Mercury,
  Jupiter, Venus, Saturn rule two). **Rahu & Ketu get icon colors but no house tint.**
  Sign→ruler: Aries/Scorpio→Mars, Taurus/Libra→Venus, Gemini/Virgo→Mercury, Cancer→Moon, Leo→Sun,
  Sagittarius/Pisces→Jupiter, Capricorn/Aquarius→Saturn.
- **Planet icons are modern celestial bodies, not glyphs** — gradient-built spheres recolored to the
  palette. Rahu = an **eclipse** (devouring node); Ketu = a **comet + tail** (released node).
- **Dignity rendering** — *the design system defines only **how** to draw a planet once its state is
  known; it does **not** determine the state.* The state (exalted/debilitated/own/neutral) comes from
  the engine's dignity logic (see [Calculations](#vedic-derivation-layer-build-on-top-of-the-engine)).
  Given a state, dignity is shown via **luminosity, halo, and ring — NEVER by changing the identity
  color.** A debilitated Mars is still unmistakably red. The same visual language applies to all nine:
  - **Neutral (base):** the body as placed, no modifier.
  - **Exalted (Uccha):** radiant gold halo, lifted glow, a small star/sparkle, blurred gold ring.
  - **Debilitated (Neecha):** desaturated + dimmed (still its color), grey overlay, dashed grey ring.
  - **Own sign (Swakshetra):** a calm identity-color ring + cardinal tick marks; settled, not amplified.
  - **Rahu & Ketu:** always neutral dignity (nodal dignity is debated in the classics).
- **Retrograde:** a small gold **"R"** superscript (top-right). It **stacks on any dignity state**.
  Sun & Moon never retrograde; Rahu & Ketu are always retrograde (but drawn neutral-dignity).

### Logo / mark
A combination mark. The symbol is the **North Indian birth-chart grid** — a square crossed by its
diagonals with an inner diamond (the classic twelve-house layout) — holding a **single gold point of
light** where the diagonals meet ("Jyotish" = *science of light*). Produced by `Celestial.diamond()`:
glowing-gold form for dark backgrounds, solid-mono form for the gold/accent surface. Wordmarks:
**"Vedic Lab"** (short) and **"Vedic Astrology Lab"** (full). Tagline: *"Learn the science of light."*

### Chart geometry reference
The Identity prototype includes a North Indian diamond layout (`POLY` = 12 house polygons,
`CENTROID` = label positions, 300×300 viewBox, Aries-ascendant demo). North Indian charts are
**house-fixed** (House 1 is always the top-center diamond; signs rotate by ascendant). Use the
prototype's geometry as the starting point for the real chart component.

---

## Deployment

- Deploys to **Vercel** → **studyvedicastrology.kerjasama.dev**.
- **Critical:** the Swiss Ephemeris WASM needs **Cross-Origin Isolation** (`SharedArrayBuffer`).
  **Set COOP/COEP response headers** on Vercel or the engine will not load:
  ```
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
  ```
  (Configure via Next.js headers / `vercel.json` / `vercel.ts`.) Cross-origin sub-resources must then
  be CORP/CORS-compatible — keep that in mind for fonts and any external assets.

---

## Build order (remaining)

Build in this order; everything from step 2 down reads from the engine.

1. **Birth-data input modal** — replace the `BirthDataModal` stub. Wire **Nominatim** (place search)
   + **timeapi.io** (timezone from coordinates).
2. **Calculation engine (D1)** — the core. Wrap `swisseph-wasm` (Lahiri, Ketu = Rahu+180) and build
   the Vedic derivation layer. **Everything below reads from this.** Longitude-based; validate against
   the reference repo's JHora fixtures.
3. **Shared `Collapsible` primitive** — reusable, accessible expand/collapse.
4. **North Indian chart component** — interactive, color-coded (houses tinted by ruling planet),
   planet bodies with dignity + retrograde variants.
5. **Nine planet detail panels** — dignity, nakshatra + lord, dasha timing, sade sati, aspects
   (each a `Collapsible`).
6. **Vimshottari dasha timeline** — Maha → Antar → Pratyantar tree.
7. **Chart page** — assemble modal + chart + panels + dasha timeline.
8. **Responsive + accessibility pass, then deploy** (COOP/COEP headers).

### Out of scope (for now)
- **Automated yoga detection** — **stub it** (leave a clean seam to add later).
- **Divisional charts beyond D1** — don't build them, but **keep the engine longitude-based** so they
  drop in cleanly (reference: `src/core/divisional.js`).

---

## Conventions

- **Data-driven & reusable** everywhere (decks, panels, lookup tables live in data, not components).
- Keep the **engine** (`src/core/`) UI-free and testable; validate against reference fixtures.
- Match the existing prototype's **accessibility bar**: focus management, keyboard nav, `aria-live`,
  tab-traps in modals, `prefers-reduced-motion` handling.
- English-primary copy; Sanskrit is subtle/secondary.
- When in doubt about astrological correctness → **stop and consult the reference repo**, never guess.
