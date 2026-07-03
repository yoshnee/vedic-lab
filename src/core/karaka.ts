/* ============================================================
   karaka.ts — Jaimini Chara Karakas by the degree-ranking method
   (the Karakas deck's documented scheme).

   The seven planets are ranked by their degree WITHIN the occupied
   sign, highest first; Rahu & Ketu are excluded (the deck's 7-karaka
   scheme). Ties break on the finer arc — `degreeValue` is the full
   decimal degrees-in-sign, so a plain numeric sort already resolves
   minutes then seconds without a special case.

   The soul-role ladder runs Atmakaraka → Amatyakaraka → …; only the
   top two are surfaced for now (owner-directed — extend `roles` below
   to add the rest). Pure over the natal (D1) planet set: no ephemeris,
   no invented math, so it stays UI-free and testable.
   ============================================================ */
import type { PlanetData, PlanetKey } from "./types";

export type KarakaRole = "atmakaraka" | "amatyakaraka";

/** English label shown on the planet panel pill. */
export const KARAKA_LABELS: Record<KarakaRole, string> = {
  atmakaraka: "Atmakaraka",
  amatyakaraka: "Amatyakaraka",
};

/** Nodes never take a chara karaka in the 7-karaka scheme. */
const EXCLUDED: readonly PlanetKey[] = ["rahu", "ketu"];

/** Map the surfaced karaka roles to the planet that holds each (top two only). */
export function charaKarakas(planets: PlanetData[]): Partial<Record<PlanetKey, KarakaRole>> {
  const ranked = planets
    .filter((p) => !EXCLUDED.includes(p.key))
    .sort((a, b) => b.degreeValue - a.degreeValue); // highest degree-in-sign first
  const roles: Partial<Record<PlanetKey, KarakaRole>> = {};
  if (ranked[0]) roles[ranked[0].key] = "atmakaraka";
  if (ranked[1]) roles[ranked[1].key] = "amatyakaraka";
  return roles;
}
