"use client";

/* ============================================================
   ChartRuler.tsx — the "start here" guided reading of the chart ruler
   (lagneśa). A numbered chain that teaches the method itself: ascendant →
   its ruling planet → the sign that planet occupies → the whole-sign house
   that is → the ruler's own nakshatra/pada (NOT the Moon's). Every noun is
   a flashcard link (same resolver as the planet panels); the maitri pill
   echoes the ruler's panel pill. Pure presentation — every value is already
   computed in ChartData (lagnaLord, planets[]). Sits full-width between the
   two charts and the planet-panel grid.
   ============================================================ */
import { Svg } from "@/components/Svg";
import { body } from "@/celestial/celestial";
import type { ChartData, Maitri, PlanetKey } from "@/core/types";
import type { FlashcardType } from "@/lib/flashcardLink";

const PNAME: Record<PlanetKey, string> = {
  sun: "Sun", moon: "Moon", mars: "Mars", mercury: "Mercury", jupiter: "Jupiter",
  venus: "Venus", saturn: "Saturn", rahu: "Rahu", ketu: "Ketu",
};
const MAITRI_LABEL: Record<Maitri, string> = {
  adhi_mitra: "Great Friend", mitra: "Friend", sama: "Neutral",
  shatru: "Enemy", adhi_shatru: "Great Enemy", own_sign: "Own Sign",
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
  const steps: React.ReactNode[] = [
    <>
      <FcLink onClick={() => onOpenCard("ascendant", ascSign)}>{ascSign}</FcLink> rises — your
      ascendant (lagna).
    </>,
    <>
      {ascSign} is ruled by{" "}
      <FcLink onClick={() => onOpenCard("planet", ruler.name)}>{ruler.name}</FcLink>, so {ruler.name}{" "}
      is your <b>chart ruler</b>.
    </>,
    <>
      {ruler.name} sits in{" "}
      <FcLink onClick={() => onOpenCard("sign", ruler.signName)}>{ruler.signName}</FcLink> at{" "}
      <span className="cr-deg">{ruler.degree}</span> — your{" "}
      <FcLink onClick={() => onOpenCard("house", ruler.house)}>{ordinal(ruler.house)} house</FcLink>{" "}
      counted from {ascSign}.
    </>,
    <>
      {ruler.name} occupies the nakshatra{" "}
      <FcLink onClick={() => onOpenCard("nakshatra", ruler.nakshatra.name)}>
        {ruler.nakshatra.name}
      </FcLink>{" "}
      (whose lord is{" "}
      <FcLink onClick={() => onOpenCard("planet", ruler.nakshatra.lord)}>{ruler.nakshatra.lord}</FcLink>
      ),{" "}
      <FcLink onClick={() => onOpenCard("pada", ruler.pada)}>
        pada {ruler.pada} ({ruler.purushartha})
      </FcLink>
      . Note we read the chart ruler&rsquo;s nakshatra here — not the Moon&rsquo;s, which seeds the daśā.
    </>,
  ];
  if (conjuncts.length > 0) {
    steps.push(
      <>
        Sharing {ruler.signName}:{" "}
        {conjuncts.map((c, i) => (
          <span key={c}>
            {i > 0 && " · "}
            <FcLink onClick={() => onSelectPlanet?.(c)}>{PNAME[c]}</FcLink>
          </span>
        ))}
        {" "}— read these alongside the ruler.
      </>,
    );
  }

  return (
    <section className="cr-card" aria-label="Chart ruler">
      <header className="cr-head">
        <span className="cr-eyebrow">Chart Ruler · Lagneśa</span>
        <span className="cr-who">
          <Svg html={body(ruler.key, 34, { state: ruler.dignity, retro: ruler.retro })} />
          <button
            type="button"
            className="cr-name"
            onClick={() => onSelectPlanet?.(ruler.key)}
            title={`Jump to the ${ruler.name} panel`}
          >
            {ruler.name}
          </button>
          {ruler.maitriToDispositor && (
            <button
              type="button"
              className="pp-pill"
              data-kind="maitri"
              data-maitri={ruler.maitriToDispositor}
              title={ruler.dispositor
                ? `Toward its dispositor ${PNAME[ruler.dispositor]} (lord of ${ruler.signName})`
                : "In its own sign — its own dispositor"}
              onClick={() => onOpenCard("maitri", "panchadha")}
            >
              {MAITRI_LABEL[ruler.maitriToDispositor]}
            </button>
          )}
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
