/* readingNotes.test.ts — the guided checklist's pure data + storage:
   per-chart key derivation, the seven canonical steps, and load/save
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
  it("is the seven steps in reading order (owner-directed 2026-06)", () => {
    expect(READING_STEPS.map((s) => s.id)).toEqual([
      "lagna", "planets", "nodes", "houses", "varga", "dashas", "synthesis",
    ]);
    expect(READING_STEPS.map((s) => s.title)).toEqual([
      "Ascendant", "Planets", "Rahu/Ketu Axis", "Houses", "Vargas (optional)", "Dashas", "Synthesis",
    ]);
  });

  it("keeps the owner's prompts verbatim (canonical wording — don't rephrase)", () => {
    const byId = Object.fromEntries(READING_STEPS.map((s) => [s.id, s.prompt]));
    expect(byId.lagna).toBe("Inspect the Chart Ruler panel.");
    expect(byId.planets).toBe(
      "Go through the planet panels in order. For each, assess its dignity.",
    );
    expect(byId.houses).toBe(
      "Walk the houses one by one. For each, note the occupants, the house lord, and their dignity.",
    );
    expect(byId.varga).toBe(
      "Peek at the relevant varga when you want more depth on a specific area. D2 for finances, D9 for marriage and dharma, D10 for career.",
    );
    expect(byId.dashas).toBe(
      "Toggle the mahadasha antardasha overlay to see which houses are activated in the running period. These are the areas of life likely at the forefront now.",
    );
    expect(byId.synthesis).toBe(
      "Bring it all together and note the confluences, the themes that more than one factor points to.",
    );
    // the nodes prompt is still a draft (not yet owner-canonical) — just present
    expect(byId.nodes).toBeTruthy();
  });

  it("carries the owner-specified deck refreshers (and only those)", () => {
    const byId = Object.fromEntries(READING_STEPS.map((s) => [s.id, s.deck]));
    expect(byId.lagna).toBeUndefined(); // the ruler jump was removed (owner-directed)
    expect(byId.planets).toMatchObject({ deckId: "planetary-groupings" }); // the hidden deck's chart-side use
    expect(byId.nodes).toMatchObject({ deckId: "rahu-ketu" });
    expect(byId.houses).toMatchObject({ deckId: "houses" });
    expect(byId.dashas).toMatchObject({ deckId: "dashas" });
    expect(byId.varga).toBeUndefined(); // no varga deck yet
    expect(byId.synthesis).toBeUndefined(); // the student's own work
  });

  it("refresher deckIds all resolve in the deck registry", async () => {
    const { DECKS } = await import("@/data/decks/registry");
    for (const s of READING_STEPS) {
      if (!s.deck) continue;
      expect(DECKS.some((d) => d.id === s.deck!.deckId), s.deck.deckId).toBe(true);
    }
  });
});

describe("firstUnchecked (the accordion's resume point)", () => {
  it("finds the first unchecked step in reading order, or null when all done", () => {
    const all = emptyNotes();
    expect(firstUnchecked(all)).toBe("lagna");
    all.lagna = { done: true, notes: "" };
    all.planets = { done: true, notes: "" };
    expect(firstUnchecked(all)).toBe("nodes");
    all.nodes = { done: true, notes: "" };
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
