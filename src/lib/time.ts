/* ============================================================
   time.ts — DST-aware timezone helpers (Luxon).

   A birth chart needs the UTC offset *at the birth instant*, not "now":
   historical DST rules vary by year and place, so a hardcoded offset
   drifts older charts. Luxon's DateTime.fromObject({...}, { zone })
   interprets the components as wall-clock time in the IANA zone and
   exposes the correct offset directly.
   ============================================================ */
import { DateTime } from "luxon";

/** A small fallback list for the rare engine without Intl.supportedValuesOf. */
const FALLBACK_ZONES = [
  "UTC",
  "Asia/Kolkata",
  "Asia/Kathmandu",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Australia/Sydney",
];

/** Build a zoned DateTime from civil date ("YYYY-MM-DD") + time ("HH:mm").
    Falls back to noon when time is absent, and to "now" when date is absent. */
function zoned(zone: string, date?: string, time?: string): DateTime {
  if (date) {
    const [y, m, d] = date.split("-").map(Number);
    const [hh, mm] = (time || "12:00").split(":").map(Number);
    return DateTime.fromObject(
      { year: y, month: m, day: d, hour: hh || 0, minute: mm || 0 },
      { zone },
    );
  }
  return DateTime.now().setZone(zone);
}

/** True if the string is a valid IANA zone Luxon can resolve. */
export function isValidZone(zone: string): boolean {
  return !!zone && DateTime.now().setZone(zone).isValid;
}

/** DST-aware UTC offset in HOURS (e.g. 5.5 for Asia/Kolkata), or null if the
    zone is invalid. This is the number the engine's birthFromCivil() wants. */
export function utcOffsetHours(
  zone: string,
  date?: string,
  time?: string,
): number | null {
  const dt = zoned(zone, date, time);
  return dt.isValid ? dt.offset / 60 : null;
}

/** "UTC+05:30" / "UTC−05:00" for the confirmed-place card (typographic minus
    to match the design). Empty string for an invalid zone. */
export function formatUtcOffset(
  zone: string,
  date?: string,
  time?: string,
): string {
  const dt = zoned(zone, date, time);
  if (!dt.isValid) return "";
  const off = dt.offset; // minutes, DST-aware
  const sign = off >= 0 ? "+" : "−";
  const abs = Math.abs(off);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `UTC${sign}${hh}:${mm}`;
}

/** Full IANA zone list for the manual fallback <select> (zero-dependency). */
export function timeZoneList(): string[] {
  try {
    if (typeof Intl.supportedValuesOf === "function") {
      return Intl.supportedValuesOf("timeZone");
    }
  } catch {
    /* fall through to the fallback list */
  }
  return FALLBACK_ZONES;
}
