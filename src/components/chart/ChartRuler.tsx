"use client";

/* ============================================================
   ChartRuler.tsx — the "start here" guided reading of the chart ruler
   (lagneśa). A numbered chain in the owner's exact phrasing: the ascendant →
   who rules it → where that planet sits (sign, house) → its nakshatra/pada
   (NOT the Moon's) → co-tenants in that sign. Every noun is a flashcard link
   (same resolver as the planet panels). The maitri pill was removed
   (owner-directed) — that relationship lives on the ruler's planet panel.
   Pure presentation — every value is already computed in ChartData
   (lagnaLord, planets[]). Sits full-width between the two charts and the
   planet-panel grid.
   ============================================================ */
import { Svg } from "@/components/Svg";
import { body } from "@/celestial/celestial";
import type { ChartData, PlanetKey } from "@/core/types";
import type { FlashcardType } from "@/lib/flashcardLink";

const PNAME: Record<PlanetKey, string> = {
  sun: "Sun", moon: "Moon", mars: "Mars", mercury: "Mercury", jupiter: "Jupiter",
  venus: "Venus", saturn: "Saturn", rahu: "Rahu", ketu: "Ketu",
};

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

type OpenCard = (type: FlashcardType, id?: string | number) => void;

function FcLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" className="fc-link" onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {children}
    </button>
  );
}

export function ChartRuler({
  chart,
  onOpenCard,
  onSelectPlanet,
}: {
  chart: ChartData;
  onOpenCard: OpenCard;
  onSelectPlanet?: (key: PlanetKey) => void;
}) {
  const ascSign = chart.ascendant.signName;
  const rulerKey = chart.lagnaLord;
  const ruler = chart.planets.find((p) => p.key === rulerKey);
  if (!ruler) return null;

  const conjuncts = ruler.conjunct;
  // the chain copy is the owner's exact phrasing — don't embellish
  const steps: React.ReactNode[] = [
    <>
      <FcLink onClick={() => onOpenCard("ascendant", ascSign)}>{ascSign}</FcLink> is the ascendant.
    </>,
    <>
      {ascSign} is ruled by{" "}
      <FcLink onClick={() => onOpenCard("planet", ruler.name)}>{ruler.name}</FcLink>.
    </>,
    <>
      {ruler.name} sits in{" "}
      <FcLink onClick={() => onOpenCard("sign", ruler.signName)}>{ruler.signName}</FcLink>, the{" "}
      <FcLink onClick={() => onOpenCard("house", ruler.house)}>{ordinal(ruler.house)} house</FcLink>.
    </>,
    <>
      {ruler.name} occupies the nakshatra{" "}
      <FcLink onClick={() => onOpenCard("nakshatra", ruler.nakshatra.name)}>
        {ruler.nakshatra.name}
      </FcLink>
      ,{" "}
      <FcLink onClick={() => onOpenCard("pada", ruler.pada)}>pada {ruler.pada}</FcLink>.
    </>,
  ];
  if (conjuncts.length > 0) {
    steps.push(
      <>
        Also in {ruler.signName}:{" "}
        {conjuncts.map((c, i) => (
          <span key={c}>
            {i > 0 && ", "}
            <FcLink onClick={() => onOpenCard("planet", PNAME[c])}>{PNAME[c]}</FcLink>
          </span>
        ))}
      </>,
    );
  }

  return (
    <section className="cr-card" aria-label="Chart ruler">
      <header className="cr-head">
        <span className="cr-eyebrow">Chart Ruler</span>
        <span className="cr-who">
          <Svg html={body(ruler.key, 34, { state: ruler.dignity, retro: ruler.retro })} />
          {onSelectPlanet ? (
            <button
              type="button"
              className="cr-name"
              onClick={() => onSelectPlanet(ruler.key)}
              title={`Jump to the ${ruler.name} panel`}
            >
              {ruler.name}
            </button>
          ) : (
            <span className="cr-name">{ruler.name}</span>
          )}
          {/* (the maitri pill was removed, owner-directed — see the ruler's panel) */}
        </span>
      </header>
      <ol className="cr-steps">
        {steps.map((s, i) => (
          <li className="cr-step" key={i}>
            <span className="cr-num" aria-hidden="true">{i + 1}</span>
            <span className="cr-text">{s}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
