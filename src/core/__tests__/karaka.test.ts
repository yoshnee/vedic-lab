import { describe, it, expect } from "vitest";
import { charaKarakas } from "../karaka";
import type { PlanetData, PlanetKey } from "../types";

/** charaKarakas only reads `key` + `degreeValue`; a thin stub keeps the test focused. */
const p = (key: PlanetKey, degreeValue: number) =>
  ({ key, degreeValue } as unknown as PlanetData);

describe("charaKarakas (Jaimini degree-ranking, 7-karaka scheme)", () => {
  it("assigns Atmakaraka to the highest degree-in-sign, Amatyakaraka to the next", () => {
    const roles = charaKarakas([
      p("sun", 12.4),
      p("moon", 28.9), // highest → Atmakaraka
      p("mars", 3.1),
      p("mercury", 22.7), // second → Amatyakaraka
      p("jupiter", 15.0),
      p("venus", 8.2),
      p("saturn", 19.5),
    ]);
    expect(roles.moon).toBe("atmakaraka");
    expect(roles.mercury).toBe("amatyakaraka");
    // only the top two are surfaced for now
    expect(Object.values(roles).filter(Boolean)).toHaveLength(2);
  });

  it("excludes Rahu and Ketu even at the highest degree", () => {
    const roles = charaKarakas([
      p("rahu", 29.9),
      p("ketu", 29.9),
      p("saturn", 27.0), // highest eligible → Atmakaraka
      p("venus", 25.0), // second eligible → Amatyakaraka
      p("sun", 1.0),
    ]);
    expect(roles.rahu).toBeUndefined();
    expect(roles.ketu).toBeUndefined();
    expect(roles.saturn).toBe("atmakaraka");
    expect(roles.venus).toBe("amatyakaraka");
  });

  it("breaks ties on the finer arc (full decimal ordering)", () => {
    const roles = charaKarakas([
      p("sun", 20.51),
      p("mars", 20.49),
      p("jupiter", 5.0),
    ]);
    expect(roles.sun).toBe("atmakaraka");
    expect(roles.mars).toBe("amatyakaraka");
  });
});
