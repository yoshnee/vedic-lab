/* ============================================================
   PageHero — the shared header block for the content routes
   (About / Resources / FAQ): a gold diamond eyebrow, the page title,
   and a lede. Keeps the three pages visually in lockstep.
   ============================================================ */
import type { ReactNode } from "react";
import { diamond } from "@/celestial/celestial";
import { Svg } from "@/components/Svg";

export function PageHero({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
}) {
  return (
    <header className="page-hero">
      <span className="page-eyebrow">
        <Svg html={diamond(20, { glow: true })} />
        {eyebrow}
      </span>
      <h1 className="page-title">{title}</h1>
      {lede != null && <p className="page-lede">{lede}</p>}
    </header>
  );
}
