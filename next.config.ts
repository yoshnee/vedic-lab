import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ─────────────────────────────────────────────────────────────────────────
  // Cross-Origin Isolation for the swisseph-wasm engine (SharedArrayBuffer).
  // Required GLOBALLY because the engine runs on the home page too (compute runs
  // on the birth-modal submit, before navigating to /chart). Fonts are self-hosted
  // via next/font and the WASM assets are served same-origin from /wasm/, so
  // isolation is safe. Cross-origin geocoding (Open-Meteo) is a CORS fetch, which
  // is permitted under COEP require-corp.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
};

export default nextConfig;
