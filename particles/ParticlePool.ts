import type { Particle, ParticleKind } from "@/types";
import { integrate } from "@/physics/integrator";

/**
 * Object pool to avoid GC churn at thousands of particles. Inactive particles
 * live in `free`; active ones are integrated each frame and recycled on death.
 */
export class ParticlePool {
  private free: Particle[] = [];
  active: Particle[] = [];

  constructor(capacity = 6000) {
    for (let i = 0; i < capacity; i++) this.free.push(ParticlePool.blank());
  }

  static blank(): Particle {
    return {
      x: 0, y: 0, vx: 0, vy: 0,
      mass: 1, opacity: 1, life: 0, maxLife: 1,
      size: 1, kind: "stream",
    };
  }

  acquire(kind: ParticleKind): Particle | null {
    const p = this.free.pop();
    if (!p) return null; // pool exhausted — drop the particle
    p.kind = kind;
    p.char = undefined;
    p.rotation = 0;
    p.spin = 0;
    this.active.push(p);
    return p;
  }

  /** Integrate every active particle and recycle the dead ones. */
  update(dt: number, floor: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      integrate(p, dt);
      if (p.rotation !== undefined && p.spin) p.rotation += p.spin * dt;

      // debris settles on the bottom edge
      if (p.kind === "debris" && p.y > floor) {
        p.y = floor;
        p.vy *= -0.25;
        p.vx *= 0.7;
      }

      if (p.life <= 0 || p.y > floor + 80) {
        this.active.splice(i, 1);
        this.free.push(p);
      }
    }
  }

  get count(): number {
    return this.active.length;
  }
}
