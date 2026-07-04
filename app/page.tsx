import type { Metadata } from "next";
import { HomeApp } from "@/components/home/HomeApp";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  // Absolute title overrides the "%s · Vedic Astrology Lab" template so the
  // landing page leads with the target keyword instead of the bare brand name.
  title: { absolute: "Study Vedic Astrology, One Flashcard at a Time | Vedic Astrology Lab" },
  description:
    "A free tool for self-learning Vedic astrology (Jyotish). Other tools render a chart and leave you alone. This one helps you study it, with flashcard decks for planets, houses, nakshatras and dashas built into an interactive birth chart.",
  alternates: { canonical: "/" },
};

/* Home structured data — an @graph tying together who publishes the site
   (Organization), the site itself (WebSite), and what it is (a free
   educational web app). Helps search engines understand the entity and can
   power a richer knowledge presentation. */
const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.liveUrl}/#organization`,
      name: SITE.owner,
      url: SITE.liveUrl,
      logo: `${SITE.liveUrl}/icon.svg`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.liveUrl}/#website`,
      name: SITE.name,
      url: SITE.liveUrl,
      description: "Study and explore Vedic astrology (Jyotish).",
      publisher: { "@id": `${SITE.liveUrl}/#organization` },
    },
    {
      "@type": "WebApplication",
      name: SITE.name,
      url: SITE.liveUrl,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires a modern browser with JavaScript enabled.",
      description:
        "An interactive study tool and birth-chart generator for learning Vedic astrology (Jyotish), with flashcard decks for planets, houses, signs, nakshatras and dashas.",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@id": `${SITE.liveUrl}/#organization` },
    },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={homeJsonLd} />
      <HomeApp />
    </>
  );
}
