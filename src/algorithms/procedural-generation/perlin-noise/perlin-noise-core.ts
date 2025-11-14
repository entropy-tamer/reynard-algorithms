/**
 * Perlin Noise Algorithms
 *
 * Implementation of Perlin noise for procedural generation.
 * Supports 2D, 3D, and 4D noise with fractal variations.
 */

import type {
  PerlinNoiseConfig,
  PerlinNoiseResult,
  PerlinNoiseOptions,
  FractalPerlinNoiseOptions,
  PerlinNoiseStats,
  MultiscalePerlinNoiseOptions,
  MultiscalePerlinNoiseResult,
} from "./perlin-noise-types.js";
import { generateMultiscaleNoise2D, generateMultiscaleNoise3D } from "./perlin-noise-multiscale.js";

/**
 * Simple hash function for seeding
 */
function hash(seed: number): number {
  let h = seed;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * Generate permutation table (using typed array for better performance)
 */
function generatePermutation(seed: number): Uint8Array {
  const perm = new Uint8Array(512);
  for (let i = 0; i < 256; i++) {
    perm[i] = i;
  }

  // Shuffle using seed
  let rng = hash(seed);
  for (let i = 255; i > 0; i--) {
    const j = rng % (i + 1);
    const temp = perm[i];
    perm[i] = perm[j];
    perm[j] = temp;
    rng = hash(rng);
  }

  // Duplicate for wrapping
  for (let i = 0; i < 256; i++) {
    perm[256 + i] = perm[i];
  }

  return perm;
}

/**
 * Generate gradient vectors
 */
function generateGradients(seed: number): Array<{ x: number; y: number }> {
  const gradients: Array<{ x: number; y: number }> = [];
  const perm = generatePermutation(seed);

  for (let i = 0; i < 256; i++) {
    const angle = (perm[i] / 256) * Math.PI * 2;
    gradients.push({
      x: Math.cos(angle),
      y: Math.sin(angle),
    });
  }

  return gradients;
}

/**
 * Fade function for smooth interpolation
 * Pre-computed lookup table for values 0-1 in 256 steps
 */
const FADE_LOOKUP = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const t = i / 255;
  FADE_LOOKUP[i] = t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Fade function for smooth interpolation (with lookup table optimization)
 */
function fade(t: number): number {
  // Clamp to [0, 1] and use lookup table
  const clamped = Math.max(0, Math.min(1, t));
  const index = Math.floor(clamped * 255);
  return FADE_LOOKUP[index];
}

/**
 * Linear interpolation
 */
function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

/**
 * Dot product of gradient and distance vector
 */
function dot2D(gx: number, gy: number, x: number, y: number): number {
  return gx * x + gy * y;
}

/**
 * 2D Perlin noise with pre-computed tables (optimized with inlined functions)
 */
export function perlinNoise2D(
  x: number,
  y: number,
  seed: number = 0,
  gradients?: Array<{ x: number; y: number }>,
  perm?: Uint8Array
): number {
  // Use provided tables or generate new ones (for backward compatibility)
  const grad = gradients ?? generateGradients(seed);
  const permutation = perm ?? generatePermutation(seed);

  // Grid coordinates (bitwise AND for fast modulo 256)
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;

  // Fractional parts
  const fx = x - Math.floor(x);
  const fy = y - Math.floor(y);

  // Fade curves (using lookup table)
  const u = fade(fx);
  const v = fade(fy);

  // Hash coordinates of the 4 square corners
  const a = permutation[X] + Y;
  const aa = permutation[a] & 255;
  const ab = permutation[a + 1] & 255;
  const b = permutation[X + 1] + Y;
  const ba = permutation[b] & 255;
  const bb = permutation[b + 1] & 255;

  // Gradients at corners
  const g1 = grad[aa];
  const g2 = grad[ba];
  const g3 = grad[ab];
  const g4 = grad[bb];

  // Distance vectors
  const d1x = fx;
  const d1y = fy;
  const d2x = fx - 1;
  const d2y = fy;
  const d3x = fx;
  const d3y = fy - 1;
  const d4x = fx - 1;
  const d4y = fy - 1;

  // Dot products (inlined)
  const n1 = g1.x * d1x + g1.y * d1y;
  const n2 = g2.x * d2x + g2.y * d2y;
  const n3 = g3.x * d3x + g3.y * d3y;
  const n4 = g4.x * d4x + g4.y * d4y;

  // Interpolate (inlined lerp)
  const x1 = n1 + u * (n2 - n1);
  const x2 = n3 + u * (n4 - n3);
  const result = x1 + v * (x2 - x1);

  return Math.fround(result);
}

/**
 * 3D Perlin noise (simplified - uses 2D gradients)
 */
export function perlinNoise3D(x: number, y: number, z: number, seed: number = 0): number {
  // Simplified 3D using 2D approach
  return perlinNoise2D(x + z * 0.5, y + z * 0.3, seed);
}

/**
 * Fractal Perlin noise (multiple octaves)
 */
export function fractalPerlinNoise2D(
  x: number,
  y: number,
  options: FractalPerlinNoiseOptions,
  seed: number = 0,
  gradients?: Array<{ x: number; y: number }>,
  perm?: Uint8Array
): number {
  const { octaves, persistence, lacunarity, frequency = 1, amplitude = 1 } = options;

  let value = 0;
  let amplitudeAccum = 0;
  let currentAmplitude = amplitude;
  let currentFrequency = frequency;

  for (let i = 0; i < octaves; i++) {
    // For different octaves, we use seed + i, but reuse same gradients/perm for base seed
    // This maintains consistency while allowing octave variation
    const octaveSeed = seed + i;
    const octaveGrad = gradients && i === 0 ? gradients : undefined;
    const octavePerm = perm && i === 0 ? perm : undefined;
    value +=
      perlinNoise2D(x * currentFrequency, y * currentFrequency, octaveSeed, octaveGrad, octavePerm) * currentAmplitude;
    amplitudeAccum += currentAmplitude;
    currentAmplitude *= persistence;
    currentFrequency *= lacunarity;
  }

  // Normalize if requested
  if (options.normalize) {
    return value / amplitudeAccum;
  }

  return value;
}

/**
 * Perlin noise class for convenient usage
 */
export class PerlinNoise {
  private config: PerlinNoiseConfig;
  private seed: number;
  // Cached lookup tables - only regenerated when seed changes
  private cachedGradients: Array<{ x: number; y: number }> | null = null;
  private cachedPermutation: Uint8Array | null = null;
  private cachedSeed: number | null = null;

  constructor(config: Partial<PerlinNoiseConfig> = {}) {
    this.config = {
      seed: 0,
      frequency: 1.0,
      amplitude: 1.0,
      octaves: 4,
      persistence: 0.5,
      lacunarity: 2.0,
      scale: 1.0,
      offset: { x: 0, y: 0, z: 0, w: 0 },
      normalize: false,
      ...config,
    };
    this.seed = this.config.seed ?? 0;
    this.ensureTables();
  }

  /**
   * Ensure lookup tables are generated and cached for current seed
   */
  private ensureTables(): void {
    if (this.cachedSeed !== this.seed || !this.cachedGradients || !this.cachedPermutation) {
      this.cachedPermutation = generatePermutation(this.seed);
      this.cachedGradients = generateGradients(this.seed);
      this.cachedSeed = this.seed;
    }
  }

  /**
   * Generate 2D noise
   */
  noise2D(x: number, y: number, options?: PerlinNoiseOptions): number {
    this.ensureTables();
    const freq = options?.frequency ?? this.config.frequency ?? 1.0;
    const amp = options?.amplitude ?? this.config.amplitude ?? 1.0;
    const offset = this.config.offset ?? { x: 0, y: 0 };
    const scale = this.config.scale ?? 1.0;

    const nx = (x + (offset?.x ?? 0)) * freq * scale;
    const ny = (y + (offset?.y ?? 0)) * freq * scale;

    return perlinNoise2D(nx, ny, this.seed, this.cachedGradients!, this.cachedPermutation!) * amp;
  }

  /**
   * Generate 3D noise
   */
  noise3D(x: number, y: number, z: number, options?: PerlinNoiseOptions): number {
    const freq = options?.frequency ?? this.config.frequency ?? 1.0;
    const amp = options?.amplitude ?? this.config.amplitude ?? 1.0;
    const offset = this.config.offset ?? { x: 0, y: 0, z: 0 };
    const scale = this.config.scale ?? 1.0;

    const nx = (x + (offset?.x ?? 0)) * freq * scale;
    const ny = (y + (offset?.y ?? 0)) * freq * scale;
    const nz = (z + (offset?.z ?? 0)) * freq * scale;

    return perlinNoise3D(nx, ny, nz, this.seed) * amp;
  }

  /**
   * Generate fractal 2D noise
   */
  fractalNoise2D(x: number, y: number, options?: FractalPerlinNoiseOptions): number {
    this.ensureTables();
    const opts: FractalPerlinNoiseOptions = {
      octaves: options?.octaves ?? this.config.octaves ?? 4,
      persistence: options?.persistence ?? this.config.persistence ?? 0.5,
      lacunarity: options?.lacunarity ?? this.config.lacunarity ?? 2.0,
      frequency: options?.frequency ?? this.config.frequency ?? 1.0,
      amplitude: options?.amplitude ?? this.config.amplitude ?? 1.0,
      normalize: options?.normalize ?? this.config.normalize ?? false,
    };

    const offset = this.config.offset ?? { x: 0, y: 0 };
    const scale = this.config.scale ?? 1.0;

    const nx = (x + (offset?.x ?? 0)) * scale;
    const ny = (y + (offset?.y ?? 0)) * scale;

    return fractalPerlinNoise2D(nx, ny, opts, this.seed, this.cachedGradients!, this.cachedPermutation!);
  }

  /**
   * Generate noise with result information
   */
  noise2DWithResult(x: number, y: number, options?: PerlinNoiseOptions): PerlinNoiseResult {
    const value = this.noise2D(x, y, options);
    return {
      value,
      gradient: {
        x: this.noise2D(x + 0.01, y, options) - this.noise2D(x - 0.01, y, options),
        y: this.noise2D(x, y + 0.01, options) - this.noise2D(x, y - 0.01, options),
      },
    };
  }

  /**
   * Generate multiscale 2D noise
   */
  multiscaleNoise2D(x: number, y: number, options: MultiscalePerlinNoiseOptions): MultiscalePerlinNoiseResult {
    this.ensureTables();
    const offset = this.config.offset ?? { x: 0, y: 0 };
    const scale = this.config.scale ?? 1.0;

    const nx = (x + (offset?.x ?? 0)) * scale;
    const ny = (y + (offset?.y ?? 0)) * scale;

    return generateMultiscaleNoise2D(nx, ny, options, this.seed, this.cachedGradients!, this.cachedPermutation!);
  }

  /**
   * Generate multiscale 3D noise
   */
  multiscaleNoise3D(
    x: number,
    y: number,
    z: number,
    options: MultiscalePerlinNoiseOptions
  ): MultiscalePerlinNoiseResult {
    const offset = this.config.offset ?? { x: 0, y: 0, z: 0 };
    const scale = this.config.scale ?? 1.0;

    const nx = (x + (offset?.x ?? 0)) * scale;
    const ny = (y + (offset?.y ?? 0)) * scale;
    const nz = (z + (offset?.z ?? 0)) * scale;

    return generateMultiscaleNoise3D(nx, ny, nz, options, this.seed);
  }
}
