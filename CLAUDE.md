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
   charts layer on cleanly. **D1 (Rasi) plus the varga set D2/D7/D9/D10/D30 are built**; further
   vargas (D60, …) drop into `src/core/divisional.ts` later, following the reference's `divisional.js`.
5. **Components stay data-driven and reusable.** Content lives in data files; components render data.
   Adding content (a new flashcard deck, a new planet panel) should not require new component code.
6. **License is AGPL-3.0.** The repo is public under AGPL-3.0 (required once Swiss Ephemeris is added).
   When the engine lands, **preserve all upstream copyright notices** (e.g. Swiss Ephemeris ©
   Astrodienst AG). Owner: **Kerjasama LLC**. Source: **https://github.com/yoshnee/vedic-lab**.

---

## What the app is

### Study side
- Data-driven **flashcard decks**. **Planets**, **Houses** (FRONTS unchanged; the BACKS are the
  **"wordsmith" Significations Cloud** — a weighted word-cloud,
  owner-provided terms in three size tiers (big/medium/small), the back showing ONLY the house
  title + the words, no Sanskrit/badge/footnote (owner-directed; the design's
  `Significations Cloud.html` + `significations.jsx` in `design-reference/flashcards/` are the
  visual source); **all twelve houses are converted** — no points backs remain;
  the same treatment is planned for the Planets deck later. Data contract: `Card.cloud =
  { terms: {label, weight}[] }` (`types.ts`), rendered by
  `src/components/flashcards/SignificationsCloud.tsx` big→medium→small, flexbox wrap, no deps),
  **Ascendants** (3 concept cards +
  the 12 signs as Lagnas, with functional lords/benefics/malefics + a Kalapurusha "Body" rulership point on each card back), **Combustion** (Asta),
  **Conjunctions** (Yuti), **Retrogression** (Vakri), **Nakshatras (27)**, **Nakshatra Padas**
  (concept), **Gandanta** (concept), **The Four Elements** (Tattva, concept — backs the chart's
  element-balance readout via its exported `ELEMENT_INFO`), **Planetary Conditions** (Panchadha
  Maitri, concept),
  **Planetary States** (Avasthas, concept), and **Aspects (Drishti, 7 cards)** have full content;
  **Shadbala (10)** has full content (overview + six balas + BPHS minimums + Ishta/Kashta +
  reading-the-numbers; owner-provided, no em-dashes by request);
  **Rahu & Ketu (9)** has full content (owner-provided `rahu_ketu_flashcards.md`: how the nodes
  form (card 1 — owner-retitled "In depth on Rahu and Ketu", 2026-06) · the eclipse rule · the
  six house AXES (1/7 … 6/12, each with both node placements +
  any "Shared" line) · assessing nodal dignity through the dispositor chain; the nodes' NATURE
  stays in the Planets deck, deliberately not duplicated. **Cards 1–2 PULL UP the interactive
  "How Rahu & Ketu Form" diagram** — a `Card.diagramLink` button on their backs opens an
  in-deck WIDE view (`DiagramCard` + `NodesDiagram`, ported from the design handoff's
  `nodes-diagram.jsx`, archived in `design-reference/flashcards/`): an oblique-projected
  orbital model (ecliptic + inclined lunar path, tilt exaggerated 14° for legibility), a
  play/scrub year with eclipse-season detection (status strip: idle/crossing/season/
  lunar/solar eclipse), and a nodal-regression toggle (~18.6yr cycle → why the nodes are
  always retrograde); node markers are the shared celestial body art, NO ☊/☋ glyphs
  (owner-directed). Card 1 opens the "formation" frame (day 0, no eclipse), card 2 the
  "eclipse" frame (day 127 — the seeded longitudes put the full Moon on the shadow line:
  a lunar-eclipse state, verified). Playback persists in localStorage (`rk-nodes-v1`);
  presets win over saved state on open. Esc closes the view before the deck; arrows/side
  buttons navigate out of it; no swipe nav in the view (the day slider is a horizontal
  drag). The diagram screen's copy (sub + 4-idea legend + tilt note) lives in
  `NODES_DIAGRAM` in `rahuKetu.ts`; styles in `src/lib/design/nodes.css`);
  **Yogas (16)** has full content (owner-provided `yogas-flashcards.md`: Raja ×2, Parivartana +
  Maha Parivartana, Pancha Mahapurusha, Gaja Kesari / Venus–Mercury / Dhana 2-11 / Lakshmi,
  Budhaditya, Neecha Bhanga with its numbered conditions 1–7 kept verbatim, and the Grahana family —
  overview + the four luminary–node pair cards; the cards double as the rule documentation the
  live yoga engine (`src/core/yoga.ts` `computeYogas` + its detectors) is pinned to, no em-dashes);
  **Karakas (8)** has full content (owner-provided `karakas-flashcards.md`: the Jaimini
  **Chara Karakas** — an overview card (degree-ranking method, Rahu/Ketu excluded, ties broken
  by minutes then seconds) + the seven karakas in rank order with badges 01–07; all diamond
  icons deliberately, since chara karakas are variable per chart — a fixed planet icon would
  mislead); **Vimshottari Dasha (15)** has full content (owner-provided
  `vimshottari-dasha-flashcards.md`: six concept cards — what it is · the 120-year cycle
  (order/duration rows GENERATED from the engine's `DASHA_SEQUENCE`, single source) · the three
  timing layers (the owner's cards say "Antara" for the third level; the chart rail says
  Pratyantar — same layer, both classical) · what makes a dasha deliver · marriage (chart icon
  house 7) · career (house 10) — + the nine Mahadasha cards with planet icons/accents, years in
  the subtitle slot). **Every deck is now available — no coming-soon tiles remain.**
  Plus one HIDDEN deck: **Planetary Groupings (3, `planetary-groupings`)** — the seven planets
  as three functional teams, couple/throuple cards (Saturn & Mars "Difficulty and Survival" ·
  Venus & Moon "Comfort, Joy & Fulfillment" · Sun/Jupiter/Mercury "Goals, Ambition,
  Achievement"; owner copy VERBATIM from `planetary_groupings_cards.md` — don't reword; each
  card shows its planets' symbols on BOTH faces via the `planets` icon row + `backIcon`
  (owner-directed "rizz" 2026-06 — this overrode the earlier all-diamond quiz-style fronts)).
  `hidden: true` keeps it OFF the landing grid (`HomeApp` filters `d.hidden`) while staying
  registered/resolvable via flashcardLink — surfaced as the /chart Reading-Notes Planets step's
  deck refresher.
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
- The **sidereal engine is built** (`src/core/`, `swisseph-wasm` + Lahiri) and **validated against
  JHora ground-truth via a Vitest suite** (`npm test` → `src/core/__tests__/`): **23 vendored JHora
  charts** (`__fixtures__/jhora/`, spanning every sign + ascendant) recomputed and checked field-by-field
  (positions, sign/degree, nakshatra + lord, pada, retrograde, **and the full Vimśottarī MD/AD tree** —
  MD ≤5d, AD ≤7d, the documented linear-vs-JHora drift), **plus pure invariant tests** over the fixed
  tables (e.g. `debilitation === exaltation + 6` — the guard that catches transcription typos like the
  Moon-in-Scorpio one, independent of any chart). `scripts/validate-engine.ts` remains as a single-chart
  printout (network, tsx). Output is **longitude-based** (raw sidereal longitude per planet) so divisional
  charts can be layered later.
- **The chart flow is LIVE in the browser.** The birth-details popup submit runs the engine on-device
  (swisseph-wasm), holds the result in a store, and navigates to `/chart`:
  - **Engine in the browser** — `getSwe()` (`src/core/swisseph.ts`) lazily inits swisseph-wasm.
    swisseph-wasm@0.0.5 is **patched** (`patches/swisseph-wasm+0.0.5.patch`, applied via the
    `postinstall` hook): the browser `locateFile` points at **`/wasm/*`** (the upstream
    `new URL('../wasm/…', import.meta.url)` 404s under Turbopack), and the Node-only dynamic imports
    (`module`/`url`/`path`) are marked `/* turbopackIgnore */` so the client bundle builds. The
    `swisseph.wasm` (544 KB) + `swisseph.data` (12 MB) are copied into `public/wasm/` by
    `scripts/copy-wasm.mjs` (`predev`/`prebuild`; gitignored). **COOP/COEP are enabled globally** in
    `next.config.ts` (SharedArrayBuffer; compute runs on the home page too, so isolation must be global).
  - **One seam, one store** — `generateChart(civil)` (`src/lib/chart/generateChart.ts`) =
    `birthFromCivil` → `computeChart` (+ `computeTransit`) → wraps a **`ChartModel`**
    (`src/lib/chart/types.ts`: `{ chart: ChartData, meta:{name,ianaTz,computedUtcISO},
    panchanga:{tithiNumber,waxing}, transit:TransitSet|null }`). `transit` = current planets
    (Lahiri, `core.computeTransit`, the engine re-run for "now") placed on the **natal lagna**
    frame — Chart 2's dataset; optional (null on failure, like the Sade Sati scan). Held in
    `ChartProvider` (`src/lib/chart/ChartProvider.tsx`, mounted in `app/layout.tsx`). Only the small
    civil input is persisted (`sessionStorage['vedic:birthDetails']`); the model is never in the URL.
  - **Flow** — `HomeApp.handleGenerate`: loading spinner on the modal CTA → `generateChart` → on
    success `setModel` + `router.push('/chart')`; on failure inline error, modal stays open (no nav).
    `/chart` → `ChartRoute` (`src/components/chart/ChartRoute.tsx`): renders the store model, else
    recomputes from the persisted civil (loading shell), else redirects home with `?analyzer=1`
    (which `HomeApp` reads to auto-open the modal). `ChartView` takes the `ChartModel`.
  - The engine code is the same validated path (155/155); `sample-chart.json` remains for the Node
    validator/dev only. **Manual browser verification** (needs a real browser): `crossOriginIsolated`
    true, the live submit→/chart flow, geocoding under COEP.

### Code layout (actual)
```
app/
  layout.tsx              root layout: next/font vars, globals.css, global <SiteHeader/> + <Footer/>
  page.tsx                "/" → <HomeApp/> (landing; analyzer hero opens the birth-details popup)
  chart/page.tsx          "/chart" → <ChartRoute/> (live ChartModel from the store, or recompute)
  about/page.tsx          "/about" → <AboutPage/> (personal essay)
  resources/page.tsx      "/resources" → <ResourcesPage/> (books + "behind the app" engines)
  faq/page.tsx            "/faq" → <FaqPage/> (native <details> accordion)
  globals.css             @import tokens.css; app.css; site.css; chart.css
src/
  core/                   THE ENGINE (UI-free; follows the Hora-Prakash reference)
    swisseph.ts           swisseph-wasm wrapper (Lahiri positions, speeds, Lagna)
    vedic.ts              sign/degree, nakshatra/pada/lord, whole-sign houses, dignity, drishti, combust
    divisional.ts         varga mapping (chart-ready D2/D7/D9/D10/D30 incl. D30's unequal portions; D3/D12/D16 for shadbala's saptavargaja)
    shadbala.ts           six-fold strength (reference's simplified scheme; see engine bullet)
    dasha.ts              Vimshottari MD→AD→PD (+ running flags, current chain)
    yoga.ts               yoga detection (Pancha Mahapurusha · Gaja Kesari · Budhaditya · Neecha Bhanga · Venus-Mercury · Dhana 2/11 · Grahana); pure over frame placements
    avastha.ts            Baladi (degree) + Jagradadi (dignity + natural maitri) "states"; no invented strength
    constants.ts          dignity tables, nakshatras, drishti, combustion orbs, dasha years
    types.ts              ChartData / PlanetData (engine output contract)
    index.ts              computeChart(birth) — the single seam; birthFromCivil()
    sample.ts             fixed sample birth;  sample-chart.json  (precomputed output)
    __tests__/            Vitest: fixtures.test.ts (23 JHora charts) + invariants.test.ts (table guards)
    __fixtures__/jhora/   23 vendored JHora ground-truth charts (trimmed: birth+planets+dasha)
  lib/design/             tokens.css (source of truth), app.css, site.css (global nav/footer + content pages), chart.css, colors.ts
  lib/chart/              generateChart() seam · ChartModel types · ChartProvider store · varga.ts (VARGAS registry + buildVargaChart/buildVargaPanels)
                          · activation.ts (dasha-lord activated houses) · readingNotes.ts (guided checklist data + localStorage)
  lib/{site.ts, flashcardLink.ts, geo.ts, time.ts, birth.ts, hooks/useDebounce.ts}
  celestial/celestial.ts  SVG art: body({state,retro}) / diamond / glyph / chart / zodiac / combust / conjunction
  components/
    Svg.tsx, flashcards/{Card,Deck,DeckGrid,SignificationsCloud,DiagramCard,NodesDiagram}
    home/{SiteHeader,AppHeader,AnalyzerHero,BirthDetailsModal,PlaceField,Footer,HomeApp}
    site/{PageHero,AboutPage,ResourcesPage,FaqPage}  (the About/Resources/FAQ content routes)
    chart/                ChartView, NorthIndianChart (generic: frame+planets), ChartCard
                          (title/type-selector wrapper), ChartRuler (lagneśa walkthrough),
                          ShadbalaGroups (built, currently UNMOUNTED — owner pulled it),
                          ElementBalance (element tally; rail on desktop, inline on mobile),
                          DashaRail (sticky/​drawer), Legend (symbol-key drawer), PlanetPanel,
                          FlashcardPopover
  data/decks/             registry.ts + per-deck data files
scripts/                  validate-engine.ts, gen-sample-chart.ts (dev: tsx)
design-reference/         read-only design handoffs (flashcards, planet-panel, birth-modal, chats)
```

---

## Current state (2026-06)

**Built and shipping (in Next.js):**
- **Repo scaffold** — Next.js 16 + React 19 + TypeScript, AGPL-3.0 `LICENSE`, `README.md`, `.gitignore`,
  `next.config.ts` (**COOP/COEP headers enabled globally** for the live in-browser engine).
- **Design system as code** — `src/lib/design/tokens.css` (color tokens, single source of truth),
  `app.css` (component styles ported verbatim), `colors.ts`; `src/celestial/celestial.ts` (the art
  module) rendered through `src/components/Svg.tsx`.
- **Global site chrome** — a sticky `SiteHeader` (brand + Home · About · Resources · FAQ, active
  route resolved from `usePathname`; Home → `/`, lit on the landing and the live `/chart` route) and a
  richer 3-column `Footer` (brand/tagline, Explore links, and the **GitHub repo link + "Licensed
  AGPL-3.0."** kept visible for AGPL compliance). Both mounted once in `app/layout.tsx`, so every
  route shares them. Styles live in `src/lib/design/site.css` (ported from the design handoff's
  `site.css`); the old single-line footer CSS was removed. (The home page still carries `#analyzer`
  and `#flashcards` anchors for deep-links, though the nav no longer points at them.)
- **Landing page** (`/`) — `AppHeader` (identity block, below the global nav) + `AnalyzerHero`
  (`id="analyzer"`; the "Generate your chart" CTA **opens the birth-details popup**) + `DeckGrid`
  (wrapped in `#flashcards`). (`AnalyzerStub` was deleted — superseded by `BirthDetailsModal`.)
- **Content routes** (`/about`, `/resources`, `/faq`) — ported from the design handoff
  (`flashcards/{about,resources,faq}.jsx` + `site.css`). Static server components sharing a
  `PageHero` (gold-diamond eyebrow + title + lede). About is a personal essay (*Jyotish* italic +
  gold); Resources lists the study books (Amazon) + "behind the app" engines (Swiss Ephemeris,
  Hora Prakash → `SITE.horaPrakashUrl`, JHora); FAQ is an accessible native-`<details>` accordion
  (first item open). Copy text is the design's verbatim — owner intends to refine it later.
- **Birth-details popup** (`src/components/home/BirthDetailsModal.tsx` + `PlaceField.tsx`) — ported
  from `design-reference/birth-modal/`. Optional name + date + time + place; place is an Open-Meteo
  autocomplete (debounced, abortable) with a manual lat/lon/timezone fallback and a confirmed-place
  card echoing coords + IANA zone + DST-aware UTC offset (Luxon). Deck-grade a11y (focus trap, Esc,
  backdrop, combobox + arrow-key suggestions). "Generate chart" persists the engine-ready civil shape
  to `sessionStorage['vedic:birthDetails']` and closes (routing to `/chart` not wired yet). Helpers:
  `lib/geo.ts`, `lib/time.ts`, `lib/birth.ts`, `lib/hooks/useDebounce.ts`.
- **Flashcards** — full reusable `Card` / `Deck` / `DeckGrid` with the prototype's a11y intact
  (←/→ nav, space/enter flip, Esc close, tab-trap, swipe, `aria-live`). Empty card bodies show a
  tasteful "coming soon"; coming-soon decks render as non-interactive tiles.
- **Decks** — `Planets` + `Houses` + `Ascendants` + `Combustion` + `Conjunctions` + `Retrogression` +
  `Rahu & Ketu` + `Nakshatras` + `Padas` + `Gandanta` + `Elements` + `Maitri` + `Avasthas` +
  `Aspects` + `Shadbala` +
  `Yogas` + `Karakas` + `Vimshottari Dasha` (full content — every deck is live, no coming-soon
  tiles remain). Registry: `src/data/decks/registry.ts`.
  (The `signs` deck id is the "Ascendants" / Lagna deck — 3 concept cards + the 12 sign cards combined
  into one; mixed card types in a single deck is fine.)
  (The `Nakshatras` deck icon/accent per card is its Vimshottari **ruling planet** — front facts are
  span + ruler + **life aim** (the nakshatra's own main purushartha, read from the engine's
  `NAKSHATRA_PURUSHARTHA` table — Sutton's column vendored verbatim; NB her last four diverge from
  dirah/Harness, pinned by an invariant test) + general nature; rulers/spans match the engine's
  validated `NAKSHATRAS` table.)
  (The `padas` deck is concept-based — 5 cards: "What a Pada Is" · "The Four Padas & the Purusharthas"
  · "The Alternating Cycle" · "Padas & the Navamsa (D9)" · "Why Padas Matter". The chart's
  `pada N (purushartha)` placement link
  opens the mapping card and highlights the tapped pada's fact row. Pada→purushartha is the
  **per-nakshatra alternating cycle** from Komilla Sutton's *The Nakshatras: The Stars Beyond the
  Zodiac* — forward Dharma·Artha·Kama·Moksha in one nakshatra, reversed in the next, with the parity
  flipping at Shravana because the book's cycle counts the pada-less Abhijit (`PADA_PURUSHARTHAS` in
  `constants.ts`, an explicit 27-row table — owner-directed; NB other sources (navamsa-element
  derivation, Trivedi) keep the fixed 1 Dharma…4 Moksha map at pada level and put the alternation at
  the whole-nakshatra level; Sutton's per-pada table wins here). `FlashcardTarget.highlightFact`
  drives the row emphasis, resolved by the card title in `flashcardLink.ts` (`PADA_CONCEPT_CARD`).)
- **Engine** (`src/core/`) — `swisseph-wasm` + Lahiri; sign/degree, nakshatra/pada/lord, whole-sign
  houses, dignity, retrograde, combustion, graha-drishti, **panchadha maitri to the dispositor**
  (`vedic.maitriToDispositor` — occupant→dispositor, **asymmetric**; naisargika table
  `NAISARGIKA_FRIENDS/ENEMIES` per the reference + tatkalika 2/3/4/10/11/12 friend rule; per planet:
  `dispositor` and `maitriToDispositor` ∈ adhi_mitra/mitra/sama/shatru/adhi_shatru/own_sign/null; nodes
  → null, the reference defines no node friendships), **functional nature per ascendant**
  (the single canonical `ASCENDANT_FUNCTIONAL` table in `constants.ts` **generates the Ascendants
  deck's** Yogakaraka/Benefics/Neutral/Malefics facts — the rising-sign card is where users see them;
  the per-planet `functionalNature` field, `vedic.functionalNatureOf`, and the panels' B/M/N/Y badge
  were REMOVED, owner-directed — visually distracting; the table + its invariant tests remain),
  **gandanta** (two-tier, **owner-directed** —
  `vedic.gandantaOf`; the flag covers the full junction padas, one pada/3°20′ per side
  (`GANDANTA_ORB = 360/108`, matching the reference), and `deep` is the narrower 28°20′→1°40′
  "true gandanta" zone, ±1°40′ (Sutton); carried by every planet **and the Lagna**), **tithi** (Moon only —
  `vedic.tithiOf`; absolute 1–30 from the Moon–Sun elongation, `tithiNumber`/`waxing`/`illumination` on
  the Moon's data), **shadbala** (`src/core/shadbala.ts` — the canonical Hora-Prakash six-fold scheme,
  **PARITY-GATED**: `__tests__/shadbala-parity.test.ts` runs all 23 fixture charts through our engine
  AND the byte-identical vendored upstream `shadbala.js` (`__tests__/__upstream__/`, AGPL, test-only,
  never bundled) asserting every component + total ≤0.1 virupa — constants must stay literally the
  upstream's (e.g. Naisargika Jupiter 34.28, NOT the exact 60/7 multiple; the gate catches drift).
  Per planet on `PlanetData.shadbala`: Sthana = Uchcha + Saptavargaja over D1/D2/D3/D7/D9/D12/D16 +
  Ojayugma + Kendradi + Drekkana, Dig, Kala = Nathonnatha + Paksha + Ayana, Chesta (retro/speed
  brackets; Sun & Moon take Ayana), Naisargika, Drik (±15 × strength ÷ 2, can go negative); totals +
  classical BPHS required minimums + ratio; **Ishta/Kashta Phala** = √(uchcha×chesta) /
  √((60−uchcha)(60−chesta)) (BPHS-derived — the upstream is silent, the one addition outside the
  gate); `parts` carries the Sthana/Kala sub-components for future progressive disclosure; `tierOf`
  grades total vs required (≥+20% strong · ≥min adequate · −10% borderline · weak); nodes null.
  NB NOT JHora/desktop-exact by design (JHora's fuller Kala/Chesta diverge ~58 virupas mean — measured,
  accepted); day/night birth uses the ecliptic-horizon test (documented; the upstream silently
  defaults to "day" without panchang — the parity test brackets panchang to agree),
  Vimshottari dasha (MD→AD→PD), and a Sade Sati timeline. **Validated via `npm test`** against **23 JHora ground-truth charts** —
  positions/nakshatra/lord/pada/retro plus the full MD→AD dasha tree (MD ≤5d, AD ≤7d of JHora; the
  linear-vs-JHora-hybrid drift the reference's `DASHA_CALCULATION_METHODS.md` documents) — and **invariant
  tests** over the dignity/nakshatra/dasha/drishti tables. Aspects &
  combustion have no fixture ground-truth (rule-based, deterministic from validated positions; the invariant
  suite spot-checks their geometry).
  Nodes shown non-retrograde (matches JHora). **Two owner-directed school choices diverge from the
  reference** (both pinned by invariant tests — don't re-align): **node drishti** is Rahu 5/9 only,
  Ketu none (no 7th for either, so the always-opposite nodes never aspect each other; the reference
  treats both as Jupiter 5/7/9), and **combustion** uses the Combustion deck's orbs (Mercury 1°,
  Venus 8°, Mars/Jupiter/Saturn 10°; only those five combust — Sun/Moon/nodes never; the reference
  uses the wider Parashari orbs incl. Moon 12°).
- **Birth-chart page** (`/chart`) — a desktop **3-up layout**: a sticky **`DashaRail`** (Vimshottari
  MD→AD→PD current chain + the full mahadasha list, each expandable to its antardashas; owns the
  **activated-houses overlay's SELECTION** — the toggle itself is the compact **"Overlay Dashas"
  pill on Chart 1's caption line, beside the DOB** (owner-placed; `ChartCard.controls`, rendered
  inside the caption span in the header grid item so the subgrid keeps the diamonds level; hidden
  in D9 mode; checkbox + title only — helper text owner-trimmed; the checkbox is the shared
  brand-mark `.dia-check` diamond; varga chart captions like "spouse · dharma · inner nature"
  were removed entirely, owner-directed). The wash: ONE accent-gold color on
  the NATAL D1 chart only (never gochar/varga), drawn as a blurred halo + crisp bright layer
  (owner-tuned glow, dialed down ~15% on review), for the
  houses the selected MD + AD lords **rule or occupy** (aspects deliberately excluded,
  owner-revised; nodes occupancy-only; deduped) — pure fn `lib/chart/activation.ts` (tested).
  TWO-COLOR rows (owner-directed): the RUNNING MD/AD/PD chain is GOLD (`data-running`), the
  user's selection is TEAL (`data-selected`); selection defaults to the running chain, tapping an
  MD row selects (MD, MD) (the first AD lord IS the MD lord) and an AD row the (MD, AD) pair,
  state in ChartView so rail + mobile drawer + chart stay in sync, rendered via
  `NorthIndianChart.highlightHouses`) on the left, **a sticky Reading-Notes rail on the RIGHT**
  (owner-directed; the page reads daśā rail | charts + planets | notes; mirrors the daśā rail's
  chrome, collapses to a right-slide drawer on mobile via its own `.notes-trigger`. A guided
  checklist of SEVEN steps in reading order (owner-directed 2026-06) — Ascendant · Planets ·
  Rahu/Ketu Axis · Houses · Vargas (optional) · Dashas · Synthesis — as an
  ACCORDION: only the active step expands (prompt + AUTO-GROWING textarea — rows=4 by default,
  owner-directed "room invites fuller notes", growing via scrollHeight); the rest collapse to
  number · title · checkbox rows (done rows mute); the checkbox is the BRAND MARK — a rotated
  diamond that lights a glowing gold center point when checked (the logo's diamond-holding-light);
  checking a step collapses it and auto-expands the next unchecked one (wrapping; resume point on
  load = first unchecked, `firstUnchecked()`); a dots + "n of 7" progress marker tops the panel.
  Prompts are the owner's CANONICAL wording (`lib/chart/readingNotes.ts`, don't rephrase —
  Ascendant and Planets were owner-shortened 2026-06: "Inspect the Chart Ruler panel." / "Go
  through the planet panels in order. For each, assess its dignity."); the Rahu/Ketu prompt is
  still a DRAFT awaiting the owner's wording. The retitled steps keep their old
  ids ("lagna" → Ascendant, "varga" → Vargas (optional)) so saved localStorage notes survive. DECK
  REFRESHERS: Planets (→ the hidden Planetary Groupings deck — its first chart-side use),
  Rahu/Ketu Axis (→ Rahu & Ketu), Houses, and Dashas (and Vargas once its deck exists) carry a
  small diamond card-icon
  beside the step title opening that whole deck in the browsable popover via the `"deck"`
  flashcard type (`resolveFlashcard("deck", deckId)` → browse-from-card-1) — owner-directed: icons,
  NOT text links; the Lagna ruler-jump link was removed. Notes persist in LOCALSTORAGE keyed per
  natal chart (`vedic:readingNotes:<computedUtcISO>|<lat>|<lon>`), write-through on every change,
  normalized on load (tested). Web Speech dictation: one mic button (sticky at the rail bottom),
  toggles start/stop with a pulsing recording state, appends FINAL transcripts to the EXPANDED
  step's notes (no target label — redundant with the accordion, owner-directed; disabled when all
  steps are done/collapsed); **ON-DEVICE FIRST** — when `SpeechRecognition.available()` (Chrome
  139+) reports the local `en-US` SODA pack installed, recognition runs with `processLocally`
  (no Google cloud round-trip, so no `network` failures); a merely-downloadable pack triggers a
  background `install()` (that attempt still uses the cloud, the next is local); older browsers
  go straight to the cloud path; failures SURFACE in the mic row (`micError`: permission blocked /
  no mic / cloud service unreachable — Brave gets its own message, it strips the Google API keys
  so its cloud path can NEVER work and its SODA install hangs upstream) and log a console.warn;
  feature-detected, disabled with a tooltip where unsupported (Firefox). Pure UI +
  storage — nothing astrological computed; the Dashas step just points at the Overlay Dashas
  toggle. One `useReadingNotes` state instance in ChartView feeds both the rail and the drawer),
  then **two charts**, each a `ChartCard` with a **live type `<select>`** — Chart 1 offers
  **D1 + the full varga set: D2 (Horā) / D7 (Saptāṁśa) / D9 (Navāṁśa) / D10 (Daśāṁśa) /
  D30 (Triṁśāṁśa)** (default D1), Chart 2 the same plus **Transit** (default Transit; transit is
  deliberately right-only — the natal-vs-X reading layout). The set lives in the
  **`VARGAS` registry** (`lib/chart/varga.ts`: key → label/short-label/mapping fn) — both
  dropdowns are generated from it, so a new varga = one registry entry + its `divisional.ts`
  function. Toggling is non-destructive (all datasets derive from the in-memory `ChartModel`).
  **Chart 1 is the DRIVER**: toggling it to any varga re-derives the nine planet panels for that
  varga via `buildVargaPanels` (`lib/chart/varga.ts`, generic over the mapping fn); Chart 2 is an
  independent secondary view and never drives the grid.
  **Owner-directed "varga == D1"** — the varga is read as a full chart: recomputed are sign/expanded
  degree/house from the varga lagna/dignity/aspects/conjunctions/rulerships, **panchadha maitri** to
  the varga dispositor, and — all from the **VARGA LONGITUDES** ((sign−1)·30 + expanded degree,
  the planet's position within the frame; owner-directed 2026-06, "the varga longitude IS the
  position") — **combustion**, **gandanta**, **tithi** (Moon), and the **full yoga detector set**
  (`computeYogas` fed the varga frame: varga dignity/houses/signs/longitudes + varga lagna; NB
  the degree-gated reads — Budhaditya's 6–14° window, Grahana's purna/strong/mild tiers —
  measure varga-longitude arcs, which expand real separations by the divisor; owner-accepted),
  plus **avasthas** (Ryan Kurczak's method: Baladi
  from the expanded degree + varga sign parity, Jagradadi from varga dignity + natural relation to
  the varga sign's lord; nodes still none) — all reused validated functions, no new math. Still
  hidden, deliberately: nakshatra/pada (a real-sky coordinate, not re-read from varga longitudes)
  and the rasi-only systems (shadbala, sade sati) (a `.pp-context` caption + per-panel
  `vargaLabel` say so).
  Chart 2 never affects the panels;
  the daśā rail stays natal, while the **ElementBalance follows the Chart 1 context**
  (tallies the varga signs in varga mode — so the readout never contradicts the visible panels).
  **The varga math** (`core/divisional.ts`, every mapping a verbatim reference port): `navamsa()`
  (reference's elemental-seed method ≡ the continuous 108-cycle; expanded degrees per the JHora
  spec), validated against all 23 fixtures' `navamsa_sign` per body; `hora()`/`saptamsa()` (shared
  with shadbala's saptavargaja); `dasamsa()` (odd from self, even from the 9th); `trimsamsa()`
  (the ONE **unequal** varga — Parashari planet-portions, odd signs 5/5/8/7/5° →
  Aries/Aquarius/Sagittarius/Gemini/Libra, even signs 5/7/8/5/5° → Taurus/Virgo/Pisces/Capricorn/
  Scorpio, inclusive upper bounds per the reference/PyJHora, the uniform (deg×30)%30 degree
  expansion kept verbatim from the reference even though portions are unequal; Leo/Cancer can
  never appear — invariant-tested, as are D10's seeds). `lib/chart/varga.ts` `buildVargaChart()`
  makes any varga's render set (frame = that varga
  of the natal ascendant, whole-sign houses from it, dignity on the varga sign, natal retro).
  Both charts render through the **generic `NorthIndianChart`**
  (`frame {ascSign,ascDegree}` + `planets ChartBody[]`); transit uses the **same natal frame**, so
  transiting planets read through the natal houses, captioned with the compute timestamp.
  **The gochar chart has a date-time scrubber** (owner-placed layout: a compact `datetime-local`
  picker + tz label + gold **Now** reset, all IN LINE beside the Chart-2 type dropdown via
  `ChartCard.headExtra` (`.cc-dt-group`); the caption line beneath carries only status text —
  the two diamonds stay level via SUBGRID (`.chart-top` rows `auto 1fr`; each `.chart-card` spans
  2 shared row tracks, header | chart, so a wrapping header pushes BOTH charts down equally;
  unwound to a plain column when the cards stack on mobile); `ChartCard.controls` remains an
  empty slot reserved for the dasha overlay (bump the subgrid span to 3 when it lands)): a `datetime-local` picker **in the NATAL location's
  timezone** (`meta.ianaTz`, UTC fallback; zone labeled beside the field — deliberately NOT the
  browser zone, so transits line up with the natal frame), Luxon-converted to the UTC instant and
  fed to `transitFor(chart, asOf)` (`generateChart.ts` — the same engine path as the initial "now"
  compute, pure over (natal chart, instant), null-on-failure); recompute is debounced 300ms via
  `useDebounce`; only the planets move — the lagna/houses stay natal; the **Now** button resets
  to the default present-moment set; the picker itself shows the moment, so the caption line
  carries only status ("computing …" while in flight, "transit unavailable for that moment" on
  failure). The scrub state is ChartView-local (the `ChartModel` in the store is never mutated). The daśā
  rail and Chart 2 stay natal regardless of the selectors; the planet panels and element balance
  follow Chart 1. Below the charts, a full-width **`ChartRuler`** card — the "start here" lagneśa
  walkthrough, a numbered chain in the OWNER'S EXACT PHRASING (don't embellish): "<Sign> is the
  ascendant." → "<Sign> is ruled by <planet>." → "<planet> sits in <sign>, the Nth house." →
  "<planet> occupies the nakshatra <name>, pada N." → "Also in <sign>: <planets>" (only when
  conjunct), every noun a flashcard link via the same resolver, the header glyph + name jumping
  to the ruler's panel. Pure presentation — reads only `ChartData.lagnaLord` + `planets[]`;
  renders in D1 panel context only (a natal-lagna reading). (It was briefly deleted 2026-06 and
  the owner RESTORED it — keep it.) An **`ElementBalance`** block (in the sticky rail on
  desktop, an inline card on mobile — CSS shows exactly one of the two rendered copies) tallies all
  nine planets by sign element (`SIGN_ELEMENT`, nodes included), gold-highlights the leading
  element(s), flags any missing element (counts only — the prevailing-trait prose and the footer
  caption were removed, owner-directed), and links each element to the Four Elements deck (text
  from `ELEMENT_INFO`, the deck's lookup form — single source). (A **`ShadbalaGroups`** card —
  the seven planets as three functional teams, owner copy in `src/data/shadbalaGroups.ts` — was
  built 2026-06 but the owner UNMOUNTED it from the page immediately after; the component + data
  files remain for if it returns. Don't re-mount it unasked.) Then
  **full-width 2-column Planet Detail Panels**
  (`.pp-grid`, row-major navagraha order; an open panel spans full width). Houses are **tinted by their sign's ruling-planet color** and labelled with the
  zodiac glyph + muted rāśi number. On mobile everything stacks and the rail becomes a **slide-in
  drawer** (a "Daśā" trigger). A header **Legend** button opens a slide-in **symbol-key drawer**
  (`Legend.tsx`) — planet colors, dignity (rendered via real `body()` glyphs), friendship,
  markers, dasha pills, chart notation — each section rendered from the **same tokens/components** as
  the live UI (so it can't drift), most rows a flashcard link. Panels: nine Planet Detail Panels
  (placement
  prose, aspect/conjunct chips — conjunct/combust hidden when empty, Sade Sati phase-track timeline,
  MD/AD/**Gandanta** pills — the old Ascendant-Lord pill stays retired (the ChartRuler card owns
  that identity); the **chara-karaka computation and its violet Karaka pill were REMOVED entirely**
  (owner-directed 2026-06: `core/karaka.ts`, `PlanetData.karaka`, the flashcard type `"karaka"`,
  the Legend Markers row, and the `--karaka` token are all gone — the **Karakas flashcard deck
  itself stays**, it's study content), with a single-card flashcard popover
  (house/nakshatra/**pada**/sign/ascendant/**gandanta**/maitri/**avastha** → real deck cards). The placement line reads
  `…° Sign · Nakshatra · pada N (Purushartha)`, each of the last three a tappable card link. (The
  square B/M/N/Y functional-nature badge was REMOVED, owner-directed — visually distracting; the
  rising-sign card still lists the functional
  benefics/malefics from the same table.) A
  **maitri** pill (Great Friend → Friend → Neutral → Enemy → Great Enemy, or Own Sign; green→grey→red,
  gold for own; omitted for nodes) shows each planet's panchadha relation to its dispositor and opens the
  Maitri deck's compound card. A **Gandanta** header pill appears on any planet in gandanta (ember-toned;
  inside the ±1°40′ zone it brightens and reads **"True Gandanta"**) and on the Lagna marker in the
  hero — tapping either opens the Gandanta deck's "What Gandanta Is" card. A **Shadbala** drawer (same collapsible pattern as Avasthas, rendered above it;
  collapsed header shows the verdict — rupas + the **tier word** (Strong/Adequate/Borderline/Weak,
  tinted gold/neutral/ember/red via `data-tier`); expanded, six bala rows + **Ishta/Kashta Phala**
  rows + total + required/ratio with the classical binary (Bal-Yukta/Balaheena), every row opening
  its Shadbala deck card via the `shadbala` flashcard type; hidden for nodes). An **Avasthas** drawer (collapsed by default, subordinate to the badges/
  pills) groups each planet's "states" — launching with **Baladi** (five ages by degree-in-sign;
  odd signs Bala→Mrita, even reversed) and **Jagradadi** (Awake/Dreaming/Asleep by dignity, splitting
  the middle case on the **natural/naisargika** relation to the sign lord, with mooltrikona → Awake).
  The Baladi state shows inline on the collapsed header, each row opens that system's Planetary States
  card, and nodes (no avasthas) hide it. Each `avasthas[]` entry carries stable keys (`system`/`state`)
  + English `label`/`systemLabel` (what the panel shows) + an optional Sanskrit subtitle, so the panel
  reads English while the deck keeps the Sanskrit. Computed in `src/core/avastha.ts`; adding Lajjitadi
  (etc.) is just another entry. **Baladi `strength` is intentionally omitted** — the Hora-Prakash
  reference implements no avastha (verified by full-repo grep), so no numeric strength is invented.
  The **Moon panel** also shows a tithi line (`Waxing/Waning Moon · Nth tithi`) with a crescent glyph.
  The hero meta (centered, above the 3-up region) shows name + place + ascendant (+ Gandanta pill)
  and the panchanga Moon line. Renders from the **live `ChartModel`** (the engine runs in-browser on
  submit; Chart 2's transit set is computed alongside it — see the chart-flow note above).

**The flow is fully wired:** the popup persists `sessionStorage['vedic:birthDetails']` and the live
in-browser compute + navigation to `/chart` run on submit; a hard refresh / deep link makes
`ChartRoute` read that key and recompute via `generateChart` on-device. Out of scope: yoga
detection beyond the seven live detectors (Pancha Mahapurusha, Gaja Kesari, Budhaditya,
Neecha Bhanga, Venus & Mercury Conjunction, Dhana 2/11, Grahana), divisional charts beyond the
shipped D2/D7/D9/D10/D30 set.

### Design prototypes — `design-reference/` (read-only visual source of truth)
The original design-tool exports (HTML/CSS/JS) live in [`design-reference/`](design-reference/):
the visual identity (`Vedic Astrology Lab - Identity.html`) and the flashcard/landing prototypes
(`flashcards/*`). The shipped code is ported from these — **match their visual output**. Keep them as
the reference when building new UI; `HANDOFF-README.md` is the original handoff note.

### Ported module APIs (reuse these; don't reinvent)
- **`src/celestial/celestial.ts`** — `body(key, size, retro?)`, `diamond(size, {glow, stroke})`,
  `glyph(label, color, size)`, `chart(size, {highlight, fill, stroke})` (North Indian chart with one
  house highlighted — Houses deck), `zodiac(symbol, size, color)` (zodiac glyph in a colored disc —
  Ascendants deck), `combust(size, planet?)` (Sun engulfing a dimmed planet — Combustion deck),
  `conjunction(size, a, b)` (two planet spheres merging — Conjunctions deck), `colors`. Returns SVG
  **markup strings**; render via `<Svg/>`.
  ⚠️ Renders **neutral + retrograde only**. The **dignity-state rendering (exalted / debilitated /
  own)** lives only in the prototype `body(key,size,state,retro)` in `Vedic Astrology Lab -
  Identity.html` — **port it here** when the chart is built. (Determination of *which* state a planet
  is in is engine logic; the art only *draws* a known state.)
- **`src/data/decks/types.ts`** — `Deck = {id,title,subtitle?,motif,accent,status?,hidden?,cards[]}`
  (`hidden: true` = registered + flashcardLink-resolvable but never tiled on the landing grid);
  `Card = {title,sanskrit?,body,badge?,accentColor?,icon?,backIcon?,facts?,points?,cloud?,diagramLink?}`; `icon = {kind:'planet',id,retro?}
  | {kind:'house',n} | {kind:'diamond'} | {kind:'chart',house} | {kind:'zodiac',symbol} |
  {kind:'combust',planet?} | {kind:'conjunction',a,b} | {kind:'planets',ids[]}` (a row of planet
  spheres — the groupings couples/throuples); `backIcon` repeats a small icon on the BACK's head
  (the Planetary Groupings deck shows its planets on both faces); `status?: 'available' | 'coming-soon'`. `facts` (label/value
  pairs) render on the card **front** (e.g. planet placement + natural relationships); `points`
  (string[]) render on the **back** as a bulleted list (used instead of `body`); `diagramLink =
  {kind:'nodes',frame:'formation'|'eclipse',label}` adds a back button that pulls up the deck's
  interactive diagram view. **Add a deck = new
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
- **Geocoding + timezone (place → lat/lon + IANA zone):** **Open-Meteo Geocoding API**
  (`geocoding-api.open-meteo.com/v1/search`). One call returns coordinates **and** the IANA
  `timezone` — no separate timezone service. Debounced ~300ms, fired at ≥2 chars, requests aborted
  on each keystroke (`src/lib/geo.ts`). Attribution link to open-meteo.com shown in the popup (AGPL).
- **Timezone → UTC offset:** computed locally, DST-aware, with **Luxon** (`src/lib/time.ts`) — never
  a hardcoded offset. (Earlier plan named Nominatim + timeapi.io; Open-Meteo replaces both.)

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

**LIVE in production** at **studyvedicastrology.kerjasama.dev** (valid SSL). Source is public at
**github.com/yoshnee/vedic-lab** (AGPL-3.0).

- **Vercel project:** `yoshnee-rs-projects/vedic-lab`, **git-connected** to github.com/yoshnee/vedic-lab
  (since 2026-06; production branch `main`). Deploys are git-driven:
  - **Every PR / branch push → a preview deployment** (unique URL; the custom domain is untouched).
  - **Merge/push to `main` → the production deployment** (updates the custom domain). Don't CLI-deploy
    to production; merging is the deploy. CLI (`vercel deploy --scope yoshnee-rs-projects`) remains
    for ad-hoc previews only. (`.vercel/` stays gitignored.)
  - (Production-affecting actions — merging to main, or any `--prod` deploy — need explicit user
    authorization.)
- **`vercel.json` pins `buildCommand` to `npm test && npm run build`** — two jobs in one:
  1. **Test gate** — the Vitest suite runs first; any failure aborts the build, so a broken engine
     never deploys (applies to git previews, git production builds, and CLI deploys alike).
  2. **WASM copy** — running the npm `build` script (not a bare `next build`) guarantees the
     `prebuild` hook (`scripts/copy-wasm.mjs`) runs, so `public/wasm/*` (gitignored, 12.5 MB) is
     always populated. A bare `next build` would skip it and ship an engine that 404s at runtime.
- **Critical:** the Swiss Ephemeris WASM needs **Cross-Origin Isolation** (`SharedArrayBuffer`), so
  **COOP/COEP response headers** are set globally in `next.config.ts` (verified live on the domain):
  ```
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
  ```
  Cross-origin sub-resources must then be CORP/CORS-compatible — keep that in mind for fonts and any
  external assets (fonts are self-hosted via `next/font`, so they're fine).

---

## Build order (remaining)

Build in this order; everything from step 2 down reads from the engine.

1. **Birth-data input modal** — ✅ **Done.** `BirthDetailsModal` opened from the analyzer hero;
   place via **Open-Meteo** geocoding (returns coords + IANA zone in one call), DST offset via
   **Luxon**, manual lat/lon/timezone fallback. Persists the engine-ready civil shape to
   `sessionStorage['vedic:birthDetails']`. The CTA navigates to `/chart` after the live in-browser
   compute; `ChartRoute` recomputes from that key on a hard refresh / deep link. Nothing remains.
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
- **Automated yoga detection beyond the seven live detectors** — `src/core/yoga.ts`, each
  pure over frame placements (VARGA PANELS NOW FEED IT their frame — owner-directed; transit
  could later too):
  **Pancha Mahapurusha** (a non-luminary own/exalted in a LAGNA Kendra → Ruchaka/Bhadra/
  Hamsa/Malavya/Sasa; no combustion/retro gating; Mercury-in-Virgo counts once; classically
  also assessed from the MOON — deliberately not computed (owner-accepted), the deck card
  carries a check-the-Moon-count-yourself note),
  **Gaja Kesari** (Jupiter in a Kendra counted whole-sign FROM THE MOON — the deliberate
  frame difference; position 1 = conjunction, included with no degree orb; the entry lands
  on BOTH Jupiter and the Moon, pill label "Gaja Kesari"; v1 is the core rule only — the
  stricter Jupiter-strength gate (not debilitated/combust/enemy sign) is a future separate
  strength pass, NOT detection), and **Budhaditya** (Sun + Mercury in the SAME SIGN with
  6°–14° longitudinal separation INCLUSIVE — the deck card's sweet spot; <6° reads as
  effectively combust, >14° is the looser form deliberately not surfaced in v1 (milder
  tier later); NB the 6° floor is the owner's card convention — the reference's Parashari
  Mercury orb is 14° and the engine's combust flag uses the deck's 1°, so pill and flag
  never contradict; entry lands on BOTH Sun and Mercury, pill label "Budhaditya"; the
  Kendra/Trikona quality tag is a future strength tag, not a gate), and **Neecha Bhanga**
  (per DEBILITATED classical planet — nodes excluded — one pill PER satisfied condition
  C1–C7, labeled "Neecha Bhanga C<n>" with `condition` + `tier` on the YogaRef; rescuers
  (dispositor / exaltation-lord / exalted occupant) resolved from the same canonical
  dignity tables that generate the deck card's back table; Kendra frame is Lagna OR Moon
  — wider than Mahapurusha, deliberately; C6/C7 reuse `vedic.aspectsOnto`, never
  reimplemented; debilitated Mercury skips C3/C4/C7 (self exaltation-lord); deduped by
  (rescuer, mechanism conjunct|kendra|aspect) keeping the lowest condition — in practice
  only Venus-in-Virgo's conjunct Mercury, C1+C5 → C1; the pill opens the Neecha Bhanga
  card PRE-FLIPPED with that condition's back point highlighted via id "neecha-bhanga-c<n>" —
  the conditions live on the card's scrollable back (the front was clipping), highlighted by
  prefix-matched `highlightFact` + `FlashcardTarget.flip`), and the
  **Venus & Mercury Conjunction** Dhana yoga (whole-sign conjunction, no orb, gated to the
  2nd/5th/9th/11th house from the lagna; entry lands on BOTH, id "venus-mercury"), and
  **Dhana 2/11** (the frame's 2nd and 11th house-lords connected by conjunction (any
  house) / MUTUAL graha drishti (both directions) / exchange — one pill on BOTH lords,
  first matching mode stored as `YogaRef.mode` and shown in the pill tooltip, pill label
  "Dhana Yoga", id "dhana-2-11"; dual-lord lagnas skip it — Leo makes Mercury both lords,
  Aquarius makes Jupiter both), and **Grahana** (a luminary + a node SHARING A SIGN — the four
  base pairs; formation is sign-based, the orb only grades `YogaRef.intensity` per the deck card:
  ≤5° purna · ≤10° strong · else mild (tooltip-surfaced); entry on BOTH participants — the nodes'
  FIRST yoga pills; a new-moon triple gives the node two pills; each pill opens ITS pair's deck
  card via id "grahana-<luminary>-<node>"; the card's eclipse layer (~18°/~12° degree-based) is a
  documented future flag, not v1). Each formed yoga lands on `PlanetData.yogas[]` (`YogaRef` = key/name/flashcard + optional
  condition/tier; `computeYogas(planet, {dignity, house, signs, longitudes, lagnaSign})`)
  and renders as a gold pill on the panel's Yogas row opening its deck card via
  `flashcardLink.ts` type `"yoga"` (ids "pancha-mahapurusha" | "gaja-kesari" |
  "budhaditya" | "neecha-bhanga-c<n>" | "grahana-<lum>-<node>"). Further detectors (Raja, …) follow the same seam:
  rule pinned to the owner's Yogas deck card (the Hora-Prakash reference has NO yoga
  module), detector in `yoga.ts`, tests in `__tests__/yoga.test.ts`.
- **Divisional charts beyond D2/D7/D9/D10/D30** — the shipped set is live (`core/divisional.ts` +
  the `VARGAS` registry in `lib/chart/varga.ts`; no disabled stubs remain in the dropdowns). Add
  further vargas (D60, …) in `divisional.ts` following the reference's `divisional.js` +
  `JHORA_DIVISIONAL_SPEC.md`, then register them in `VARGAS` — both dropdowns and the panel
  derivation pick them up from the registry.

---

## Conventions

- **Data-driven & reusable** everywhere (decks, panels, lookup tables live in data, not components).
- Keep the **engine** (`src/core/`) UI-free and testable; validate against reference fixtures.
- Match the existing prototype's **accessibility bar**: focus management, keyboard nav, `aria-live`,
  tab-traps in modals, `prefers-reduced-motion` handling.
- English-primary copy; Sanskrit is subtle/secondary.
- When in doubt about astrological correctness → **stop and consult the reference repo**, never guess.
