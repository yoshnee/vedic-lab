"use client";

/* ============================================================
   ReadingNotesLauncher.tsx — the docked "Your Analysis" panel in the chart's
   right rail. Lists the seven tenets; clicking a row spawns its sticky note (or
   raises it if already open). Beside each title is a clickable diamond deck
   icon (replaces the old 01..07 numbers) opening that tenet's relevant deck in
   the browsable popover via onOpenDeck. A mini sticky-note icon (the shared
   NoteMark, same as the landing hero) marks a closed tenet — tap it (or the row)
   to spawn the note; a gold dot marks an open one.

   Below the tenets, any freestanding CUSTOM notes are listed the same way, each
   with a trash button — since closing (X-ing) a note only hides it, this list
   is how a closed custom note is reopened or deleted. The foot carries a "New
   sticky note" button — spawning a blank freestanding note, as many as the user
   wants — above the shared "Download all" control (badge = how many notes carry
   text; disabled when none do), which compiles every written note (open OR
   closed) into one Markdown file. Presentational over the api from
   useReadingNotes.
   ============================================================ */
import { Svg } from "@/components/Svg";
import { diamond } from "@/celestial/celestial";
import { FlashcardIcon } from "@/components/flashcards/FlashcardIcon";
import { NoteMark } from "@/components/NoteMark";
import { TENETS, customNotes } from "@/lib/chart/readingNotes";
import type { ReadingNotesApi } from "./useReadingNotes";
import type { ChartModel } from "@/lib/chart/types";

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7.5 1.5v8M4 6l3.5 3.5L11 6M2 12.5h11" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
    <path d="M7 1.8v10.4M1.8 7h10.4" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.5 3.5h9M5.5 3.5V2.3h3v1.2M3.6 3.5l.5 8h5.8l.5-8M6 6v4M8 6v4" />
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
  const { downloadCount } = api;
  const customs = customNotes(api.doc);
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
                <FlashcardIcon size={16} />
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
                  : <span className="add" aria-hidden="true"><NoteMark variant="chip" /></span>}
              </button>
            </div>
          );
        })}
      </div>

      {customs.length > 0 && (
        <div className="rn-customs">
          <span className="rn-customs-k">Your notes</span>
          {customs.map((c) => (
            <div key={c.id} className={`rn-tenet rn-tenet--custom${c.open ? " is-open" : ""}`}>
              <span className="rn-cust-ico" aria-hidden="true"><NoteMark variant="chip" /></span>
              <button
                type="button"
                className="rn-note"
                aria-pressed={c.open}
                title={c.open ? `Bring ${c.title} to front` : `Reopen ${c.title}`}
                onClick={() => api.openNote(c.id)}
              >
                <span className="nm">{c.title}</span>
                {c.open
                  ? <span className="open" aria-hidden="true" />
                  : c.hasText ? <span className="dot" aria-hidden="true" title="Has text" /> : null}
              </button>
              <button
                type="button"
                className="rn-del"
                title={`Delete ${c.title}`}
                aria-label={`Delete ${c.title}`}
                onClick={() => api.deleteNote(c.id)}
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="rn-foot">
        <button
          type="button"
          className="rn-add"
          title="Add a blank sticky note"
          onClick={() => api.addNote()}
        >
          <PlusIcon />
          New sticky note
        </button>
        <button
          type="button"
          className="rn-dl"
          disabled={downloadCount === 0}
          onClick={() => api.downloadAll(model)}
        >
          <DownloadIcon />
          Download all <span className="badge">{downloadCount}</span>
        </button>
        <p className="rn-dlnote">Compiles every note with text into one document</p>
      </div>
    </div>
  );
}
