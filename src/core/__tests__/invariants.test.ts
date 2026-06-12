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
  DASHA_SEQUENCE, DASHA_TOTAL_YEARS, PADA_PURUSHARTHAS, NAKSHATRA_PURUSHARTHA, COMBUSTION_ORB,
  SIGN_ELEMENT, ASCENDANT_FUNCTIONAL,
} from "../constants";
import {
  dignityOf, nakshatraOf, gandantaOf, isCombust, aspectsOnto, maitriToDispositor,
} from "../vedic";
import { navamsa, hora, drekkana, saptamsa, dwadasamsa, shodasamsa, dasamsa, trimsamsa } from "../divisional";
import { computeShadbala, SHADBALA_REQUIRED, tierOf } from "../shadbala";
import type { ShadbalaBody } from "../shadbala";
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

  it("sign elements cycle fire→earth→air→water from Aries, three signs each", () => {
    expect(SIGN_ELEMENT).toHaveLength(12);
    const cycle = ["fire", "earth", "air", "water"];
    for (let s = 1; s <= 12; s++) expect(SIGN_ELEMENT[s - 1], `sign ${s}`).toBe(cycle[(s - 1) % 4]);
    for (const e of cycle) expect(SIGN_ELEMENT.filter((x) => x === e)).toHaveLength(3);
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

  it("nakshatra main purusharthas match Sutton's column verbatim", () => {
    expect(NAKSHATRA_PURUSHARTHA).toHaveLength(27);
    // Ashwini..Dhanishta (with pada-less Abhijit=Kama implicitly before Shravana)
    // snake through the 8-cycle D·A·K·M·M·K·A·D…
    const SNAKE = ["Dharma", "Artha", "Kama", "Moksha", "Moksha", "Kama", "Artha", "Dharma"];
    for (let i = 0; i <= 20; i++) {
      expect(NAKSHATRA_PURUSHARTHA[i], NAKSHATRAS[i].name).toBe(SNAKE[i % 8]);
    }
    expect(NAKSHATRA_PURUSHARTHA[21]).toBe("Artha"); // Shravana (Abhijit takes the Kama slot)
    expect(NAKSHATRA_PURUSHARTHA[22]).toBe("Dharma"); // Dhanishta
    // …but Sutton's last four run M·K·A·D where dirah/Harness continue D·A·K·M —
    // her column is vendored verbatim (owner-directed); this pin stops a "fix".
    expect(NAKSHATRA_PURUSHARTHA.slice(23)).toEqual(["Moksha", "Kama", "Artha", "Dharma"]);
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

describe("navamsa (D9)", () => {
  it("elemental seeds match the classical movable/fixed/dual rule AND the continuous cycle", () => {
    for (let s = 1; s <= 12; s++) {
      const firstPart = navamsa((s - 1) * 30 + 0.1).sign;
      const classical =
        [1, 4, 7, 10].includes(s) ? s // movable: starts from itself
        : [2, 5, 8, 11].includes(s) ? ((s - 1 + 8) % 12) + 1 // fixed: from the 9th
        : ((s - 1 + 4) % 12) + 1; // dual: from the 5th
      expect(firstPart, `sign ${s} first navamsa`).toBe(classical);
    }
    for (let L = 0.05; L < 360; L += 1.7) {
      expect(navamsa(L).sign).toBe((Math.floor(L / (360 / 108)) % 12) + 1);
    }
  });

  it("expanded degree spans 0–30 within each 3°20′ part (mid-part = 15°)", () => {
    expect(navamsa(360 / 108 / 2).degree).toBeCloseTo(15, 6); // middle of Aries' first navamsa
    for (let L = 0.05; L < 360; L += 2.3) {
      const { degree } = navamsa(L);
      expect(degree).toBeGreaterThanOrEqual(0);
      expect(degree).toBeLessThan(30);
    }
  });
});

describe("saptavargaja vargas (reference spot checks)", () => {
  it("D2 hora: odd signs run forward, even signs mirrored (Udayashakti)", () => {
    expect(hora(5).sign).toBe(1); // Aries 1st half
    expect(hora(20).sign).toBe(2); // Aries 2nd half
    expect(hora(35).sign).toBe(4); // Taurus 1st half (even → 2N)
    expect(hora(50).sign).toBe(3); // Taurus 2nd half (even → 2N−1)
  });
  it("D3/D7/D12/D16 seeding matches the reference rules", () => {
    expect(drekkana(5).sign).toBe(1); // Aries 1st decanate → itself
    expect(drekkana(15).sign).toBe(5); // 2nd → +4 (Leo)
    expect(drekkana(25).sign).toBe(9); // 3rd → +8 (Sagittarius)
    expect(saptamsa(1).sign).toBe(1); // odd sign starts from self
    expect(saptamsa(31).sign).toBe(8); // even sign starts from the 7th
    expect(dwadasamsa(1).sign).toBe(1); // starts from self
    expect(dwadasamsa(29).sign).toBe(12); // last part → 12th from self
    expect(shodasamsa(0.5).sign).toBe(1); // movable → Aries
    expect(shodasamsa(30.5).sign).toBe(5); // fixed → Leo
    expect(shodasamsa(60.5).sign).toBe(9); // dual → Sagittarius
  });
});

describe("dasamsa (D10)", () => {
  it("odd signs count from self, even from the 9th, +1 per 3° part", () => {
    for (let s = 1; s <= 12; s++) {
      for (let part = 0; part < 10; part++) {
        const lon = (s - 1) * 30 + part * 3 + 0.1;
        const seed = s % 2 === 0 ? (s - 1 + 8) % 12 : s - 1;
        expect(dasamsa(lon).sign, `sign ${s} part ${part + 1}`).toBe(((seed + part) % 12) + 1);
      }
    }
  });
  it("expanded degree spans 0–30 within each 3° part", () => {
    expect(dasamsa(1.5).degree).toBeCloseTo(15, 6); // middle of Aries' first dasamsa
    for (let L = 0.05; L < 360; L += 2.3) {
      const { degree } = dasamsa(L);
      expect(degree).toBeGreaterThanOrEqual(0);
      expect(degree).toBeLessThan(30);
    }
  });
});

describe("trimsamsa (D30) — UNEQUAL Parashari portions, per the reference", () => {
  it("odd signs: 5/5/8/7/5° → Aries/Aquarius/Sagittarius/Gemini/Libra", () => {
    for (const s of [1, 3, 5, 7, 9, 11]) {
      const base = (s - 1) * 30;
      expect(trimsamsa(base + 2).sign, `sign ${s} 0–5°`).toBe(1);
      expect(trimsamsa(base + 7).sign, `sign ${s} 5–10°`).toBe(11);
      expect(trimsamsa(base + 14).sign, `sign ${s} 10–18°`).toBe(9);
      expect(trimsamsa(base + 21).sign, `sign ${s} 18–25°`).toBe(3);
      expect(trimsamsa(base + 27).sign, `sign ${s} 25–30°`).toBe(7);
    }
  });
  it("even signs: 5/7/8/5/5° → Taurus/Virgo/Pisces/Capricorn/Scorpio", () => {
    for (const s of [2, 4, 6, 8, 10, 12]) {
      const base = (s - 1) * 30;
      expect(trimsamsa(base + 2).sign, `sign ${s} 0–5°`).toBe(2);
      expect(trimsamsa(base + 9).sign, `sign ${s} 5–12°`).toBe(6);
      expect(trimsamsa(base + 15).sign, `sign ${s} 12–20°`).toBe(12);
      expect(trimsamsa(base + 22).sign, `sign ${s} 20–25°`).toBe(10);
      expect(trimsamsa(base + 27).sign, `sign ${s} 25–30°`).toBe(8);
    }
  });
  it("only the five non-luminary planetary signs ever appear (no Sun/Moon signs)", () => {
    // Trimsamsa belongs to the five tara grahas — Leo (Sun) and Cancer (Moon)
    // can never be a trimsamsa sign, the structural fingerprint of this varga.
    for (let L = 0.05; L < 360; L += 0.7) {
      const { sign } = trimsamsa(L);
      expect([1, 2, 3, 6, 7, 8, 9, 10, 11, 12]).toContain(sign);
    }
  });
  it("upper bounds are inclusive, per the reference (PyJHora convention)", () => {
    expect(trimsamsa(5).sign).toBe(1); // exactly 5° in an odd sign → still Aries
    expect(trimsamsa(30 + 12).sign).toBe(6); // exactly 12° in an even sign → still Virgo
  });
});

describe("shadbala", () => {
  /** Seven grahas, one per sign Aries→Libra, house = sign (Aries lagna). */
  const mkBodies = (mut?: (b: ShadbalaBody) => void): ShadbalaBody[] => {
    const keys: PlanetKey[] = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"];
    return keys.map((key, i) => {
      const lon = i * 30 + 5;
      const b: ShadbalaBody = {
        key, lon, sign: i + 1, house: i + 1, degreeValue: 5, retro: false, speed: 1,
      };
      mut?.(b);
      return b;
    });
  };

  it("total = sum of the six components; ratio = total/required; tables exact", () => {
    const out = computeShadbala(mkBodies(), 0);
    const NAISARGIKA = { sun: 60, moon: 51.43, venus: 42.86, jupiter: 34.28, mercury: 25.71, mars: 17.14, saturn: 8.57 };
    for (const [key, s] of Object.entries(out)) {
      const sum = s.sthana + s.dig + s.kala + s.chesta + s.naisargika + s.drik;
      expect(Math.abs(s.total - sum), `${key} total`).toBeLessThan(0.5); // per-component rounding
      expect(s.required, `${key} required`).toBe(SHADBALA_REQUIRED[key]);
      expect(s.ratio, `${key} ratio`).toBeCloseTo(s.total / s.required, 2);
      expect(s.naisargika, `${key} naisargika`).toBeCloseTo(NAISARGIKA[key as keyof typeof NAISARGIKA], 1);
    }
  });

  it("dig bala peaks (60) in the planet's best house and zeroes opposite", () => {
    const at = (house: number) =>
      computeShadbala(mkBodies((b) => { if (b.key === "sun") b.house = house; }), 0).sun!.dig;
    expect(at(10)).toBe(60); // Sun's best: the 10th
    expect(at(4)).toBe(0); // opposite house
  });

  it("retrograde grahas take full chesta (60)", () => {
    const out = computeShadbala(mkBodies((b) => { if (b.key === "mars") b.retro = true; }), 0);
    expect(out.mars!.chesta).toBe(60);
  });

  it("nathonnatha flips with day/night birth (Sun gains by day, Moon by night)", () => {
    const bodies = mkBodies();
    // sun lon 5: asc 100 → (5−100+360)%360 = 265 > 180 → day; asc 0 → 5 → night
    const day = computeShadbala(bodies, 100);
    const night = computeShadbala(bodies, 0);
    expect(day.sun!.kala - night.sun!.kala).toBeCloseTo(60, 1);
    expect(night.moon!.kala - day.moon!.kala).toBeCloseTo(60, 1);
    expect(day.mercury!.kala).toBeCloseTo(night.mercury!.kala, 1); // Mercury: 60 always
  });

  it("ishta/kashta are 0–60 geometric means of uchcha & chesta; parts sum to their components", () => {
    const out = computeShadbala(mkBodies(), 0);
    for (const [key, s] of Object.entries(out)) {
      expect(s.ishta, `${key} ishta`).toBeGreaterThanOrEqual(0);
      expect(s.ishta, `${key} ishta`).toBeLessThanOrEqual(60);
      expect(s.kashta, `${key} kashta`).toBeGreaterThanOrEqual(0);
      expect(s.kashta, `${key} kashta`).toBeLessThanOrEqual(60);
      expect(s.ishta, `${key} ishta identity`).toBeCloseTo(
        Math.sqrt(s.parts.uchcha * s.chesta), 0);
      const sthanaSum =
        s.parts.uchcha + s.parts.saptavargaja + s.parts.ojayugma + s.parts.kendradi + s.parts.drekkana;
      expect(Math.abs(s.sthana - sthanaSum), `${key} sthana = Σ parts`).toBeLessThan(0.5);
      const kalaSum = s.parts.nathonnatha + s.parts.paksha + s.parts.ayana;
      expect(Math.abs(s.kala - kalaSum), `${key} kala = Σ parts`).toBeLessThan(0.5);
    }
  });

  it("tierOf: +20% strong · ≥minimum adequate · within 10% below borderline · else weak", () => {
    expect(tierOf({ total: 360, required: 300 })).toBe("strong"); // exactly +20%
    expect(tierOf({ total: 300, required: 300 })).toBe("adequate"); // exactly at the bar
    expect(tierOf({ total: 359, required: 300 })).toBe("adequate");
    expect(tierOf({ total: 270, required: 300 })).toBe("borderline"); // exactly −10%
    expect(tierOf({ total: 269, required: 300 })).toBe("weak");
  });

  it("drik bala may be negative and is never produced for the nodes", () => {
    const out = computeShadbala(mkBodies(), 0);
    expect(out.rahu).toBeUndefined();
    expect(out.ketu).toBeUndefined();
    for (const s of Object.values(out)) expect(Math.abs(s.drik)).toBeLessThanOrEqual(52.5);
  });
});

describe("graha drishti", () => {
  it("the seven grahas aspect the 7th; specials are Mars 4/7/8, Jupiter 5/7/9, Saturn 3/7/10", () => {
    for (const p of SEVEN) expect(DRISHTI[p]).toContain(7);
    expect(DRISHTI.mars).toEqual([4, 7, 8]);
    expect(DRISHTI.jupiter).toEqual([5, 7, 9]);
    expect(DRISHTI.saturn).toEqual([3, 7, 10]);
  });

  it("nodes: Rahu casts 5/9 only, Ketu none — no 7th, so the nodes never aspect each other", () => {
    // Owner-chosen convention (the reference treats nodes as Jupiter 5/7/9) —
    // see the DRISHTI note in constants.ts before "fixing" this.
    expect(DRISHTI.rahu).toEqual([5, 9]);
    expect(DRISHTI.ketu).toEqual([]);
    // Rahu in Aries, Ketu opposite in Libra: neither lands an aspect on the other.
    const signs = { ...allSignsAt(1), ketu: 7 };
    expect(aspectsOnto(7, signs).map((a) => a.planet)).not.toContain("rahu");
    expect(aspectsOnto(1, signs).map((a) => a.planet)).not.toContain("ketu");
  });

  it("aspectsOnto resolves the special-aspect geometry (all bodies in Aries)", () => {
    const signs = allSignsAt(1);
    const onto = (s: number) => aspectsOnto(s, signs).map((a) => a.planet).sort();
    const sevenGrahas = [...SEVEN].sort();
    expect(onto(7)).toEqual(sevenGrahas); // 7th aspect — all grahas, but not the nodes
    expect(onto(1)).toEqual([]); // a body never aspects its own sign
    expect(onto(2)).toEqual([]); // no body has a 2nd-house drishti
    expect(onto(4)).toEqual(["mars"]); // Mars' 4th
    expect(onto(8)).toEqual(["mars"]); // Mars' 8th
    expect(onto(3)).toEqual(["saturn"]); // Saturn's 3rd
    expect(onto(10)).toEqual(["saturn"]); // Saturn's 10th
    expect(onto(5)).toEqual(["jupiter", "rahu"]); // 5th — Jupiter + Rahu (not Ketu)
    expect(onto(9)).toEqual(["jupiter", "rahu"]); // 9th — Jupiter + Rahu (not Ketu)
  });
});

describe("combustion", () => {
  it("orbs match the Combustion deck: Mercury 1°, Venus 8°, Mars/Jupiter/Saturn 10°", () => {
    // Owner-chosen (deck) values — the reference's wider Parashari orbs were
    // deliberately dropped; see the COMBUSTION_ORB note in constants.ts.
    expect(COMBUSTION_ORB).toEqual({ mercury: 1, venus: 8, mars: 10, jupiter: 10, saturn: 10 });
  });

  it("combust within the planet's own orb, clear beyond it", () => {
    expect(isCombust("mercury", 100, 100.5)).toBe(true); // 0.5° ≤ 1
    expect(isCombust("mercury", 100, 105)).toBe(false); // 5° > 1 — Mercury's tight orb
    expect(isCombust("venus", 359, 1)).toBe(true); // 2° across 0° ≤ 8
    expect(isCombust("venus", 100, 109)).toBe(false); // 9° > 8
    expect(isCombust("mars", 100, 109)).toBe(true); // 9° ≤ 10
  });

  it("only the five tara grahas combust — never Sun, Moon, or the nodes", () => {
    expect(isCombust("sun", 100, 100)).toBe(false); // the Sun cannot combust
    expect(isCombust("moon", 100, 100)).toBe(false); // the Moon is not counted
    expect(isCombust("rahu", 100, 100)).toBe(false); // nodes never combust
    expect(isCombust("ketu", 100, 100)).toBe(false);
  });
});

describe("gandanta", () => {
  it("flags the full junction padas — ±3°20′ around the three water→fire junctions", () => {
    // Two-tier owner scheme: flag = junction padas (reference orb), deep = the
    // 28°20′→1°40′ zone — see the GANDANTA_ORB note in constants.ts.
    for (const junction of [0, 120, 240]) {
      expect(gandantaOf(junction)).toMatchObject({ on: true, deep: true });
    }
    expect(gandantaOf(243).on).toBe(true); // 3° into Sagittarius ≤ 3°20′
    expect(gandantaOf(237).on).toBe(true); // 27° Scorpio — 3° before the junction
    expect(gandantaOf(244).on).toBe(false); // 4° → outside the pada
    expect(gandantaOf(115).on).toBe(false); // 5° before a junction → outside
    expect(gandantaOf(60).on).toBe(false); // mid-Taurus, far from any junction
  });

  it("deep band is ±1°40′ — the 28°20′→1°40′ 'true gandanta' zone", () => {
    expect(gandantaOf(241.5).deep).toBe(true); // 1°30′ ≤ 1°40′
    expect(gandantaOf(238.5).deep).toBe(true); // 28°30′ Scorpio — 1°30′ before
    expect(gandantaOf(242)).toMatchObject({ on: true, deep: false }); // 2° — flagged, not deep
  });
});

describe("panchadha maitri", () => {
  it("reads own-sign and omits the badge for node occupants", () => {
    const inLeo = allSignsAt(5); // everyone in Leo (ruled by the Sun)
    expect(maitriToDispositor("sun", inLeo)).toEqual({ dispositor: null, relation: "own_sign" });
    expect(maitriToDispositor("rahu", inLeo)).toEqual({ dispositor: "sun", relation: null });
  });
});

describe("functional nature (ASCENDANT_FUNCTIONAL)", () => {
  it("each lagna's benefics/neutrals/malefics exactly partition the seven grahas", () => {
    for (const row of ASCENDANT_FUNCTIONAL) {
      const all = [...row.benefics, ...row.neutrals, ...row.malefics];
      expect(all).toHaveLength(7); // no omissions, no double-listing
      expect([...all].sort()).toEqual([...SEVEN].sort());
    }
  });

  it("a yogakaraka, when present, is listed among that lagna's benefics", () => {
    for (const row of ASCENDANT_FUNCTIONAL) {
      if (row.yogakaraka) expect(row.benefics).toContain(row.yogakaraka);
    }
  });

  it("Taurus lagna: Sun is functionally NEUTRAL — owner-corrected, don't re-list as malefic", () => {
    const taurus = ASCENDANT_FUNCTIONAL[1];
    expect(taurus.neutrals).toContain("sun");
    expect(taurus.malefics).not.toContain("sun");
  });
});
