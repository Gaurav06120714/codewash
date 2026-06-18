import { CodeRenderer } from "./CodeRenderer";
import { ParticlePool } from "@/particles/ParticlePool";
import { emitStream, emitSplash, spawnDebris } from "@/particles/emitters";
import { SpatialGrid } from "@/physics/SpatialGrid";
import type { NozzleState } from "@/types";

const IMPACT_RADIUS = 11;
const EROSION = 2.4; // integrity removed per second of contact
const COMPLETE_AT = 0.97;

/**
 * Core render/simulation loop. Owns the canvas, particle pool, spatial grid,
 * and code renderer; resolves water-vs-glyph impacts and emits debris.
 */
export class Engine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer = new CodeRenderer();
  private pool = new ParticlePool();
  private grid = new SpatialGrid();
  private raf = 0;
  private last = 0;
  private code: string;

  private cssW = 0;
  private cssH = 0;
  private shake = 0;

  /** Smoothed nozzle state, written by the React pointer hook. */
  nozzle: NozzleState = { x: 0, y: 0, angle: 0, firing: false };

  /** Reported every frame: { cleaned, total, particles }. */
  onMetrics?: (m: { cleaned: number; total: number; particles: number }) => void;
  onComplete?: () => void;
  private completed = false;

  constructor(canvas: HTMLCanvasElement, code: string) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context unavailable");
    this.canvas = canvas;
    this.ctx = ctx;
    this.code = code;
    this.resize();
  }

  resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    this.cssW = rect.width;
    this.cssH = rect.height;
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.renderer.layout(this.code, this.ctx);
    this.grid.build(this.renderer.glyphs, this.cssW);
  }

  reset(): void {
    this.completed = false;
    this.pool.active.length = 0;
    this.renderer.layout(this.code, this.ctx);
    this.grid.build(this.renderer.glyphs, this.cssW);
  }

  start(): void {
    this.last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - this.last) / 1000, 1 / 30);
      this.last = now;
      this.update(dt);
      this.render();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop(): void {
    cancelAnimationFrame(this.raf);
  }

  private update(dt: number): void {
    if (this.nozzle.firing) emitStream(this.pool, this.nozzle);

    let detachedThisFrame = 0;

    // resolve water-vs-glyph impacts for stream particles
    for (const p of this.pool.active) {
      if (p.kind !== "stream") continue;
      const candidates = this.grid.query(p.x, p.y);
      for (const idx of candidates) {
        const g = this.renderer.glyphs[idx];
        if (g.detached) continue;
        const dx = p.x - (g.x + g.width / 2);
        const dy = p.y - (g.y + g.height / 2);
        if (dx * dx + dy * dy > IMPACT_RADIUS * IMPACT_RADIUS) continue;

        g.integrity -= EROSION * dt;
        p.life -= dt * 2; // stream loses energy on impact
        if (Math.random() < 0.25) emitSplash(this.pool, p.x, p.y, 2);

        if (g.integrity <= 0) {
          g.detached = true;
          spawnDebris(this.pool, g, p.vx, p.vy);
          detachedThisFrame++;
        }
        break;
      }
    }

    if (detachedThisFrame > 6) this.shake = Math.min(this.shake + 2.5, 6);
    this.shake *= 0.86;

    this.pool.update(dt, this.cssH);

    const total = this.renderer.glyphs.length;
    const cleaned = this.countDetached();
    this.onMetrics?.({ cleaned, total, particles: this.pool.count });

    if (!this.completed && total > 0 && cleaned / total >= COMPLETE_AT) {
      this.completed = true;
      this.onComplete?.();
    }
  }

  private countDetached(): number {
    let c = 0;
    for (const g of this.renderer.glyphs) if (g.detached) c++;
    return c;
  }

  private render(): void {
    const ctx = this.ctx;
    ctx.save();

    // camera shake on strong impacts
    if (this.shake > 0.2) {
      ctx.translate(
        (Math.random() - 0.5) * this.shake,
        (Math.random() - 0.5) * this.shake,
      );
    }

    // editor background
    ctx.fillStyle = "#0f1115";
    ctx.fillRect(-8, -8, this.cssW + 16, this.cssH + 16);
    ctx.fillStyle = "#13161c";
    ctx.fillRect(0, 0, 48, this.cssH); // gutter panel

    this.renderer.draw(ctx);
    this.renderParticles(ctx);

    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D): void {
    // water: additive glow
    ctx.globalCompositeOperation = "lighter";
    for (const p of this.pool.active) {
      if (p.kind === "debris") continue;
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.kind === "mist" ? "#6f8bb0" : "#aac4e4";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";

    // debris glyphs tumbling away
    ctx.font = `13px "SF Mono", Menlo, monospace`;
    ctx.textBaseline = "top";
    for (const p of this.pool.active) {
      if (p.kind !== "debris" || !p.char) continue;
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.opacity + 0.2);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation ?? 0);
      ctx.fillStyle = p.color ?? "#c8cdd6";
      ctx.fillText(p.char, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
}
