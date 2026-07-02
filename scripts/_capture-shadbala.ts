import { rawPositions } from "../src/core/swisseph";
import { signOf, houseOf, degInSign } from "../src/core/vedic";
import { computeShadbala, type ShadbalaBody } from "../src/core/shadbala";
import { sampleBirth } from "../src/core/sample";

const GRAHAS = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"] as const;

async function main() {
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
  const out = computeShadbala(bodies, raw.ascendant, raw.ayanamsa);

  const frozen = {
    ascendant: raw.ascendant,
    ayanamsa: raw.ayanamsa,
    longitudes: Object.fromEntries(GRAHAS.map((k) => [k, raw.longitudes[k]])),
    speeds: Object.fromEntries(GRAHAS.map((k) => [k, raw.speeds[k]])),
  };
  console.log("=== FROZEN INPUTS ===");
  console.log(JSON.stringify(frozen, null, 2));
  console.log("=== OUTPUT ===");
  console.log(JSON.stringify(out, null, 2));
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
