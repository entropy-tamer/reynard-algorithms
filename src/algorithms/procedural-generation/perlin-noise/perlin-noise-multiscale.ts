/**
 * Perlin Noise Multiscale Implementation
 *
 * Multiscale noise generation for Perlin noise, allowing independent
 * scale generation with flexible combination modes.
 */

import type {
  MultiscalePerlinNoiseOptions,
  MultiscalePerlinNoiseResult,
  MultiscaleCombinationMode,
  ScaleDefinition,
  ScaleStats,
} from "./perlin-noise-types.js";
import { perlinNoise2D, perlinNoise3D } from "./perlin-noise-core.js";

/**
 * Combine scale values using the specified mode
 */
function combineScales(
  scaleValues: Array<{ value: number; amplitude: number }>,
  mode: MultiscaleCombinationMode,
  normalize: boolean
): number {
  if (scaleValues.length === 0) {
    return 0;
  }

  let result: number;

  switch (mode) {
    case "additive": {
      result = scaleValues.reduce((sum, scale) => sum + scale.value * scale.amplitude, 0);
      break;
    }
    case "multiplicative": {
      result = scaleValues.reduce((prod, scale) => prod * (scale.value * scale.amplitude + 1), 1) - 1;
      break;
    }
    case "weighted": {
      const totalWeight = scaleValues.reduce((sum, scale) => sum + scale.amplitude, 0);
      if (totalWeight === 0) {
        result = 0;
      } else {
        result = scaleValues.reduce((sum, scale) => sum + scale.value * scale.amplitude, 0) / totalWeight;
      }
      break;
    }
    case "max": {
      result = Math.max(...scaleValues.map(scale => scale.value * scale.amplitude));
      break;
    }
    case "min": {
      result = Math.min(...scaleValues.map(scale => scale.value * scale.amplitude));
      break;
    }
    default: {
      // Default to additive
      result = scaleValues.reduce((sum, scale) => sum + scale.value * scale.amplitude, 0);
    }
  }

  if (normalize && mode === "additive") {
    const maxAmplitude = scaleValues.reduce((sum, scale) => sum + scale.amplitude, 0);
    if (maxAmplitude > 0) {
      result = result / maxAmplitude;
    }
  }

  return result;
}

/**
 * Generate multiscale 2D Perlin noise
 */
export function generateMultiscaleNoise2D(
  x: number,
  y: number,
  options: MultiscalePerlinNoiseOptions,
  seed: number = 0,
  gradients?: Array<{ x: number; y: number }>,
  perm?: Uint8Array
): MultiscalePerlinNoiseResult {
  const { scales, combinationMode = "additive", normalize = false } = options;

  const scaleMap = new Map<string | number, number>();
  const scaleValues: Array<{ value: number; amplitude: number }> = [];

  // Generate noise for each scale
  for (let i = 0; i < scales.length; i++) {
    const scale = scales[i];
    const noiseValue = perlinNoise2D(x * scale.frequency, y * scale.frequency, seed, gradients, perm);
    const scaledValue = noiseValue * scale.amplitude;

    // Store in map using name or index
    const key = scale.name ?? i;
    scaleMap.set(key, noiseValue);

    scaleValues.push({
      value: noiseValue,
      amplitude: scale.amplitude,
    });
  }

  // Combine scales
  const combined = combineScales(scaleValues, combinationMode, normalize);

  return {
    scales: scaleMap,
    combined,
  };
}

/**
 * Generate multiscale 3D Perlin noise
 */
export function generateMultiscaleNoise3D(
  x: number,
  y: number,
  z: number,
  options: MultiscalePerlinNoiseOptions,
  seed: number = 0
): MultiscalePerlinNoiseResult {
  const { scales, combinationMode = "additive", normalize = false } = options;

  const scaleMap = new Map<string | number, number>();
  const scaleValues: Array<{ value: number; amplitude: number }> = [];

  // Generate noise for each scale
  for (let i = 0; i < scales.length; i++) {
    const scale = scales[i];
    const noiseValue = perlinNoise3D(x * scale.frequency, y * scale.frequency, z * scale.frequency, seed);
    const scaledValue = noiseValue * scale.amplitude;

    // Store in map using name or index
    const key = scale.name ?? i;
    scaleMap.set(key, noiseValue);

    scaleValues.push({
      value: noiseValue,
      amplitude: scale.amplitude,
    });
  }

  // Combine scales
  const combined = combineScales(scaleValues, combinationMode, normalize);

  return {
    scales: scaleMap,
    combined,
  };
}
