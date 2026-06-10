/* ============================================================
   invariants.test.ts — pure, fast tests over the fixed Jyotish tables and the
   rule-based derivation layer (no ephemeris). These catch transcription bugs
   that ground-truth charts can miss — e.g. the Moon-debilitation typo only
   surfaces when a chart actually has the Moon in Scorpio. An invariant
   ("debilitation === exaltation + 6 signs") catches it unconditionally.
   ============================================================ */
import { describe, it, expect } from "vitest";
import {
  PLANET_ORDER, SIGN_RULER, EXALTATION, DEBILITATION, OWN_SIGNS, MOOLTRIKONA,
  NAKSHATRAS, NAKSHATRA_ARC, PADA_ARC, DRISHTI,
  DASHA_SEQUENCE, DASHA_TOTAL_YEARS, PADA_PURUSHARTHAS,
} from "../constants";
import {
  dignityOf, nakshatraOf, gandantaOf, isCombust, aspectsOnto, maitriToDispositor,
} from "../vedic";
import type { PlanetKey } from "../types";

/** The seven non-node grahas — the only bodies with dignity / friendships. */
const SEVEN: PlanetKey[] = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"];
const oppositeSign = (s: number) => ((s - 1 + 6) % 12) + 1;
const allSignsAt = (sign: number) =>
  Object.fromEntries(PLANET_ORDER.map((k) => [k, sign])) as Record<PlanetKey, number>;

describe("dignity tables", () => {
  it("every planet has exactly one exaltation and one debilitation sign", () => {
    for (const p of SEVEN) {
      expect(EXALTATION[p], `${p} exaltation`).toBeTypeOf("number");
      expect(DEBILITATION[p], `${p} debilitation`).toBeTypeOf("number");
    }
  });

  it("debilitation is exactly opposite exaltation (+6 signs) for every planet", () => {
    // This single invariant catches the Moon-in-Scorpio typo (and any future one).
    for (const p of SEVEN) {
      expect(DEBILITATION[p], `${p}: debil should be opposite exalt`).toBe(oppositeSign(EXALTATION[p]!));
    }
  });

  it("Moon is debilitated in Scorpio, not Sagittarius (reference-typo regression)", () => {
    expect(dignityOf("moon", 8)).toBe("debilitated"); // Scorpio
    expect(dignityOf("moon", 9)).toBe("neutral"); // Sagittarius — the reference's wrong value
    expect(dignityOf("moon", 2)).toBe("exalted"); // Taurus
  });

  it("own-sign and ruler tables agree both ways", () => {
    for (const p of SEVEN) for (const s of OWN_SIGNS[p]!) expect(SIGN_RULER[s - 1]).toBe(p);
    for (let s = 1; s <= 12; s++) expect(OWN_SIGNS[SIGN_RULER[s - 1]]).toContain(s);
  });

  it("dignityOf reports exalted/debilitated/own at the table signs", () => {
    for (const p of SEVEN) {
      expect(dignityOf(p, EXALTATION[p]!)).toBe("exalted");
      expect(dignityOf(p, DEBILITATION[p]!)).toBe("debilitated");
      // own sign reads "own" — except where it coincides with exaltation
      // (Mercury/Virgo), where exaltation correctly takes precedence.
      for (const s of OWN_SIGNS[p]!) {
        if (s === EXALTATION[p]) continue;
        expect(dignityOf(p, s)).toBe("own");
      }
    }
  });

  it("exaltation outranks own sign for Mercury in Virgo", () => {
    expect(dignityOf("mercury", 6)).toBe("exalted"); // Virgo is both — exalted wins
  });

  it("nodes carry no dignity in any sign", () => {
    for (let s = 1; s <= 12; s++) {
      expect(dignityOf("rahu", s)).toBe("neutral");
      expect(dignityOf("ketu", s)).toBe("neutral");
    }
  });

  it("mooltrikona is an own sign for all but the Moon (Taurus, by design)", () => {
    for (const p of SEVEN) {
      if (p === "moon") expect(MOOLTRIKONA.moon).toBe(2);
      else expect(OWN_SIGNS[p]).toContain(MOOLTRIKONA[p]!);
    }
  });
});

describe("nakshatras & vimshottari", () => {
  it("27 nakshatras whose lords cycle in 9s, tiling 360°", () => {
    expect(NAKSHATRAS).toHaveLength(27);
    expect(NAKSHATRA_ARC * 27).toBeCloseTo(360);
    expect(PADA_ARC * 108).toBeCloseTo(360);
    for (let i = 0; i < 27; i++) expect(NAKSHATRAS[i].lord).toBe(NAKSHATRAS[i % 9].lord);
  });

  it("the first nine nakshatra lords are the Vimśottarī sequence", () => {
    expect(NAKSHATRAS.slice(0, 9).map((n) => n.lord)).toEqual(DASHA_SEQUENCE.map((d) => d.lord));
  });

  it("Vimśottarī has 9 distinct lords whose years sum to 120", () => {
    expect(DASHA_SEQUENCE).toHaveLength(9);
    expect(new Set(DASHA_SEQUENCE.map((d) => d.lord)).size).toBe(9);
    expect(DASHA_SEQUENCE.reduce((s, d) => s + d.years, 0)).toBe(DASHA_TOTAL_YEARS);
    expect(DASHA_TOTAL_YEARS).toBe(120);
  });

  it("pada purusharthas: one row per nakshatra, each touching all four aims", () => {
    expect(PADA_PURUSHARTHAS).toHaveLength(27);
    for (let i = 0; i < 27; i++) {
      expect(new Set(PADA_PURUSHARTHAS[i]), NAKSHATRAS[i].name)
        .toEqual(new Set(["Dharma", "Artha", "Kama", "Moksha"]));
    }
  });

  it("pada purusharthas alternate forward/reversed, with the parity flip at Shravana (Sutton)", () => {
    const DAKM = ["Dharma", "Artha", "Kama", "Moksha"];
    const MKAD = [...DAKM].reverse();
    // Ashwini..Uttara Ashadha (indices 0–20): even forward, odd reversed
    for (let i = 0; i <= 20; i++) {
      expect(PADA_PURUSHARTHAS[i], NAKSHATRAS[i].name).toEqual(i % 2 === 0 ? DAKM : MKAD);
    }
    // pada-less Abhijit sits before Shravana in the book's cycle, flipping parity:
    // Shravana..Revati (indices 21–26): odd forward, even reversed
    for (let i = 21; i <= 26; i++) {
      expect(PADA_PURUSHARTHAS[i], NAKSHATRAS[i].name).toEqual(i % 2 === 1 ? DAKM : MKAD);
    }
    expect(PADA_PURUSHARTHAS[21]).toEqual(DAKM); // Shravana restarts forward
    expect(PADA_PURUSHARTHAS[26]).toEqual(MKAD); // Revati ends reversed
  });

  it("nakshatraOf lands on the right nakshatra + pada at boundaries", () => {
    expect(nakshatraOf(0)).toMatchObject({ name: "Ashwini", pada: 1 });
    expect(nakshatraOf(NAKSHATRA_ARC + 0.01).name).toBe("Bharani"); // just into the 2nd
    expect(nakshatraOf(360 - 1e-6).name).toBe("Revati");
    expect(nakshatraOf(NAKSHATRA_ARC - 0.01).pada).toBe(4); // last pada of Ashwini
    for (let lon = 0; lon < 360; lon += 2.5) {
      const { pada } = nakshatraOf(lon);
      expect(pada).toBeGreaterThanOrEqual(1);
      expect(pada).toBeLessThanOrEqual(4);
    }
  });
});

describe("graha drishti", () => {
  it("every body aspects the 7th; specials are Mars 4/7/8, Jupiter 5/7/9, Saturn 3/7/10", () => {
    for (const p of Object.keys(DRISHTI) as PlanetKey[]) expect(DRISHTI[p]).toContain(7);
    expect(DRISHTI.mars).toEqual([4, 7, 8]);
    expect(DRISHTI.jupiter).toEqual([5, 7, 9]);
    expect(DRISHTI.saturn).toEqual([3, 7, 10]);
    expect(DRISHTI.rahu).toEqual([5, 7, 9]); // nodes treated as Jupiter
  });

  it("aspectsOnto resolves the special-aspect geometry (all bodies in Aries)", () => {
    const signs = allSignsAt(1);
    const onto = (s: number) => aspectsOnto(s, signs).map((a) => a.planet).sort();
    const everyone = [...PLANET_ORDER].sort();
    expect(onto(7)).toEqual(everyone); // 7th aspect — universal
    expect(onto(1)).toEqual([]); // a body never aspects its own sign
    expect(onto(2)).toEqual([]); // no body has a 2nd-house drishti
    expect(onto(4)).toEqual(["mars"]); // Mars' 4th
    expect(onto(8)).toEqual(["mars"]); // Mars' 8th
    expect(onto(3)).toEqual(["saturn"]); // Saturn's 3rd
    expect(onto(10)).toEqual(["saturn"]); // Saturn's 10th
    expect(onto(5)).toEqual(["jupiter", "ketu", "rahu"]); // 5th — Jupiter + nodes
    expect(onto(9)).toEqual(["jupiter", "ketu", "rahu"]); // 9th — Jupiter + nodes
  });
});

describe("combustion", () => {
  it("combust within the orb, clear beyond it, and never for Sun/nodes", () => {
    expect(isCombust("mercury", 100, 105)).toBe(true); // 5° ≤ 14
    expect(isCombust("mercury", 100, 120)).toBe(false); // 20° > 14
    expect(isCombust("venus", 359, 1)).toBe(true); // 2° across 0° ≤ 10
    expect(isCombust("sun", 100, 100)).toBe(false); // the Sun cannot combust
    expect(isCombust("rahu", 100, 100)).toBe(false); // nodes never combust
  });
});

describe("gandanta", () => {
  it("flags the three water→fire junctions, with a deep band within 1°", () => {
    for (const junction of [0, 120, 240]) {
      expect(gandantaOf(junction)).toMatchObject({ on: true, deep: true });
    }
    expect(gandantaOf(241).deep).toBe(true); // 1° into Sagittarius
    expect(gandantaOf(242)).toMatchObject({ on: true, deep: false }); // 2° → on but not deep
    expect(gandantaOf(60).on).toBe(false); // mid-Taurus, far from any junction
    expect(gandantaOf(115).on).toBe(false); // 5° before a junction → outside the pada orb
  });
});

describe("panchadha maitri", () => {
  it("reads own-sign and omits the badge for node occupants", () => {
    const inLeo = allSignsAt(5); // everyone in Leo (ruled by the Sun)
    expect(maitriToDispositor("sun", inLeo)).toEqual({ dispositor: null, relation: "own_sign" });
    expect(maitriToDispositor("rahu", inLeo)).toEqual({ dispositor: "sun", relation: null });
  });
});
