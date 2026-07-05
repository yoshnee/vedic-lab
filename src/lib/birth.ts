/* ============================================================
   birth.ts — the birth-details domain shape the popup collects, plus
   the mapper onto the engine's seam.

   `BirthDetails` keeps the IANA zone (richer / future-proof). `toEngineCivil`
   computes the DST-aware offset and emits the exact argument object that
   src/core/index.ts `birthFromCivil()` consumes — so the /chart side can
   call the engine with no further mapping. The popup persists this under
   BIRTH_DETAILS_KEY in sessionStorage as the cross-feature handoff.
   ============================================================ */
import { utcOffsetHours } from "./time";
import type { ChartStyle } from "./chart/types";

export interface BirthPlace {
  label: string; // resolved display label, or the manual label
  latitude: number;
  longitude: number;
  timezone: string; // IANA zone
  source: "geocode" | "manual";
}

export interface BirthDetails {
  name?: string;
  date: string; // "YYYY-MM-DD" from <input type="date">
  time: string; // "HH:mm" from <input type="time">
  place: BirthPlace;
  chartStyle: ChartStyle; // North diamond vs South grid, picked in the modal
}

/** The shape src/core/index.ts `birthFromCivil()` accepts (+ optional name,
    which the engine ignores but the chart can use for a title). */
export interface EngineCivilBirth {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  tzOffsetHours: number; // DST-aware, at the birth instant
  lat: number;
  lon: number;
  dateLabel: string;
  placeLabel?: string;
  name?: string;
  ianaTz?: string; // carried for chart meta; ignored by the engine
  chartStyle?: ChartStyle; // display choice; carried for /chart, ignored by the engine
}

/** sessionStorage key the /chart route reads to pick up the entered birth. */
export const BIRTH_DETAILS_KEY = "vedic:birthDetails";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "14 Jan 1990, 05:30" */
export function formatDateLabel(date: string, time: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const month = MONTHS[m - 1] ?? "?";
  return `${d} ${month} ${y}, ${time}`;
}

/** Map collected details onto the engine's civil-birth argument. */
export function toEngineCivil(details: BirthDetails): EngineCivilBirth {
  const { date, time, place } = details;
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return {
    year,
    month,
    day,
    hour,
    minute,
    tzOffsetHours: utcOffsetHours(place.timezone, date, time) ?? 0,
    lat: place.latitude,
    lon: place.longitude,
    dateLabel: formatDateLabel(date, time),
    placeLabel: place.label,
    name: details.name?.trim() || undefined,
    ianaTz: place.timezone,
    chartStyle: details.chartStyle,
  };
}
