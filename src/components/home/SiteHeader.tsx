"use client";

/* ============================================================
   SiteHeader — the global sticky top nav, shared by every route.
   Brand mark + wordmark on the left, primary nav on the right with
   the active route highlighted (resolved from the pathname). Home
   returns to the landing page; About / Resources / FAQ are their own
   routes. Mounted once in app/layout.tsx.
   ============================================================ */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { diamond } from "@/celestial/celestial";
import { Svg } from "@/components/Svg";
import { SITE } from "@/lib/site";

/* The brand mark (top-left) returns to the landing page; Flashcards / About /
   Resources / FAQ are their own routes. (No "Home" tab, owner-directed: the
   logo is the home affordance.) */
const SITE_NAV = [
  { label: "Flashcards", href: "/flashcards" },
  { label: "About", href: "/about" },
  { label: "Resources", href: "/resources" },
  { label: "FAQ", href: "/faq" },
] as const;

/* Each content route lights up its own tab; the landing page and the live
   /chart route have no active tab (the brand mark is the home affordance). */
function activeLabel(pathname: string): string | null {
  if (pathname === "/flashcards") return "Flashcards";
  if (pathname === "/about") return "About";
  if (pathname === "/resources") return "Resources";
  if (pathname === "/faq") return "FAQ";
  return null;
}

export function SiteHeader() {
  const active = activeLabel(usePathname() ?? "/");

  return (
    <header className="site-nav">
      <Link className="site-brand" href="/" aria-label={`${SITE.name} — home`}>
        <Svg className="site-brand-mark" html={diamond(28, { glow: true })} />
        <span className="site-brand-name">{SITE.name}</span>
      </Link>
      <nav className="site-links" aria-label="Primary">
        {SITE_NAV.map((n) => {
          const isActive = n.label === active;
          return (
            <Link
              key={n.label}
              className={"site-link" + (isActive ? " is-active" : "")}
              href={n.href}
              aria-current={isActive ? "page" : undefined}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
