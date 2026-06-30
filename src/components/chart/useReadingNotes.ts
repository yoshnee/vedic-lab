"use client";

/* ============================================================
   useReadingNotes.ts — the reading-notes workspace's shared state + the voice
   dictation engine. Called ONCE in ChartView and passed to the launcher dock
   and the notes workspace (same lifted-state pattern as the DashaRail
   selection, so the views can never diverge). Owns the per-note doc (open /
   position / stacking / text / prompts), the focused note, and the Web Speech
   recognizer. Pure UI + storage (lib/chart/readingNotes.ts); nothing
   astrological is computed.

   The workspace re-anchors when the chart changes (derive-state-from-props, no
   effect). loadDoc runs at render time — ChartView is only ever client-side
   (ChartRoute shows a loading shell until a model exists), so window /
   localStorage access is safe, no hydration mismatch. Every mutation writes
   through to localStorage.
   ============================================================ */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  TENETS, notesKey, loadDoc, saveDoc,
  type NotesDoc,
} from "@/lib/chart/readingNotes";
import type { ChartModel } from "@/lib/chart/types";

/* ---- Web Speech API (not in TS's lib.dom — minimal local typing) ---- */
interface SpeechResultEvent {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  /** Chrome 139+: force the on-device recognizer (no cloud round-trip). */
  processLocally?: boolean;
  onresult: ((e: SpeechResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  start(): void;
  stop(): void;
}
/** The on-device statics (Chrome 139+/Edge): availability + language-pack
    install for local recognition. Optional — older browsers lack them. */
interface SpeechRecognitionStatics {
  available?: (o: { langs: string[]; processLocally?: boolean }) => Promise<string>;
  install?: (o: { langs: string[]; processLocally?: boolean }) => Promise<boolean>;
}
type SpeechRecognitionCtor = (new () => SpeechRecognitionLike) & SpeechRecognitionStatics;
function speechCtor(): SpeechRecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/** English-primary app → English dictation (also what the SODA pack ships). */
const SPEECH_LANG = "en-US";

/** Brave ships a `navigator.brave` marker — its builds strip the Google API
    keys the cloud recognizer needs, so `network` errors there are by design. */
const isBrave = () => typeof navigator !== "undefined" && "brave" in navigator;

/** Human wording for the Web Speech error codes worth surfacing. */
const MIC_ERRORS: Record<string, string> = {
  "not-allowed": "microphone access blocked — allow it in the address bar",
  "service-not-allowed": "speech service blocked by the browser",
  network: "the browser could not reach its cloud speech service (try Chrome, which can dictate on-device)",
  "audio-capture": "no microphone found",
  "language-not-supported": "the on-device speech pack is missing, tap the mic to retry",
};
/** Brave can never reach the cloud recognizer (no Google API keys). */
const BRAVE_NETWORK_ERROR = "Brave blocks the cloud speech service, dictation needs Chrome or Edge";
/** The cloud failed but we already kicked off the on-device pack download. */
const DOWNLOADING_NETWORK_ERROR =
  "cloud speech unreachable — the on-device speech pack is downloading in the background, try the mic again in a minute";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "chart";
}

export interface ReadingNotesApi {
  doc: NotesDoc;
  openCount: number;
  focusedId: string | null;
  openNote: (id: string) => void;
  closeNote: (id: string) => void;
  focusNote: (id: string) => void;
  setText: (id: string, text: string) => void;
  togglePrompts: (id: string) => void;
  moveNote: (id: string, x: number, y: number) => void;
  downloadAll: (model: ChartModel) => void;
  /* dictation */
  speechSupported: boolean;
  /** The note id currently being dictated into, or null. */
  recordingId: string | null;
  /** Why the last dictation attempt failed (auto-clears) — silent mics are
      indistinguishable from broken ones, so failures must be visible. */
  micError: string | null;
  toggleRecording: (id: string) => void;
}

/** The shared workspace state + dictation engine — call once, render twice. */
export function useReadingNotes(model: ChartModel): ReadingNotesApi {
  const key = notesKey(model);
  const [doc, setDoc] = useState<NotesDoc>(() => loadDoc(key));
  const [focusedId, setFocusedId] = useState<string | null>(null);
  // a different chart re-anchors the workspace (derive-state-from-props, no effect)
  const [anchorKey, setAnchorKey] = useState(key);
  if (anchorKey !== key) {
    setAnchorKey(key);
    setDoc(loadDoc(key));
    setFocusedId(null);
  }

  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const micErrTimer = useRef<number | undefined>(undefined);
  const mountedRef = useRef(true); // guards the async probe's continuation
  const installKickedRef = useRef(false); // an on-device pack download is in flight
  const flagMicError = useCallback((code?: string) => {
    let msg = MIC_ERRORS[code ?? ""] ?? null; // "no-speech"/"aborted" are normal — stay quiet
    if (code === "network" && isBrave()) msg = BRAVE_NETWORK_ERROR;
    else if (code === "network" && installKickedRef.current) msg = DOWNLOADING_NETWORK_ERROR;
    if (!msg) return;
    setMicError(msg);
    window.clearTimeout(micErrTimer.current);
    micErrTimer.current = window.setTimeout(() => setMicError(null), 6000);
  }, []);

  // refs keep the long-lived callbacks reading fresh values — synced via
  // effects, which run long before any user event or speech result can fire
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const keyRef = useRef(key);
  useEffect(() => { keyRef.current = key; }, [key]);
  const recordingIdRef = useRef<string | null>(null);
  useEffect(() => { recordingIdRef.current = recordingId; }, [recordingId]);
  // a deferred start when switching the mic from one note to another (stop is
  // async — onend starts the queued note)
  const pendingStartRef = useRef<string | null>(null);
  // docRef lets the speech result + download read the live doc without
  // re-binding the long-lived recognition callbacks; beginRef breaks the
  // start↔onend cycle without a forward reference
  const docRef = useRef(doc);
  useEffect(() => { docRef.current = doc; }, [doc]);
  const beginRef = useRef<(id: string) => void>(() => {});

  /** One mutation path: update the doc and write through to localStorage. */
  const mutate = useCallback((fn: (prev: NotesDoc) => NotesDoc) => {
    setDoc((prev) => {
      const next = fn(prev);
      if (next === prev) return prev;
      saveDoc(keyRef.current, next);
      return next;
    });
  }, []);

  const openNote = useCallback((id: string) => {
    mutate((prev) => {
      const note = prev.notes[id];
      if (!note) return prev;
      const z = prev.z + 1;
      return { ...prev, z, notes: { ...prev.notes, [id]: { ...note, open: true, z } } };
    });
    setFocusedId(id);
  }, [mutate]);

  const closeNote = useCallback((id: string) => {
    if (recordingIdRef.current === id) recRef.current?.stop(); // stop dictation on close
    mutate((prev) => {
      const note = prev.notes[id];
      if (!note || !note.open) return prev;
      return { ...prev, notes: { ...prev.notes, [id]: { ...note, open: false } } };
    });
    setFocusedId((f) => (f === id ? null : f));
  }, [mutate]);

  const focusNote = useCallback((id: string) => {
    mutate((prev) => {
      const note = prev.notes[id];
      if (!note || note.z === prev.z) return prev; // gone or already on top
      const z = prev.z + 1;
      return { ...prev, z, notes: { ...prev.notes, [id]: { ...note, z } } };
    });
    setFocusedId(id);
  }, [mutate]);

  const setText = useCallback((id: string, text: string) => {
    mutate((prev) => {
      const note = prev.notes[id];
      if (!note) return prev;
      // auto-collapse the prompts on the empty→non-empty edge (State A→B), once;
      // a manual toggle afterward wins (unless the field is cleared back to empty)
      const collapse = !note.promptsCollapsed && note.text.trim() === "" && text.trim() !== "";
      return {
        ...prev,
        notes: { ...prev.notes, [id]: { ...note, text, promptsCollapsed: collapse || note.promptsCollapsed } },
      };
    });
  }, [mutate]);

  const togglePrompts = useCallback((id: string) => {
    mutate((prev) => {
      const note = prev.notes[id];
      if (!note) return prev;
      return { ...prev, notes: { ...prev.notes, [id]: { ...note, promptsCollapsed: !note.promptsCollapsed } } };
    });
  }, [mutate]);

  const moveNote = useCallback((id: string, x: number, y: number) => {
    mutate((prev) => {
      const note = prev.notes[id];
      if (!note || (note.x === x && note.y === y)) return prev;
      return { ...prev, notes: { ...prev.notes, [id]: { ...note, x, y } } };
    });
  }, [mutate]);

  const downloadAll = useCallback((m: ChartModel) => {
    const cur = docRef.current;
    if (TENETS.every((t) => !cur.notes[t.id]?.open)) return;
    const name = m.meta.name?.trim() || "Birth Chart";
    const sub = [m.chart.birth.dateLabel, m.chart.birth.placeLabel].filter(Boolean).join(" · ");
    const body = TENETS.flatMap((t, i) => {
      const note = cur.notes[t.id];
      if (!note?.open) return [];
      const num = String(i + 1).padStart(2, "0");
      return [`## ${num} ${t.title}`, "", note.text.trim(), ""];
    });
    const md = [`# Reading Notes — ${name}`, ...(sub ? [sub] : []), "", ...body].join("\n");
    try {
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reading-notes-${slugify(name)}.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("[reading-notes] download failed:", err);
    }
  }, []);

  /** ON-DEVICE FIRST (Chrome 139+): when the local SODA language pack is
      installed, recognition runs on the machine — no Google cloud round-trip,
      so no `network` failures (Brave strips the cloud service's API keys; even
      official Chrome's cloud path has outages). When the pack is merely
      downloadable, kick its install off in the background (this attempt still
      uses the cloud) so the NEXT dictation is local. Older browsers skip
      straight to the cloud path, exactly as before. */
  const startingRef = useRef(false); // guards the async availability probe

  const startRecognition = useCallback((Ctor: SpeechRecognitionCtor, local: boolean, id: string) => {
    const rec = new Ctor();
    rec.lang = SPEECH_LANG;
    rec.continuous = true;
    rec.interimResults = false; // final results only — keeps the text stable
    if (local) rec.processLocally = true; // the validated on-device path
    rec.onresult = (e) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) text += r[0].transcript;
      }
      text = text.trim();
      if (!text) return;
      const target = recordingIdRef.current; // the note being dictated into
      if (!target) return;
      mutate((prev) => {
        const note = prev.notes[target];
        if (!note) return prev;
        const joined = note.text ? `${note.text.replace(/\s+$/, "")} ${text}` : text;
        return { ...prev, notes: { ...prev.notes, [target]: { ...note, text: joined } } };
      });
    };
    rec.onend = () => {
      recRef.current = null;
      setRecordingId(null);
      recordingIdRef.current = null;
      // honor a queued switch-to-another-note (stop is async)
      const pending = pendingStartRef.current;
      pendingStartRef.current = null;
      if (pending && mountedRef.current) beginRef.current(pending);
    };
    rec.onerror = (e) => {
      // surfaced in the mic row (onend follows and clears the recording state)
      console.warn("[reading-notes] dictation error:", e.error);
      flagMicError(e.error);
    };
    try {
      rec.start();
      recRef.current = rec;
      setRecordingId(id);
      recordingIdRef.current = id;
      setMicError(null);
    } catch (err) {
      console.warn("[reading-notes] dictation failed to start:", err);
      flagMicError("service-not-allowed");
    }
  }, [flagMicError, mutate]);

  /** Probe the on-device pack then start recognition for `id`. */
  const beginRecognition = useCallback((id: string) => {
    if (startingRef.current) return; // probe in flight — ignore the double-tap
    const Ctor = speechCtor();
    if (!Ctor) return;
    startingRef.current = true;
    void (async () => {
      let local = false;
      try {
        if (Ctor.available) {
          const a = await Ctor.available({ langs: [SPEECH_LANG], processLocally: true });
          if (a === "available") local = true;
          // Brave excluded: its SODA install hangs upstream (brave-browser#55414),
          // so kicking it off would only spawn never-settling downloads per tap.
          else if (a === "downloadable" && Ctor.install && mountedRef.current && !isBrave()) {
            console.info("[reading-notes] downloading the on-device speech pack for next time");
            installKickedRef.current = true; // a network failure now gets the "downloading" message
            void Ctor.install({ langs: [SPEECH_LANG], processLocally: true })
              .catch(() => {})
              .finally(() => { installKickedRef.current = false; });
          }
        }
      } catch {
        /* probe failed → cloud path, as on older browsers */
      }
      try {
        if (mountedRef.current) startRecognition(Ctor, local, id);
      } finally {
        startingRef.current = false;
      }
    })();
  }, [startRecognition]);
  useEffect(() => { beginRef.current = beginRecognition; }, [beginRecognition]);

  const toggleRecording = useCallback((id: string) => {
    if (recRef.current) {
      // recording: same note → stop; different note → switch (start it on onend)
      if (recordingIdRef.current !== id) pendingStartRef.current = id;
      recRef.current.stop();
      return;
    }
    beginRecognition(id);
  }, [beginRecognition]);

  // on unmount: cancel any pending probe continuation, the micError auto-clear
  // timer, and stop listening if mid-dictation
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      pendingStartRef.current = null;
      window.clearTimeout(micErrTimer.current);
      recRef.current?.stop();
    };
  }, []);

  const openCount = TENETS.reduce((n, t) => n + (doc.notes[t.id]?.open ? 1 : 0), 0);

  return {
    doc, openCount, focusedId,
    openNote, closeNote, focusNote, setText, togglePrompts, moveNote, downloadAll,
    speechSupported: !!speechCtor(), recordingId, micError, toggleRecording,
  };
}
