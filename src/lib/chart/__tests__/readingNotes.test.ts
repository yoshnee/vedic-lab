/* readingNotes.test.ts — the reading-notes workspace's pure data + storage:
   the seven canonical tenets + their guiding questions, per-chart key
   derivation, and load/save round-trips with normalization + the legacy
   migration from the old checklist shape (vitest runs in node, so storage is a
   Map-backed fake injected through the StorageLike param). */
import { describe, it, expect } from "vitest";
import {
  TENETS, notesKey, emptyDoc, loadDoc, saveDoc, openNotesCount, openNoteViews, isTenetId,
  writtenNotesCount, writtenNoteViews, customNotes, customTitle,
  type NotesDoc, type NoteState,
} from "../readingNotes";
import type { ChartModel } from "../types";

/** A custom note state (freestanding) for the tests below. */
function custom(partial: Partial<NoteState> & { title: string }): NoteState {
  return { open: false, x: 400, y: 200, z: 1, text: "", promptsCollapsed: false, custom: true, ...partial };
}

function fakeModel(computedUtcISO: string, lat: number, lon: number): ChartModel {
  return {
    meta: { computedUtcISO },
    chart: { birth: { lat, lon } },
  } as unknown as ChartModel;
}

function fakeStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    map,
  };
}

describe("TENETS", () => {
  it("is the seven tenets in reading order (ids preserved from the old checklist)", () => {
    expect(TENETS.map((t) => t.id)).toEqual([
      "lagna", "planets", "nodes", "houses", "varga", "dashas", "synthesis",
    ]);
    expect(TENETS.map((t) => t.title)).toEqual([
      "Ascendant", "Planets", "Rahu/Ketu Axis", "Houses", "Vargas", "Dashas", "Synthesis",
    ]);
  });

  it("carries the owner's guiding questions, none with em-dashes", () => {
    const byId = Object.fromEntries(TENETS.map((t) => [t.id, t.questions]));
    expect(byId.lagna[0]).toBe("What sign rises, and what does that set as the chart's basic lens?");
    expect(byId.lagna).toHaveLength(4);
    expect(byId.planets).toHaveLength(3);
    expect(byId.nodes).toHaveLength(3);
    expect(byId.houses).toHaveLength(4);
    expect(byId.varga).toHaveLength(5);
    expect(byId.dashas).toHaveLength(4);
    // Synthesis is a free workspace — one soft line, not an interrogation
    expect(byId.synthesis).toEqual(["Pull the threads together. What's the chart's central story?"]);
    // owner rule: no em-dashes anywhere in user-facing copy
    for (const t of TENETS) {
      expect(t.title, t.title).not.toMatch(/—/);
      for (const q of t.questions) expect(q, q).not.toMatch(/—/);
    }
  });
});

describe("notesKey", () => {
  it("is stable per natal chart and distinct across charts (scheme unchanged)", () => {
    const a = fakeModel("1991-05-02T03:30:00.000Z", 21.6333, 69.6);
    expect(notesKey(a)).toBe("vedic:readingNotes:1991-05-02T03:30:00.000Z|21.6333|69.6");
    expect(notesKey(a)).toBe(notesKey(fakeModel("1991-05-02T03:30:00.000Z", 21.6333, 69.6))); // same birth → same key
    expect(notesKey(a)).not.toBe(notesKey(fakeModel("1991-05-02T03:31:00.000Z", 21.6333, 69.6))); // different time
    expect(notesKey(a)).not.toBe(notesKey(fakeModel("1991-05-02T03:30:00.000Z", 3.139, 101.6869))); // different place
  });
});

describe("emptyDoc", () => {
  it("is a v2 envelope, all tenets closed and empty", () => {
    const doc = emptyDoc();
    expect(doc.v).toBe(2);
    expect(doc.z).toBe(0);
    expect(Object.keys(doc.notes).sort()).toEqual([...TENETS.map((t) => t.id)].sort());
    for (const t of TENETS) {
      expect(doc.notes[t.id].open).toBe(false);
      expect(doc.notes[t.id].text).toBe("");
    }
    expect(openNotesCount(doc)).toBe(0);
  });
});

describe("loadDoc / saveDoc", () => {
  it("round-trips the per-note state", () => {
    const store = fakeStorage();
    const doc: NotesDoc = emptyDoc();
    doc.z = 3;
    doc.notes.lagna = { open: true, x: 420, y: 160, z: 2, text: "Scorpio rising, Mars in the 3rd", promptsCollapsed: true };
    doc.notes.synthesis = { open: true, x: 500, y: 240, z: 3, text: "wealth themes repeat", promptsCollapsed: false };
    saveDoc("k", doc, store);
    expect(loadDoc("k", store)).toEqual(doc);
    expect(openNotesCount(loadDoc("k", store))).toBe(2);
  });

  it("a missing key yields a fresh empty workspace covering every tenet", () => {
    expect(loadDoc("nope", fakeStorage())).toEqual(emptyDoc());
  });

  it("corrupt JSON / non-object normalizes to a fresh workspace", () => {
    const store = fakeStorage();
    store.setItem("bad", "{not json");
    expect(loadDoc("bad", store)).toEqual(emptyDoc());
    store.setItem("nullish", "null");
    expect(loadDoc("nullish", store)).toEqual(emptyDoc());
  });

  it("a v2 envelope with malformed entries coerces safely and drops unknown ids", () => {
    const store = fakeStorage();
    store.setItem("partial", JSON.stringify({
      v: 2, z: 5,
      notes: {
        lagna: { open: "yes", x: "nope", y: 40, z: 4, text: 42, promptsCollapsed: 1 },
        junk: { open: true },
      },
    }));
    const got = loadDoc("partial", store);
    // non-boolean/number/string coerced to safe defaults (home x falls back)
    expect(got.notes.lagna.open).toBe(false);
    expect(got.notes.lagna.text).toBe("");
    expect(got.notes.lagna.promptsCollapsed).toBe(false);
    expect(got.notes.lagna.y).toBe(40);
    expect(got.notes).not.toHaveProperty("junk"); // unknown ids dropped
    expect(Object.keys(got.notes).sort()).toEqual([...TENETS.map((t) => t.id)].sort());
  });

  it("migrates the OLD {done,notes} checklist: carries text, drops done, auto-opens written notes", () => {
    const store = fakeStorage();
    store.setItem("legacy", JSON.stringify({
      lagna: { done: true, notes: "Scorpio rising" },
      planets: { done: false, notes: "" },
      synthesis: { done: true, notes: "wealth themes" },
      junk: { done: true, notes: "ignored" },
    }));
    const got = loadDoc("legacy", store);
    expect(got.v).toBe(2);
    // written notes carry over AND auto-open so prior work is visible
    expect(got.notes.lagna.open).toBe(true);
    expect(got.notes.lagna.text).toBe("Scorpio rising");
    expect(got.notes.synthesis.open).toBe(true);
    expect(got.notes.synthesis.text).toBe("wealth themes");
    // empty old notes stay closed
    expect(got.notes.planets.open).toBe(false);
    expect(got.notes.planets.text).toBe("");
    // `done` is gone from the new shape; unknown ids dropped
    expect(got.notes.lagna).not.toHaveProperty("done");
    expect(got.notes).not.toHaveProperty("junk");
    expect(openNotesCount(got)).toBe(2);
  });

  it("storage failures are swallowed (private mode posture)", () => {
    const throwing = {
      getItem: () => { throw new Error("denied"); },
      setItem: () => { throw new Error("denied"); },
    };
    expect(loadDoc("k", throwing)).toEqual(emptyDoc());
    expect(() => saveDoc("k", emptyDoc(), throwing)).not.toThrow();
  });
});

describe("freestanding custom notes", () => {
  it("preserves custom-flagged notes across a round-trip (and keeps customSeq)", () => {
    const store = fakeStorage();
    const doc: NotesDoc = emptyDoc();
    doc.z = 4;
    doc.customSeq = 2;
    doc.notes["custom-1"] = { open: true, x: 400, y: 200, z: 3, text: "a loose thought", promptsCollapsed: false, custom: true, title: "Note 1" };
    doc.notes["custom-2"] = { open: true, x: 430, y: 230, z: 4, text: "", promptsCollapsed: false, custom: true, title: "Note 2" };
    saveDoc("k", doc, store);
    expect(loadDoc("k", store)).toEqual(doc);
    expect(openNotesCount(loadDoc("k", store))).toBe(2);
  });

  it("keeps custom-flagged notes but still drops genuinely-unknown ids", () => {
    const store = fakeStorage();
    store.setItem("mixed", JSON.stringify({
      v: 2, z: 3, customSeq: 1,
      notes: {
        "custom-1": { open: true, x: 400, y: 200, z: 3, text: "kept", custom: true, title: "Note 1" },
        junk: { open: true, x: 10, y: 10, z: 2, text: "no custom flag" },
      },
    }));
    const got = loadDoc("mixed", store);
    expect(got.notes).toHaveProperty("custom-1");
    expect(got.notes["custom-1"].text).toBe("kept");
    expect(got.notes["custom-1"].custom).toBe(true);
    expect(got.notes).not.toHaveProperty("junk"); // no custom flag → dropped
    expect(got.customSeq).toBe(1);
  });

  it("a custom note missing a title stores raw empty; the display falls back to Note N", () => {
    const store = fakeStorage();
    store.setItem("untitled", JSON.stringify({
      v: 2, z: 1, customSeq: 1,
      notes: { "custom-1": { open: true, x: 400, y: 200, z: 1, text: "", custom: true } },
    }));
    const doc = loadDoc("untitled", store);
    expect(doc.notes["custom-1"].title).toBe("");            // raw title preserved (empty)
    expect(customNotes(doc)[0].title).toBe("Note 1");        // numbered default at the display layer
  });

  it("isTenetId distinguishes tenets from custom ids", () => {
    expect(isTenetId("lagna")).toBe(true);
    expect(isTenetId("synthesis")).toBe(true);
    expect(isTenetId("custom-1")).toBe(false);
    expect(isTenetId("junk")).toBe(false);
  });

  it("customTitle uses the user's title, else the numbered default from the id", () => {
    expect(customTitle("custom-8", "Marriage themes")).toBe("Marriage themes");
    expect(customTitle("custom-8", "  spaced  ")).toBe("spaced"); // trimmed
    expect(customTitle("custom-8", "")).toBe("Note 8");           // emptied → numbered default
    expect(customTitle("custom-8", "   ")).toBe("Note 8");        // whitespace-only → numbered default
    expect(customTitle("custom-8")).toBe("Note 8");               // never titled
    expect(customTitle("weird-id")).toBe("Note");                 // no number to recover
  });

  it("a renamed custom note surfaces its title in the launcher and export; emptied falls back to Note N", () => {
    const doc = emptyDoc();
    doc.notes["custom-8"] = custom({ title: "Career", open: false, text: "10th lord strong" });
    doc.notes["custom-9"] = custom({ title: "", open: true, text: "loose thought" }); // title cleared
    expect(customNotes(doc)).toEqual([
      { id: "custom-8", title: "Career", open: false, hasText: true },
      { id: "custom-9", title: "Note 9", open: true, hasText: true }, // fallback to numbered default
    ]);
    expect(writtenNoteViews(doc).map((v) => v.title)).toEqual(["Career", "Note 9"]);
  });

  it("customNotes lists every custom note (open or closed) with its state", () => {
    const doc = emptyDoc();
    doc.notes["custom-1"] = custom({ title: "Note 1", open: false, text: "kept while closed" });
    doc.notes["custom-2"] = custom({ title: "Note 2", open: true, text: "" });
    const rows = customNotes(doc);
    expect(rows).toEqual([
      { id: "custom-1", title: "Note 1", open: false, hasText: true },
      { id: "custom-2", title: "Note 2", open: true, hasText: false },
    ]);
    // tenets are never listed as custom rows
    expect(rows.some((r) => isTenetId(r.id))).toBe(false);
  });
});

describe("writtenNoteViews / writtenNotesCount (download by text, open or closed)", () => {
  it("includes any note with text whether it is open or X-ed shut, in reading order then customs", () => {
    const doc = emptyDoc();
    // a CLOSED tenet that still holds text — must still be downloadable
    doc.notes.lagna = { ...doc.notes.lagna, open: false, text: "Scorpio rising" };
    // an OPEN but EMPTY tenet — nothing to download
    doc.notes.houses = { ...doc.notes.houses, open: true, text: "   " };
    // a CLOSED custom note with text, and an OPEN empty custom note
    doc.notes["custom-1"] = custom({ title: "Note 1", open: false, text: "a loose thought" });
    doc.notes["custom-2"] = custom({ title: "Note 2", open: true, text: "" });
    expect(writtenNoteViews(doc).map((v) => v.id)).toEqual(["lagna", "custom-1"]);
    expect(writtenNotesCount(doc)).toBe(2);
    // openNoteViews (what the workspace renders) is unchanged: open notes only
    expect(openNoteViews(doc).map((v) => v.id)).toEqual(["houses", "custom-2"]);
  });

  it("counts nothing when every note is blank, even with notes open", () => {
    const doc = emptyDoc();
    doc.notes.lagna = { ...doc.notes.lagna, open: true };
    doc.notes["custom-1"] = custom({ title: "Note 1", open: true });
    expect(writtenNotesCount(doc)).toBe(0);
    expect(writtenNoteViews(doc)).toEqual([]);
    expect(openNotesCount(doc)).toBe(2); // open, just empty
  });
});

describe("openNoteViews", () => {
  it("returns only open notes: tenets in reading order, then custom notes", () => {
    const doc = emptyDoc();
    doc.notes.houses = { ...doc.notes.houses, open: true };
    doc.notes.lagna = { ...doc.notes.lagna, open: true };
    doc.notes["custom-1"] = { open: true, x: 400, y: 200, z: 5, text: "", promptsCollapsed: false, custom: true, title: "Note 1" };
    const views = openNoteViews(doc);
    expect(views.map((v) => v.id)).toEqual(["lagna", "houses", "custom-1"]); // reading order, custom last
    expect(views[0].questions.length).toBeGreaterThan(0); // tenet carries its guiding questions
    expect(views[0].custom).toBe(false); // tenets are not renamable
    expect(views[2]).toEqual({ id: "custom-1", title: "Note 1", questions: [], custom: true }); // custom: own title, no questions, renamable
  });

  it("is empty when nothing is open", () => {
    expect(openNoteViews(emptyDoc())).toEqual([]);
  });
});
