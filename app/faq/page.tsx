import type { Metadata } from "next";
import { FaqPage } from "@/components/site/FaqPage";

export const metadata: Metadata = {
  title: "FAQ",
  description: "How the charts are built, what happens to your data, and where this site sits among other tools.",
};

export default function Page() {
  return <FaqPage />;
}
