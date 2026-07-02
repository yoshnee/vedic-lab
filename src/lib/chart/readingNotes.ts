/* ============================================================
   readingNotes.ts — the "reading notes" workspace's data + storage.
   Seven TENETS in classical reading order, each a draggable sticky note with
   its own guiding questions (owner's wording, verbatim — don't rephrase, no
   em-dashes) and a free-writing surface. The launcher dock spawns the notes;
   notes float on a fixed workspace, many open at once.

   Per-note state (open / position / stacking / text / prompts-collapsed)
   persists in LOCALSTORAGE so the workspace survives refresh and browser
   restarts, keyed per natal chart by the resolved birth UT instant +
   coordinates — the same birth always recomputes to the same key. The key
   scheme is UNCHANGED from the old checklist, so existing notes carry over.

   Pure data + storage; nothing astrological is computed here. The optional
   Storage-like param exists so tests can inject a Map-backed fake (vitest
   runs in node, where localStorage doesn't exist).
   ============================================================ */
import type { ChartModel } from "./types";

export interface Tenet {
  id: string;
  title: string;
  /** Guiding questions shown above the writing surface (owner-canonical copy,
      no em-dashes). Empty notes lead with these; once writing starts they tuck
      away behind the toggle. */
  questions: string[];
  /** The flashcard deck this tenet refreshes. Rendered as a clickable diamond
      icon beside the title in the launcher dock — opens that whole deck in the
      browsable popover via openCard("deck", id). Owner-mapped per tenet. */
  deck: { id: string; label: string };
}

/** The reading order (owner-directed: Ascendant → Planets → Rahu/Ketu Axis →
    Houses → Vargas → Dashas → Synthesis). The "lagna"/"varga" ids are kept
    from the old checklist so saved localStorage notes survive the rename. */
export const TENETS: Tenet[] = [
  {
    id: "lagna",
    title: "Ascendant",
    questions: [
      "What sign rises, and what does that set as the chart's basic lens?",
      "Find the lagna lord. What's its dignity, and which house does it sit in?",
      "For this ascendant, which planets are functional benefics and which are malefics?",
      "What stands out as the foundation of the chart?",
    ],
    deck: { id: "ascendants", label: "Open the Ascendants deck" },
  },
  {
    id: "planets",
    title: "Planets",
    questions: [
      "Which planets sit in the 1st house, and how do they color the personality?",
      "Which planets aspect the lagna?",
      "Locate the Moon, its sign and house. Read it as a second lagna: what's felt vs. what's promised?",
    ],
    deck: { id: "planetary-groupings", label: "Open the Planetary Groupings deck" },
  },
  {
    id: "nodes",
    title: "Rahu/Ketu Axis",
    questions: [
      "Which house axis do the nodes fall on? What two life areas are pulled against each other?",
      "Assess each node's dispositor, its dignity and placement.",
      "Is any planet conjunct a node? What gets amplified or distorted?",
    ],
    deck: { id: "rahu-ketu", label: "Open the Rahu & Ketu deck" },
  },
  {
    id: "houses",
    title: "Houses",
    questions: [
      "Angles (1, 4, 7, 10): who occupies them? Benefic or malefic, and in what dignity?",
      "Trines (1, 5, 9): the fortune lines, who sits here and how strong?",
      "Dusthanas (6, 8, 12): what's afflicted? Any exchange between these lords worth flagging?",
      "Where do the angle and trine lords go, do any of them link up?",
    ],
    deck: { id: "houses", label: "Open the Houses deck" },
  },
  {
    id: "varga",
    title: "Vargas",
    questions: [
      "D9 Navamsa: does the lagna lord hold its dignity here? Vargottama anywhere? This confirms or weakens the D1 promise.",
      "D10 Dasamsa: are the career-driving planets strong?",
      "D2 Hora: where do the wealth significators land?",
      "D30 Trimshamsa: which planets weaken here, where's the vulnerability?",
      "Overall: which planets hold strength across charts, and which collapse?",
    ],
    deck: { id: "vargas", label: "Open the Vargas deck" },
  },
  {
    id: "dashas",
    title: "Dashas",
    questions: [
      "Current mahadasha lord: its natal house, dignity, and the houses it owns, this is the backdrop theme.",
      "Antardasha lord: how many houses from the mahadasha lord, and friend or enemy to it? This shapes the foreground.",
      "Where do the mahadasha and antardasha planets sit in D9 and D10?",
      "Which houses light up in the running period?",
    ],
    deck: { id: "dashas", label: "Open the Vimshottari Dasha deck" },
  },
  {
    id: "synthesis",
    title: "Synthesis",
    // a free workspace by design — one soft line, not an interrogation
    questions: ["Pull the threads together. What's the chart's central story?"],
    deck: { id: "karakas", label: "Open the Karakas deck" },
  },
];

/** One sticky note's persisted state. Positions are viewport pixels (the
    workspace is a fixed full-viewport layer); StickyNote re-clamps on mount,
    so a note saved off-screen always comes back into view. */
export interface NoteState {
  open: boolean;
  x: number;
  y: number;
  z: number;
  text: string;
  promptsCollapsed: boolean;
}
export type ReadingNotesState = Record<string, NoteState>;

/** Versioned storage envelope. `z` is the monotonic top-of-stack counter,
    persisted so stacking order survives reload. */
export interface NotesDoc {
  v: 2;
  z: number;
  notes: ReadingNotesState;
}

/* Deterministic cascade for a never-placed note's home position, so reopened
   notes don't stack pixel-perfectly. Kept clear of the left daśā rail / right
   launcher; StickyNote clamps to the live viewport on mount. */
const BASE_X = 372;
const BASE_Y = 116;
const OFFSET = 30;

export function homePosition(i: number): { x: number; y: number } {
  return { x: BASE_X + i * OFFSET, y: BASE_Y + i * OFFSET };
}

type StorageLike = Pick<Storage, "getItem" | "setItem">;

const defaultStorage = (): StorageLike | undefined =>
  typeof window !== "undefined" ? window.localStorage : undefined;

/** Stable per-natal-chart key: birth UT instant + coordinates. UNCHANGED — the
    same birth always re-anchors to the same key (this is what migrates old
    notes). */
export function notesKey(model: ChartModel): string {
  return `vedic:readingNotes:${model.meta.computedUtcISO}|${model.chart.birth.lat}|${model.chart.birth.lon}`;
}

function defaultNote(i: number): NoteState {
  const { x, y } = homePosition(i);
  return { open: false, x, y, z: 0, text: "", promptsCollapsed: false };
}

/** A fresh all-closed workspace covering every tenet. */
export function emptyDoc(): NotesDoc {
  const notes: ReadingNotesState = {};
  TENETS.forEach((t, i) => {
    notes[t.id] = defaultNote(i);
  });
  return { v: 2, z: 0, notes };
}

const isFiniteNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** Normalize a v2 envelope: coerce each known tenet's fields, drop unknown ids,
    recompute the top z-counter. */
function normalizeV2(obj: Record<string, unknown>): NotesDoc {
  const stored = obj.notes as Record<string, unknown>;
  const notes: ReadingNotesState = {};
  let maxZ = 0;
  TENETS.forEach((t, i) => {
    const base = defaultNote(i);
    const e = stored[t.id];
    if (e && typeof e === "object") {
      const o = e as Record<string, unknown>;
      const n: NoteState = {
        open: o.open === true,
        x: isFiniteNum(o.x) ? o.x : base.x,
        y: isFiniteNum(o.y) ? o.y : base.y,
        z: isFiniteNum(o.z) ? o.z : 0,
        text: typeof o.text === "string" ? o.text : "",
        promptsCollapsed: o.promptsCollapsed === true,
      };
      notes[t.id] = n;
      if (n.z > maxZ) maxZ = n.z;
    } else {
      notes[t.id] = base;
    }
  });
  const docZ = isFiniteNum(obj.z) ? obj.z : 0;
  return { v: 2, z: Math.max(docZ, maxZ), notes };
}

/** Migrate the OLD bare `Record<id, {done, notes}>` checklist shape: carry the
    written `notes` text into `text`, drop `done`, and AUTO-OPEN any note that
    has text (so prior work is visible, not hidden behind a blank board); empty
    notes stay closed. */
function migrateLegacy(obj: Record<string, unknown>): NotesDoc {
  const notes: ReadingNotesState = {};
  let z = 0;
  TENETS.forEach((t, i) => {
    const base = defaultNote(i);
    const e = obj[t.id];
    let text = "";
    if (e && typeof e === "object") {
      const raw = (e as Record<string, unknown>).notes;
      if (typeof raw === "string") text = raw;
    }
    if (text.trim()) {
      notes[t.id] = { ...base, open: true, text, z: ++z, promptsCollapsed: true };
    } else {
      notes[t.id] = base;
    }
  });
  return { v: 2, z, notes };
}

/** Restore from storage — missing key, corrupt JSON, or unavailable storage
    (private mode) all normalize to a fresh workspace; the old checklist shape
    is migrated; unknown tenet ids are dropped. */
export function loadDoc(key: string, storage?: StorageLike): NotesDoc {
  try {
    const raw = (storage ?? defaultStorage())?.getItem(key);
    if (!raw) return emptyDoc();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyDoc();
    const obj = parsed as Record<string, unknown>;
    if (obj.v === 2 && obj.notes && typeof obj.notes === "object") return normalizeV2(obj);
    return migrateLegacy(obj); // old bare {done,notes} record
  } catch {
    return emptyDoc();
  }
}

export function saveDoc(key: string, doc: NotesDoc, storage?: StorageLike): void {
  try {
    (storage ?? defaultStorage())?.setItem(key, JSON.stringify(doc));
  } catch {
    /* private mode / quota — typing still works, it just won't persist */
  }
}

/** How many notes are currently open (the launcher badge / Download-all count). */
export function openNotesCount(doc: NotesDoc): number {
  return TENETS.reduce((n, t) => n + (doc.notes[t.id]?.open ? 1 : 0), 0);
}
