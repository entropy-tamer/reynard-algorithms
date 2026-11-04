/**
 * One 2D noise function, without the class that carries 3D and 4D as well.
 *
 * `new SimplexNoise({ seed }).noise2D(x, y)` is the friendly API, and it is the
 * right one when a caller uses several dimensions or the analysis helpers. It is
 * the wrong one when a caller wants a field of 2D noise and nothing else: the
 * class holds methods for 3D, 4D, multiscale, fractal and analysis, so every
 * consumer that instantiates it links all of that. On sly.so's /start page that
 * was 15.5 KiB of a 41 KiB chunk to compute two numbers per particle per frame.
 *
 * `createNoise2D` closes over the gradient and permutation tables once and hands
 * back a plain function. Same algorithm, same numbers: the test asserts it agrees
 * with `SimplexNoise.noise2D` and with `generateNoise2D` across seeds, offsets,
 * amplitudes, frequencies and the normalize flag, because "it is only a wrapper"
 * is the claim that rots first.
 *
 * @module algorithms/geometry/algorithms/simplex-noise
 */

import type { SimplexNoiseConfig } from "./simplex-noise-types";
import { generateNoise2D } from "./simplex-noise-generate-2d";
import { initializeGradients, initializePermutation } from "./simplex-noise-init";

/**
 * The configuration a single 2D noise function can honour. Everything else in
 * `SimplexNoiseConfig` (octaves, persistence, lacunarity) describes fractal
 * composition, which a lone sample does not do.
 */
export type CreateNoise2DOptions = Partial<
  Pick<SimplexNoiseConfig, "seed" | "frequency" | "amplitude" | "scale" | "offset" | "normalize">
>;

export type Noise2D = (x: number, y: number) => number;

const DEFAULTS: SimplexNoiseConfig = {
  seed: 0,
  frequency: 1.0,
  amplitude: 1.0,
  octaves: 4,
  persistence: 0.5,
  lacunarity: 2.0,
  scale: 1.0,
  offset: { x: 0, y: 0, z: 0, w: 0 },
  normalize: false,
  useImprovedGradients: true,
};

/**
 * Build a 2D simplex noise sampler.
 *
 * The tables are built once, here, rather than per call.
 *
 * @param options - Seed and the transforms applied to every sample.
 * @returns A function of `(x, y)` returning noise in `[-1, 1]`, or `[0, 1]` when
 * `normalize` is set.
 * @example
 * const noise2D = createNoise2D({ seed: 7, frequency: 0.02 });
 * const angle = noise2D(x, y) * Math.PI * 2;
 */
export function createNoise2D(options: CreateNoise2DOptions = {}): Noise2D {
  const config: SimplexNoiseConfig = { ...DEFAULTS, ...options };
  const { grad3 } = initializeGradients(config);
  const { perm, permMod12 } = initializePermutation(config);

  return (x, y) => generateNoise2D(x, y, config, grad3, perm, permMod12);
}
