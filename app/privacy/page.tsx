import type { Metadata } from "next";
import { PrivacyPage } from "@/components/site/PrivacyPage";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Vedic Astrology Lab handles your data: a client-side study tool with no accounts, where your birth details and notes stay in your browser.",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return <PrivacyPage />;
}
