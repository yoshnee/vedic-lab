"use client";

/* ============================================================
   Svg.tsx — the bridge between the celestial art module (which
   returns SVG markup strings) and React.

   dangerouslySetInnerHTML is safe here: every input is generated
   internally by celestial.ts from a fixed palette and numeric sizes.
   No user-supplied or network data ever reaches this component.

   suppressHydrationWarning: celestial.ts mints unique gradient/filter
   ids from a module-level counter, so server- and client-generated
   markup can differ in those id numbers. The art is decorative
   (aria-hidden) and each SVG's ids are internally self-consistent, so
   the difference is cosmetic — we silence the hydration check for it.
   ============================================================ */

export function Svg({ html, className }: { html: string; className?: string }) {
  return (
    <span
      className={className}
      aria-hidden="true"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
