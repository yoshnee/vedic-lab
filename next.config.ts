import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ─────────────────────────────────────────────────────────────────────────
  // RESERVED FOR THE ENGINE PHASE (Swiss Ephemeris / swisseph-wasm).
  // The WASM engine needs Cross-Origin Isolation (SharedArrayBuffer), which
  // requires these COOP/COEP headers. Fonts are self-hosted via next/font, so
  // enabling isolation will not break font loading. Left DISABLED for now —
  // there is no WASM yet, and enabling it early would constrain sub-resources
  // for no benefit. Uncomment when the birth-chart engine lands.
  //
  // async headers() {
  //   return [
  //     {
  //       source: "/:path*",
  //       headers: [
  //         { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  //         { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
  //       ],
  //     },
  //   ];
  // },
};

export default nextConfig;
