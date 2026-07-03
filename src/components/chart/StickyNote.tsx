"use client";

/* ============================================================
   StickyNote.tsx — one draggable note on the reading-notes workspace. Header
   (drag handle + title + close), a collapsible "Guiding questions" list, a
   free-writing textarea (auto-growing), a save-status + word-count footer, and
   a voice-dictation mic. Pointer-drag (mouse/touch/pen) from the header with
   bring-to-front + viewport clamping; arrow-key nudging from the grip for
   keyboard users. Purely presentational over the note's state + the api
   callbacks passed down from useReadingNotes.
   ============================================================ */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { NoteView, NoteState } from "@/lib/chart/readingNotes";

/** Keep notes clear of the sticky global header (the rails dock at top:78px;
    the workspace also sits below the nav's z-index, so this is belt-and-braces). */
const HEADER_SAFE = 84;

function wordCount(s: string): number {
  const t = s.trim();
  return t ? t.split(/\s+/).length : 0;
}
/** Keep the textarea exactly as tall as its content. */
function autoGrow(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight + 2}px`;
}

const Grip = () => (
  <svg width="9" height="14" viewBox="0 0 9 14" fill="currentColor" aria-hidden="true">
    <circle cx="2" cy="2" r="1.1" /><circle cx="7" cy="2" r="1.1" />
    <circle cx="2" cy="7" r="1.1" /><circle cx="7" cy="7" r="1.1" />
    <circle cx="2" cy="12" r="1.1" /><circle cx="7" cy="12" r="1.1" />
  </svg>
);
const Eye = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8Z" />
    <circle cx="8" cy="8" r="1.9" />
  </svg>
);
const Chevron = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
    <path d="M2 7l3.5-3.5L9 7" />
  </svg>
);

export interface StickyNoteProps {
  view: NoteView;
  note: NoteState;
  focused: boolean;
  speechSupported: boolean;
  recording: boolean;
  micError: string | null;
  onMove: (x: number, y: number) => void;
  onFocus: () => void;
  onClose: () => void;
  onSetText: (text: string) => void;
  onTogglePrompts: () => void;
  onToggleRecording: () => void;
  /** Retitle a custom note (ignored for the fixed-title tenets). */
  onRename: (title: string) => void;
}

export function StickyNote({
  view, note, focused, speechSupported, recording, micError,
  onMove, onFocus, onClose, onSetText, onTogglePrompts, onToggleRecording, onRename,
}: StickyNoteProps) {
  // `drag` holds the transient position only WHILE dragging; when null the
  // rendered position derives straight from the committed note.x/note.y, so
  // reloads / external moves / nudges reflect with no setState-in-effect mirror.
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const dragging = drag !== null;
  const pos = drag ?? { x: note.x, y: note.y };
  const rootRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const grab = useRef({ dx: 0, dy: 0 });
  const raf = useRef<number | undefined>(undefined);
  // mirror the COMMITTED position for the stable resize closure + keyboard nudge
  // (both reposition from the saved spot, never from a transient drag frame)
  const posRef = useRef({ x: note.x, y: note.y });
  useEffect(() => { posRef.current = { x: note.x, y: note.y }; }, [note.x, note.y]);

  /** Clamp a position so the note stays inside the viewport (below the header). */
  const clamp = useCallback((x: number, y: number) => {
    const el = rootRef.current;
    const w = el?.offsetWidth ?? 300;
    const h = el?.offsetHeight ?? 0;
    const maxX = Math.max(0, window.innerWidth - w);
    const maxY = Math.max(HEADER_SAFE, window.innerHeight - h);
    return { x: Math.min(Math.max(0, x), maxX), y: Math.min(Math.max(HEADER_SAFE, y), maxY) };
  }, []);

  // recovery: clamp the stored position into the live viewport — on mount AND
  // whenever the committed coordinates change from outside (a chart re-anchor or
  // a storage reload re-seats the note without remounting it, so the mount-only
  // clamp would leave it off-screen). We commit through onMove (the parent
  // re-renders with the clamped note.x/note.y, which is what we render); the
  // useLayoutEffect flush keeps the corrected paint clean. clamp is stable and
  // onMove is read fresh, so we key only on the coordinates.
  useLayoutEffect(() => {
    const c = clamp(note.x, note.y);
    if (c.x !== note.x || c.y !== note.y) onMove(c.x, c.y);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.x, note.y]);
  useEffect(() => {
    const onResize = () => {
      const c = clamp(posRef.current.x, posRef.current.y);
      if (c.x !== posRef.current.x || c.y !== posRef.current.y) onMove(c.x, c.y);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clamp, onMove]);

  // grow the textarea when its content changes from outside (dictation) or the
  // prompts fold/unfold (which changes available height)
  useEffect(() => { autoGrow(taRef.current); }, [note.text, note.promptsCollapsed]);

  // keep the note fully on-screen as it grows (typing / dictation / prompt fold):
  // reclamp whenever the box resizes. The CSS max-height bounds that growth, so a
  // long note grows to the bound and then scrolls its body (.sn-body) internally.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const c = clamp(posRef.current.x, posRef.current.y);
      if (c.x !== posRef.current.x || c.y !== posRef.current.y) onMove(c.x, c.y);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [clamp, onMove]);

  // focus the textarea when the note gains focus (a fresh open / raise) — but
  // NOT on a reload mount (focusedId is null then, so nothing auto-grabs focus)
  const wasFocused = useRef(false);
  useEffect(() => {
    if (focused && !wasFocused.current) taRef.current?.focus();
    wasFocused.current = focused;
  }, [focused]);

  const onHeadPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // primary button only
    // let the close button click and the rename field take the pointer (no drag)
    if ((e.target as HTMLElement).closest(".sn-close, .sn-rename")) return;
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    grab.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ x: note.x, y: note.y }); // enter dragging at the committed position
    e.preventDefault();
  };
  const onHeadPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const nx = e.clientX - grab.current.dx;
    const ny = e.clientY - grab.current.dy;
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => setDrag(clamp(nx, ny)));
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    if (raf.current) cancelAnimationFrame(raf.current);
    const c = clamp(e.clientX - grab.current.dx, e.clientY - grab.current.dy);
    setDrag(null);       // fall back to the committed note.x/note.y…
    onMove(c.x, c.y);    // …which this commits in the same batch
  };

  const onGripKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 48 : 16;
    let dx = 0, dy = 0;
    if (e.key === "ArrowLeft") dx = -step;
    else if (e.key === "ArrowRight") dx = step;
    else if (e.key === "ArrowUp") dy = -step;
    else if (e.key === "ArrowDown") dy = step;
    else return;
    e.preventDefault();
    const c = clamp(posRef.current.x + dx, posRef.current.y + dy);
    onMove(c.x, c.y);
  };

  const collapsed = note.promptsCollapsed;
  const saved = note.text.trim().length > 0;
  const cls = ["sn", "sn--sm", dragging && "sn--drag", focused && "sn--focus", collapsed && "is-collapsed"]
    .filter(Boolean).join(" ");

  return (
    <div
      ref={rootRef}
      className={cls}
      style={{ left: pos.x, top: pos.y, zIndex: note.z }}
      role="group"
      aria-label={`${view.title} note`}
      onPointerDownCapture={onFocus}
    >
      <div
        className="sn-head"
        onPointerDown={onHeadPointerDown}
        onPointerMove={onHeadPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <span
          className="sn-grip"
          role="button"
          tabIndex={0}
          aria-label="Move note (arrow keys)"
          onKeyDown={onGripKeyDown}
        >
          <Grip />
        </span>
        <span className="sn-title">
          <span className="sn-dot" aria-hidden="true" />
          {view.custom ? (
            <input
              className="sn-rename"
              value={note.title ?? ""}
              placeholder="Untitled note"
              aria-label="Note title"
              maxLength={60}
              onChange={(e) => onRename(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
            />
          ) : view.title}
        </span>
        <button type="button" className="sn-close" aria-label="Close note" onClick={onClose}>✕</button>
      </div>

      {/* Everything below the drag header scrolls as one when the note grows past
          its max-height (long text / many questions) — the header stays a fixed
          handle and the note never runs off the fixed workspace. */}
      <div className="sn-body">
      {view.questions.length > 0 && (
        <button type="button" className="sn-toggle" aria-expanded={!collapsed} onClick={onTogglePrompts}>
          <span className="eye"><Eye /></span>
          <span className="lbl">Guiding questions</span>
          <span className="ct">{view.questions.length}</span>
          <span className="chev"><Chevron /></span>
        </button>
      )}

      <div className="sn-q-wrap">
        <ul className="sn-q-list">
          {view.questions.map((q) => (
            <li className="sn-q" key={q}><i aria-hidden="true" />{q}</li>
          ))}
        </ul>
      </div>

      <div className="sn-write">
        <textarea
          ref={taRef}
          className="sn-textarea"
          rows={4}
          value={note.text}
          placeholder="Begin your reading…"
          aria-label={`${view.title} notes`}
          onChange={(e) => { onSetText(e.target.value); autoGrow(e.currentTarget); }}
        />
      </div>

      <div className="sn-foot">
        <span className="save"><i aria-hidden="true" data-on={saved || undefined} />{saved ? "Saved" : "New note"}</span>
        <span className="right">{wordCount(note.text)} {wordCount(note.text) === 1 ? "word" : "words"}</span>
      </div>

      <div className="sn-mic-row">
        <button
          type="button"
          className="sn-mic"
          data-recording={recording || undefined}
          disabled={!speechSupported}
          aria-pressed={recording}
          title={
            !speechSupported
              ? "Voice dictation isn't supported in this browser"
              : recording ? "Stop dictation" : `Dictate into the ${view.title} note`
          }
          onClick={onToggleRecording}
        >
          <span className="sn-mic-dot" aria-hidden="true" />
          {recording ? "Listening" : "Dictate"}
        </button>
        {micError && <span className="sn-mic-err" aria-live="polite">{micError}</span>}
      </div>
      </div>
    </div>
  );
}
