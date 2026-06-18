import type { Particle } from "@/types";

export const GRAVITY = 980; // px/s^2
export const AIR_RESISTANCE = 0.98;
export const WIND = 0;

/**
 * Semi-implicit Euler integration step for a single particle. Scaffold —
 * extend with collision response and ground friction.
 */
export function integrate(p: Particle, dt: number): void {
  p.vy += GRAVITY * p.mass * dt;
  p.vx = (p.vx + WIND * dt) * AIR_RESISTANCE;
  p.vy *= AIR_RESISTANCE;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.life -= dt;
  p.opacity = Math.max(0, p.life / p.maxLife);
}
