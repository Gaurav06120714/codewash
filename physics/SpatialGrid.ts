import type { Glyph } from "@/types";

/**
 * Uniform spatial hash grid over the static glyph layout. Built once after
 * layout; gives O(1) broad-phase lookup of glyphs near a water particle.
 */
export class SpatialGrid {
  private cellSize: number;
  private cells = new Map<number, number[]>();
  private cols = 0;

  constructor(cellSize = 24) {
    this.cellSize = cellSize;
  }

  private key(cx: number, cy: number): number {
    return cy * this.cols + cx;
  }

  build(glyphs: Glyph[], width: number): void {
    this.cells.clear();
    this.cols = Math.max(1, Math.ceil(width / this.cellSize));
    glyphs.forEach((g, i) => {
      const cx = Math.floor((g.x + g.width / 2) / this.cellSize);
      const cy = Math.floor((g.y + g.height / 2) / this.cellSize);
      const k = this.key(cx, cy);
      const bucket = this.cells.get(k);
      if (bucket) bucket.push(i);
      else this.cells.set(k, [i]);
    });
  }

  /** Candidate glyph indices in the cell containing (x, y) and its neighbours. */
  query(x: number, y: number): number[] {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const out: number[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const bucket = this.cells.get(this.key(cx + dx, cy + dy));
        if (bucket) out.push(...bucket);
      }
    }
    return out;
  }
}
