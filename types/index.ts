export interface Vec2 {
  x: number;
  y: number;
}

/** A single physically-simulated particle (water droplet, mist, or code debris). */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  opacity: number;
  life: number; // remaining lifetime in seconds
  maxLife: number;
  size: number;
  kind: ParticleKind;
  /** For debris particles: the glyph being flung off and its color. */
  char?: string;
  color?: string;
  rotation?: number;
  spin?: number;
}

export type ParticleKind = "stream" | "mist" | "splash" | "debris";

/** A destructible glyph rendered from the source code. */
export interface Glyph {
  char: string;
  x: number;
  y: number;
  width: number;
  height: number;
  integrity: number; // 1 = intact, 0 = destroyed
  detached: boolean;
  color: string;
}

export interface NozzleState extends Vec2 {
  angle: number;
  firing: boolean;
}

export interface Metrics {
  totalGlyphs: number;
  cleanedGlyphs: number;
  elapsedMs: number;
}
