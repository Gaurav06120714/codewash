"use client";

import { useCodeWashStore } from "@/store/useCodeWashStore";

/** Minimal metrics overlay: cleaned percentage + mute toggle. */
export function HUD() {
  const { metrics, muted, toggleMute } = useCodeWashStore();
  const pct =
    metrics.totalGlyphs > 0
      ? Math.round((metrics.cleanedGlyphs / metrics.totalGlyphs) * 100)
      : 0;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-4 text-sm tracking-wide text-[var(--text)]">
      <span className="font-mono text-[var(--accent)]">CodeWash</span>
      <div className="flex items-center gap-6">
        <span className="font-mono tabular-nums">Code Cleaned {pct}%</span>
        <button
          onClick={toggleMute}
          className="pointer-events-auto rounded border border-[var(--line)] px-2 py-1 font-mono text-xs"
        >
          {muted ? "Unmute" : "Mute"}
        </button>
      </div>
    </div>
  );
}
