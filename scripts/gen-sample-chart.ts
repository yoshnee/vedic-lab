/* Precompute the fixed sample (Gandhi) chart with the validated engine and write
   it to src/core/sample-chart.json. The /chart page renders this JSON, so no
   Swiss Ephemeris WASM ships to the browser in this phase. Re-run after engine
   changes:  npx --yes tsx scripts/gen-sample-chart.ts
   (Live client-side compute lands with the separate birth-details input build.) */
import { writeFileSync } from "fs";
import { computeChart } from "../src/core/index";
import { sampleBirth } from "../src/core/sample";

async function main() {
  const birth = await sampleBirth();
  const chart = await computeChart(birth, new Date());
  const out = new URL("../src/core/sample-chart.json", import.meta.url);
  writeFileSync(out, JSON.stringify(chart, null, 2) + "\n");
  const sat = chart.planets.find((p) => p.key === "saturn");
  console.log(
    `wrote sample-chart.json — Lagna ${chart.ascendant.signName} ${chart.ascendant.degree}, ` +
      `lagna lord ${chart.lagnaLord}, ${chart.planets.length} planets, ` +
      `current dasha ${chart.currentDasha.chain.join(" → ")}, ` +
      `sade-sati periods ${sat?.extraRows[0]?.type === "sadesati" ? sat.extraRows[0].periods.length : 0}`,
  );
}
main().catch((e) => { console.error(e); process.exit(1); });
