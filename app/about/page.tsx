import type { Metadata } from "next";
import { AboutPage } from "@/components/site/AboutPage";

export const metadata: Metadata = {
  title: "About",
  description: "Why I built Vedic Astrology Lab — a study tool for learning Jyotish, one layer at a time.",
};

export default function Page() {
  return <AboutPage />;
}
