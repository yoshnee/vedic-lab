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
   chart (Mahatma Gandhi, src/core/sample.ts) are locked -- every planet's total
   AND its six component balas -- so any future drift in a single component is
   caught. The BPHS rule each corrected figure reflects is recorded inline in
   EXPECTED[planet].note.

   IMPORTANT: these locked values inherit the engine's accepted SIMPLIFICATIONS
   (reduced Kala Bala, bucketed Cheshta, whole-sign Drik -- see shadbala.ts). So
   they are "correct per the current model," NOT a claim of full classical
   Shadbala parity with JHora or a complete BPHS implementation.

   Cross-planet BPHS rules baked into every expectation below:
     - Saptavargaja over the seven vargas D1, D2, D3, D7, D9, D12, D30.
     - Ojayugma summed across Rasi and Navamsa (15 + 15, max 30), not averaged.
   ============================================================ */
import { describe, it, expect, beforeAll } from "vitest";
import { rawPositions } from "../swisseph";
import { signOf, houseOf, degInSign } from "../vedic";
import { computeShadbala, type ShadbalaBody } from "../shadbala";
import { sampleBirth } from "../sample";

// Tolerance guards float / ephemeris noise only; real bala drift is >= 0.1 virupa.
const TOL = 0.1;

const GRAHAS = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"] as const;
type Graha = (typeof GRAHAS)[number];

interface Expected {
  sthana: number;
  dig: number;
  kala: number;
  chesta: number;
  naisargika: number;
  drik: number;
  total: number;
  note: string;
}

/* Locked = the engine's current BPHS-anchored output on the canonical sample
   chart. `note` names the BPHS rule(s) the corrected figures reflect. */
const EXPECTED: Record<Graha, Expected> = {
  sun: {
    sthana: 97.7, dig: 40, kala: 128.3, chesta: 24.5, naisargika: 60, drik: 0, total: 350.4,
    note: "Cheshta = Ayana (BPHS 27.18); Ayana doubled by dual-count in Kala + Cheshta, no multiplier.",
  },
  moon: {
    sthana: 241.6, dig: 0, kala: 28.2, chesta: 16.2, naisargika: 51.4, drik: 0, total: 337.4,
    note: "Cheshta = Paksha (BPHS 27.18); Paksha doubled by dual-count in Kala + Cheshta, no multiplier.",
  },
  mars: {
    sthana: 198.2, dig: 30, kala: 51, chesta: 45, naisargika: 17.1, drik: 7.5, total: 348.8,
    note: "Saptavargaja D1/D2/D3/D7/D9/D12/D30; Ojayugma summed (max 30).",
  },
  mercury: {
    sthana: 216.1, dig: 60, kala: 123.4, chesta: 15, naisargika: 25.7, drik: 7.5, total: 447.7,
    note: "Ayana from declination, always additive (range 30..60); Saptavargaja D1..D30; Ojayugma summed.",
  },
  jupiter: {
    sthana: 274, dig: 0, kala: 129.6, chesta: 60, naisargika: 34.3, drik: 7.5, total: 505.4,
    note: "Saptavargaja D1/D2/D3/D7/D9/D12/D30; Ojayugma summed (max 30).",
  },
  venus: {
    sthana: 245.4, dig: 30, kala: 84, chesta: 15, naisargika: 42.9, drik: 7.5, total: 424.8,
    note: "Saptavargaja D1/D2/D3/D7/D9/D12/D30; Ojayugma summed (max 30).",
  },
  saturn: {
    sthana: 181.1, dig: 10, kala: 102.6, chesta: 30, naisargika: 8.6, drik: 0, total: 332.3,
    note: "Saptavargaja D1/D2/D3/D7/D9/D12/D30; Ojayugma summed (max 30).",
  },
};

const COMPONENTS = ["sthana", "dig", "kala", "chesta", "naisargika", "drik", "total"] as const;

let actual!: ReturnType<typeof computeShadbala>;

beforeAll(async () => {
  const b = await sampleBirth();
  const raw = await rawPositions(b.jdUT, b.lat, b.lon);
  const lagnaSign = signOf(raw.ascendant);
  const bodies: ShadbalaBody[] = GRAHAS.map((key) => ({
    key,
    lon: raw.longitudes[key],
    sign: signOf(raw.longitudes[key]),
    house: houseOf(signOf(raw.longitudes[key]), lagnaSign),
    degreeValue: degInSign(raw.longitudes[key]),
    retro: key === "sun" || key === "moon" ? false : raw.speeds[key] < 0,
    speed: raw.speeds[key],
  }));
  actual = computeShadbala(bodies, raw.ascendant);
}, 60_000);

describe("shadbala regression guard (engine's own BPHS-anchored outputs, canonical sample chart)", () => {
  it("locks all seven grahas", () => {
    expect(Object.keys(EXPECTED).sort()).toEqual([...GRAHAS].sort());
  });

  for (const key of GRAHAS) {
    it(`${key}: total and six component balas match the locked BPHS-anchored values`, () => {
      const a = actual[key];
      const e = EXPECTED[key];
      expect(a, `${key} present`).toBeDefined();
      for (const c of COMPONENTS) {
        expect(
          Math.abs(a![c] - e[c]),
          `${key} ${c}: actual ${a![c]} vs locked ${e[c]} | ${e.note}`,
        ).toBeLessThanOrEqual(TOL);
      }
    });
  }
});
