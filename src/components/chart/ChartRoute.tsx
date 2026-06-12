"use client";

/* ============================================================
   ChartRoute.tsx — the /chart entry. Decides what to render:
   - store already has a model (normal submit→/chart nav) → render it
   - no model but sessionStorage has the civil birth (hard refresh / deep link
     after a prior submit) → recompute via generateChart, then render
   - nothing at all (cold deep link) → redirect home with the modal open
   The heavy ChartModel lives in the store (never the URL); only the small civil
   birth input is persisted, so a refresh re-runs the engine from it.
   ============================================================ */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Svg } from "@/components/Svg";
import { diamond } from "@/celestial/celestial";
import { ChartView } from "./ChartView";
import { useChart } from "@/lib/chart/ChartProvider";
import { generateChart } from "@/lib/chart/generateChart";
import { BIRTH_DETAILS_KEY, type EngineCivilBirth } from "@/lib/birth";

type Phase = "loading" | "error";

export function ChartRoute() {
  const router = useRouter();
  const { model, setModel } = useChart();
  // Defaults to the loading shell; the redirect path also shows it briefly.
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (model) return; // normal navigation — already computed

    let civil: EngineCivilBirth | null = null;
    try {
      const raw = sessionStorage.getItem(BIRTH_DETAILS_KEY);
      if (raw) civil = JSON.parse(raw) as EngineCivilBirth;
    } catch {
      /* sessionStorage unavailable — treat as no input */
    }
    if (!civil) {
      router.replace("/?analyzer=1"); // cold deep-link — back home with the modal open
      return;
    }
    generateChart(civil)
      .then((m) => setModel(m)) // store update → re-render → ChartView
      .catch((e) => {
        setError(e instanceof Error && e.message ? e.message : "Could not cast the chart.");
        setPhase("error");
      });
  }, [model, router, setModel]);

  // Keyed per natal chart: replacing the store model (a new birth) must reset
  // ALL per-chart UI state (daśā selection, gochar scrub, chart-type toggles)
  // rather than leak the previous chart's into the new one.
  if (model) {
    const chartKey = `${model.meta.computedUtcISO}|${model.chart.birth.lat}|${model.chart.birth.lon}`;
    return <ChartView key={chartKey} model={model} />;
  }

  return (
    <>
      <header className="chart-header">
        <Link className="chart-back" href="/">
          <Svg className="chart-mark" html={diamond(30, { glow: true })} />
          <span>Vedic Astrology Lab</span>
        </Link>
      </header>
      <main className="chart-page chart-status">
        {phase === "error" ? (
          <div className="chart-status-box">
            <p className="chart-status-title">Couldn’t cast the chart</p>
            <p className="chart-status-sub">{error}</p>
            <button type="button" className="bd-cta" onClick={() => router.replace("/?analyzer=1")}>
              Re-enter birth details
            </button>
          </div>
        ) : (
          <div className="chart-status-box">
            <Svg className="chart-status-mark" html={diamond(46, { glow: true })} />
            <p className="chart-status-title">Casting your chart…</p>
            <p className="chart-status-sub">Initialising the ephemeris engine.</p>
          </div>
        )}
      </main>
    </>
  );
}
