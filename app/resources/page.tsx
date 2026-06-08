import type { Metadata } from "next";
import { ResourcesPage } from "@/components/site/ResourcesPage";

export const metadata: Metadata = {
  title: "Resources",
  description: "The books I'm studying, and the engines and references the calculations are built on.",
};

export default function Page() {
  return <ResourcesPage />;
}
