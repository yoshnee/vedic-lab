/* Copy the swisseph-wasm runtime assets into public/wasm/ so they are served
   same-origin at /wasm/* (required under COOP/COEP cross-origin isolation, and
   the path our patched swisseph-wasm `locateFile` points at — see
   patches/swisseph-wasm+0.0.5.patch). Runs as `predev` + `prebuild`, so it works
   in local dev and on the Vercel build. public/wasm/ is gitignored. */
import { mkdirSync, copyFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "swisseph-wasm", "wasm");
const dest = join(root, "public", "wasm");
const files = ["swisseph.wasm", "swisseph.data"];

mkdirSync(dest, { recursive: true });
for (const f of files) {
  const from = join(src, f);
  const to = join(dest, f);
  copyFileSync(from, to);
  console.log(`copied ${f} (${(statSync(to).size / 1024 / 1024).toFixed(1)} MB) → public/wasm/${f}`);
}
