/**
 * Simplex Noise Generation Operations
 *
 * Handles core noise generation algorithms and initialization
 * for the Simplex Noise algorithm.
 *
 * @module algorithms/geometry/algorithms/simplex-noise
 */

import type {
  SimplexNoiseConfig,
  NoiseStats,
  NoiseResult,
  Noise2DOptions,
  Noise3DOptions,
  Noise4DOptions,
  FractalNoiseOptions,
} from "./simplex-noise-types";

import { initializeGradients, initializePermutation } from "./simplex-noise-init";
import { generateNoise2D, generateNoise3D, generateNoise4D, generateFractalNoise } from "./simplex-noise-core-functions";

// Re-export functions from core modules
export { generateNoise2D, generateNoise3D, generateNoise4D, generateFractalNoise } from "./simplex-noise-core-functions";

