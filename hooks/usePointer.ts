import { useEffect, useRef } from "react";
import type { NozzleState } from "@/types";

/**
 * Tracks the pointer and returns a smoothed nozzle state: position eased
 * toward the target (natural lag) and angle derived from travel direction.
 * The smoothing runs on its own rAF so it stays decoupled from React renders.
 */
export function usePointer() {
  const nozzle = useRef<NozzleState>({ x: 0, y: 0, angle: 0, firing: false });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    target.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    nozzle.current.x = target.current.x;
    nozzle.current.y = target.current.y;

    const onMove = (e: PointerEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };
    const onDown = (e: PointerEvent) => {
      if (e.button === 0) nozzle.current.firing = true;
    };
    const onUp = () => (nozzle.current.firing = false);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    let raf = 0;
    const ease = () => {
      const n = nozzle.current;
      const t = target.current;
      const px = n.x;
      const py = n.y;
      n.x += (t.x - n.x) * 0.18; // natural lag
      n.y += (t.y - n.y) * 0.18;
      const vx = n.x - px;
      const vy = n.y - py;
      if (vx * vx + vy * vy > 0.4) {
        const desired = Math.atan2(vy, vx);
        // shortest-arc rotational tracking
        let diff = desired - n.angle;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        n.angle += diff * 0.2;
      }
      raf = requestAnimationFrame(ease);
    };
    raf = requestAnimationFrame(ease);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  return nozzle;
}
