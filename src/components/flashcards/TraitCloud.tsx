"use client";

/* ============================================================
   TraitCloud.tsx — the two-group trait word-cloud back face (Zodiacs deck).

   Reuses the significations cloud's flex-wrap layout and big → medium → small
   size tiers, but splits into two color-coded, labeled groups: Positive (green,
   --good) and Negative (red, --bad). Terms sort heavy → light within each group
   so the lead trait bands at the top. Sizing is editorial (a memorization aid),
   not canonical. Styles in app.css under "TRAIT CLOUD".
   ============================================================ */
import type { CardTraitCloud, CloudTerm, CloudWeight } from "@/data/decks/types";

const TIER: Record<CloudWeight, number> = { big: 0, medium: 1, small: 2 };

function TraitGroup({
  tone,
  label,
  terms,
}: {
  tone: "pos" | "neg";
  label: string;
  terms: CloudTerm[];
}) {
  const sorted = [...terms].sort((a, b) => TIER[a.weight] - TIER[b.weight]);
  return (
    <div className="trait-group" data-tone={tone}>
      <span className="trait-label">{label}</span>
      <ul className="trait-terms" aria-label={`${label} traits`}>
        {sorted.map((t) => (
          <li key={t.label} className={`trait-term trait-term--${t.weight}`}>
            {t.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TraitCloud({ data }: { data: CardTraitCloud }) {
  return (
    <div className="trait-cloud">
      <TraitGroup tone="pos" label="Positive" terms={data.positive} />
      <TraitGroup tone="neg" label="Negative" terms={data.negative} />
    </div>
  );
}
