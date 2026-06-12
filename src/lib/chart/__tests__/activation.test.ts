/* activation.test.ts — the activated-houses overlay's pure data fn:
   rules ∪ occupies per lord (aspects deliberately excluded, owner-revised),
   nodes occupancy-only, union deduped across the (MD, AD) pair. */
import { describe, it, expect } from "vitest";
import { activatedHouses, activatedHousesFor } from "../activation";
import type { ChartData, PlanetKey } from "@/core/types";

/** Minimal natal chart: only what activation reads (key/house/rules). */
function fakeChart(planets: { key: PlanetKey; house: number; rules: number[] }[]): ChartData {
  return { ascendant: { sign: 1 }, planets } as unknown as ChartData;
}

describe("activatedHouses", () => {
  it("a lord activates the houses it rules plus the house it occupies", () => {
    const chart = fakeChart([{ key: "moon", house: 11, rules: [4] }]); // Aries lagna: Moon rules Cancer = 4th
    expect(activatedHouses("moon", chart).sort((a, b) => a - b)).toEqual([4, 11]);
  });

  it("aspects contribute NOTHING — rules-or-occupies only", () => {
    // Saturn in the 1st rules 10 & 11; its 3rd/7th/10th drishti (3, 7, 10) must add nothing new
    const chart = fakeChart([{ key: "saturn", house: 1, rules: [10, 11] }]);
    expect(activatedHouses("saturn", chart).sort((a, b) => a - b)).toEqual([1, 10, 11]);
  });

  it("occupying an own-ruled house counts once", () => {
    const chart = fakeChart([{ key: "mars", house: 1, rules: [1, 8] }]); // Mars in Aries, Aries lagna
    expect(activatedHouses("mars", chart).sort((a, b) => a - b)).toEqual([1, 8]);
  });

  it("nodes contribute only the house they occupy", () => {
    const chart = fakeChart([
      { key: "rahu", house: 6, rules: [] },
      { key: "ketu", house: 12, rules: [] },
    ]);
    expect(activatedHouses("rahu", chart)).toEqual([6]);
    expect(activatedHouses("ketu", chart)).toEqual([12]);
  });
});

describe("activatedHousesFor (the MD + AD union)", () => {
  it("worked check — Moon MD + Mars AD: Cancer's house, Aries' & Scorpio's houses, both occupied houses; nothing aspected", () => {
    // Aries lagna: Cancer = 4th (Moon-ruled), Aries = 1st & Scorpio = 8th (Mars-ruled);
    // Moon sits in the 11th, Mars in the 10th
    const chart = fakeChart([
      { key: "moon", house: 11, rules: [4] },
      { key: "mars", house: 10, rules: [1, 8] },
    ]);
    expect(activatedHousesFor(["moon", "mars"], chart)).toEqual([1, 4, 8, 10, 11]);
  });

  it("a house activated by both lords highlights once", () => {
    const chart = fakeChart([
      { key: "moon", house: 8, rules: [4] }, // Moon occupies the 8th…
      { key: "mars", house: 10, rules: [1, 8] }, // …which Mars also rules
    ]);
    expect(activatedHousesFor(["moon", "mars"], chart)).toEqual([1, 4, 8, 10]);
  });
});
