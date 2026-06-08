"use client";

/* ============================================================
   PlaceField — the "Place of birth" autocomplete (ported from
   design-reference/birth-modal/birth-modal.jsx, place section).

   States: empty search → typing (debounced) → searching → suggestions
   → confirmed card (geocoded pick), plus a manual lat/lon/timezone
   fallback. The parent owns the resolved `BirthPlace | null`; this field
   reports it via onChange. Search is backed by Open-Meteo (src/lib/geo).

   A11y: editable combobox with list-autocomplete — focus stays on the
   input, ArrowUp/Down move aria-activedescendant, Enter selects, options
   are role="option" + tabIndex=-1 (mouse-selectable, Tab-skipped). The
   container's blur (relatedTarget check) dismisses the list, so tabbing
   away closes it without the blur-before-click race.

   `searching` / `no matches` / `error` are DERIVED at render from
   (debounced query vs the last-resolved query) — the search effect only
   calls setState inside its async callbacks, never synchronously.
   ============================================================ */
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { searchPlaces, formatCoords, type PlaceSuggestion } from "@/lib/geo";
import { formatUtcOffset, isValidZone, timeZoneList } from "@/lib/time";
import type { BirthPlace } from "@/lib/birth";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { icons } from "./birthIcons";

interface ManualVals {
  label: string;
  lat: string;
  lon: string;
  tz: string;
}
const EMPTY_MANUAL: ManualVals = { label: "", lat: "", lon: "", tz: "" };

/** Bold the typed substring within a suggestion's city name. */
function highlight(text: string, q: string): ReactNode {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <b>{text.slice(i, i + q.length)}</b>
      {text.slice(i + q.length)}
    </>
  );
}

function manualValid(m: ManualVals): boolean {
  const lat = parseFloat(m.lat);
  const lon = parseFloat(m.lon);
  return (
    m.lat.trim() !== "" &&
    m.lon.trim() !== "" &&
    m.tz !== "" &&
    Number.isFinite(lat) &&
    Math.abs(lat) <= 90 &&
    Number.isFinite(lon) &&
    Math.abs(lon) <= 180 &&
    isValidZone(m.tz)
  );
}

function manualToPlace(m: ManualVals): BirthPlace {
  return {
    label: m.label.trim() || "Custom location",
    latitude: parseFloat(m.lat),
    longitude: parseFloat(m.lon),
    timezone: m.tz,
    source: "manual",
  };
}

export function PlaceField({
  value,
  onChange,
  date,
  time,
  showError,
  onTouch,
}: {
  value: BirthPlace | null;
  onChange: (place: BirthPlace | null) => void;
  date: string;
  time: string;
  showError: boolean;
  onTouch?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [manual, setManual] = useState(false);
  const [manualVals, setManualVals] = useState<ManualVals>(EMPTY_MANUAL);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searchedQuery, setSearchedQuery] = useState(""); // query the suggestions/error belong to
  const [errored, setErrored] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debounced = useDebounce(query, 300);
  const searchRef = useRef<HTMLInputElement>(null);
  const pendingFocus = useRef(false);
  const listId = "bd-place-list";

  const zones = useMemo(() => timeZoneList(), []);

  /* debounced search — only setState inside the async callbacks (the
     "searching/empty/error" surface is derived at render). Aborts the
     in-flight request on every keystroke and on unmount. */
  useEffect(() => {
    const q = debounced.trim();
    if (q.length < 2 || value) return;
    const ctrl = new AbortController();
    let cancelled = false;
    searchPlaces(q, ctrl.signal)
      .then((rows) => {
        if (cancelled) return;
        setSuggestions(rows);
        setSearchedQuery(q);
        setErrored(false);
        setActiveIndex(-1);
      })
      .catch((e: unknown) => {
        if (cancelled || (e as Error)?.name === "AbortError") return;
        setSuggestions([]);
        setSearchedQuery(q);
        setErrored(true);
        setActiveIndex(-1);
      });
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [debounced, value]);

  /* focus the search input after a Change / Clear (never on mount) */
  useEffect(() => {
    if (pendingFocus.current && searchRef.current) {
      searchRef.current.focus();
      pendingFocus.current = false;
    }
  });

  const typed = query.trim();
  const dq = debounced.trim();
  const settled = searchedQuery === dq; // last-resolved query matches the current one
  const loading = typed.length >= 2 && !settled; // typing pause or fetch in flight
  const visible = settled && !errored ? suggestions : [];
  const showResults = focused && !manual && !value && typed.length >= 2;

  const resetSearch = () => {
    setSuggestions([]);
    setSearchedQuery("");
    setErrored(false);
    setActiveIndex(-1);
  };

  const pick = (p: PlaceSuggestion) => {
    onChange({
      label: p.label,
      latitude: p.latitude,
      longitude: p.longitude,
      timezone: p.timezone,
      source: "geocode",
    });
    setQuery(p.label);
    setFocused(false);
    resetSearch();
    onTouch?.();
  };

  const clear = () => {
    setQuery("");
    resetSearch();
    onChange(null);
    pendingFocus.current = true;
  };

  const changePlace = () => {
    onChange(null);
    setQuery("");
    setManual(false);
    resetSearch();
    setFocused(true);
    pendingFocus.current = true;
  };

  const enterManual = () => {
    setManual(true);
    setFocused(false);
    resetSearch();
    onChange(null);
  };

  const exitManual = () => {
    setManual(false);
    setManualVals(EMPTY_MANUAL);
    onChange(null);
  };

  const setManualField = (patch: Partial<ManualVals>) => {
    const next = { ...manualVals, ...patch };
    setManualVals(next);
    onChange(manualValid(next) ? manualToPlace(next) : null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showResults) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, visible.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && visible[activeIndex]) {
        e.preventDefault();
        pick(visible[activeIndex]);
      }
    } else if (e.key === "Escape") {
      // dismiss the list without closing the whole modal
      e.stopPropagation();
      setFocused(false);
      setActiveIndex(-1);
    }
  };

  const errMsg = (() => {
    if (value) return null;
    if (!showError) return null;
    if (manual) return "Enter a valid latitude, longitude & timezone";
    if (typed) return "Choose a place from the list";
    return "Enter your place of birth";
  })();

  const liveText = !showResults
    ? ""
    : loading
      ? "Searching places…"
      : errored
        ? "Place search failed"
        : visible.length
          ? `${visible.length} place${visible.length > 1 ? "s" : ""} found`
          : "No matches";

  return (
    <div
      className="bd-field bd-place"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setFocused(false);
          onTouch?.();
        }
      }}
    >
      <span className="bd-label" id="bd-place-label">
        Place of birth
      </span>

      {value && !manual ? (
        /* ---------- confirmed place ---------- */
        <div className="bd-confirmed">
          <span className="mark">{icons.check}</span>
          <span className="body">
            <span className="place">{value.label}</span>
            <span className="coords">
              {formatCoords(value.latitude, value.longitude)}
              <br />
              <span className="tz">
                {value.timezone} · {formatUtcOffset(value.timezone, date, time)}
              </span>
            </span>
          </span>
          <button type="button" className="change" onClick={changePlace}>
            Change
          </button>
        </div>
      ) : manual ? (
        /* ---------- manual coordinates ---------- */
        <div className="bd-manual">
          <div className="bd-manual-head">
            <span className="t">Manual coordinates</span>
            <button type="button" className="bd-manual-back" onClick={exitManual}>
              {icons.back} Back to search
            </button>
          </div>
          <div className="bd-manual-grid">
            <label className="bd-field bd-field--full">
              <span className="bd-label">
                City label <span className="opt">— optional</span>
              </span>
              <input
                className="bd-input"
                type="text"
                value={manualVals.label}
                placeholder="e.g. Grandmother's village"
                onChange={(e) => setManualField({ label: e.target.value })}
              />
            </label>
            <label className="bd-field">
              <span className="bd-label">Latitude</span>
              <input
                className={"bd-input" + (errMsg && manualVals.lat.trim() === "" ? " is-error" : "")}
                type="text"
                inputMode="decimal"
                value={manualVals.lat}
                placeholder="18.9667"
                onChange={(e) => setManualField({ lat: e.target.value })}
                onBlur={() => onTouch?.()}
              />
            </label>
            <label className="bd-field">
              <span className="bd-label">Longitude</span>
              <input
                className={"bd-input" + (errMsg && manualVals.lon.trim() === "" ? " is-error" : "")}
                type="text"
                inputMode="decimal"
                value={manualVals.lon}
                placeholder="72.8333"
                onChange={(e) => setManualField({ lon: e.target.value })}
                onBlur={() => onTouch?.()}
              />
            </label>
            <label className="bd-field bd-field--full">
              <span className="bd-label">Timezone</span>
              <select
                className="bd-select"
                value={manualVals.tz}
                onChange={(e) => setManualField({ tz: e.target.value })}
                onBlur={() => onTouch?.()}
              >
                <option value="">Select a timezone…</option>
                {zones.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {errMsg && (
            <span className="bd-err">
              {icons.alert} {errMsg}
            </span>
          )}
        </div>
      ) : (
        /* ---------- search ---------- */
        <>
          <div className="bd-searchwrap">
            <span className="lead">{icons.search}</span>
            <input
              ref={searchRef}
              className={"bd-input bd-search" + (errMsg ? " is-error" : "")}
              type="text"
              value={query}
              placeholder="Search for your birth city…"
              autoComplete="off"
              role="combobox"
              aria-expanded={showResults}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-labelledby="bd-place-label"
              aria-activedescendant={
                activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined
              }
              aria-invalid={!!errMsg}
              onChange={(e) => {
                setQuery(e.target.value);
                setFocused(true);
              }}
              onFocus={() => setFocused(true)}
              onKeyDown={onKeyDown}
            />
            <span className="trail">
              {loading ? (
                <span className="bd-spin" aria-hidden="true" />
              ) : query ? (
                <button type="button" className="bd-clear" onClick={clear} aria-label="Clear">
                  {icons.x}
                </button>
              ) : null}
            </span>
          </div>

          {showResults && (
            <div className="bd-suggest" role="listbox" id={listId} aria-label="Place suggestions">
              {loading ? (
                <div className="bd-sug-status">
                  <span className="bd-spin" /> Searching places…
                </div>
              ) : errored ? (
                <div className="bd-sug-status">Couldn&rsquo;t reach the place search. Try again.</div>
              ) : visible.length ? (
                visible.map((p, i) => (
                  <button
                    key={p.id}
                    id={`${listId}-opt-${i}`}
                    type="button"
                    role="option"
                    aria-selected={i === activeIndex}
                    tabIndex={-1}
                    className={"bd-sug" + (i === activeIndex ? " is-active" : "")}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pick(p);
                    }}
                  >
                    <span className="pin">{icons.pin}</span>
                    <span className="txt">
                      <span className="city">{highlight(p.name, typed)}</span>
                      <span className="region">
                        {[p.region, p.country].filter(Boolean).join(", ")}
                      </span>
                    </span>
                  </button>
                ))
              ) : (
                <div className="bd-sug-status">No matches for &ldquo;{typed}&rdquo;.</div>
              )}
            </div>
          )}

          {errMsg && !showResults && (
            <span className="bd-err" style={{ marginTop: 7 }}>
              {icons.alert} {errMsg}
            </span>
          )}

          <button type="button" className="bd-manual-link" onClick={enterManual}>
            {icons.pin} Can&rsquo;t find your place? Enter coordinates manually
          </button>
        </>
      )}

      <span className="bd-sr" aria-live="polite">
        {liveText}
      </span>
    </div>
  );
}
