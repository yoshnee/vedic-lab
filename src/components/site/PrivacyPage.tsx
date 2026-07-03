/* ============================================================
   PrivacyPage: the /privacy route. A plain-language privacy policy
   for a client-side study tool: no accounts, no backend, your data
   stays in your browser. Static content; no client JS.

   Reuses the shared content-page classes (PageHero + .about prose +
   the .res-section / .res-head section pattern) so it needs no new
   CSS. Owner copy, edit freely; no em-dashes (house style).
   ============================================================ */
import { PageHero } from "./PageHero";
import { SITE } from "@/lib/site";

/** External link, opens in a new tab. */
function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className="about-link" href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export function PrivacyPage() {
  return (
    <main className="page">
      <PageHero
        eyebrow="Privacy"
        title="Privacy Policy"
        lede="The short version: this is a study tool that runs entirely in your browser. There are no accounts, and your birth details and notes stay on your device."
      />

      <div className="about">
        <p><span className="muted">Last updated 2 July 2026.</span></p>

        <section className="res-section">
          <div className="res-head"><h2>Runs in your browser</h2></div>
          <p>
            Vedic Astrology Lab is a client-side study tool. There is no login and no server that
            collects or stores your information. Your chart is generated on your own device, and the
            birth details you enter, along with any notes you write, stay in your browser.
          </p>
        </section>

        <section className="res-section">
          <div className="res-head"><h2>What is stored on your device</h2></div>
          <p>
            A few things are saved in your browser so the app works and remembers where you left
            off: the birth details you last entered, the reading notes you write on a chart, and
            small preferences such as whether you have already seen the guided instructions. This stays on
            your device and is never sent to us. You can remove all of it at any time by clearing
            this site&apos;s data in your browser.
          </p>
        </section>

        <section className="res-section">
          <div className="res-head"><h2>What leaves your browser</h2></div>
          <p>Only a few features reach beyond your device, and only when you use them:</p>
          <p>
            <strong>Place search.</strong> When you look up a birth place, the text you type is sent
            to the Open-Meteo geocoding service, which returns coordinates and a timezone. See{" "}
            <Ext href="https://open-meteo.com/en/terms">Open-Meteo&apos;s terms and privacy</Ext>.
          </p>
          <p>
            <strong>Voice dictation (optional).</strong> If you tap the microphone on a note,
            transcription uses your browser&apos;s built-in speech recognition. Recent versions of
            Chrome can do this on your device; other browsers may send the audio to their own speech
            service to transcribe it. It runs only while you are actively dictating.
          </p>
          <p>
            <strong>Usage analytics.</strong> We use Vercel Web Analytics to see which pages are
            visited. It is privacy-friendly and cookieless, records only aggregate, anonymized
            visits, and never includes your name, birth details, or notes. It does not track you
            across other websites. See{" "}
            <Ext href="https://vercel.com/legal/privacy-policy">Vercel&apos;s privacy policy</Ext>.
          </p>
          <p>
            <strong>Hosting.</strong> The site is served by Vercel. As with any web host, its
            servers handle the basic technical data needed to deliver a page, such as your IP
            address and request details.
          </p>
        </section>

        <section className="res-section">
          <div className="res-head"><h2>What we do not do</h2></div>
          <p>
            No accounts. No advertising. No tracking cookies. We do not sell or share your
            information, and your chart and notes are never stored on a server.
          </p>
        </section>

        <section className="res-section">
          <div className="res-head"><h2>Children</h2></div>
          <p>
            This site is not intended for children. Please do not enter personal details if you are
            under the age of digital consent where you live.
          </p>
        </section>

        <section className="res-section">
          <div className="res-head"><h2>Open source, changes, and contact</h2></div>
          <p>
            The entire app is open source under the AGPL-3.0 license, so you can read exactly what it
            does and how it handles data on <Ext href={SITE.repoUrl}>GitHub</Ext>. We may update this
            policy as the app evolves; the date above marks the latest version. Questions are welcome
            at <Ext href="https://yoshnee-raveendran.com">yoshnee-raveendran.com</Ext>.
          </p>
        </section>
      </div>
    </main>
  );
}
