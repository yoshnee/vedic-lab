/* ============================================================
   ResourcesPage — the Resources route. Two sections: Books (study
   material) and "Behind the app" (the engines + references the
   calculations are built on). Data-driven: edit the arrays below.
   ============================================================ */
import { type ReactNode } from "react";
import { SITE } from "@/lib/site";
import { diamond } from "@/celestial/celestial";
import { Svg } from "@/components/Svg";
import { PageHero } from "./PageHero";

interface BookItem {
  tag: string;
  title: string;
  href: string; // the title links here (Amazon, or the resource site)
  author?: string;
  authorUrl?: string; // author's own site, shown beside their name
  note: ReactNode;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

interface ToolItem {
  name: string;
  role: string;
  desc: string;
  href: string;
  cta: string;
}

const BOOKS: BookItem[] = [
  {
    tag: "Starting out",
    title: "A Beginner's Guide to Astrology",
    author: "Harshna Chandolia",
    authorUrl: "https://harshnachandolia.com/",
    href: "https://www.amazon.com/Beginners-Guide-Astrology-Harshna-Chandolia/dp/9371002255",
    note: "Harshna is my teacher, and I've had the privilege of learning the basics of Jyotish directly from her. Her teachings are rooted in the Vedas, and her understanding of the innate expressions of the planets is exceptional. She emphasizes the importance of yogas and dashas, the keys to understanding what is actually going on in a chart. As a millennial, she bridges ancient teaching with the world we live in today, making the tradition genuinely applicable to modern life.",
  },
  {
    tag: "Foundation & intermediate",
    title: "The Art & Science of Vedic Astrology",
    author: "Ryan Kurczak & Richard Fish",
    authorUrl: "https://ashevillevedicastrology.wordpress.com/",
    href: "https://www.amazon.com/Art-Science-Vedic-Astrology-Intermediate/dp/1493773119",
    note: (
      <>
        I&apos;ve been learning from Ryan&apos;s YouTube content for years. He offers a free{" "}
        <a
          className="book-why-link"
          href="https://youtube.com/playlist?list=PLoHfx_U4o06SYXKUgTmugg3VqYDsR1ud0&si=tBYxWIbd7qE3AFMl"
          target="_blank"
          rel="noopener noreferrer"
        >
          52-video Vedic astrology course
        </a>{" "}
        covering all the fundamentals, an exceptional resource for anyone starting out. Ryan has been
        practicing and teaching Vedic astrology for decades, and it shows: he is remarkably articulate
        and knowledgeable, especially when breaking down the nuances of putting all the pieces of a chart
        together. His understanding and emphasis on planetary strengths and dignities is like no other.
      </>
    ),
  },
  {
    tag: "Nakshatras",
    title: "The Nakshatras: The Stars Beyond the Zodiac",
    author: "Komilla Sutton",
    authorUrl: "https://komilla.com/",
    href: "https://www.amazon.com/Nakshatras-Stars-Beyond-Zodiac/dp/1902405927",
    note: "Komilla Sutton is a recognized authority in the field of Vedic astrology, having authored numerous books including work on the nakshatras, the lunar nodes, the panchanga, and the divisional charts, alongside decades of teaching, courses, and conferences worldwide. Her book on the nakshatras has given me a much deeper understanding of all 27 lunar mansions. The nakshatras are what truly set Vedic astrology apart: their mythology, and the way they color the expression of the planets, down to the padas and beyond.",
  },
  {
    tag: "Online reference",
    title: "Jagannath Hora",
    href: "https://jagannathhora.com/",
    author: "Parminder Chahal",
    authorUrl: "https://jagannathhora.com/",
    note: `My go-to for quick recaps, what I call "spark notes". When I need a fast refresher on the houses, zodiacs, or common beginner pitfalls, the articles here are written in a straightforward, easy-to-understand way that makes reviewing the fundamentals painless. A great complement to the deeper texts.`,
  },
];

const TOOLS: ToolItem[] = [
  {
    name: "Swiss Ephemeris",
    role: "Astronomy",
    desc: "The high-precision astronomy engine behind every chart — planetary positions run in your browser via swisseph-wasm.",
    href: "https://www.astro.com/swisseph/",
    cta: "astro.com",
  },
  {
    name: "Hora Prakash",
    role: "Algorithm",
    desc: "The classical reference followed for the derived techniques — the source for how the layers beyond raw positions are computed.",
    href: SITE.horaPrakashUrl,
    cta: "Reference",
  },
  {
    name: "JHora",
    role: "Validation",
    desc: "Jagannatha Hora (JHora), by P.V.R. Narasimha Rao, is the community gold standard for Jyotish computation. We took 23 well-known birth charts, computed them in JHora, then had our Vedic Astrology Lab engine recompute each one too, to be compared against JHora's output: planetary positions, signs, nakshatras, padas, and dasha dates. These comparisons run automatically on every build, so what is shipped is verified.",
    href: "https://www.vedicastrologer.org/jh/",
    cta: "vedicastrologer.org",
  },
];

const WHY_LABEL = "In my words";

function Book({ b, i }: { b: BookItem; i: number }) {
  return (
    <div className="book">
      <span className="book-idx">{String(i + 1).padStart(2, "0")}</span>
      <div className="book-body">
        <span className="book-tag">{b.tag}</span>
        <a className="book-title" href={b.href} target="_blank" rel="noopener noreferrer">
          {b.title}
        </a>
        {b.author && (
          <span className="book-author">
            {b.author}
            {b.authorUrl && (
              <a
                className="book-author-link"
                href={b.authorUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {hostOf(b.authorUrl)}
              </a>
            )}
          </span>
        )}
        <div className="book-why">
          <span className="book-why-label">{WHY_LABEL}</span>
          <p className="book-why-text">{b.note}</p>
        </div>
      </div>
    </div>
  );
}

function Tool({ t }: { t: ToolItem }) {
  return (
    <div className="tool">
      <div className="tool-main">
        <span className="tool-name">
          {t.name} <span className="tool-role">{t.role}</span>
        </span>
        <span className="tool-desc">{t.desc}</span>
      </div>
      <a className="tool-link" href={t.href} target="_blank" rel="noopener noreferrer">
        {t.cta} ↗
      </a>
    </div>
  );
}

export function ResourcesPage() {
  return (
    <main className="page">
      <PageHero
        eyebrow="Resources"
        title="Backbone of The Vedic Astrology Lab"
      />

      <section className="res-section">
        <div className="res-head">
          <h2>Books &amp; Resources</h2>
          <span className="res-sub">The texts and teachers this study tool is built from</span>
        </div>
        <div className="res-list">
          <a
            className="res-spotlight"
            href="https://www.amazon.com/s?k=Brihat+Parasara+Hora+Sastra+R+Santhanam"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Svg className="res-spotlight-mark" html={diamond(24, { glow: true })} />
            <span className="res-spotlight-body">
              <span className="res-spotlight-label">Foundational text</span>
              <span className="res-spotlight-title">Brihat Parashara Hora Shastra</span>
              <span className="res-spotlight-note">
                The fundamentals of Jyotish, studied through R. Santhanam&apos;s English translation.
              </span>
            </span>
          </a>
          {BOOKS.map((b, i) => (
            <Book key={b.title} b={b} i={i} />
          ))}
        </div>
      </section>

      <section className="res-section">
        <div className="res-head">
          <h2>Behind the app</h2>
          <span className="res-sub"> algorithms & mechanisms for computations </span>
        </div>
        <div className="tool-list">
          {TOOLS.map((t) => (
            <Tool key={t.name} t={t} />
          ))}
        </div>
      </section>
    </main>
  );
}
