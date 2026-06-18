"use client";

import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type { NozzleState } from "@/types";

/**
 * High-resolution SVG pressure-washer nozzle that replaces the cursor.
 * Follows the smoothed nozzle state with rotational tracking. Scaffold.
 */
export function Nozzle({ nozzle }: { nozzle: MutableRefObject<NozzleState> }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const follow = () => {
      const el = ref.current;
      if (el) {
        const { x, y, angle } = nozzle.current;
        el.style.transform = `translate(${x}px, ${y}px) rotate(${angle}rad)`;
      }
      raf = requestAnimationFrame(follow);
    };
    raf = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(raf);
  }, [nozzle]);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute left-0 top-0 z-20 -ml-6 -mt-3 will-change-transform"
    >
      {/* TODO: replace with detailed nozzle SVG */}
      <svg width="64" height="24" viewBox="0 0 64 24" fill="none">
        <rect x="2" y="8" width="44" height="8" rx="3" fill="#2a2f3a" />
        <rect x="44" y="6" width="18" height="12" rx="2" fill="#3a414e" />
        <circle cx="62" cy="12" r="2" fill="#7d97b8" />
      </svg>
    </div>
  );
}
