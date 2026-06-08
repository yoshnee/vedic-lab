"use client";

/* ============================================================
   chart/ChartProvider.tsx — in-memory store for the computed ChartModel, shared
   across the home (compute-on-submit) and /chart (render/recompute) routes. Only
   the small civil birth input is persisted (sessionStorage, by the modal); this
   store holds the heavy computed model so a normal submit→/chart navigation does
   not recompute. Mounted once in app/layout.tsx so it spans both routes.
   ============================================================ */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { ChartModel } from "./types";

interface ChartContextValue {
  model: ChartModel | null;
  loading: boolean;
  error: string | null;
  setModel: (m: ChartModel | null) => void;
  setLoading: (b: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

const ChartContext = createContext<ChartContextValue | null>(null);

export function ChartProvider({ children }: { children: ReactNode }) {
  const [model, setModel] = useState<ChartModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setModel(null);
    setLoading(false);
    setError(null);
  }, []);

  const value = useMemo<ChartContextValue>(
    () => ({ model, loading, error, setModel, setLoading, setError, reset }),
    [model, loading, error, reset],
  );

  return <ChartContext.Provider value={value}>{children}</ChartContext.Provider>;
}

export function useChart(): ChartContextValue {
  const ctx = useContext(ChartContext);
  if (!ctx) throw new Error("useChart must be used within <ChartProvider>");
  return ctx;
}
