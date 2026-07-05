"use client";

/* ============================================================
   BirthDetailsModal — the Birth Chart Analyzer's birth-data popup.
   Ported from design-reference/birth-modal/birth-modal.jsx (dark-only;
   no unknown-time toggle; CTA reads "Generate chart" with no arrow).

   Collects optional name + date + time + place, then hands a typed
   BirthDetails to onGenerate. Place resolution (autocomplete + manual
   fallback) lives in <PlaceField>. Routing to /chart is intentionally
   NOT wired here — the parent persists the payload and closes.

   A11y mirrors flashcards/Deck.tsx: role=dialog, focus-on-open, Esc to
   close, backdrop dismiss, and a Tab focus-trap that re-queries the
   focusable set each keypress (so the appearing/disappearing place
   suggestions and the gated CTA are handled correctly).
   ============================================================ */
import { useEffect, useRef, useState } from "react";
import { diamond } from "@/celestial/celestial";
import { Svg } from "@/components/Svg";
import type { BirthDetails, BirthPlace } from "@/lib/birth";
import type { ChartStyle } from "@/lib/chart/types";
import { PlaceField } from "./PlaceField";
import { icons } from "./birthIcons";

const FOCUSABLE =
  'button:not([disabled]):not([tabindex="-1"]),input:not([disabled]),select:not([disabled]),a[href],[tabindex="0"]';

export function BirthDetailsModal({
  onClose,
  onGenerate,
  submitting = false,
  error = null,
}: {
  onClose: () => void;
  onGenerate: (details: BirthDetails) => void;
  submitting?: boolean;
  error?: string | null;
}) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState<BirthPlace | null>(null);
  const [chartStyle, setChartStyle] = useState<ChartStyle>("north"); // fixed on /chart once generated
  const [touched, setTouched] = useState<{ date?: boolean; time?: boolean; place?: boolean }>({});

  const dialogRef = useRef<HTMLDivElement>(null);
  const touch = (k: "date" | "time" | "place") => setTouched((t) => ({ ...t, [k]: true }));

  const valid = !!date && !!time && !!place;
  const errDate = touched.date && !date;
  const errTime = touched.time && !time;

  /* focus the dialog on open + Esc / Tab-trap keyboard handling */
  useEffect(() => {
    dialogRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const f = dialog.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = () => {
    if (submitting) return;
    if (!valid || !place) {
      setTouched({ date: true, time: true, place: true });
      return;
    }
    onGenerate({ name: name.trim() || undefined, date, time, place, chartStyle });
  };

  return (
    <div
      className="bd-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bd-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bd-title"
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="bd-head">
          <span className="bd-eyebrow" id="bd-title">
            <Svg html={diamond(20, { glow: true })} /> Enter Chart Details
          </span>
          <button type="button" className="bd-close" onClick={onClose} aria-label="Close">
            {icons.x}
          </button>
        </header>

        <p className="bd-sub">
          A few details to cast your chart. We&rsquo;ll resolve your birthplace to exact coordinates.
        </p>

        <div className="bd-form">
          {/* NAME */}
          <label className="bd-field">
            <span className="bd-label">
              Your name <span className="opt">— optional</span>
            </span>
            <input
              className="bd-input"
              type="text"
              value={name}
              placeholder="For labelling the chart"
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          {/* DATE + TIME — deliberately UNCONTROLLED (no `value` prop). Safari
              reports a partly-typed date/time as "" on every keystroke; a
              controlled input would let React restore the DOM value to "" after
              each one, wiping the segment (typing a 4-digit year, each digit
              replaced the last). Uncontrolled lets the browser's native segment
              editing accumulate; onChange still captures the value for validation. */}
          <div className="bd-row2">
            <label className="bd-field">
              <span className="bd-label">Date of birth</span>
              <input
                className={"bd-input" + (errDate ? " is-error" : "")}
                type="date"
                onChange={(e) => setDate(e.target.value)}
                onBlur={() => touch("date")}
                aria-invalid={!!errDate}
              />
              {errDate && (
                <span className="bd-err">
                  {icons.alert} Enter your date of birth
                </span>
              )}
            </label>
            <label className="bd-field">
              <span className="bd-label">Time of birth</span>
              <input
                className={"bd-input" + (errTime ? " is-error" : "")}
                type="time"
                onChange={(e) => setTime(e.target.value)}
                onBlur={() => touch("time")}
                aria-invalid={!!errTime}
              />
              {errTime && (
                <span className="bd-err">
                  {icons.alert} Enter your time of birth
                </span>
              )}
            </label>
          </div>

          {/* PLACE OF BIRTH */}
          <PlaceField
            value={place}
            onChange={setPlace}
            date={date}
            time={time}
            showError={!!touched.place}
            onTouch={() => touch("place")}
          />
        </div>

        {/* CHART STYLE — the choice is FIXED once the chart is generated (no
            in-page toggle on /chart); it drives both charts. Controlled radio
            group, carried through BirthDetails → the persisted civil → meta. */}
        <div className="bd-style" role="radiogroup" aria-labelledby="bd-chartstyle-label">
          <span className="bd-label" id="bd-chartstyle-label">Chart style</span>
          <div className="bd-style-opts">
            <label className="bd-style-opt">
              <input
                type="radio"
                name="chartStyle"
                value="north"
                checked={chartStyle === "north"}
                onChange={() => setChartStyle("north")}
              />
              <span>North Indian</span>
            </label>
            <label className="bd-style-opt">
              <input
                type="radio"
                name="chartStyle"
                value="south"
                checked={chartStyle === "south"}
                onChange={() => setChartStyle("south")}
              />
              <span>South Indian</span>
            </label>
          </div>
        </div>

        {/* FOOTER / CTA */}
        <div className="bd-foot">
          <button type="button" className="bd-cta" disabled={!valid || submitting} onClick={submit}>
            {submitting ? (
              <>
                <span className="bd-spin" aria-hidden="true" /> Casting your chart…
              </>
            ) : (
              "Generate chart"
            )}
          </button>
          {error ? (
            <p className="bd-err bd-foot-err" role="alert">
              {icons.alert} {error}
            </p>
          ) : !valid ? (
            <p className="bd-footnote">
              {icons.lock} Add date, time &amp; place to generate your chart.
            </p>
          ) : (
            <p className="bd-footnote">
              {icons.lock} Computed on your device · nothing leaves this browser.
            </p>
          )}
          <p className="bd-attrib">
            Place search by{" "}
            <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
              Open-Meteo
            </a>
          </p>
          <p className="bd-disclaimer">
            {icons.info}
            <span>
              Charts are cast on the <strong>sidereal zodiac</strong> using the{" "}
              <strong>Lahiri ayanamsha</strong>, the standard most Vedic astrologers use.
              It&rsquo;s the only option for now.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
