/* readingNotes.test.ts — the guided checklist's pure data + storage:
   per-chart key derivation, the five canonical steps, and load/save
   round-trips with normalization (vitest runs in node, so storage is a
   Map-backed fake injected through the StorageLike param). */
import { describe, it, expect } from "vitest";
import {
  READING_STEPS, notesKey, emptyNotes, loadNotes, saveNotes, firstUnchecked,
  type ReadingNotesState,
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

describe("READING_STEPS", () => {
  it("is the five steps in reading order", () => {
    expect(READING_STEPS.map((s) => s.id)).toEqual(["lagna", "houses", "varga", "dashas", "synthesis"]);
    expect(READING_STEPS.map((s) => s.title)).toEqual(["Lagna", "Houses", "Varga", "Dashas", "Synthesis"]);
  });

  it("keeps the owner's prompts verbatim (canonical wording — don't rephrase)", () => {
    expect(READING_STEPS.map((s) => s.prompt)).toEqual([
      "Inspect the Chart Ruler panel. It lays out the ascendant and information about its lord. Determine the lord's dignity, and where it sits. Note what stands out as the foundation of the chart.",
      "Walk the houses one by one. For each, note the occupants, the house lord, and their dignity.",
      "Peek at the relevant varga when you want more depth on a specific area. D2 for finances, D9 for marriage and dharma, D10 for career.",
      "Toggle the mahadasha antardasha overlay to see which houses are activated in the running period. These are the areas of life likely at the forefront now.",
      "Bring it all together and note the confluences, the themes that more than one factor points to.",
    ]);
  });

  it("carries the owner-specified deck refreshers (and only those)", () => {
    const byId = Object.fromEntries(READING_STEPS.map((s) => [s.id, s.deck]));
    expect(byId.lagna).toBeUndefined(); // the ruler jump was removed (owner-directed)
    expect(byId.houses).toMatchObject({ deckId: "houses" });
    expect(byId.dashas).toMatchObject({ deckId: "dashas" });
    expect(byId.varga).toBeUndefined(); // no varga deck yet
    expect(byId.synthesis).toBeUndefined(); // the student's own work
  });
});

describe("firstUnchecked (the accordion's resume point)", () => {
  it("finds the first unchecked step in reading order, or null when all done", () => {
    const all = emptyNotes();
    expect(firstUnchecked(all)).toBe("lagna");
    all.lagna = { done: true, notes: "" };
    all.houses = { done: true, notes: "" };
    expect(firstUnchecked(all)).toBe("varga");
    for (const s of READING_STEPS) all[s.id] = { done: true, notes: "" };
    expect(firstUnchecked(all)).toBeNull();
  });
});

describe("notesKey", () => {
  it("is stable per natal chart and distinct across charts", () => {
    const a = fakeModel("1991-05-02T03:30:00.000Z", 21.6333, 69.6);
    expect(notesKey(a)).toBe("vedic:readingNotes:1991-05-02T03:30:00.000Z|21.6333|69.6");
    expect(notesKey(a)).toBe(notesKey(fakeModel("1991-05-02T03:30:00.000Z", 21.6333, 69.6))); // same birth → same key
    expect(notesKey(a)).not.toBe(notesKey(fakeModel("1991-05-02T03:31:00.000Z", 21.6333, 69.6))); // different time
    expect(notesKey(a)).not.toBe(notesKey(fakeModel("1991-05-02T03:30:00.000Z", 3.139, 101.6869))); // different place
  });
});

describe("loadNotes / saveNotes", () => {
  it("round-trips checkboxes and notes", () => {
    const store = fakeStorage();
    const state: ReadingNotesState = {
      ...emptyNotes(),
      lagna: { done: true, notes: "Scorpio rising, Mars in the 3rd" },
      synthesis: { done: false, notes: "wealth themes repeat" },
    };
    saveNotes("k", state, store);
    expect(loadNotes("k", store)).toEqual(state);
  });

  it("a missing key yields a fresh all-empty state covering every step", () => {
    const fresh = loadNotes("nope", fakeStorage());
    expect(Object.keys(fresh).sort()).toEqual([...READING_STEPS.map((s) => s.id)].sort());
    for (const s of READING_STEPS) expect(fresh[s.id]).toEqual({ done: false, notes: "" });
  });

  it("corrupted JSON and malformed entries normalize instead of throwing", () => {
    const store = fakeStorage();
    store.setItem("bad", "{not json");
    expect(loadNotes("bad", store)).toEqual(emptyNotes());

    store.setItem("partial", JSON.stringify({ lagna: { done: "yes", notes: 42 }, junk: { done: true } }));
    const got = loadNotes("partial", store);
    expect(got.lagna).toEqual({ done: false, notes: "" }); // non-boolean/string coerced safe
    expect(got).not.toHaveProperty("junk"); // unknown step ids dropped
    expect(got.houses).toEqual({ done: false, notes: "" });
  });

  it("storage failures are swallowed (private mode posture)", () => {
    const throwing = {
      getItem: () => { throw new Error("denied"); },
      setItem: () => { throw new Error("denied"); },
    };
    expect(loadNotes("k", throwing)).toEqual(emptyNotes());
    expect(() => saveNotes("k", emptyNotes(), throwing)).not.toThrow();
  });
});
