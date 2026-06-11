"use client";

/* ============================================================
   DashaRail.tsx — the Vimśottarī daśā rail. A vertical, compact version of the
   old DashaDrill: the current MD → AD → PD chain summary on top, then the full
   mahādaśā list, each row expandable to its antardaśās (→ pratyantardaśās). The
   running nodes are highlighted; only the running mahādaśā opens by default
   (the antardaśā level loads collapsed). Built to hold the whole
   sequence — the rail shape grows into a full timeline. Rendered in a sticky
   left rail on desktop and inside a slide-in drawer on mobile (same content).
   Reuses the engine's dasha tree directly and the shared .dnode/.drow classes.
   ============================================================ */
import { useState } from "react";
import { Svg } from "@/components/Svg";
import { body } from "@/celestial/celestial";
import type { DashaPeriod, CurrentDasha, PlanetKey } from "@/core/types";

const PNAME: Record<PlanetKey, string> = {
  sun: "Sun", moon: "Moon", mars: "Mars", mercury: "Mercury", jupiter: "Jupiter",
  venus: "Venus", saturn: "Saturn", rahu: "Rahu", ketu: "Ketu",
};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LEVEL_LABEL = ["Mahādaśā", "Antardaśā", "Pratyantardaśā"];

/** Compact date — DDMmmYY (e.g. "02May91"); the rail is narrow, so no spaces. */
function fmt(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const yy = String(d.getUTCFullYear()).slice(-2);
  return `${dd}${MONTHS[d.getUTCMonth()]}${yy}`;
}

function DashaNode({ node, level }: { node: DashaPeriod; level: number }) {
  const children = node.children;
  const hasChildren = !!(children && children.length);
  // Only the running mahādaśā auto-expands (to its antardaśās); the running
  // antardaśā loads collapsed — pratyantardaśās are a tap away, not default.
  const [open, setOpen] = useState(node.running && level === 0);
  const running = node.running;

  return (
    <div className="dnode" data-open={open}>
      {hasChildren ? (
        <button className="drow" data-running={running} aria-expanded={open}
          title={PNAME[node.lord]} aria-label={`${PNAME[node.lord]} daśā, ${fmt(node.start)} to ${fmt(node.end)}`}
          onClick={() => setOpen((o) => !o)}>
          <span className="dico"><Svg html={body(node.lord, 20)} /></span>
          <span className="ddate">{fmt(node.start)}-{fmt(node.end)}</span>
          <svg className="dexp" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      ) : (
        <div className="drow" data-running={running} data-static="true"
          title={PNAME[node.lord]} aria-label={`${PNAME[node.lord]} daśā, ${fmt(node.start)} to ${fmt(node.end)}`}>
          <span className="dico"><Svg html={body(node.lord, 20)} /></span>
          <span className="ddate">{fmt(node.start)}-{fmt(node.end)}</span>
        </div>
      )}
      {hasChildren && (
        <div className="dchild">
          <div className="dchild-in">
            <div className="dlvl">
              <div className="dlvl-label">{LEVEL_LABEL[level + 1] ?? ""}</div>
              {children!.map((ch, i) => <DashaNode key={i} node={ch} level={level + 1} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function DashaRail({ dasha, current }: { dasha: DashaPeriod[]; current: CurrentDasha }) {
  return (
    <div className="dasha-rail-in">
      <div className="dr-head">
        <span className="dr-eyebrow">Vimśottarī Daśā</span>
        <div className="dr-now">
          {current.chain.map((pk, i) => (
            <div className="dr-now-step" key={i}>
              <span className="dr-now-lvl">{LEVEL_LABEL[i]}</span>
              <span className="dr-now-planet">
                <Svg html={body(pk, 18)} />
                {PNAME[pk]}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="dlvl dr-list">
        {dasha.map((node, i) => <DashaNode key={i} node={node} level={0} />)}
      </div>
    </div>
  );
}
