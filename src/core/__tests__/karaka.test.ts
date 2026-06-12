/* karaka.test.ts — Jaimini chara karakas. Rule source: the owner-provided
   Karakas deck (overview card): rank the seven classical planets by degree
   travelled within the sign, highest = Atmakaraka, second = Amatyakaraka,
   lowest = Darakaraka; Rahu/Ketu always excluded; ties resolve by full
   precision (degrees → minutes → seconds is the same numeric comparison). */
import { describe, it, expect } from "vitest";
import { charaKarakas } from "../karaka";
import type { PlanetKey } from "../types";
import { PLANET_ORDER } from "../constants";

/** Longitude map: every body at 0° unless overridden. */
const lons = (o: Partial<Record<PlanetKey, number>>) =>
  ({ ...Object.fromEntries(PLANET_ORDER.map((k) => [k, 0])), ...o }) as Record<PlanetKey, number>;

describe("charaKarakas", () => {
  it("assigns Atmakaraka / Amatyakaraka / Darakaraka by within-sign degree rank", () => {
    // degrees in sign: Sun 29, Moon 25, Mars 20, Mercury 15, Jupiter 10, Venus 5, Saturn 1
    const k = charaKarakas(lons({
      sun: 29, moon: 55, mars: 80, mercury: 105, jupiter: 130, venus: 155, saturn: 181,
    }));
    expect(k.sun?.key).toBe("atmakaraka");
    expect(k.moon?.key).toBe("amatyakaraka");
    expect(k.saturn?.key).toBe("darakaraka");
    // the middle ranks carry no designation
    expect(k.mars).toBeUndefined();
    expect(k.mercury).toBeUndefined();
    expect(k.jupiter).toBeUndefined();
    expect(k.venus).toBeUndefined();
  });

  it("ranks by degree WITHIN the sign, not by absolute longitude", () => {
    // Saturn at 359° (29° Pisces) outranks the Sun at 15° (15° Aries)
    const k = charaKarakas(lons({ saturn: 359, sun: 15, moon: 40, mars: 65, mercury: 95, jupiter: 125, venus: 152 }));
    expect(k.saturn?.key).toBe("atmakaraka");
  });

  it("full precision decides near-ties (the minutes/seconds tiebreak)", () => {
    // Sun 20°30′ vs Moon 20°31′ in their signs — the Moon's extra minute wins
    const k = charaKarakas(lons({
      sun: 20.5, moon: 50.5166667, mars: 70, mercury: 100, jupiter: 130, venus: 155, saturn: 185,
    }));
    expect(k.moon?.key).toBe("atmakaraka");
    expect(k.sun?.key).toBe("amatyakaraka");
  });

  it("Rahu and Ketu are always excluded, whatever their degrees", () => {
    // degrees in sign: Sun 25, Saturn 24, Moon 20, Mars 15, Mercury 10, Jupiter 5, Venus 0
    const k = charaKarakas(lons({
      rahu: 29.99, ketu: 209.99, // would top the ranking if included
      sun: 25, moon: 50, mars: 75, mercury: 100, jupiter: 125, venus: 150, saturn: 174,
    }));
    expect(k.rahu).toBeUndefined();
    expect(k.ketu).toBeUndefined();
    expect(k.sun?.key).toBe("atmakaraka");
    expect(k.saturn?.key).toBe("amatyakaraka");
    expect(k.venus?.key).toBe("darakaraka");
  });

  it("each designation carries the pill label and its flashcard target", () => {
    const k = charaKarakas(lons({ sun: 29, moon: 55, mars: 80, mercury: 105, jupiter: 130, venus: 155, saturn: 181 }));
    expect(k.sun).toEqual({
      key: "atmakaraka",
      name: "Atmakaraka",
      flashcard: { type: "karaka", id: "atmakaraka" },
    });
    expect(k.saturn?.name).toBe("Darakaraka");
  });
});
