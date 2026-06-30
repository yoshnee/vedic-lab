"use client";

/* ============================================================
   ReadingNotesLauncher.tsx — the docked "Your Analysis" panel in the chart's
   right rail. Lists the seven tenets; clicking a row spawns its sticky note (or
   raises it if already open). Beside each title is a clickable diamond deck
   icon (replaces the old 01..07 numbers) opening that tenet's relevant deck in
   the browsable popover via onOpenDeck. A "+" affordance marks a closed tenet,
   a gold dot an open one. The foot carries the shared "Download all" control
   (badge = open count, disabled when none open) that compiles every open note
   into one Markdown file. Presentational over the api from useReadingNotes.
   ============================================================ */
import { Svg } from "@/components/Svg";
import { diamond } from "@/celestial/celestial";
import { TENETS } from "@/lib/chart/readingNotes";
import type { ReadingNotesApi } from "./useReadingNotes";
import type { ChartModel } from "@/lib/chart/types";

const Plus = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <path d="M6.5 2v9M2 6.5h9" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7.5 1.5v8M4 6l3.5 3.5L11 6M2 12.5h11" />
  </svg>
);

export function ReadingNotesLauncher({
  api,
  model,
  onOpenDeck,
}: {
  api: ReadingNotesApi;
  model: ChartModel;
  onOpenDeck: (deckId: string) => void;
}) {
  const { openCount } = api;
  return (
    <div className="rn">
      <div className="rn-head">
        <span className="rn-mark" aria-hidden="true"><Svg html={diamond(28, { glow: true })} /></span>
        <div><span className="k">Reading Notes</span><h3>Your Analysis</h3></div>
      </div>

      <div className="rn-tenets">
        {TENETS.map((t) => {
          const open = !!api.doc.notes[t.id]?.open;
          return (
            <div key={t.id} className={`rn-tenet${open ? " is-open" : ""}`}>
              <button
                type="button"
                className="rn-deck"
                title={t.deck.label}
                aria-label={t.deck.label}
                onClick={() => onOpenDeck(t.deck.id)}
              >
                <Svg html={diamond(16, { glow: true })} />
              </button>
              <button
                type="button"
                className="rn-note"
                aria-pressed={open}
                title={open ? `Bring the ${t.title} note to front` : `Open a ${t.title} note`}
                onClick={() => api.openNote(t.id)}
              >
                <span className="nm">{t.title}</span>
                {open
                  ? <span className="open" aria-hidden="true" />
                  : <span className="add" aria-hidden="true"><Plus /></span>}
              </button>
            </div>
          );
        })}
      </div>

      <div className="rn-foot">
        <button
          type="button"
          className="rn-dl"
          disabled={openCount === 0}
          onClick={() => api.downloadAll(model)}
        >
          <DownloadIcon />
          Download all <span className="badge">{openCount}</span>
        </button>
        <p className="rn-dlnote">Compiles every open note into one document</p>
      </div>
    </div>
  );
}
