import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/* Engine tests run in Node (the swisseph-wasm engine loads the same way the
   dev validator does under tsx). The "@/..." alias mirrors tsconfig so tests
   can import engine modules the same way the app does. */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    testTimeout: 30_000, // WASM init + 23 charts; generous headroom
  },
});
