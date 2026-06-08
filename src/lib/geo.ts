/* ============================================================
   geo.ts — place search backed by the Open-Meteo Geocoding API
   (free, no API key). Replaces the prototype's mock GEO_PLACES.

   GET https://geocoding-api.open-meteo.com/v1/search
       ?name={q}&count=8&language=en&format=json

   The API returns each result's IANA `timezone` directly, so there's
   no separate timezone lookup. `results` is omitted entirely when there
   are no matches. AbortError is re-thrown so a cancelled request is
   never mistaken for "no results".
   ============================================================ */

const ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";

/** Raw Open-Meteo result item (only the fields we consume are listed). */
export interface OpenMeteoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string; // IANA, e.g. "Asia/Kolkata" — always present
  country?: string;
  country_code?: string;
  admin1?: string; // region / state (optional)
  admin2?: string;
  population?: number;
}

interface OpenMeteoResponse {
  results?: OpenMeteoResult[];
  generationtime_ms?: number;
}

/** Normalized suggestion the UI renders. */
export interface PlaceSuggestion {
  id: number;
  name: string; // city name only (for the bolded primary line)
  region: string; // admin1, may be ""
  country: string; // may be ""
  label: string; // "Bengaluru, Karnataka, India"
  latitude: number;
  longitude: number;
  timezone: string; // IANA
}

/** Compose the "City, Region, Country" display label. */
export function placeLabel(parts: {
  name: string;
  region?: string;
  country?: string;
}): string {
  return [parts.name, parts.region, parts.country].filter(Boolean).join(", ");
}

/**
 * Search places by name. Pass an AbortSignal so the caller can cancel a
 * stale in-flight request. Returns [] when there are no matches; re-throws
 * AbortError (do not swallow it — a stale resolve must not render empties
 * over a fresher search).
 */
export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<PlaceSuggestion[]> {
  const q = query.trim();
  if (!q) return [];

  const url = `${ENDPOINT}?name=${encodeURIComponent(q)}&count=8&language=en&format=json`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);

  const data = (await res.json()) as OpenMeteoResponse;
  if (!data.results) return [];

  return data.results.map((r) => ({
    id: r.id,
    name: r.name,
    region: r.admin1 ?? "",
    country: r.country ?? "",
    label: placeLabel({ name: r.name, region: r.admin1, country: r.country }),
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
  }));
}

/** "18.9400° N, 72.8300° E" — ported from the prototype's GEO_FMT. */
export function formatCoords(lat: number, lon: number): string {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${ns}, ${Math.abs(lon).toFixed(4)}° ${ew}`;
}
