/* ============================================================
   FaqPage — the FAQ route. Native <details> accordion (no JS state,
   keyboard-accessible). First item open by default. Data-driven.
   ============================================================ */
import type { ReactNode } from "react";
import Link from "next/link";
import { PageHero } from "./PageHero";

interface Faq {
  q: string;
  a: ReactNode;
}

const FAQS: Faq[] = [
  {
    q: "Is my birth data stored anywhere?",
    a: (
      <>
        No. Everything runs in your browser. Your birth details never leave your device or touch a
        server. For more, read our <Link href="/privacy">Privacy Policy</Link>.
      </>
    ),
  },
  {
    q: "How are charts calculated?",
    a: (
      <>
        Swiss Ephemeris for the astronomy, Lahiri ayanamsa, whole-sign houses. For the full list of
        sources and references, see the <Link href="/resources">Resources</Link> tab.
      </>
    ),
  },
  {
    q: "Why might results differ from another site?",
    a: (
      <>
        Usually a different ayanamsa or house system, or different conventions like combustion orbs
        and node aspects. This site uses sidereal calculations (not tropical) with Lahiri and
        whole-sign houses. Convinced something&apos;s wrong? Reach out and we&apos;ll fix it.
      </>
    ),
  },
  {
    q: "Why sidereal and not tropical?",
    a: (
      <>
        Sidereal astrology anchors the zodiac to the actual fixed stars, so a chart reflects where
        the planets truly sit against the constellations, while the tropical zodiac has drifted
        about 24° off the real stars over the centuries. Jyotish itself is built on genuine stellar
        positions (its nakshatras are named after real stars, its dasha timing seeded from the
        Moon&apos;s place among them).
      </>
    ),
  },
  {
    q: "Is this professional advice?",
    a: (
      <>
        No. The Vedic Astrology Lab is a study tool for learning Jyotish, built to be approachable
        for beginners. See the <Link href="/about">About</Link> page to learn more.
      </>
    ),
  },
  {
    q: "Who built the Vedic Astrology Lab?",
    a: (
      <>
        A lifelong seeker, self-learning Jyotish like so many others. Read the full story on the{" "}
        <Link href="/about">About</Link> page, or come say hello at{" "}
        <a href="https://yoshnee-raveendran.com" target="_blank" rel="noopener noreferrer">
          yoshnee-raveendran.com
        </a>
        .
      </>
    ),
  },
];

function FaqItem({ item, open }: { item: Faq; open: boolean }) {
  return (
    <details className="faq" open={open}>
      <summary>
        <span className="faq-q">{item.q}</span>
        <span className="faq-mark" aria-hidden="true" />
      </summary>
      <div className="faq-a">
        <p>{item.a}</p>
      </div>
    </details>
  );
}

export function FaqPage() {
  return (
    <main className="page">
      <PageHero
        eyebrow="FAQ"
        title="Questions & answers"
      />

      <div className="faq-list">
        {FAQS.map((f, i) => (
          <FaqItem key={f.q} item={f} open={i === 0} />
        ))}
      </div>
    </main>
  );
}
