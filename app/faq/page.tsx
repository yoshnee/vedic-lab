import type { Metadata } from "next";
import { FaqPage } from "@/components/site/FaqPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQS } from "@/data/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Common questions about studying Vedic astrology with the Lab: how charts are calculated, why sidereal, privacy of your birth data, and more.",
  alternates: { canonical: "/faq" },
};

/* FAQPage structured data — built from the same FAQS the page renders, so the
   schema text always matches the visible answers (a Google requirement).
   Qualifies the page for the FAQ rich result in search. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.plain },
  })),
};

export default function Page() {
  return (
    <>
      <JsonLd data={faqJsonLd} />
      <FaqPage />
    </>
  );
}
