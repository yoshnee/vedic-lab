"use client";

/* ============================================================
   Instructions.tsx — a centered "how to use this tool" popup for the chart
   page, opened from the hero-meta button row (beside Legend). Modal dialog with
   a backdrop, focus trap, Esc-to-close, backdrop-click-to-close, and a
   scrollable body. Content is data-driven (INSTRUCTIONS) so it's easy to edit.
   Purely presentational — nothing computed here.
   ============================================================ */
import { useEffect, useRef } from "react";
import { Svg } from "@/components/Svg";
import { diamond } from "@/celestial/celestial";

/** The walkthrough steps shown in the popup. Owner copy — edit freely.
    (Placeholder until the real instructions land.) */
interface InstrStep {
  title: string;
  body: string;
}
const INSTRUCTIONS: InstrStep[] = [
  {
    title: "Instructions coming soon",
    body: "A short walkthrough of how to read and use this birth chart tool will live here.",
  },
];

export function Instructions({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const prevFocused = document.activeElement as HTMLElement | null;
    el?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Tab" && el) {
        const f = el.querySelectorAll<HTMLElement>('button,[href],[tabindex="0"]');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prevFocused?.focus(); // return focus to the trigger on close
    };
  }, [onClose]);

  return (
    <div className="instr-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="instr-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="instr-title"
        ref={ref}
        tabIndex={-1}
      >
        <header className="instr-head">
          <span className="instr-head-txt">
            <span className="instr-eyebrow">
              <Svg html={diamond(18, { glow: true })} /> How to use this tool
            </span>
            <h2 id="instr-title">Instructions</h2>
          </span>
          <button type="button" className="instr-close" onClick={onClose} aria-label="Close instructions">✕</button>
        </header>

        <div className="instr-body">
          <ol className="instr-steps">
            {INSTRUCTIONS.map((s, i) => (
              <li className="instr-step" key={i}>
                <span className="instr-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="instr-text">
                  <span className="instr-step-title">{s.title}</span>
                  <span className="instr-step-body">{s.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
