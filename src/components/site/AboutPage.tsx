/* ============================================================
   AboutPage — the About route. Personal essay. "Jyotish" is rendered
   italic + gold via <J/> (.jyotish). Static content; no client JS.
   ============================================================ */
import { PageHero } from "./PageHero";

/* italic + gold "Jyotish" */
function J() {
  return <em className="jyotish">Jyotish</em>;
}

export function AboutPage() {
  return (
    <main className="page">
      <PageHero
        eyebrow="About"
        title="Why I built this tool"
      />

      <article className="about">
        <p>
          I&apos;ve been circling sidereal Vedic Astrology i.e. <J />{" "}for a few years now, picking up
          pieces here and there through various forms, long before I&apos;d have called it
          &ldquo;studying.&rdquo; It&apos;s the kind of subject you can dabble in for years and
          still feel like you&apos;re standing at the very edge of it. <J /> is genuinely
          complex: an art and a science at the same time, layered and precise, with centuries of
          method behind all the concepts.
        </p>

        <p>
          Not long ago I decided to stop dabbling and start learning it properly. These days that
          means pulling from everything I can: books, YouTube, and most of all, a teacher walking
          me through the basics.
        </p>

        <blockquote className="about-pull">
          <em>Jyotish </em> means the science of light, and that&apos;s the whole spirit of the Vedic Astrology Lab.
        </blockquote>

        <p>
          I came to <J /> wanting to understand myself. What I found is a body of knowledge so vast
          that the studying never really ends. The Lab is my study desk made public. A chart on one
          side, flashcards and notes on the other, so every session builds the foundation instead of
          scattering it.
        </p>

        <p className="about-close">
          If you&apos;re on the same path, I hope it serves your study as well as it serves mine.
        </p>

        <div className="about-sign">
          <p>
            Come say hello at{" "}
            <a
              className="about-link"
              href="https://yoshnee-raveendran.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              yoshnee-raveendran.com
            </a>
          </p>
        </div>
      </article>
    </main>
  );
}
