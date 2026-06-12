/* yoga.test.ts — Pancha Mahapurusha detection. The detector is a pure
   function of (planet, dignity, house); dignity here is derived through the
   engine's own validated dignityOf/tables (never re-stated), so these tests
   exercise the exact path computeChart feeds the detector. The rule source is
   the owner-provided Yogas deck card (the Hora-Prakash reference has no yoga
   module). */
import { describe, it, expect } from "vitest";
import {
  panchaMahapurusha, gajaKesari, budhaditya, venusMercuryConjunction, dhana2and11, neechaBhanga,
  computeYogas, MAHAPURUSHA,
} from "../yoga";
import { dignityOf } from "../vedic";
import { EXALTATION, OWN_SIGNS, PLANET_ORDER } from "../constants";
import type { PlanetKey } from "../types";

const FIVE: PlanetKey[] = ["mars", "mercury", "jupiter", "venus", "saturn"];
const NEVER: PlanetKey[] = ["sun", "moon", "rahu", "ketu"];
const KENDRAS = [1, 4, 7, 10];
const NON_KENDRAS = [2, 3, 5, 6, 8, 9, 11, 12];
const ALL_SIGNS = Array.from({ length: 12 }, (_, i) => i + 1);

/** A full sign map (everyone in Aries unless overridden) for computeYogas. */
const signsWith = (o: Partial<Record<PlanetKey, number>>) =>
  ({ ...Object.fromEntries(PLANET_ORDER.map((k) => [k, 1])), ...o }) as Record<PlanetKey, number>;
/** A full longitude map (everyone at 0° unless overridden) — the 0° default
    keeps Sun/Mercury at 0° separation, so Budhaditya never fires by accident. */
const lonsWith = (o: Partial<Record<PlanetKey, number>>) =>
  ({ ...Object.fromEntries(PLANET_ORDER.map((k) => [k, 0])), ...o }) as Record<PlanetKey, number>;

describe("MAHAPURUSHA table", () => {
  it("covers exactly the five non-luminaries with their named yogas", () => {
    expect(Object.keys(MAHAPURUSHA).sort()).toEqual([...FIVE].sort());
    expect(MAHAPURUSHA.mars?.name).toBe("Ruchaka Mahapurusha Yoga");
    expect(MAHAPURUSHA.mercury?.name).toBe("Bhadra Mahapurusha Yoga");
    expect(MAHAPURUSHA.jupiter?.name).toBe("Hamsa Mahapurusha Yoga");
    expect(MAHAPURUSHA.venus?.name).toBe("Malavya Mahapurusha Yoga");
    expect(MAHAPURUSHA.saturn?.name).toBe("Sasa Mahapurusha Yoga");
  });
});

describe("panchaMahapurusha", () => {
  it("forms for each of the five in own or exaltation sign, in every Kendra", () => {
    for (const planet of FIVE) {
      const qualifying = [...(OWN_SIGNS[planet] ?? []), EXALTATION[planet]!];
      for (const sign of qualifying) {
        const dignity = dignityOf(planet, sign);
        expect(["own", "exalted"]).toContain(dignity);
        for (const house of KENDRAS) {
          const yoga = panchaMahapurusha(planet, dignity, house);
          expect(yoga?.key).toBe(MAHAPURUSHA[planet]!.key);
          expect(yoga?.name).toBe(MAHAPURUSHA[planet]!.name);
          expect(yoga?.flashcard).toEqual({ type: "yoga", id: "pancha-mahapurusha" });
        }
      }
    }
  });

  it("never forms outside a Kendra, whatever the dignity", () => {
    for (const planet of FIVE) {
      for (const sign of ALL_SIGNS) {
        for (const house of NON_KENDRAS) {
          expect(panchaMahapurusha(planet, dignityOf(planet, sign), house)).toBeNull();
        }
      }
    }
  });

  it("never forms from friend/neutral/enemy/debilitated signs, even in a Kendra", () => {
    for (const planet of FIVE) {
      const qualifying = new Set([...(OWN_SIGNS[planet] ?? []), EXALTATION[planet]]);
      for (const sign of ALL_SIGNS.filter((s) => !qualifying.has(s))) {
        for (const house of KENDRAS) {
          expect(panchaMahapurusha(planet, dignityOf(planet, sign), house)).toBeNull();
        }
      }
    }
  });

  it("luminaries and nodes never form one, even exalted/own in a Kendra", () => {
    for (const planet of NEVER) {
      for (const sign of ALL_SIGNS) {
        for (const house of KENDRAS) {
          expect(panchaMahapurusha(planet, dignityOf(planet, sign), house)).toBeNull();
        }
      }
      // belt-and-braces: even if dignity were forced to qualifying values
      expect(panchaMahapurusha(planet, "exalted", 1)).toBeNull();
      expect(panchaMahapurusha(planet, "own", 10)).toBeNull();
    }
  });

  it("Mercury in Virgo (own AND exaltation) counts once — a single Bhadra", () => {
    const dignity = dignityOf("mercury", 6); // Virgo
    const yogas = computeYogas("mercury", {
      dignity, house: 1, signs: signsWith({ mercury: 6 }), longitudes: lonsWith({}), lagnaSign: 6,
    });
    expect(yogas).toHaveLength(1);
    expect(yogas[0].key).toBe("bhadra");
  });
});

describe("gajaKesari", () => {
  it("forms exactly when Jupiter sits 1/4/7/10 whole-sign from the Moon", () => {
    for (const moonSign of ALL_SIGNS) {
      for (const jupiterSign of ALL_SIGNS) {
        const position = ((jupiterSign - moonSign + 12) % 12) + 1;
        const yoga = gajaKesari(jupiterSign, moonSign);
        if (KENDRAS.includes(position)) {
          expect(yoga).toEqual({
            key: "gaja-kesari",
            name: "Gaja Kesari",
            flashcard: { type: "yoga", id: "gaja-kesari" },
          });
        } else {
          expect(yoga).toBeNull();
        }
      }
    }
  });

  it("conjunction (same sign) is the 1st-from-Moon case — included, no orb", () => {
    expect(gajaKesari(4, 4)?.key).toBe("gaja-kesari");
  });

  it("the frame is the Moon, not the Lagna — Lagna plays no part", () => {
    // Jupiter 7th from the Moon forms regardless of where any lagna would be
    expect(gajaKesari(10, 4)).not.toBeNull();
    // Jupiter 5th from the Moon (a trikona, not a kendra) never forms
    expect(gajaKesari(8, 4)).toBeNull();
  });
});

describe("budhaditya", () => {
  it("forms at 6°–14° separation INCLUSIVE in the same sign, both bounds in", () => {
    // Leo (sign 5, 120°–150°)
    expect(budhaditya(125, 131, 5, 5)?.key).toBe("budhaditya"); // exactly 6°
    expect(budhaditya(125, 139, 5, 5)?.key).toBe("budhaditya"); // exactly 14°
    expect(budhaditya(131, 125, 5, 5)?.key).toBe("budhaditya"); // order-independent
    expect(budhaditya(125, 135, 5, 5)?.flashcard).toEqual({ type: "yoga", id: "budhaditya" });
  });

  it("does not surface below 6° (effectively combust) or above 14° (looser form)", () => {
    expect(budhaditya(125, 130.5, 5, 5)).toBeNull(); // 5.5°: too close
    expect(budhaditya(125, 125, 5, 5)).toBeNull(); // exact conjunction
    expect(budhaditya(125, 139.5, 5, 5)).toBeNull(); // 14.5°: same sign, but the looser form
  });

  it("requires the same sign — a qualifying separation across a sign boundary is not the yoga", () => {
    expect(budhaditya(149, 157, 5, 6)).toBeNull(); // 8° apart, Leo vs Virgo
  });
});

describe("venusMercuryConjunction", () => {
  it("forms exactly when conjunct in the 2nd, 5th, 9th, or 11th from the lagna", () => {
    const lagna = 1;
    for (const sign of ALL_SIGNS) {
      const house = ((sign - lagna + 12) % 12) + 1;
      const yoga = venusMercuryConjunction(sign, sign, lagna);
      if ([2, 5, 9, 11].includes(house)) {
        expect(yoga).toEqual({
          key: "venus-mercury",
          name: "Venus & Mercury Conjunction",
          flashcard: { type: "yoga", id: "venus-mercury" },
        });
      } else {
        expect(yoga).toBeNull(); // kendras, trikona 1, dusthanas: conjunct but not surfaced
      }
    }
  });

  it("requires the same sign — adjacent signs never form it, whatever the houses", () => {
    expect(venusMercuryConjunction(2, 3, 1)).toBeNull();
    expect(venusMercuryConjunction(5, 11, 1)).toBeNull();
  });

  it("the house is counted from the frame's lagna", () => {
    expect(venusMercuryConjunction(6, 6, 5)).not.toBeNull(); // Virgo = 2nd from a Leo lagna
    expect(venusMercuryConjunction(6, 6, 6)).toBeNull(); // same conjunction, 1st from a Virgo lagna
  });
});

describe("dhana2and11", () => {
  // Aries lagna: L2 = Venus (Taurus 2nd), L11 = Saturn (Aquarius 11th)
  const LAGNA = 1;

  it("conjunction mode — any house qualifies, the relationship is the wealth", () => {
    const signs = signsWith({ venus: 3, saturn: 3 }); // conjunct in the 3rd, not a wealth house
    const yoga = dhana2and11("venus", signs, LAGNA);
    expect(yoga).toMatchObject({ key: "dhana-2-11", name: "Dhana Yoga", mode: "conjunction" });
    expect(yoga?.flashcard).toEqual({ type: "yoga", id: "dhana-2-11" });
  });

  it("mutual-aspect mode — both directions required, one-way is not enough", () => {
    // opposition: Venus in Taurus, Saturn in Scorpio → mutual 7th
    expect(dhana2and11("saturn", signsWith({ venus: 2, saturn: 8 }), LAGNA)?.mode).toBe("mutual-aspect");
    // one-way: Saturn in Aries casts its 3rd onto Gemini Venus; Venus's 7th (Sagittarius) misses Saturn
    expect(dhana2and11("saturn", signsWith({ venus: 3, saturn: 1 }), LAGNA)).toBeNull();
  });

  it("exchange mode — L2 in the 11th house, L11 in the 2nd (each in the other's sign)", () => {
    const signs = signsWith({ venus: 11, saturn: 2 }); // Venus in Aquarius (11th), Saturn in Taurus (2nd)
    expect(dhana2and11("venus", signs, LAGNA)?.mode).toBe("exchange");
  });

  it("dual lord skips the yoga — Leo lagna gives Mercury both the 2nd and the 11th", () => {
    expect(dhana2and11("mercury", signsWith({ mercury: 6 }), 5)).toBeNull();
  });

  it("non-lords never carry it", () => {
    const signs = signsWith({ venus: 3, saturn: 3 });
    expect(dhana2and11("mars", signs, LAGNA)).toBeNull();
    expect(dhana2and11("jupiter", signs, LAGNA)).toBeNull();
  });
});

describe("neechaBhanga", () => {
  const conditions = (yogas: ReturnType<typeof neechaBhanga>) => yogas.map((y) => y.condition);

  it("returns [] unless the planet is debilitated, and never for nodes", () => {
    expect(neechaBhanga("mars", dignityOf("mars", 10), signsWith({ mars: 10 }), 1)).toEqual([]); // exalted
    expect(neechaBhanga("mars", dignityOf("mars", 1), signsWith({ mars: 1 }), 1)).toEqual([]); // own
    expect(neechaBhanga("rahu", "neutral", signsWith({}), 1)).toEqual([]);
    expect(neechaBhanga("rahu", "debilitated", signsWith({}), 1)).toEqual([]); // defensive: yoga doesn't apply
  });

  it("rescuer table behaves per row — Sun in Libra: Venus C1, Mars C3, Saturn C5", () => {
    // each rescuer conjunct D, isolated (others parked in 3/5/9-ish neutral spots)
    const base = { sun: 7, moon: 12, venus: 3, mars: 5, saturn: 11, jupiter: 9, mercury: 9 };
    const lagna = 2; // Libra is 6th from lagna; from Moon (12) it's 8th — no stray kendras
    expect(conditions(neechaBhanga("sun", "debilitated", signsWith({ ...base, venus: 7 }), lagna))).toContain(1);
    expect(conditions(neechaBhanga("sun", "debilitated", signsWith({ ...base, mars: 7 }), lagna))).toContain(3);
    expect(conditions(neechaBhanga("sun", "debilitated", signsWith({ ...base, saturn: 7 }), lagna))).toContain(5);
  });

  it("C1 + C2 are separate pills — conjunct AND in a Kendra are different mechanisms", () => {
    // Saturn debilitated in Aries; Mars (dispositor) conjunct in Aries, which is also house 1 from the lagna
    const signs = signsWith({ saturn: 1, mars: 1, moon: 12, venus: 2, jupiter: 9, sun: 9, mercury: 9 });
    const yogas = neechaBhanga("saturn", dignityOf("saturn", 1), signs, 1);
    expect(conditions(yogas)).toEqual([1, 2]);
    expect(yogas.map((y) => y.tier)).toEqual(["major", "major"]);
    expect(yogas[1]).toMatchObject({
      key: "neecha-bhanga-c2",
      name: "Neecha Bhanga C2",
      flashcard: { type: "yoga", id: "neecha-bhanga-c2" },
    });
  });

  it("the Kendra frame is Lagna OR Moon — a Moon-only Kendra fires C2", () => {
    // Sun debilitated in Libra; Venus (dispositor) in Taurus: 2nd from lagna (no), 4th from Moon (yes)
    const signs = signsWith({ sun: 7, venus: 2, moon: 11, mars: 3, saturn: 4, jupiter: 9, mercury: 9 });
    expect(conditions(neechaBhanga("sun", "debilitated", signs, 1))).toEqual([2]);
  });

  it("debilitated Mercury skips C3/C4/C7 (the exaltation-lord is Mercury itself)", () => {
    // Jupiter (dispositor) and Venus (exalted occupant) both conjunct in Pisces
    const signs = signsWith({ mercury: 12, jupiter: 12, venus: 12, moon: 7, sun: 3, mars: 3, saturn: 3 });
    const yogas = neechaBhanga("mercury", dignityOf("mercury", 12), signs, 2);
    expect(conditions(yogas)).toEqual([1, 5]);
    expect(conditions(yogas)).not.toContain(3);
    expect(conditions(yogas)).not.toContain(4);
    expect(conditions(yogas)).not.toContain(7);
  });

  it("Moon in Scorpio: C5 can never fire (nothing exalts in Scorpio); aspect = minor tier", () => {
    // Mars (dispositor) in Aries casts its 8th onto Scorpio → C6 only
    const signs = signsWith({ moon: 8, mars: 1, venus: 9, sun: 3, mercury: 3, jupiter: 12, saturn: 3 });
    const yogas = neechaBhanga("moon", dignityOf("moon", 8), signs, 5);
    expect(conditions(yogas)).toEqual([6]);
    expect(yogas[0].tier).toBe("minor");
  });

  it("dedupe: debilitated Venus with Mercury conjunct collapses C1 + C5 into a single C1", () => {
    // Mercury is BOTH dispositor and exalted occupant for Venus in Virgo
    const signs = signsWith({ venus: 6, mercury: 6, jupiter: 3, moon: 5, sun: 12, mars: 12, saturn: 12 });
    const yogas = neechaBhanga("venus", dignityOf("venus", 6), signs, 1);
    expect(yogas).toHaveLength(1);
    expect(yogas[0]).toMatchObject({ condition: 1, tier: "major", key: "neecha-bhanga-c1" });
  });
});

describe("computeYogas", () => {
  const quiet = lonsWith({}); // Sun/Mercury at 0° separation: no Budhaditya
  it("returns [] when nothing forms, one entry per formed yoga otherwise", () => {
    // Jupiter 2nd from Moon: no Gaja Kesari; Saturn placed per its dignity, Venus
    // parked clear of Saturn so the 2/11-lord Dhana doesn't fire incidentally
    const noGk = signsWith({ jupiter: 2, moon: 1, saturn: 7, venus: 4 });
    expect(computeYogas("mars", { dignity: dignityOf("mars", 2), house: 1, signs: noGk, longitudes: quiet, lagnaSign: 2 })).toEqual([]);
    expect(computeYogas("mars", { dignity: dignityOf("mars", 10), house: 5, signs: noGk, longitudes: quiet, lagnaSign: 6 })).toEqual([]); // exalted but trikona
    const formed = computeYogas("saturn", { dignity: dignityOf("saturn", 7), house: 7, signs: noGk, longitudes: quiet, lagnaSign: 1 });
    expect(formed.map((y) => y.key)).toEqual(["sasa"]);
  });

  it("Gaja Kesari lands on BOTH participants, and only on them", () => {
    // Jupiter 4th from the Moon; Saturn parked away from Mars (the 2/11 lords for a Pisces lagna)
    const signs = signsWith({ jupiter: 1, moon: 10, saturn: 5 });
    const neutral = { dignity: "neutral" as const, house: 2, signs, longitudes: quiet, lagnaSign: 12 };
    expect(computeYogas("jupiter", neutral).map((y) => y.key)).toEqual(["gaja-kesari"]);
    expect(computeYogas("moon", neutral).map((y) => y.key)).toEqual(["gaja-kesari"]);
    expect(computeYogas("sun", neutral)).toEqual([]);
    expect(computeYogas("mars", neutral)).toEqual([]);
  });

  it("Budhaditya lands on BOTH the Sun and Mercury, and only on them", () => {
    const signs = signsWith({ sun: 5, mercury: 5 });
    const longitudes = lonsWith({ sun: 125, mercury: 133 }); // 8° apart in Leo
    const inp = { dignity: "neutral" as const, house: 3, signs, longitudes, lagnaSign: 3 };
    expect(computeYogas("sun", inp).map((y) => y.key)).toEqual(["budhaditya"]);
    expect(computeYogas("mercury", inp).map((y) => y.key)).toEqual(["budhaditya"]);
    expect(computeYogas("venus", inp)).toEqual([]);
  });

  it("a planet can stack yogas — exalted Jupiter conjunct the Moon in a Kendra forms Hamsa + Gaja Kesari", () => {
    const signs = signsWith({ jupiter: 4, moon: 4 }); // both in Cancer
    const jupiter = computeYogas("jupiter", { dignity: dignityOf("jupiter", 4), house: 1, signs, longitudes: quiet, lagnaSign: 4 });
    expect(jupiter.map((y) => y.key)).toEqual(["hamsa", "gaja-kesari"]);
    const moon = computeYogas("moon", { dignity: dignityOf("moon", 4), house: 1, signs, longitudes: quiet, lagnaSign: 4 });
    expect(moon.map((y) => y.key)).toEqual(["gaja-kesari"]); // own-sign Moon, but no Moon Mahapurusha
  });

  it("Mercury can stack Bhadra + Budhaditya — own-sign Virgo in a Kendra, 7° from the Sun", () => {
    const signs = signsWith({ sun: 6, mercury: 6 }); // both in Virgo
    const longitudes = lonsWith({ sun: 155, mercury: 162 });
    const mercury = computeYogas("mercury", { dignity: dignityOf("mercury", 6), house: 10, signs, longitudes, lagnaSign: 9 });
    expect(mercury.map((y) => y.key)).toEqual(["bhadra", "budhaditya"]);
    const sun = computeYogas("sun", { dignity: dignityOf("sun", 6), house: 10, signs, longitudes, lagnaSign: 9 });
    expect(sun.map((y) => y.key)).toEqual(["budhaditya"]); // the Sun forms no Mahapurusha
  });

  it("Venus & Mercury Conjunction lands on BOTH participants, and stacks with Budhaditya", () => {
    // Venus, Mercury, and the Sun all in Taurus, the 2nd from an Aries lagna;
    // Sun 8° from Mercury → Mercury carries Budhaditya + the Dhana conjunction
    const signs = signsWith({ venus: 2, mercury: 2, sun: 2, jupiter: 3 }); // Jupiter 3rd from the Moon: no Gaja Kesari noise
    const longitudes = lonsWith({ sun: 35, mercury: 43, venus: 50 });
    const inp = { dignity: "neutral" as const, house: 2, signs, longitudes, lagnaSign: 1 };
    expect(computeYogas("venus", inp).map((y) => y.key)).toEqual(["venus-mercury"]);
    expect(computeYogas("mercury", inp).map((y) => y.key)).toEqual(["budhaditya", "venus-mercury"]);
    expect(computeYogas("moon", inp)).toEqual([]);
  });

  it("Dhana 2/11 lands on BOTH lords, and only on them", () => {
    // Aries lagna: Venus (L2) and Saturn (L11) conjunct in Gemini; Jupiter parked to avoid Gaja Kesari noise
    const signs = signsWith({ venus: 3, saturn: 3, jupiter: 2 });
    const inp = { dignity: "neutral" as const, house: 3, signs, longitudes: quiet, lagnaSign: 1 };
    expect(computeYogas("venus", inp).map((y) => y.key)).toEqual(["dhana-2-11"]);
    expect(computeYogas("saturn", inp).map((y) => y.key)).toEqual(["dhana-2-11"]);
    expect(computeYogas("mars", inp)).toEqual([]);
  });

  it("Neecha Bhanga rides alongside other yogas — debilitated Moon with Jupiter in a Moon-Kendra", () => {
    // Moon in Scorpio (debilitated) with Jupiter 7th from it → Gaja Kesari + NB pills together;
    // Mars (dispositor) conjunct the Moon in Scorpio → C1, and Scorpio is a lagna-Kendra → C2
    const signs = signsWith({ moon: 8, jupiter: 2, mars: 8, venus: 12, sun: 3, mercury: 3, saturn: 6 });
    const moon = computeYogas("moon", { dignity: dignityOf("moon", 8), house: 1, signs, longitudes: quiet, lagnaSign: 8 });
    expect(moon.map((y) => y.key)).toEqual(["gaja-kesari", "neecha-bhanga-c1", "neecha-bhanga-c2"]);
  });
});
