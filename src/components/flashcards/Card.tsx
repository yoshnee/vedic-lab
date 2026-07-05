"use client";

/* A single flashcard (front + back faces). An empty body renders a
   tasteful "coming soon" placeholder so scaffolded decks don't look broken. */
import type { CSSProperties } from "react";
import {
  body,
  glyph,
  diamond,
  chart,
  zodiac,
  combust,
  conjunction,
} from "@/celestial/celestial";
import { Svg } from "@/components/Svg";
import { SignificationsCloud } from "./SignificationsCloud";
import { TraitCloud } from "./TraitCloud";
import { TabbedCardBack } from "./TabbedCardBack";
import type { Card as CardData, CardDiagramLink } from "@/data/decks/types";

function CardIcon({
  icon,
  accent,
  size,
}: {
  icon?: CardData["icon"];
  accent: string;
  size: number;
}) {
  if (!icon) return null;
  let html = "";
  let cls = "fc-icon";
  if (icon.kind === "planet") html = body(icon.id, size, { retro: icon.retro });
  else if (icon.kind === "house") html = glyph(String(icon.n), accent, size);
  else if (icon.kind === "diamond") html = diamond(size, { glow: true });
  else if (icon.kind === "chart") {
    html = chart(size, { highlight: icon.house });
    cls = "fc-icon fc-icon--chart";
  } else if (icon.kind === "zodiac") html = zodiac(icon.symbol, size, accent);
  else if (icon.kind === "combust") html = combust(size, icon.planet);
  else if (icon.kind === "conjunction") html = conjunction(size, icon.a, icon.b);
  else if (icon.kind === "planets") {
    // a row of the shared planet-sphere art (CSS lays the row out + sizes it)
    html = icon.ids.map((id) => body(id, size)).join("");
    cls = "fc-icon fc-icon--planets";
  }
  if (!html) return null;
  return <Svg className={cls} html={html} />;
}

export function Card({
  card,
  deckAccent,
  flipped,
  highlightFact,
  activeTab,
  onOpenDiagram,
}: {
  card: CardData;
  deckAccent: string;
  flipped: boolean;
  /** Emphasize the front fact-row with this exact label (e.g. the tapped "Pada 2"),
      or a BACK point that starts with it (e.g. "Major 3-4" → the condition line). */
  highlightFact?: string;
  /** Tab to open a tabbed back on (deep-link targets — a chart pill opening its
      sub-yoga's tab). Ignored for non-tabbed backs. */
  activeTab?: number;
  /** Handler for the back's diagramLink button (the Deck's in-deck diagram
      view). Omitted (e.g. in the chart popover) → the button hides. */
  onOpenDiagram?: (link: CardDiagramLink) => void;
}) {
  const accent = card.accentColor || deckAccent;
  const hasFacts = !!card.facts?.length;
  const hasCloud = !!card.cloud?.terms.length;
  const hasFrontCloud = !!card.frontCloud?.terms.length;
  const hasTraits = !!(card.traits?.positive.length || card.traits?.negative.length);
  const hasTabs = !!card.tabs?.length;
  const hasPoints = !!card.points?.length;
  const hasBody = card.body.trim().length > 0;
  const hasBackContent = hasCloud || hasTraits || hasPoints || hasBody;
  // Zodiac sign cards carry their Sanskrit name on the BACK only — the front
  // leads with the English sign + glyph; the Sanskrit name appears once you flip.
  const frontSanskrit = card.sanskrit && card.icon?.kind !== "zodiac";

  return (
    <div className="fc-card">
      <div
        className={"fc-inner" + (flipped ? " is-flipped" : "")}
        style={{ "--accent": accent } as CSSProperties}
      >
        <div className={"fc-face fc-front" + (hasFacts ? " fc-front--data" : "")}>
          {card.badge && <span className="fc-badge">{card.badge}</span>}
          <span className="fc-glow" />
          <CardIcon icon={card.icon} accent={accent} size={92} />
          <span className="fc-term">{card.title}</span>
          {frontSanskrit && <span className="fc-sk">{card.sanskrit}</span>}
          {hasFacts && (
            <dl className="fc-facts">
              {card.facts!.map((f) => (
                <div
                  className="fc-fact"
                  key={f.label}
                  data-active={highlightFact === f.label || undefined}
                >
                  <dt className="fc-fact-label">{f.label}</dt>
                  <dd className="fc-fact-value">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {card.footnote && <p className="fc-fn">{card.footnote}</p>}
          {/* a significations word cloud on the FRONT, below the facts (nakshatra
              fronts). Reuses the back cloud renderer, sized down for the front. */}
          {hasFrontCloud && (
            <div className="fc-front-cloud">
              <SignificationsCloud data={card.frontCloud!} />
            </div>
          )}
          {/* always shown — the card's own self-explanatory flip cue. On data
              cards it's pinned to the corner (CSS) so it clears the facts. */}
          <span className="fc-hint" aria-hidden="true">Flip ↻</span>
        </div>
        {/* Cloud backs ("wordsmith") show ONLY the title + the weighted words —
            no Sanskrit, no badge, no prose (owner-directed). The front above
            is identical either way. */}
        <div className={"fc-face fc-back" + (hasCloud ? " fc-back--cloud" : hasTraits ? " fc-back--traits" : hasTabs ? " fc-back--tabbed" : "")}>
          {hasTabs ? (
            /* Tabbed back: the crown (title + Sanskrit) + tabs own the whole
               face, so the standard head/badge are skipped. */
            <TabbedCardBack
              title={card.backTitle}
              sanskrit={card.sanskrit}
              intro={card.tabsIntro}
              footnote={card.tabsFootnote}
              tabs={card.tabs!}
              initialTab={activeTab}
            />
          ) : (
            <>
              {!card.hideBackTitle && (
                <div className="fc-back-head">
                  {card.backIcon && <CardIcon icon={card.backIcon} accent={accent} size={26} />}
                  <span className="fc-back-term">{card.backTitle ?? card.title}</span>
                  {card.sanskrit && !hasCloud && <span className="fc-sk">{card.sanskrit}</span>}
                </div>
              )}
              {hasCloud ? (
                <SignificationsCloud data={card.cloud!} />
              ) : hasTraits ? (
                <TraitCloud data={card.traits!} />
              ) : hasPoints ? (
                <>
                  <ul className="fc-points">
                    {card.points!.map((p, idx) => (
                      <li key={idx} data-active={(highlightFact && p.startsWith(highlightFact)) || undefined}>
                        {p}
                      </li>
                    ))}
                  </ul>
                  {card.diagramLink && onOpenDiagram && (
                    <button
                      type="button"
                      className="fcd-open"
                      onClick={(e) => { e.stopPropagation(); onOpenDiagram(card.diagramLink!); }}
                    >
                      {card.diagramLink.label} ↗
                    </button>
                  )}
                </>
              ) : hasBody ? (
                <p className="fc-body">{card.body}</p>
              ) : (
                <div className="fc-empty">
                  <Svg className="fc-empty-mark" html={diamond(46, { glow: true })} />
                  <span className="fc-empty-text">Coming soon</span>
                  <span className="fc-empty-sub">
                    This card’s meaning hasn’t been written yet.
                  </span>
                </div>
              )}
              {card.badge && hasBackContent && !hasCloud && (
                <span className="fc-badge fc-badge--back">{card.badge}</span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
