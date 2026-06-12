/* ============================================================
   karaka.ts — Jaimini chara karakas (the Karakas deck is the spec; the
   Hora-Prakash reference has no karaka module). The seven classical planets
   are ranked by the degrees travelled within their sign (longitude mod 30,
   FULL precision — the fractional part already carries minutes and seconds,
   so the numeric comparison IS the classical degrees→minutes→seconds
   tiebreak). Rahu and Ketu are always excluded.

   Surfaced designations (owner-directed): rank 1 = Atmakaraka, rank 2 =
   Amatyakaraka, rank 7 (lowest) = Darakaraka. The middle ranks (Bhratri/
   Matri/Putra/Gnati) are in the deck but not pinned to panels — add them
   here when wanted.

   A NATAL-D1 property: computed once from the natal longitudes and carried
   on PlanetData.karaka; varga panels null it (never recomputed per chart
   type). Pure function — a transit/varga caller COULD feed it other
   longitudes, but the product deliberately doesn't.
   ============================================================ */
import type { PlanetKey, KarakaRef } from "./types";

const SEVEN: PlanetKey[] = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"];

const REF = (key: KarakaRef["key"], name: string): KarakaRef => ({
  key,
  name,
  flashcard: { type: "karaka", id: key },
});

/** Per-planet chara-karaka designation (only the three surfaced ones; the
    other four planets get no entry). */
export function charaKarakas(
  longitudes: Record<PlanetKey, number>,
): Partial<Record<PlanetKey, KarakaRef>> {
  const ranked = SEVEN.map((p) => ({ p, deg: ((longitudes[p] % 30) + 30) % 30 })).sort(
    (a, b) => b.deg - a.deg,
  );
  return {
    [ranked[0].p]: REF("atmakaraka", "Atmakaraka"),
    [ranked[1].p]: REF("amatyakaraka", "Amatyakaraka"),
    [ranked[6].p]: REF("darakaraka", "Darakaraka"),
  };
}
