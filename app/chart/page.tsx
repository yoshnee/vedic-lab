import type { Metadata } from "next";
import { ChartRoute } from "@/components/chart/ChartRoute";

export const metadata: Metadata = {
  title: "Birth Chart",
  description: "Interactive North Indian D1 birth chart with nine planet detail panels.",
};

/* Server component (for metadata) → client <ChartRoute>, which renders the live
   ChartModel from the store or recomputes it from the persisted birth input. */
export default function ChartPage() {
  return <ChartRoute />;
}
