"use client";

/* ============================================================
   NotesWorkspace.tsx — the fixed full-viewport layer that holds the open
   reading-notes. It is pointer-transparent (pointer-events:none) so it never
   blocks the scrolling chart page; each StickyNote re-enables pointer events on
   itself. Notes are mapped in stable order (tenets in reading order, then any
   freestanding custom notes) with stable keys so raising the stack never
   remounts a note (and never drops the caret).
   ============================================================ */
import { openNoteViews } from "@/lib/chart/readingNotes";
import { StickyNote } from "./StickyNote";
import type { ReadingNotesApi } from "./useReadingNotes";

export function NotesWorkspace({ api }: { api: ReadingNotesApi }) {
  const views = openNoteViews(api.doc);
  if (!views.length) return null;
  return (
    <div className="notes-workspace" aria-label="Reading notes workspace">
      {views.map((v) => (
        <StickyNote
          key={v.id}
          view={v}
          note={api.doc.notes[v.id]}
          focused={api.focusedId === v.id}
          speechSupported={api.speechSupported}
          recording={api.recordingId === v.id}
          micError={api.focusedId === v.id ? api.micError : null}
          onMove={(x, y) => api.moveNote(v.id, x, y)}
          onFocus={() => api.focusNote(v.id)}
          onClose={() => api.closeNote(v.id)}
          onSetText={(text) => api.setText(v.id, text)}
          onTogglePrompts={() => api.togglePrompts(v.id)}
          onToggleRecording={() => api.toggleRecording(v.id)}
          onRename={(title) => api.renameNote(v.id, title)}
        />
      ))}
    </div>
  );
}
