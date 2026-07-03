/* ============================================================
   Footer — the global site footer, shared by every route.
   Brand + tagline, and a single inline nav row (FAQ · Privacy · GitHub
   repository). "Licensed AGPL-3.0." sits on the base bar beside the
   copyright. The repo link and the license must stay present and visible
   (AGPL-3.0 compliance). Mounted once in app/layout.tsx.
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

        <nav className="foot-links" aria-label="Footer">
          <Link href="/faq">FAQ</Link>
          <Link href="/privacy">Privacy</Link>
          <a href={SITE.repoUrl} target="_blank" rel="noopener noreferrer">
            GitHub repository ↗
          </a>
        </nav>
      </div>

      <div className="site-foot-base">
        <span>© {SITE.year} {SITE.owner}. All rights reserved.</span>
        <span className="foot-lic">Licensed AGPL-3.0.</span>
      </div>
    </footer>
  );
}
