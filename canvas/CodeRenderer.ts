import type { Glyph } from "@/types";
import { tokenizeLine } from "@/lib/highlight";

export const FONT_SIZE = 13;
export const LINE_HEIGHT = 19;
export const GUTTER = 56;
export const PAD_TOP = 52;
export const FONT = `${FONT_SIZE}px "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace`;

/**
 * Lays the source code out into a grid of destructible glyphs (one per
 * non-space character) and draws the intact ones. Glyph integrity drops as
 * water hits; the renderer fades and jitters weakened glyphs.
 */
export class CodeRenderer {
  glyphs: Glyph[] = [];
  charWidth = 8;
  lineCount = 0;

  layout(code: string, ctx: CanvasRenderingContext2D): void {
    ctx.font = FONT;
    this.charWidth = ctx.measureText("M").width;
    this.glyphs = [];

    const lines = code.split("\n");
    this.lineCount = lines.length;

    lines.forEach((line, row) => {
      const y = PAD_TOP + row * LINE_HEIGHT;
      const spans = tokenizeLine(line);
      let col = 0;
      for (const span of spans) {
        for (const char of span.text) {
          if (char !== " " && char !== "\t") {
            this.glyphs.push({
              char,
              x: GUTTER + col * this.charWidth,
              y,
              width: this.charWidth,
              height: LINE_HEIGHT,
              integrity: 1,
              detached: false,
              color: span.color,
            });
          }
          col += char === "\t" ? 2 : 1;
        }
      }
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.font = FONT;
    ctx.textBaseline = "top";

    // gutter line numbers
    ctx.fillStyle = "#3a414e";
    ctx.textAlign = "right";
    for (let i = 0; i < this.lineCount; i++) {
      ctx.fillText(
        String(i + 1),
        GUTTER - 14,
        PAD_TOP + i * LINE_HEIGHT,
      );
    }

    // glyphs
    ctx.textAlign = "left";
    for (const g of this.glyphs) {
      if (g.detached || g.integrity <= 0) continue;
      ctx.globalAlpha = g.integrity;
      ctx.fillStyle = g.color;
      // weakened glyphs jitter slightly
      const jitter = g.integrity < 0.6 ? (Math.random() - 0.5) * 1.6 : 0;
      ctx.fillText(g.char, g.x + jitter, g.y + jitter);
    }
    ctx.globalAlpha = 1;
  }
}
