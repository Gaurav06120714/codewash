"use client";

import { useEffect, useRef } from "react";
import { Engine } from "@/canvas/Engine";
import { usePointer } from "@/hooks/usePointer";
import { useCodeWashStore } from "@/store/useCodeWashStore";
import { SAMPLE_CODE } from "@/lib/sampleCode";
import { Nozzle } from "./Nozzle";
import { HUD } from "./HUD";
import { CompletionOverlay } from "./CompletionOverlay";

/**
 * Root client component. Mounts the canvas, drives the engine, feeds the
 * smoothed nozzle state in each frame, and pipes metrics into the store.
 */
export function Experience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const nozzle = usePointer();
  const setMetrics = useCodeWashStore((s) => s.setMetrics);
  const setCompleted = useCodeWashStore((s) => s.setCompleted);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(canvas, SAMPLE_CODE);
    engineRef.current = engine;

    engine.onMetrics = ({ cleaned, total }) =>
      setMetrics({ cleanedGlyphs: cleaned, totalGlyphs: total });
    engine.onComplete = () => setCompleted(true);

    // sync the smoothed nozzle into the engine each frame
    let raf = 0;
    const sync = () => {
      engine.nozzle = nozzle.current;
      raf = requestAnimationFrame(sync);
    };
    raf = requestAnimationFrame(sync);

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    engine.start();

    // restart hook for the completion overlay
    const handleReset = () => engine.reset();
    window.addEventListener("codewash:reset", handleReset);

    return () => {
      engine.stop();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("codewash:reset", handleReset);
    };
  }, [nozzle, setMetrics, setCompleted]);

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <HUD />
      <Nozzle nozzle={nozzle} />
      <CompletionOverlay />
    </div>
  );
}
