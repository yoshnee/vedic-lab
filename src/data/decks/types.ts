/* ============================================================
   types.ts — the shape of flashcard data.

   Decks are data files (see ./registry.ts). Adding a deck =
   create a file + add one entry to the registry — NO component
   changes. Card bodies may be empty ("") while a deck is being
   scaffolded; the UI renders a tasteful "coming soon" placeholder.
   ============================================================ */

export type CardIcon =
  | { kind: "planet"; id: string; retro?: boolean } // celestial body, e.g. id:'sun'; retro adds the "R"
  | { kind: "house"; n: number } // diamond medallion with the house number
  | { kind: "diamond" } // the chart-diamond mark (default deck motif)
  | { kind: "chart"; house: number | number[] } // North Indian chart with one or more houses highlighted (an array for the nodal axes)
  | { kind: "zodiac"; symbol: string } // zodiac sign glyph (colored by the card's accent)
  | { kind: "combust"; planet?: string } // Sun with a dimmed planet (combustion / asta)
  | { kind: "conjunction"; a: string; b: string } // two planet spheres merging (yuti)
  | { kind: "planets"; ids: string[] }; // a row of planet spheres (groupings: couples & throuples)

/** A label/value pair shown on the card FRONT (e.g. planet placement data). */
export interface CardFact {
  label: string;
  value: string;
}

/** A weighted term in a significations cloud (three visual size tiers). */
export type CloudWeight = "big" | "medium" | "small";
export interface CloudTerm {
  label: string;
  weight: CloudWeight;
}
/** The "wordsmith" word-cloud BACK face (houses; planets later). When present
    it replaces the prose/points back ENTIRELY — the back shows only the card
    title and the weighted words, nothing else (owner-directed). The front is
    untouched. Sizing is editorial (a memorization aid), not canonical. */
export interface CardCloud {
  terms: CloudTerm[];
}

/** A two-group trait word-cloud BACK (Zodiacs deck): positive traits shown in
    green, negative in red, each a weighted cloud group reusing the same size
    tiers as `CardCloud`. Unlike `cloud`, this keeps the standard back head
    (sign name + Sanskrit) above the two labeled groups. Sizing is editorial. */
export interface CardTraitCloud {
  positive: CloudTerm[];
  negative: CloudTerm[];
  /** Drop the visible "Positive" / "Negative" group headings — the green/red
      coloring already implies polarity. Screen-reader labels are kept. */
  hideLabels?: boolean;
}

/** A key/value row in a tabbed card back's heading area. Mirrors `CardFact`
    but adds an optional color swatch before the value (e.g. the ruling graha's
    identity color). Rendered by `TabbedCardBack`. */
export interface CardTabFact {
  label: string;
  value: string;
  /** Optional swatch color shown before the value (e.g. a planet's color). */
  dot?: string;
}

/** One tab of a `TabbedCardBack` — a facet of a single topic. The tab row
    shows `label`; the active tab's panel shows the `facts` heading, the
    `bullets` list, a `cloud` (significations), and (where it applies) one
    `tag` pill. Everything is optional but `label`, so a tab can be facts-only,
    bullets-only, or cloud-only. */
export interface CardTab {
  /** Tab button text — keep it short (it shares row width with the others). */
  label: string;
  /** Heading key/value rows for this tab. */
  facts?: CardTabFact[];
  /** Short behaviour lines shown as a bullet list. */
  bullets?: string[];
  /** A significations word-cloud for this tab (same weighted tiers as
      `CardCloud`) — e.g. the Vipreet Raja Yoga sub-yogas' results. */
  cloud?: CardCloud;
  /** Optional pill flagging a special condition (e.g. "Pushkara Navāṁśa"). */
  tag?: string;
}

/** A card-back link that pulls up the deck's interactive diagram view
    (e.g. "How Rahu & Ketu Form" on the Rahu & Ketu deck — its cards 1 and 2
    open the same component on different preset frames). The diagram's own
    copy lives with its deck's data file; `kind` picks the component,
    `frame` the preset it opens on. */
export interface CardDiagramLink {
  kind: "nodes";
  frame: "formation" | "eclipse";
  /** Button text on the card back, e.g. "View the diagram". */
  label: string;
}

export interface Card {
  title: string;
  /** Back-face heading override — when the flip should ANSWER rather than
      repeat the front (e.g. the Rahu & Ketu axis cards flip to their theme,
      "Self ↔ Other"). Defaults to `title`. */
  backTitle?: string;
  /** Drop the back-face heading entirely (a non-tabbed back with no title row,
      just the content). Owner-directed for concept cards whose front already
      names the topic, so the back need not repeat it. */
  hideBackTitle?: boolean;
  sanskrit?: string;
  /** Prose meaning on the back. Empty AND no `points`/`cloud` → "coming soon" placeholder. */
  body: string;
  badge?: string;
  /** Overrides the deck accent for this card (e.g. a planet's color). */
  accentColor?: string;
  icon?: CardIcon;
  /** Optional small icon repeated on the card BACK's head (e.g. the
      Planetary Groupings deck shows its planets on both faces). */
  backIcon?: CardIcon;
  /** Reference data shown on the card FRONT (under the icon/title). */
  facts?: CardFact[];
  /** A small clarifying note shown on the card FRONT beneath the facts
      (e.g. the zodiac cards note that their functional benefics/malefics
      apply only when that sign is the ascendant). */
  footnote?: string;
  /** Characteristics shown on the card BACK as a bulleted list (used instead of `body`). */
  points?: string[];
  /** Significations word-cloud BACK (used instead of `points`/`body`). */
  cloud?: CardCloud;
  /** Significations word-cloud shown on the card FRONT, below the facts (the
      nakshatra fronts). Distinct from `cloud`, which renders on the BACK. */
  frontCloud?: CardCloud;
  /** Two-group positive/negative trait cloud BACK (Zodiacs deck; used instead
      of `points`/`body`). Keeps the standard back head. */
  traits?: CardTraitCloud;
  /** Tabbed BACK face — a row of 2–6 clickable tabs over a content panel
      (used instead of `points`/`body`/`cloud`). Rendered by `TabbedCardBack`.
      The back does NOT repeat the front title; a crown (heading + `sanskrit`)
      shows ONLY when `backTitle` sets a distinct back heading (an answer/theme).
      Without `backTitle` the back opens straight into the intro/tabs. */
  tabs?: CardTab[];
  /** An always-visible lede shown above the tab row on a tabbed back (stays put
      across tabs) — e.g. a framing note. Only used when `tabs` is present. */
  tabsIntro?: string;
  /** An always-visible footnote pinned below the tab body on a tabbed back
      (persists across tabs) — e.g. a cross-deck pointer. Only used when `tabs`
      is present. (Distinct from `footnote`, which sits on the card FRONT.) */
  tabsFootnote?: string;
  /** Back-of-card button opening the deck's interactive diagram view. */
  diagramLink?: CardDiagramLink;
}

export type DeckStatus = "available" | "coming-soon";

export interface Deck {
  id: string;
  title: string;
  subtitle?: string;
  motif: "diamond";
  accent: string;
  /** Defaults to "available". "coming-soon" tiles are non-interactive. */
  status?: DeckStatus;
  /** Registered (resolvable via flashcardLink, e.g. from /chart) but NOT
      rendered on the landing flashcards grid (owner-directed). */
  hidden?: boolean;
  cards: Card[];
}
