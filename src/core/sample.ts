/* ============================================================
   sample.ts — a fixed sample birth so /chart always renders while the
   user-facing birth-details input popup is a separate later build.

   Uses Mahatma Gandhi's birth (2 Oct 1869, 07:?? — JHora records 08:40
   LMT +05:30, Porbandar), which the engine is validated against in
   core/__validate__. Clearly an illustrative sample, not the user's chart.
   ============================================================ */
import type { BirthInput } from "./types";
import { birthFromCivil } from "./index";

export function sampleBirth(): Promise<BirthInput> {
  return birthFromCivil({
    year: 1869, month: 10, day: 2,
    hour: 8, minute: 40, second: 0,
    tzOffsetHours: 5.5,
    lat: 21.633333, lon: 69.6,
    dateLabel: "2 October 1869 · 08:40 (UT+5:30)",
    placeLabel: "Porbandar, India",
  });
}
