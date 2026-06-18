import type { Glyph, NozzleState } from "@/types";
import type { ParticlePool } from "./ParticlePool";

const STREAM_SPEED = 1500;
const CONE = 0.13; // radians of spread
const PER_FRAME = 14;

/** Emit a high-pressure spray cone from the nozzle tip while firing. */
export function emitStream(pool: ParticlePool, nozzle: NozzleState): void {
  // nozzle tip offset along the barrel
  const tipX = nozzle.x + Math.cos(nozzle.angle) * 34;
  const tipY = nozzle.y + Math.sin(nozzle.angle) * 34;

  for (let i = 0; i < PER_FRAME; i++) {
    const p = pool.acquire("stream");
    if (!p) break;
    const spread = (Math.random() - 0.5) * 2 * CONE;
    const a = nozzle.angle + spread;
    const speed = STREAM_SPEED * (0.8 + Math.random() * 0.4);
    p.x = tipX;
    p.y = tipY;
    p.vx = Math.cos(a) * speed;
    p.vy = Math.sin(a) * speed;
    p.mass = 0.04;
    p.size = 1 + Math.random() * 1.6;
    p.maxLife = p.life = 0.32 + Math.random() * 0.15;
    p.opacity = 0.9;
  }
}

/** Radial splash + mist burst when the stream impacts a glyph. */
export function emitSplash(pool: ParticlePool, x: number, y: number, count = 5): void {
  for (let i = 0; i < count; i++) {
    const p = pool.acquire(Math.random() < 0.4 ? "mist" : "splash");
    if (!p) break;
    const a = Math.random() * Math.PI * 2;
    const speed = p.kind === "mist" ? 30 + Math.random() * 40 : 120 + Math.random() * 180;
    p.x = x;
    p.y = y;
    p.vx = Math.cos(a) * speed;
    p.vy = Math.sin(a) * speed - 40;
    p.mass = p.kind === "mist" ? 0.02 : 0.3;
    p.size = p.kind === "mist" ? 2 + Math.random() * 3 : 1 + Math.random() * 1.5;
    p.maxLife = p.life = p.kind === "mist" ? 0.6 + Math.random() * 0.5 : 0.4 + Math.random() * 0.3;
    p.opacity = p.kind === "mist" ? 0.18 : 0.7;
  }
}

/** Fling a destroyed glyph off as a tumbling debris particle. */
export function spawnDebris(pool: ParticlePool, g: Glyph, impactVx: number, impactVy: number): void {
  const p = pool.acquire("debris");
  if (!p) return;
  p.x = g.x;
  p.y = g.y;
  p.vx = impactVx * 0.25 + (Math.random() - 0.5) * 120;
  p.vy = impactVy * 0.25 - Math.random() * 120;
  p.mass = 1;
  p.size = 1;
  p.maxLife = p.life = 1.6 + Math.random();
  p.opacity = 1;
  p.char = g.char;
  p.color = g.color;
  p.rotation = 0;
  p.spin = (Math.random() - 0.5) * 14;
}
