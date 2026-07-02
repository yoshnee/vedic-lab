"use client";

/* ============================================================
   ElementBalance.tsx — the chart's elemental tally: all nine planets (Rahu &
   Ketu included) counted by the element of the sign each occupies. Shows the
   four counts, the predominant element's prevailing trait, and any missing
   element's flag — text from ELEMENT_INFO (the Elements deck's lookup form),
   so the readout and the flashcards can't diverge. Each element name opens its
   deck card. Rendered twice by ChartView: in the sticky rail (desktop) and
   inline above the planet panels (mobile) — CSS shows exactly one.
   ============================================================ */
import { SIGN_ELEMENT, type Element } from "@/core/constants";
import { ELEMENT_INFO } from "@/data/decks/elements";
import { FcLink } from "./FcLink";
import type { PlanetData } from "@/core/types";
import type { FlashcardType } from "@/lib/flashcardLink";

const ELEMENTS: Element[] = ["fire", "earth", "air", "water"];

type OpenCard = (type: FlashcardType, id?: string | number) => void;

export function ElementBalance({
  planets,
  onOpenCard,
  inline = false,
}: {
  planets: PlanetData[];
  onOpenCard: OpenCard;
  /** true → the mobile in-flow variant (the rail copy is hidden on mobile) */
  inline?: boolean;
}) {
  const counts: Record<Element, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  for (const p of planets) counts[SIGN_ELEMENT[p.sign - 1]] += 1;

  const max = Math.max(...ELEMENTS.map((e) => counts[e])); // leaders get the gold highlight
  const missing = ELEMENTS.filter((e) => counts[e] === 0);

  return (
    <section className="eb-card" data-inline={inline || undefined} aria-label="Element balance">
      <span className="eb-eyebrow">Elements · Tattva</span>
      <ul className="eb-rows">
        {ELEMENTS.map((e) => (
          <li className="eb-row" key={e} data-dominant={(counts[e] === max && max > 0) || undefined}>
            <FcLink className="eb-name" onClick={() => onOpenCard("element", ELEMENT_INFO[e].label)}>
              {ELEMENT_INFO[e].label}
            </FcLink>
            <span className="eb-dots" aria-hidden="true">
              {Array.from({ length: counts[e] }, (_, i) => <i key={i} />)}
            </span>
            <span className="eb-count">{counts[e]}</span>
          </li>
        ))}
      </ul>
      {missing.map((e) => (
        <p className="eb-note" data-missing="" key={e}>
          No planets in <b>{ELEMENT_INFO[e].label}</b> — {ELEMENT_INFO[e].missing}.
        </p>
      ))}
    </section>
  );
}
