/* ============================================================
   readingNotes.ts — the guided "reading notes" rail's data + storage.
   Seven steps in classical reading order, each a checkbox + teacherly prompt
   (owner's wording, verbatim — don't rephrase) + a notes field. Notes persist
   in LOCALSTORAGE (they must survive refresh and browser restarts, unlike the
   sessionStorage birth details), keyed per natal chart by the resolved birth
   UT instant + coordinates — the same birth always recomputes to the same key.
   Pure data + storage; nothing astrological is computed here. The optional
   Storage-like param exists so tests can inject a Map-backed fake (vitest
   runs in node, where localStorage doesn't exist).
   ============================================================ */
import type { ChartModel } from "./types";

export interface ReadingStep {
  id: string;
  title: string;
  prompt: string;
  /** Optional deck refresher: rendered as a small card icon beside the step
      title (owner-directed — no "Open the … deck" text links), opening that
      deck in the browsable popover. Varga gets one when its deck exists. */
  deck?: { deckId: string; label: string };
}

/** The reading order (owner-directed 2026-06: Ascendant → Planets →
    Rahu/Ketu Axis → Houses → Vargas (optional) → Dashas → Synthesis).
    Prompts are the owner's wording — canonical, don't rephrase — EXCEPT the
    Rahu/Ketu prompt, still a draft awaiting the owner's copy. The
    "lagna"/"varga" ids are kept for the retitled steps so saved
    localStorage notes survive the rename. */
export const READING_STEPS: ReadingStep[] = [
  {
    id: "lagna",
    title: "Ascendant",
    prompt: "Inspect the Chart Ruler panel.",
  },
  {
    id: "planets",
    title: "Planets",
    prompt: "Go through the planet panels in order. For each, assess its dignity.",
    deck: { deckId: "planetary-groupings", label: "Open the Planetary Groupings deck" },
  },
  {
    id: "nodes",
    title: "Rahu/Ketu Axis",
    prompt:
      "Find the nodal axis. Note the houses Rahu and Ketu occupy, the signs and their lords, and any planets joined with them. Read both ends together as one axis.",
    deck: { deckId: "rahu-ketu", label: "Open the Rahu & Ketu deck" },
  },
  {
    id: "houses",
    title: "Houses",
    prompt:
      "Walk the houses one by one. For each, note the occupants, the house lord, and their dignity.",
    deck: { deckId: "houses", label: "Open the Houses deck" },
  },
  {
    id: "varga",
    title: "Vargas (optional)",
    prompt:
      "Peek at the relevant varga when you want more depth on a specific area. D2 for finances, D9 for marriage and dharma, D10 for career.",
    // no deck icon yet — the varga deck doesn't exist
  },
  {
    id: "dashas",
    title: "Dashas",
    prompt:
      "Toggle the mahadasha antardasha overlay to see which houses are activated in the running period. These are the areas of life likely at the forefront now.",
    deck: { deckId: "dashas", label: "Open the Vimshottari Dasha deck" },
  },
  {
    id: "synthesis",
    title: "Synthesis",
    prompt:
      "Bring it all together and note the confluences, the themes that more than one factor points to.",
    // no deck — synthesis is the student's own work
  },
];

/** The id of the first unchecked step (the accordion's resume point), or null
    when every step is done. */
export function firstUnchecked(state: ReadingNotesState): string | null {
  return READING_STEPS.find((s) => !state[s.id]?.done)?.id ?? null;
}

export interface StepNotes {
  done: boolean;
  notes: string;
}
export type ReadingNotesState = Record<string, StepNotes>;

export const EMPTY_STEP: StepNotes = { done: false, notes: "" };

type StorageLike = Pick<Storage, "getItem" | "setItem">;

const defaultStorage = (): StorageLike | undefined =>
  typeof window !== "undefined" ? window.localStorage : undefined;

/** Stable per-natal-chart key: birth UT instant + coordinates. */
export function notesKey(model: ChartModel): string {
  return `vedic:readingNotes:${model.meta.computedUtcISO}|${model.chart.birth.lat}|${model.chart.birth.lon}`;
}

/** A fresh all-unchecked, all-empty state covering every step. */
export function emptyNotes(): ReadingNotesState {
  return Object.fromEntries(READING_STEPS.map((s) => [s.id, { ...EMPTY_STEP }]));
}

/** Restore from storage — missing keys, corrupted JSON, or unavailable storage
    (private mode) all normalize to a fresh state; unknown step ids are dropped. */
export function loadNotes(key: string, storage?: StorageLike): ReadingNotesState {
  const out = emptyNotes();
  try {
    const raw = (storage ?? defaultStorage())?.getItem(key);
    if (!raw) return out;
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      for (const step of READING_STEPS) {
        const entry = (parsed as Record<string, unknown>)[step.id];
        if (entry && typeof entry === "object") {
          const { done, notes } = entry as { done?: unknown; notes?: unknown };
          out[step.id] = { done: done === true, notes: typeof notes === "string" ? notes : "" };
        }
      }
    }
  } catch {
    /* corrupted JSON / storage unavailable → fresh notes */
  }
  return out;
}

export function saveNotes(key: string, state: ReadingNotesState, storage?: StorageLike): void {
  try {
    (storage ?? defaultStorage())?.setItem(key, JSON.stringify(state));
  } catch {
    /* private mode / quota — typing still works, it just won't persist */
  }
}
