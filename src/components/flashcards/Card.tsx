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
  let cls = "fc-icon";
  if (icon.kind === "planet") html = body(icon.id, size, icon.retro);
  else if (icon.kind === "house") html = glyph(String(icon.n), accent, size);
  else if (icon.kind === "diamond") html = diamond(size, { glow: true });
  else if (icon.kind === "chart") {
    html = chart(size, { highlight: icon.house });
    cls = "fc-icon fc-icon--chart";
  } else if (icon.kind === "zodiac") html = zodiac(icon.symbol, size, accent);
  else if (icon.kind === "combust") html = combust(size, icon.planet);
  else if (icon.kind === "conjunction") html = conjunction(size, icon.a, icon.b);
  if (!html) return null;
  return <Svg className={cls} html={html} />;
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
  const hasFacts = !!card.facts?.length;
  const hasPoints = !!card.points?.length;
  const hasBody = card.body.trim().length > 0;
  const hasBackContent = hasPoints || hasBody;

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
          {card.sanskrit && <span className="fc-sk">{card.sanskrit}</span>}
          {hasFacts ? (
            <dl className="fc-facts">
              {card.facts!.map((f) => (
                <div className="fc-fact" key={f.label}>
                  <dt className="fc-fact-label">{f.label}</dt>
                  <dd className="fc-fact-value">{f.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <span className="fc-hint">Flip ↻</span>
          )}
        </div>
        <div className="fc-face fc-back">
          <div className="fc-back-head">
            <span className="fc-back-term">{card.title}</span>
            {card.sanskrit && <span className="fc-sk">{card.sanskrit}</span>}
          </div>
          {hasPoints ? (
            <ul className="fc-points">
              {card.points!.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
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
          {card.badge && hasBackContent && (
            <span className="fc-badge fc-badge--back">{card.badge}</span>
          )}
        </div>
      </div>
    </div>
  );
}
