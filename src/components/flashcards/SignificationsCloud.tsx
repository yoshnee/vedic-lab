"use client";

/* ============================================================
   SignificationsCloud.tsx — the "wordsmith" weighted word-cloud back face
   (ported from design-reference/flashcards/significations.jsx).

   Layout: plain flexbox wrap, centered (styles in app.css under
   "SIGNIFICATIONS CLOUD"). Terms are sorted big → medium → small so heavy
   terms gravitate to the top/center band; no rotation, no packing — this is
   a study aid, readability first. The back shows ONLY the card title and
   these words (owner-directed — the prototype's "sizing is editorial"
   footnote was cut too: no other text). No deps beyond React.
   ============================================================ */
import type { CardCloud, CloudWeight } from "@/data/decks/types";

const TIER: Record<CloudWeight, number> = { big: 0, medium: 1, small: 2 };

export function SignificationsCloud({ data }: { data: CardCloud }) {
  const terms = [...data.terms].sort((a, b) => TIER[a.weight] - TIER[b.weight]);
  return (
    <div className="sig-cloud">
      <div className="sig-terms" role="list" aria-label="Significations, sized by emphasis">
        {terms.map((t) => (
          <span key={t.label} role="listitem" className={`sig-term sig-term--${t.weight}`}>
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}
