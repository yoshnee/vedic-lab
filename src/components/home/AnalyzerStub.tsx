"use client";

/* Birth-data input modal — STUB for this phase. Inputs are disabled and
   nothing is calculated; the sidereal engine is wired up in a later
   phase. Keyboard accessible (Esc to close, focus tab-trap). */
import { useEffect, useRef } from "react";
import { diamond } from "@/celestial/celestial";
import { Svg } from "@/components/Svg";

export function AnalyzerStub({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const dialog = ref.current;
        if (!dialog) return;
        const f = dialog.querySelectorAll<HTMLElement>(
          'button,input,[tabindex="0"]',
        );
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

  return (
    <div
      className="bd-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bd-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bd-title"
        ref={ref}
        tabIndex={-1}
      >
        <header className="bd-head">
          <span className="bd-eyebrow">
            <Svg html={diamond(22, { glow: true })} /> Birth Chart Analyzer
          </span>
          <button className="bd-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <h2 className="bd-title" id="bd-title">
          Enter birth details
        </h2>
        <form className="bd-form" onSubmit={(e) => e.preventDefault()}>
          <label className="bd-field">
            <span>Date of birth</span>
            <input type="date" disabled />
          </label>
          <label className="bd-field">
            <span>Time of birth</span>
            <input type="time" disabled />
          </label>
          <label className="bd-field bd-field--full">
            <span>Place of birth</span>
            <input type="text" placeholder="City, country" disabled />
          </label>
          <button type="submit" className="bd-submit" disabled>
            Calculate chart
          </button>
        </form>
        <p className="bd-note">
          Preview only — the sidereal calculation engine isn’t wired up yet.
          These inputs will drive the live chart once it’s built.
        </p>
      </div>
    </div>
  );
}
