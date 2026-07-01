/* ============================================================
   shadbala-regression.test.ts -- a fixed-expectations REGRESSION GUARD for the
   six-fold strength engine (src/core/shadbala.ts). This is NOT a parity gate.

   History: the engine was once pinned byte-for-byte to a vendored copy of the
   Hora-Prakash reference (a differential parity gate). The engine has since been
   re-anchored to classical BPHS on five documented points, so byte-parity with
   the upstream no longer holds and that gate was retired. The vendored copy is
   kept only for provenance (see __upstream__/README.md); nothing in the test or
   build path imports it anymore.

   What this asserts: the engine's OWN current outputs for the canonical sample
   chart (Mahatma Gandhi, src/core/sample.ts) are locked -- every planet's total,
   its six component balas, AND its eight Sthana/Kala sub-balas (parts) -- so any
   future drift in a single component OR sub-bala is caught (an offsetting change
   in one sub-term can no longer slip past a rolled-up total). The BPHS rule each
   corrected figure reflects is recorded inline in EXPECTED[planet].note.

   FROZEN INPUTS: the sample chart's sidereal inputs (ascendant, ayanamsa, each
   graha's longitude + speed) are stored below as literals, captured once from
   sampleBirth() + rawPositions(). The test feeds those frozen values straight
   into computeShadbala() and never re-runs the ephemeris -- so this stays a
   shadbala regression test, not an upstream-astronomy one. A swisseph/ayanamsa
   change is caught by the JHora fixture suite (fixtures.test.ts), not here.

   IMPORTANT: these locked values inherit the engine's accepted SIMPLIFICATIONS
   (reduced Kala Bala, bucketed Cheshta, whole-sign Drik -- see shadbala.ts). So
   they are "correct per the current model," NOT a claim of full classical
   Shadbala parity with JHora or a complete BPHS implementation.

   Cross-planet BPHS rules baked into every expectation below:
     - Saptavargaja over the seven vargas D1, D2, D3, D7, D9, D12, D30, scored by
       the COMPOUND (panchadha) dignity 7-tier scheme — moolatrikona 45 / own 30 /
       adhimitra 22.5 / mitra 15 / sama 7.5 / shatru 3.75 / adhishatru 1.875
       (naisargika + tatkalika; owner-directed 2026-07, was permanent-only 5-tier).
     - Ojayugma summed across Rasi and Navamsa (15 + 15, max 30), not averaged.
     - Ayana/declination terms reconstruct tropical longitude from the chart's
       ACTUAL ayanamsa (22.04 for 1869), not a hard-coded ~24.
   ============================================================ */
import { describe, it, expect, beforeAll } from "vitest";
import { signOf, houseOf, degInSign } from "../vedic";
import { computeShadbala, type ShadbalaBody } from "../shadbala";

// Tolerance guards float rounding only; real bala drift is >= 0.1 virupa.
const TOL = 0.1;

const GRAHAS = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"] as const;
type Graha = (typeof GRAHAS)[number];

/* Frozen sidereal inputs for the canonical sample chart (Mahatma Gandhi),
   captured once from sampleBirth() + rawPositions(). Stored as literals so the
   snapshot depends ONLY on computeShadbala(), never on the live ephemeris. */
const FROZEN: {
  ascendant: number;
  ayanamsa: number;
  longitudes: Record<Graha, number>;
  speeds: Record<Graha, number>;
} = {
  ascendant: 192.8962633660426,
  ayanamsa: 22.038221970909422,
  longitudes: {
    sun: 166.9184962841921,
    moon: 118.30413171164474,
    mars: 206.3835458946511,
    mercury: 191.75121242061596,
    jupiter: 28.13687979948429,
    venus: 204.4298431700771,
    saturn: 230.32978983238092,
  },
  speeds: {
    sun: 0.9853224159271737,
    moon: 14.440095343272759,
    mars: 0.6977577892163598,
    mercury: 0.6167426066783721,
    jupiter: -0.07317617044548592,
    venus: 1.1939752085637607,
    saturn: 0.07246075915185966,
  },
};

interface Parts {
  uchcha: number;
  saptavargaja: number;
  ojayugma: number;
  kendradi: number;
  drekkana: number;
  nathonnatha: number;
  paksha: number;
  ayana: number;
}
interface Expected {
  sthana: number;
  dig: number;
  kala: number;
  chesta: number;
  naisargika: number;
  drik: number;
  total: number;
  parts: Parts;
  note: string;
}

/* Locked = the engine's current BPHS-anchored output on the canonical sample
   chart. `note` names the BPHS rule(s) the corrected figures reflect. */
const EXPECTED: Record<Graha, Expected> = {
  sun: {
    sthana: 112.7, dig: 40, kala: 129.3, chesta: 25.5, naisargika: 60, drik: 0, total: 367.4,
    parts: { uchcha: 7.7, saptavargaja: 75, ojayugma: 15, kendradi: 15, drekkana: 0, nathonnatha: 60, paksha: 43.8, ayana: 25.5 },
    note: "Cheshta = Ayana (BPHS 27.18); Ayana doubled by dual-count in Kala + Cheshta, no multiplier; Ayana from actual ayanamsa. Saptavargaja compound 7-tier (panchadha).",
  },
  moon: {
    sthana: 279.1, dig: 0, kala: 27.4, chesta: 16.2, naisargika: 51.4, drik: 0, total: 374.1,
    parts: { uchcha: 31.6, saptavargaja: 142.5, ojayugma: 30, kendradi: 60, drekkana: 15, nathonnatha: 0, paksha: 16.2, ayana: 11.2 },
    note: "Cheshta = Paksha (BPHS 27.18); Paksha doubled by dual-count in Kala + Cheshta, no multiplier. Saptavargaja compound 7-tier (panchadha).",
  },
  mars: {
    sthana: 188.8, dig: 30, kala: 51.6, chesta: 45, naisargika: 17.1, drik: 7.5, total: 340.1,
    parts: { uchcha: 29.5, saptavargaja: 84.4, ojayugma: 15, kendradi: 60, drekkana: 0, nathonnatha: 0, paksha: 43.8, ayana: 7.8 },
    note: "Saptavargaja D1/D2/D3/D7/D9/D12/D30, compound 7-tier (panchadha); Ojayugma summed (max 30).",
  },
  mercury: {
    sthana: 219.8, dig: 60, kala: 122.6, chesta: 15, naisargika: 25.7, drik: 7.5, total: 450.6,
    parts: { uchcha: 51.1, saptavargaja: 63.8, ojayugma: 30, kendradi: 60, drekkana: 15, nathonnatha: 60, paksha: 16.2, ayana: 46.4 },
    note: "Ayana from declination, always additive (range 30..60); Saptavargaja D1..D30, compound 7-tier (panchadha); Ojayugma summed.",
  },
  jupiter: {
    sthana: 260.8, dig: 0, kala: 129, chesta: 60, naisargika: 34.3, drik: 7.5, total: 491.6,
    parts: { uchcha: 37.7, saptavargaja: 133.1, ojayugma: 30, kendradi: 60, drekkana: 0, nathonnatha: 60, paksha: 16.2, ayana: 52.8 },
    note: "Saptavargaja D1/D2/D3/D7/D9/D12/D30, compound 7-tier (panchadha); Ojayugma summed (max 30).",
  },
  venus: {
    sthana: 230.4, dig: 30, kala: 84.8, chesta: 15, naisargika: 42.9, drik: 7.5, total: 410.5,
    parts: { uchcha: 9.1, saptavargaja: 131.3, ojayugma: 15, kendradi: 60, drekkana: 15, nathonnatha: 60, paksha: 16.2, ayana: 8.5 },
    note: "Saptavargaja D1/D2/D3/D7/D9/D12/D30, compound 7-tier (panchadha); Ojayugma summed (max 30).",
  },
  saturn: {
    sthana: 196.1, dig: 10, kala: 102.3, chesta: 30, naisargika: 8.6, drik: 0, total: 347,
    parts: { uchcha: 49.9, saptavargaja: 116.3, ojayugma: 0, kendradi: 30, drekkana: 0, nathonnatha: 0, paksha: 43.8, ayana: 58.5 },
    note: "Saptavargaja D1/D2/D3/D7/D9/D12/D30, compound 7-tier (panchadha); Ojayugma summed (max 30).",
  },
};

const COMPONENTS = ["sthana", "dig", "kala", "chesta", "naisargika", "drik", "total"] as const;
const PARTS = ["uchcha", "saptavargaja", "ojayugma", "kendradi", "drekkana", "nathonnatha", "paksha", "ayana"] as const;

let actual!: ReturnType<typeof computeShadbala>;

beforeAll(() => {
  const lagnaSign = signOf(FROZEN.ascendant);
  const bodies: ShadbalaBody[] = GRAHAS.map((key) => {
    const lon = FROZEN.longitudes[key];
    return {
      key,
      lon,
      sign: signOf(lon),
      house: houseOf(signOf(lon), lagnaSign),
      degreeValue: degInSign(lon),
      retro: key === "sun" || key === "moon" ? false : FROZEN.speeds[key] < 0,
      speed: FROZEN.speeds[key],
    };
  });
  actual = computeShadbala(bodies, FROZEN.ascendant, FROZEN.ayanamsa);
});

describe("shadbala regression guard (engine's own BPHS-anchored outputs, canonical sample chart)", () => {
  it("locks all seven grahas", () => {
    expect(Object.keys(EXPECTED).sort()).toEqual([...GRAHAS].sort());
  });

  for (const key of GRAHAS) {
    it(`${key}: total, six component balas, and eight sub-balas match the locked BPHS-anchored values`, () => {
      const a = actual[key];
      const e = EXPECTED[key];
      expect(a, `${key} present`).toBeDefined();
      for (const c of COMPONENTS) {
        expect(
          Math.abs(a![c] - e[c]),
          `${key} ${c}: actual ${a![c]} vs locked ${e[c]} | ${e.note}`,
        ).toBeLessThanOrEqual(TOL);
      }
      for (const p of PARTS) {
        expect(
          Math.abs(a!.parts[p] - e.parts[p]),
          `${key} parts.${p}: actual ${a!.parts[p]} vs locked ${e.parts[p]} | ${e.note}`,
        ).toBeLessThanOrEqual(TOL);
      }
    });
  }
});
