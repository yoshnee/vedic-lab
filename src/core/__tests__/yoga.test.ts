/* yoga.test.ts — Pancha Mahapurusha detection. The detector is a pure
   function of (planet, dignity, house); dignity here is derived through the
   engine's own validated dignityOf/tables (never re-stated), so these tests
   exercise the exact path computeChart feeds the detector. The rule source is
   the owner-provided Yogas deck card (the Hora-Prakash reference has no yoga
   module). */
import { describe, it, expect } from "vitest";
import {
  panchaMahapurusha, gajaKesari, budhaditya, venusMercuryConjunction, dhana2and11, grahana,
  neechaBhanga, computeYogas, MAHAPURUSHA,
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

describe("grahana", () => {
  it("forms on a shared sign with intensity graded by orb — never gated by it", () => {
    // Leo (sign 5, 120°–150°)
    const at = (lum: number, node: number) =>
      grahana("sun", "rahu", signsWith({ sun: 5, rahu: 5 }), lonsWith({ sun: lum, rahu: node }));
    expect(at(125, 130)?.intensity).toBe("purna"); // exactly 5°: within five
    expect(at(125, 130.5)?.intensity).toBe("strong"); // 5.5°
    expect(at(125, 135)?.intensity).toBe("strong"); // exactly 10°
    expect(at(121, 149)?.intensity).toBe("mild"); // 28° apart, still the same sign — still forms
    expect(at(125, 127)).toMatchObject({
      key: "grahana-sun-rahu",
      name: "Grahana",
      flashcard: { type: "yoga", id: "grahana-sun-rahu" },
    });
  });

  it("is sign-based — a tight orb across a sign boundary is NOT the yoga", () => {
    // Sun 29° Leo, Ketu 1° Virgo: 2° apart, different signs
    expect(grahana("sun", "ketu", signsWith({ sun: 5, ketu: 6 }), lonsWith({ sun: 149, ketu: 151 }))).toBeNull();
  });

  it("covers all four luminary–node pairs", () => {
    const signs = signsWith({ moon: 9, ketu: 9 });
    const lons = lonsWith({ moon: 245, ketu: 252 });
    expect(grahana("moon", "ketu", signs, lons)?.key).toBe("grahana-moon-ketu");
  });
});

describe("neechaBhanga", () => {
  const rules = (yogas: ReturnType<typeof neechaBhanga>) => yogas.map((y) => y.condition);

  it("returns [] unless the planet is debilitated, and never for nodes", () => {
    expect(neechaBhanga("mars", dignityOf("mars", 10), signsWith({ mars: 10 }), 1)).toEqual([]); // exalted
    expect(neechaBhanga("mars", dignityOf("mars", 1), signsWith({ mars: 1 }), 1)).toEqual([]); // own
    expect(neechaBhanga("rahu", "neutral", signsWith({}), 1)).toEqual([]);
    expect(neechaBhanga("rahu", "debilitated", signsWith({}), 1)).toEqual([]); // defensive: yoga doesn't apply
  });

  it("R1: the debilitation-sign lord in a Kendra from the Lagna", () => {
    // Sun debilitated in Libra (7); dispositor Venus in Cancer (4) = 4th from an Aries lagna.
    // Venus in Cancer neither conjuncts nor opposes Libra, so R3 stays quiet.
    const signs = signsWith({ sun: 7, venus: 4, moon: 11, mars: 3, saturn: 9, jupiter: 9, mercury: 9 });
    expect(rules(neechaBhanga("sun", "debilitated", signs, 1))).toEqual([1]);
  });

  it("R1 counts a Moon-only Kendra, not just the Lagna", () => {
    // Sun debilitated in Libra; Venus (dispositor) in Taurus (2): 2nd from lagna (no), 4th from Moon in Aquarius (11) → yes
    const signs = signsWith({ sun: 7, venus: 2, moon: 11, mars: 3, saturn: 4, jupiter: 6, mercury: 6 });
    expect(rules(neechaBhanga("sun", "debilitated", signs, 1))).toEqual([1]);
  });

  it("R2: the exaltation-sign lord in a Kendra", () => {
    // Sun debilitated in Libra; Sun exalts in Aries → exalt-lord Mars in Capricorn (10) = 10th from lagna,
    // aspecting nothing onto Libra. Dispositor Venus parked in Scorpio (no Kendra, no exchange).
    const signs = signsWith({ sun: 7, mars: 10, venus: 8, moon: 12, saturn: 3, jupiter: 3, mercury: 3 });
    expect(rules(neechaBhanga("sun", "debilitated", signs, 1))).toEqual([2]);
  });

  it("R3: conjunct by the dispositor is one rule, one pill (id r3), no tier field", () => {
    // Saturn debilitated in Aries; Mars (dispositor) conjunct in Aries. Lagna 5 so Aries isn't a Kendra.
    const signs = signsWith({ saturn: 1, mars: 1, moon: 8, venus: 3, jupiter: 6, sun: 6, mercury: 6 });
    const yogas = neechaBhanga("saturn", dignityOf("saturn", 1), signs, 5);
    expect(rules(yogas)).toEqual([3]);
    expect(yogas[0]).toMatchObject({
      key: "neecha-bhanga-r3",
      name: "Neecha Bhanga R3",
      flashcard: { type: "yoga", id: "neecha-bhanga-r3" },
    });
    expect(yogas[0]).not.toHaveProperty("tier");
  });

  it("R3 fires on aspect alone — Moon in Scorpio, Mars in Aries casts its 8th onto Scorpio", () => {
    const signs = signsWith({ moon: 8, mars: 1, venus: 3, sun: 6, mercury: 6, jupiter: 6, saturn: 6 });
    expect(rules(neechaBhanga("moon", dignityOf("moon", 8), signs, 5))).toEqual([3]);
  });

  it("R4: parivartana — the dispositor sits in a sign the debilitated planet rules", () => {
    // Saturn debilitated in Aries; Mars (Aries lord) in Aquarius, which Saturn rules → exchange.
    // Mars in Aquarius is in no Kendra here and aspects nothing onto Aries, so only R4 fires.
    const signs = signsWith({ saturn: 1, mars: 11, venus: 8, moon: 6, sun: 4, mercury: 4, jupiter: 4 });
    expect(rules(neechaBhanga("saturn", dignityOf("saturn", 1), signs, 3))).toEqual([4]);
  });

  it("debilitated Mercury: R2 never fires (its exaltation-lord is Mercury itself)", () => {
    // Jupiter (dispositor) conjunct Mercury in Pisces → R3 only; the exalt-lord half is skipped
    const signs = signsWith({ mercury: 12, jupiter: 12, moon: 5, venus: 3, sun: 7, mars: 7, saturn: 7 });
    const yogas = neechaBhanga("mercury", dignityOf("mercury", 12), signs, 2);
    expect(rules(yogas)).toEqual([3]);
    expect(rules(yogas)).not.toContain(2);
  });

  it("surfaces multiple pills when multiple rules fire (R1 + R3)", () => {
    // Saturn debilitated in Aries; Mars (dispositor) conjunct in Aries AND Aries is house 1 (a Kendra)
    const signs = signsWith({ saturn: 1, mars: 1, venus: 2, moon: 12, sun: 5, mercury: 5, jupiter: 5 });
    const yogas = neechaBhanga("saturn", dignityOf("saturn", 1), signs, 1);
    expect(rules(yogas)).toEqual([1, 3]);
    expect(yogas.map((y) => y.key)).toEqual(["neecha-bhanga-r1", "neecha-bhanga-r3"]);
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
    // Jupiter 4th from the Moon; Saturn parked away from Mars (the 2/11 lords for a
    // Pisces lagna); the nodes parked off the luminaries so no Grahana noise
    const signs = signsWith({ jupiter: 1, moon: 10, saturn: 5, rahu: 6, ketu: 12 });
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
    // Jupiter 3rd from the Moon (no Gaja Kesari noise); nodes off the luminaries (no Grahana noise)
    const signs = signsWith({ venus: 2, mercury: 2, sun: 2, jupiter: 3, rahu: 5, ketu: 11 });
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

  it("Grahana lands on BOTH participants — and a new-moon triple gives the node two pills", () => {
    // Sun, Moon, and Rahu all in Cancer (the card's combination 5); Ketu opposite in Capricorn
    const signs = signsWith({ sun: 4, moon: 4, rahu: 4, ketu: 10, jupiter: 10 });
    const longitudes = lonsWith({ sun: 95, moon: 99, rahu: 102, ketu: 282 });
    const inp = { dignity: "neutral" as const, house: 2, signs, longitudes, lagnaSign: 3 };
    expect(computeYogas("sun", inp).map((y) => y.key)).toEqual(["grahana-sun-rahu"]);
    expect(computeYogas("moon", inp).map((y) => y.key)).toEqual(["gaja-kesari", "grahana-moon-rahu"]); // Jupiter 7th from the Moon
    expect(computeYogas("rahu", inp).map((y) => y.key)).toEqual(["grahana-sun-rahu", "grahana-moon-rahu"]);
    expect(computeYogas("ketu", inp)).toEqual([]); // the opposite node shares no luminary's sign
  });

  it("Neecha Bhanga rides alongside other yogas — debilitated Moon with Jupiter in a Moon-Kendra", () => {
    // Moon in Scorpio (debilitated) with Jupiter 7th from it → Gaja Kesari + NB pills together;
    // Mars (dispositor) conjunct the Moon in Scorpio → R3, and Scorpio is a lagna-Kendra → R1
    const signs = signsWith({ moon: 8, jupiter: 2, mars: 8, venus: 12, sun: 3, mercury: 3, saturn: 6 });
    const moon = computeYogas("moon", { dignity: dignityOf("moon", 8), house: 1, signs, longitudes: quiet, lagnaSign: 8 });
    expect(moon.map((y) => y.key)).toEqual(["gaja-kesari", "neecha-bhanga-r1", "neecha-bhanga-r3"]);
  });
});
