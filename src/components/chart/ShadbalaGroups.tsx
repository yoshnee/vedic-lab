"use client";

/* ============================================================
   ShadbalaGroups.tsx — the "Shadbala Groupings" section: the seven planets as
   three functional teams (survival → comfort → achievement) that share
   responsibilities, so a weak planet's group-mates can compensate. Copy is
   the owner's, verbatim, from data/shadbalaGroups.ts.

   Strength layer: each planet row shows its Shadbala total (rupas) and
   whether it sits above or below its own BPHS minimum — reusing the existing
   PlanetData.shadbala totals + required thresholds, nothing recomputed. A
   below-minimum planet is marked, and its group-mates carry a "shares the
   load" chip — DATA AND GROUPING ONLY, no verdict; the reading stays with
   the user. When shadbala isn't on the dataset (varga panel context — a
   rasi-only system), the strength rows drop out and the groupings render
   statically: just the teams and the copy.
   ============================================================ */
import { Svg } from "@/components/Svg";
import { body } from "@/celestial/celestial";
import { SHADBALA_GROUPS, SHADBALA_GROUPS_FOOTER } from "@/data/shadbalaGroups";
import type { PlanetData, PlanetKey } from "@/core/types";

export function ShadbalaGroups({ planets }: { planets: PlanetData[] }) {
  const byKey = new Map(planets.map((p) => [p.key, p]));

  return (
    <section className="sbg-card" aria-label="Shadbala groupings">
      <header className="sbg-head">
        <span className="sbg-eyebrow">Shadbala Groupings</span>
      </header>
      <div className="sbg-groups">
        {SHADBALA_GROUPS.map((g) => {
          const members = g.planets
            .map((key) => byKey.get(key))
            .filter((p): p is PlanetData => !!p);
          const weak = new Set<PlanetKey>(
            members
              .filter((p) => p.shadbala && p.shadbala.total < p.shadbala.required)
              .map((p) => p.key),
          );
          return (
            <article className="sbg-group" key={g.id}>
              <header className="sbg-group-head">
                <span className="sbg-group-label">{g.label}</span>
                <span className="sbg-group-title">{g.title}</span>
                <span className="sbg-tagline">{g.tagline}</span>
              </header>
              {members.some((p) => p.shadbala) && (
                <ul className="sbg-rows">
                  {members.map((p) => {
                    const sb = p.shadbala;
                    if (!sb) return null;
                    const below = sb.total < sb.required;
                    const mateBelow = weak.size > 0 && !weak.has(p.key);
                    return (
                      <li className="sbg-row" key={p.key} data-below={below || undefined}>
                        <span className="sbg-ico"><Svg html={body(p.key, 22)} /></span>
                        <span className="sbg-name">{p.name}</span>
                        <span className="sbg-val">
                          {(sb.total / 60).toFixed(2)} rupas
                          <span className="sbg-min" data-below={below || undefined}>
                            {below ? "below" : "above"} minimum ({(sb.required / 60).toFixed(2)})
                          </span>
                        </span>
                        {mateBelow && <span className="sbg-chip">shares the load</span>}
                      </li>
                    );
                  })}
                </ul>
              )}
              {g.lines.map((line, i) => (
                <p className="sbg-line" key={i}>{line}</p>
              ))}
            </article>
          );
        })}
      </div>
      <p className="sbg-footer">{SHADBALA_GROUPS_FOOTER}</p>
    </section>
  );
}
