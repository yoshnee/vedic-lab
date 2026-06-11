/* ============================================================
   FaqPage — the FAQ route. Native <details> accordion (no JS state,
   keyboard-accessible). First item open by default. Data-driven.
   ============================================================ */
import type { ReactNode } from "react";
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
        No. All calculations run in your browser; your birth details are never sent to a server.
      </>
    ),
  },
  {
    q: "How are charts calculated?",
    a: (
      <>
        Swiss Ephemeris (via swisseph-wasm) for the astronomy, with the Lahiri ayanamsa and
        whole-sign houses, following the Hora Prakash reference for derived techniques.
      </>
    ),
  },
  {
    q: "Why might results differ from another site?",
    a: (
      <>
        Usually a different ayanamsa or house system, or different conventions (e.g. combustion
        orbs, node aspects). This site uses <em>sidereal</em> calculations for the zodiac — not
        tropical — with <em>Lahiri + whole-sign</em>. If you are convinced that there is a mistake,
        please feel free to reach out to get it fixed.
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
        Moon&apos;s place among them). For more on the debate, see{" "}
        <a href="https://astrosight.ai/blog/sidereal-vs-tropical-zodiac" target="_blank" rel="noopener noreferrer">
          this article
        </a>
        .
      </>
    ),
  },
  {
    q: "Is this professional advice?",
    a: (
      <>
        No. The Vedic Lab is a study tool for learning the concepts of Vedic astrology,
        built to be approachable for beginners.
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
        lede="How the charts are built, what happens to your data, and where this site sits among other tools."
      />

      <div className="faq-list">
        {FAQS.map((f, i) => (
          <FaqItem key={f.q} item={f} open={i === 0} />
        ))}
      </div>
    </main>
  );
}
