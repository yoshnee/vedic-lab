/* ============================================================
   Footer — the global site footer, shared by every route.
   Brand + tagline, an Explore column, and an Open-source column whose
   GitHub repository link + "Licensed AGPL-3.0." must stay present and
   visible (AGPL-3.0 compliance). Mounted once in app/layout.tsx.
   ============================================================ */
import Link from "next/link";
import { diamond } from "@/celestial/celestial";
import { Svg } from "@/components/Svg";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-foot">
      <div className="site-foot-inner">
        <div className="foot-brand">
          <Link className="foot-brand-top" href="/">
            <Svg className="foot-mark" html={diamond(32, { glow: true })} />
            <span className="foot-name">{SITE.name}</span>
          </Link>
          <p className="foot-tag">Learn the science of light.</p>
        </div>

        <nav className="foot-col" aria-label="Explore">
          <span className="foot-h">Explore</span>
          <Link href="/about">About</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/faq">FAQ</Link>
        </nav>

        <div className="foot-col">
          <span className="foot-h">Open source</span>
          <a href={SITE.repoUrl} target="_blank" rel="noopener noreferrer">
            GitHub repository ↗
          </a>
          <span className="foot-lic">Licensed AGPL-3.0.</span>
        </div>
      </div>

      <div className="site-foot-base">
        <span>© {SITE.year} {SITE.owner}</span>
      </div>
    </footer>
  );
}
