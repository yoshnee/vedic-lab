/* ============================================================
   ResourcesPage — the Resources route. Two sections: Books (study
   material) and "Behind the app" (the engines + references the
   calculations are built on). Data-driven: edit the arrays below.
   ============================================================ */
import { SITE } from "@/lib/site";
import { PageHero } from "./PageHero";

interface BookItem {
  tag: string;
  title: string;
  author: string;
  href: string;
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
    href: "https://www.amazon.com/Beginners-Guide-Astrology-Harshna-Chandolia/dp/9371002255",
  },
  {
    tag: "Foundation",
    title: "The Art & Science of Vedic Astrology: Foundation",
    author: "Ryan Kurczak & Richard Fish",
    href: "https://www.amazon.com/Art-Science-Vedic-Astrology-Foundation/dp/1475267657",
  },
  {
    tag: "Intermediate",
    title: "The Art & Science of Vedic Astrology: Intermediate",
    author: "Ryan Kurczak & Richard Fish",
    href: "https://www.amazon.com/Art-Science-Vedic-Astrology-Intermediate/dp/1493773119",
  },
  {
    tag: "Concepts",
    title: "Vedic Astrology for Beginners",
    author: "Pamela McDonough",
    href: "https://www.amazon.com/Vedic-Astrology-Beginners-Introduction-Concepts/dp/1646113071",
  },
  {
    tag: "Nakshatras",
    title: "The Nakshatras: The Stars Beyond the Zodiac",
    author: "Komilla Sutton",
    href: "https://www.amazon.com/Nakshatras-Stars-Beyond-Zodiac/dp/1902405927",
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
    name: "JHora · Jagannatha Hora",
    role: "Validation",
    desc: "P.V.R. Narasimha Rao's Jyotish software. A chart it computed serves as the ground-truth this engine's output was tested against during development — positions, nakshatras, dignities and the dasha tree.",
    href: "https://www.vedicastrologer.org/jh/",
    cta: "vedicastrologer.org",
  },
];

function Book({ b, i }: { b: BookItem; i: number }) {
  return (
    <a className="book" href={b.href} target="_blank" rel="noopener noreferrer">
      <span className="book-idx">{String(i + 1).padStart(2, "0")}</span>
      <span className="book-body">
        <span className="book-tag">{b.tag}</span>
        <span className="book-title">{b.title}</span>
        <span className="book-author">{b.author}</span>
      </span>
      <span className="book-go">Amazon ↗</span>
    </a>
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
        title="Backbone of The Vedic Lab"
      />

      <section className="res-section">
        <div className="res-head">
          <h2>Books</h2>
          <span className="res-sub">{BOOKS.length} titles to build a strong foundation</span>
        </div>
        <div className="res-list">
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
