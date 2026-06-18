import { useCallback, useRef } from "react";

/**
 * Optional audio layer: pressure washer loop, water impacts, ambient hum.
 * Muted until first user interaction (autoplay policy). Scaffold.
 */
export function useAudio() {
  const ctx = useRef<AudioContext | null>(null);

  const init = useCallback(() => {
    // TODO: lazily create AudioContext on first gesture; load buffers.
  }, []);

  const setFiring = useCallback((_on: boolean) => {
    // TODO: ramp washer loop gain.
  }, []);

  return { init, setFiring };
}
