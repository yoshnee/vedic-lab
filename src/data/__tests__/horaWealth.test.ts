/* horaWealth.test.ts — the D2 (Horā) reading layer: the 9×2 wealth map's
   completeness + owner copy rule (no em-dashes), and the placement lookup
   (which luminary's horā a varga sign falls in, by parity). */
import { describe, it, expect } from "vitest";
import { HORA_WEALTH, HORA_COLUMNS, horaLuminaryOf } from "../horaWealth";
import type { PlanetKey } from "@/core/types";

const PLANETS: PlanetKey[] = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu"];

describe("HORA_WEALTH", () => {
  it("covers all nine grahas with non-empty sun + moon readings", () => {
    expect(Object.keys(HORA_WEALTH).sort()).toEqual([...PLANETS].sort());
    for (const p of PLANETS) {
      expect(HORA_WEALTH[p].sun.trim().length, p).toBeGreaterThan(0);
      expect(HORA_WEALTH[p].moon.trim().length, p).toBeGreaterThan(0);
    }
  });

  it("uses no em-dashes (owner copy rule)", () => {
    for (const p of PLANETS) {
      expect(HORA_WEALTH[p].sun, p).not.toMatch(/—/);
      expect(HORA_WEALTH[p].moon, p).not.toMatch(/—/);
    }
  });
});

describe("horaLuminaryOf (placement parity)", () => {
  it("odd varga signs fall in the Sun's horā, even in the Moon's", () => {
    expect(horaLuminaryOf("Aries")).toBe("sun"); // 1
    expect(horaLuminaryOf("Taurus")).toBe("moon"); // 2
    expect(horaLuminaryOf("Gemini")).toBe("sun"); // 3
    expect(horaLuminaryOf("Cancer")).toBe("moon"); // 4
    expect(horaLuminaryOf("Leo")).toBe("sun"); // 5
    expect(horaLuminaryOf("Capricorn")).toBe("moon"); // 10
    expect(horaLuminaryOf("Aquarius")).toBe("sun"); // 11
    expect(horaLuminaryOf("Pisces")).toBe("moon"); // 12
  });

  it("the two column labels match their luminary (Leo → Sun, Cancer → Moon)", () => {
    const sun = HORA_COLUMNS.find((c) => c.key === "sun")!;
    const moon = HORA_COLUMNS.find((c) => c.key === "moon")!;
    expect(sun.sign).toBe("Leo");
    expect(moon.sign).toBe("Cancer");
    expect(horaLuminaryOf(sun.sign)).toBe("sun");
    expect(horaLuminaryOf(moon.sign)).toBe("moon");
  });
});
