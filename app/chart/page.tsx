import type { Metadata } from "next";
import { ChartRoute } from "@/components/chart/ChartRoute";

export const metadata: Metadata = {
  title: "Birth Chart",
  description: "Interactive North Indian D1 birth chart with nine planet detail panels.",
  alternates: { canonical: "/chart" },
  // Per-user, content-less without birth data (redirects home) — keep it out of
  // the index, but let crawlers follow its links. Matches robots.ts disallow.
  robots: { index: false, follow: true },
};

/* Server component (for metadata) → client <ChartRoute>, which renders the live
   ChartModel from the store or recomputes it from the persisted birth input. */
export default function ChartPage() {
  return <ChartRoute />;
}
