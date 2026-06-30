/* readingNotes.test.ts — the reading-notes workspace's pure data + storage:
   the seven canonical tenets + their guiding questions, per-chart key
   derivation, and load/save round-trips with normalization + the legacy
   migration from the old checklist shape (vitest runs in node, so storage is a
   Map-backed fake injected through the StorageLike param). */
import { describe, it, expect } from "vitest";
import {
  TENETS, notesKey, emptyDoc, loadDoc, saveDoc, openNotesCount,
  type NotesDoc,
} from "../readingNotes";
import type { ChartModel } from "../types";

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
