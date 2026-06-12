"use client";

/* ============================================================
   ReadingNotes.tsx — the guided reading checklist: seven steps in reading
   order (Ascendant → Planets → Rahu/Ketu Axis → Houses → Vargas (optional) →
   Dashas → Synthesis) as an ACCORDION — only
   the active step is expanded (prompt + optional jump link + auto-growing
   notes field); the rest collapse to a number · title · checkbox row.
   Clicking a collapsed row expands it; checking a step collapses it and
   auto-expands the next unchecked step (the accordion resumes at the first
   unchecked step on load). A dots + "n of 7" progress marker tops the panel.

   Dictation always targets the EXPANDED step's notes. Steps with a study
   deck (Planets → Planetary Groupings, Rahu/Ketu Axis → Rahu & Ketu, Houses,
   Dashas — Vargas once its deck exists) carry a small card icon
   beside the title that opens the deck in the browsable flashcard popover —
   a refresher, owner-directed (no text links).

   Pure UI + storage (lib/chart/readingNotes.ts) — nothing astrological is
   computed; the Dashas step only POINTS to the Overlay Dashas toggle.

   State lives in `useReadingNotes`, called ONCE in ChartView and passed to
   both render sites (the sticky right rail on desktop, the slide-in drawer on
   mobile) — the same lifted-state pattern as the DashaRail selection, so the
   two instances can never diverge. Notes write through to localStorage on
   every change and re-anchor when the chart changes.

   ChartView is only ever rendered client-side (ChartRoute shows a loading
   shell until a model exists), so window/localStorage access at render time
   is safe — no hydration mismatch.
   ============================================================ */
import { useCallback, useEffect, useRef, useState } from "react";
import { Svg } from "@/components/Svg";
import { diamond } from "@/celestial/celestial";
import {
  READING_STEPS, EMPTY_STEP, notesKey, loadNotes, saveNotes, firstUnchecked,
  type ReadingNotesState,
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

/** Auto-grow: keep the textarea exactly as tall as its content. */
function autoGrow(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight + 2}px`;
}

export interface ReadingNotesApi {
  state: ReadingNotesState;
  /** The EXPANDED step — also the dictation target. "" = all collapsed (everything done). */
  activeStep: string;
  setActiveStep: (id: string) => void;
  setDone: (id: string, done: boolean) => void;
  setText: (id: string, notes: string) => void;
  doneCount: number;
  speechSupported: boolean;
  recording: boolean;
  /** Why the last dictation attempt failed (auto-clears) — silent mics are
      indistinguishable from broken ones, so failures must be visible. */
  micError: string | null;
  toggleRecording: () => void;
}

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

/** The shared state + dictation engine — call once, render twice. */
export function useReadingNotes(model: ChartModel): ReadingNotesApi {
  const key = notesKey(model);
  const [state, setState] = useState<ReadingNotesState>(() => loadNotes(key));
  const [activeStep, setActiveStep] = useState<string>(() => firstUnchecked(loadNotes(key)) ?? "");
  // a different chart re-anchors the notes (derive-state-from-props, no effect)
  const [anchorKey, setAnchorKey] = useState(key);
  if (anchorKey !== key) {
    setAnchorKey(key);
    const fresh = loadNotes(key);
    setState(fresh);
    setActiveStep(firstUnchecked(fresh) ?? "");
  }
  const [recording, setRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const micErrTimer = useRef<number | undefined>(undefined);
  const mountedRef = useRef(true); // guards the async probe's continuation
  const flagMicError = useCallback((code?: string) => {
    let msg = MIC_ERRORS[code ?? ""] ?? null; // "no-speech"/"aborted" are normal — stay quiet
    if (code === "network" && isBrave()) msg = BRAVE_NETWORK_ERROR;
    if (!msg) return;
    setMicError(msg);
    window.clearTimeout(micErrTimer.current);
    micErrTimer.current = window.setTimeout(() => setMicError(null), 6000);
  }, []);

  // refs keep the long-lived recognition callbacks (and the advance logic)
  // reading fresh values — synced via effects, which run long before any
  // user event or speech result can fire
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const keyRef = useRef(key);
  useEffect(() => { keyRef.current = key; }, [key]);
  const activeRef = useRef(activeStep);
  useEffect(() => { activeRef.current = activeStep; }, [activeStep]);
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const setDone = useCallback((id: string, done: boolean) => {
    const next: ReadingNotesState = {
      ...stateRef.current,
      [id]: { ...(stateRef.current[id] ?? EMPTY_STEP), done },
    };
    setState(next);
    saveNotes(keyRef.current, next);
    if (done) {
      // checking collapses the step and auto-expands the NEXT unchecked one
      // (searching onward from it, wrapping; "" when everything is done)
      const order = READING_STEPS.map((s) => s.id);
      const i = order.indexOf(id);
      const onward = [...order.slice(i + 1), ...order.slice(0, i)];
      setActiveStep(onward.find((sid) => !next[sid]?.done) ?? "");
    }
  }, []);

  const setText = useCallback((id: string, notes: string) => {
    setState((prev) => {
      const next = { ...prev, [id]: { ...(prev[id] ?? EMPTY_STEP), notes } };
      saveNotes(keyRef.current, next); // write-through: dictation persists like typing
      return next;
    });
  }, []);

  /** ON-DEVICE FIRST (Chrome 139+): when the local SODA language pack is
      installed, recognition runs on the machine — no Google cloud round-trip,
      so no `network` failures (Brave strips the cloud service's API keys; even
      official Chrome's cloud path has outages). When the pack is merely
      downloadable, kick its install off in the background (this attempt still
      uses the cloud) so the NEXT dictation is local. Older browsers skip
      straight to the cloud path, exactly as before. */
  const startingRef = useRef(false); // guards the async availability probe

  const startRecognition = useCallback((Ctor: SpeechRecognitionCtor, local: boolean) => {
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
      const id = activeRef.current; // the expanded step
      if (!id) return;
      setState((prev) => {
        const cur = prev[id] ?? EMPTY_STEP;
        const joined = cur.notes ? `${cur.notes.replace(/\s+$/, "")} ${text}` : text;
        const next = { ...prev, [id]: { ...cur, notes: joined } };
        saveNotes(keyRef.current, next);
        return next;
      });
    };
    rec.onend = () => {
      recRef.current = null;
      setRecording(false);
    };
    rec.onerror = (e) => {
      // surfaced in the mic row (onend follows and clears the recording state)
      console.warn("[reading-notes] dictation error:", e.error);
      flagMicError(e.error);
    };
    try {
      rec.start();
      recRef.current = rec;
      setRecording(true);
      setMicError(null);
    } catch (err) {
      console.warn("[reading-notes] dictation failed to start:", err);
      flagMicError("service-not-allowed");
    }
  }, [flagMicError]);

  const toggleRecording = useCallback(() => {
    if (recRef.current) {
      recRef.current.stop(); // onend clears the state
      return;
    }
    if (startingRef.current) return; // probe in flight — ignore the double-tap
    const Ctor = speechCtor();
    if (!Ctor || !activeRef.current) return; // no expanded step → nothing to dictate into
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
            void Ctor.install({ langs: [SPEECH_LANG], processLocally: true }).catch(() => {});
          }
        }
      } catch {
        /* probe failed → cloud path, as on older browsers */
      }
      try {
        // the page may have unmounted while the probe awaited (recRef is still
        // null then, so the unmount cleanup had nothing to stop) — don't start
        // a mic on a dead page or fire state setters after unmount
        if (mountedRef.current) startRecognition(Ctor, local);
      } finally {
        startingRef.current = false;
      }
    })();
  }, [startRecognition]);

  // on unmount: cancel any pending probe continuation, the micError auto-clear
  // timer, and stop listening if mid-dictation
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      window.clearTimeout(micErrTimer.current);
      recRef.current?.stop();
    };
  }, []);

  const doneCount = READING_STEPS.reduce((n, s) => n + (state[s.id]?.done ? 1 : 0), 0);

  return {
    state, activeStep, setActiveStep, setDone, setText, doneCount,
    speechSupported: !!speechCtor(), recording, micError, toggleRecording,
  };
}

/** The checklist itself — rendered in the desktop rail AND the mobile drawer. */
export function ReadingNotes({
  api,
  heading = true,
  onOpenDeck,
}: {
  api: ReadingNotesApi;
  heading?: boolean;
  /** Opens a whole flashcard deck in the browsable popover (the card icons). */
  onOpenDeck?: (deckId: string) => void;
}) {
  const activeTitle = READING_STEPS.find((s) => s.id === api.activeStep)?.title;
  return (
    <div className="rn">
      {heading && <span className="dr-eyebrow">Reading Notes</span>}
      <div className="rn-progress">
        <span className="rn-dots" aria-hidden="true">
          {READING_STEPS.map((s) => (
            <i key={s.id} data-on={api.state[s.id]?.done || undefined} />
          ))}
        </span>
        <span className="rn-count">{api.doneCount} of {READING_STEPS.length}</span>
      </div>
      <ol className="rn-steps">
        {READING_STEPS.map((s, i) => {
          const entry = api.state[s.id] ?? EMPTY_STEP;
          const open = api.activeStep === s.id;
          return (
            <li className="rn-step" key={s.id} data-open={open || undefined} data-done={entry.done || undefined}>
              <div className="rn-step-head">
                <input
                  type="checkbox"
                  className="dia-check"
                  checked={entry.done}
                  aria-label={`${s.title} done`}
                  onChange={(e) => api.setDone(s.id, e.target.checked)}
                />
                <button
                  type="button"
                  className="rn-step-btn"
                  aria-expanded={open}
                  onClick={() => api.setActiveStep(s.id)}
                >
                  <span className="rn-step-no">{i + 1}</span>
                  <span className="rn-step-title">{s.title}</span>
                </button>
                {s.deck && onOpenDeck && (
                  // the card icon beside the title — a deck refresher (owner-directed)
                  <button
                    type="button"
                    className="rn-deck-btn"
                    title={s.deck.label}
                    aria-label={s.deck.label}
                    onClick={() => onOpenDeck(s.deck!.deckId)}
                  >
                    <Svg html={diamond(15, { glow: true })} />
                  </button>
                )}
              </div>
              {open && (
                <div className="rn-step-body">
                  <p className="rn-prompt">{s.prompt}</p>
                  <textarea
                    className="rn-notes"
                    rows={4}
                    ref={autoGrow}
                    value={entry.notes}
                    placeholder="Your notes…"
                    aria-label={`${s.title} notes`}
                    onChange={(e) => {
                      api.setText(s.id, e.target.value);
                      autoGrow(e.currentTarget);
                    }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <div className="rn-mic-row">
        <button
          type="button"
          className="rn-mic"
          data-recording={api.recording || undefined}
          disabled={!api.speechSupported || !api.activeStep}
          aria-pressed={api.recording}
          title={
            !api.speechSupported
              ? "Voice dictation isn't supported in this browser"
              : !api.activeStep
                ? "Open a step to dictate into it"
                : api.recording
                  ? "Stop dictation"
                  : `Dictate into the ${activeTitle} notes`
          }
          onClick={api.toggleRecording}
        >
          <span className="rn-mic-dot" aria-hidden="true" />
          {api.recording ? "Listening" : "Dictate"}
        </button>
        {/* (the "→ Step" target label was removed — redundant with the accordion,
            owner-directed; the slot now surfaces dictation failures instead) */}
        {api.micError && <span className="rn-mic-err" aria-live="polite">{api.micError}</span>}
      </div>
    </div>
  );
}
