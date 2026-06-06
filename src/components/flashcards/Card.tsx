"use client";

/* A single flashcard (front + back faces). An empty body renders a
   tasteful "coming soon" placeholder so scaffolded decks don't look broken. */
import type { CSSProperties } from "react";
import { body, glyph, diamond } from "@/celestial/celestial";
import { Svg } from "@/components/Svg";
import type { Card as CardData } from "@/data/decks/types";

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
  if (icon.kind === "planet") html = body(icon.id, size);
  else if (icon.kind === "house") html = glyph(String(icon.n), accent, size);
  else if (icon.kind === "diamond") html = diamond(size, { glow: true });
  if (!html) return null;
  return <Svg className="fc-icon" html={html} />;
}

export function Card({
  card,
  deckAccent,
  flipped,
}: {
  card: CardData;
  deckAccent: string;
  flipped: boolean;
}) {
  const accent = card.accentColor || deckAccent;
  const hasBody = card.body.trim().length > 0;

  return (
    <div className="fc-card">
      <div
        className={"fc-inner" + (flipped ? " is-flipped" : "")}
        style={{ "--accent": accent } as CSSProperties}
      >
        <div className="fc-face fc-front">
          {card.badge && <span className="fc-badge">{card.badge}</span>}
          <span className="fc-glow" />
          <CardIcon icon={card.icon} accent={accent} size={92} />
          <span className="fc-term">{card.title}</span>
          {card.sanskrit && <span className="fc-sk">{card.sanskrit}</span>}
          <span className="fc-hint">Flip ↻</span>
        </div>
        <div className="fc-face fc-back">
          <div className="fc-back-head">
            <span className="fc-back-term">{card.title}</span>
            {card.sanskrit && <span className="fc-sk">{card.sanskrit}</span>}
          </div>
          {hasBody ? (
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
          {card.badge && hasBody && (
            <span className="fc-badge fc-badge--back">{card.badge}</span>
          )}
        </div>
      </div>
    </div>
  );
}
