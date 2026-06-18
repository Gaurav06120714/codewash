import { create } from "zustand";
import type { Metrics } from "@/types";

interface CodeWashState {
  metrics: Metrics;
  muted: boolean;
  completed: boolean;
  setMetrics: (m: Partial<Metrics>) => void;
  toggleMute: () => void;
  setCompleted: (v: boolean) => void;
  reset: () => void;
}

const initialMetrics: Metrics = {
  totalGlyphs: 0,
  cleanedGlyphs: 0,
  elapsedMs: 0,
};

export const useCodeWashStore = create<CodeWashState>((set) => ({
  metrics: initialMetrics,
  muted: true,
  completed: false,
  setMetrics: (m) =>
    set((s) => ({ metrics: { ...s.metrics, ...m } })),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  setCompleted: (v) => set({ completed: v }),
  reset: () => set({ metrics: { ...initialMetrics }, completed: false }),
}));
