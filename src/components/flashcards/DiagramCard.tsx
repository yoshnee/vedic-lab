"use client";

/* The deck's interactive diagram view — pulled up from a card back via
   Card.diagramLink (the Rahu & Ketu deck's cards 1–2). Lays out the design's
   screen: title + lede, <NodesDiagram/>, the numbered idea tiles, and the
   footnote (copy from NODES_DIAGRAM in the deck's data file). `frame` presets
   the diagram: "formation" opens at day 0 (plain geometry, no eclipse),
   "eclipse" at day 127 — where the seeded longitudes put the shadow line on
   the node with the full Moon there (a lunar-eclipse state). A back button
   returns to the card. */
import { NodesDiagram } from "./NodesDiagram";
import { NODES_DIAGRAM } from "@/data/decks/rahuKetu";
import type { CardDiagramLink } from "@/data/decks/types";

/** Day-of-year presets for the two teaching frames (see header). */
const FRAME_DAY: Record<CardDiagramLink["frame"], number> = {
  formation: 0,
  eclipse: 127,
};

export function DiagramCard({ link, onBack }: { link: CardDiagramLink; onBack: () => void }) {
  return (
    <div className="fcd-card">
      <button type="button" className="fcd-back" onClick={onBack}>
        ‹ Back to the card
      </button>
      <header className="fcd-head">
        <span className="fcd-title">{NODES_DIAGRAM.title}</span>
        <p className="fcd-sub">{NODES_DIAGRAM.sub}</p>
      </header>
      <NodesDiagram presetDay={FRAME_DAY[link.frame]} />
      <section className="rk-legend" aria-label="Ideas this diagram teaches">
        {NODES_DIAGRAM.legend.map((li, i) => (
          <div className="rk-li" key={i}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <h3>{li.title}</h3>
            <p>{li.text}</p>
          </div>
        ))}
      </section>
      <p className="fcd-note">{NODES_DIAGRAM.note}</p>
    </div>
  );
}
