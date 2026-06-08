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
        title="A study tool I built to stop dabbling and start learning Vedic astrology properly"
      />

      <article className="about">
        <p>
          I&apos;ve been circling Vedic Astrology i.e. <J />{" "}for a few years now, picking up
          pieces here and there through various forms, long before I&apos;d have called it
          &ldquo;studying.&rdquo; It&apos;s the kind of subject you can dabble in for years and
          still feel like you&apos;re standing at the very edge of it. <J /> is genuinely
          complex: an art and a science at the same time, layered and precise, with centuries of
          method behind all the concepts.
        </p>

        <p>
          Not long ago I decided to stop dabbling and start learning it properly. These days that
          means pulling from everything I can - YouTube, books, and, most of all, a teacher walking
          me through it.
        </p>

        <blockquote className="about-pull">
          <em>Jyotish </em> means the science of light, and that&apos;s the whole spirit of this lab.
        </blockquote>

        <p>
          Vedic Astrology Lab is where I put what I&apos;m learning to work. I built it as a study
          tool: somewhere to generate a chart and actually see the pieces. A place to learn it, one
          layer at a time. If it helps you do the same, even better.
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
