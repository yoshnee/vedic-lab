"use client";

/* ============================================================
   NotesWorkspace.tsx — the fixed full-viewport layer that holds the open
   reading-notes. It is pointer-transparent (pointer-events:none) so it never
   blocks the scrolling chart page; each StickyNote re-enables pointer events on
   itself. Notes are mapped in TENETS order with stable keys so raising the
   stack never remounts a note (and never drops the caret).
   ============================================================ */
import { TENETS } from "@/lib/chart/readingNotes";
import { StickyNote } from "./StickyNote";
import type { ReadingNotesApi } from "./useReadingNotes";

export function NotesWorkspace({ api }: { api: ReadingNotesApi }) {
  const open = TENETS.filter((t) => api.doc.notes[t.id]?.open);
  if (!open.length) return null;
  return (
    <div className="notes-workspace" aria-label="Reading notes workspace">
      {open.map((t) => (
        <StickyNote
          key={t.id}
          tenet={t}
          note={api.doc.notes[t.id]}
          focused={api.focusedId === t.id}
          speechSupported={api.speechSupported}
          recording={api.recordingId === t.id}
          micError={api.focusedId === t.id ? api.micError : null}
          onMove={(x, y) => api.moveNote(t.id, x, y)}
          onFocus={() => api.focusNote(t.id)}
          onClose={() => api.closeNote(t.id)}
          onSetText={(text) => api.setText(t.id, text)}
          onTogglePrompts={() => api.togglePrompts(t.id)}
          onToggleRecording={() => api.toggleRecording(t.id)}
        />
      ))}
    </div>
  );
}
