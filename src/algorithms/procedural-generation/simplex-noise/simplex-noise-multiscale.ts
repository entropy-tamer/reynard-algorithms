/**
 * Simplex Noise Multiscale Implementation
 *
 * Multiscale noise generation for Simplex noise, allowing independent
 * scale generation with flexible combination modes.
 */

import type {
  MultiscaleSimplexNoiseOptions,
  MultiscaleSimplexNoiseResult,
  MultiscaleCombinationMode,
  ScaleDefinition,
  ScaleStats,
  SimplexNoiseConfig,
} from "./simplex-noise-types";
import { noise2D } from "./simplex-noise-2d";
import { noise3D } from "./simplex-noise-3d";
import { noise4D } from "./simplex-noise-4d";

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
 * Generate multiscale 2D Simplex noise
 */
export function generateMultiscaleNoise2D(
  x: number,
  y: number,
  options: MultiscaleSimplexNoiseOptions,
  config: SimplexNoiseConfig,
  grad3: number[][],
  perm: number[],
  permMod12: number[]
): MultiscaleSimplexNoiseResult {
  const { scales, combinationMode = "additive", normalize = false } = options;

  const scaleMap = new Map<string | number, number>();
  const scaleValues: Array<{ value: number; amplitude: number }> = [];

  // Generate noise for each scale
  for (let i = 0; i < scales.length; i++) {
    const scale = scales[i];
    // Create a modified config with the scale frequency
    const scaleConfig: SimplexNoiseConfig = {
      ...config,
      frequency: (config.frequency ?? 1.0) * scale.frequency,
    };
    const noiseValue = noise2D(x, y, scaleConfig, grad3, perm, permMod12);

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
 * Generate multiscale 3D Simplex noise
 */
export function generateMultiscaleNoise3D(
  x: number,
  y: number,
  z: number,
  options: MultiscaleSimplexNoiseOptions,
  config: SimplexNoiseConfig,
  grad3: number[][],
  perm: number[],
  permMod12: number[]
): MultiscaleSimplexNoiseResult {
  const { scales, combinationMode = "additive", normalize = false } = options;

  const scaleMap = new Map<string | number, number>();
  const scaleValues: Array<{ value: number; amplitude: number }> = [];

  // Generate noise for each scale
  for (let i = 0; i < scales.length; i++) {
    const scale = scales[i];
    // Create a modified config with the scale frequency
    const scaleConfig: SimplexNoiseConfig = {
      ...config,
      frequency: (config.frequency ?? 1.0) * scale.frequency,
    };
    const noiseValue = noise3D(x, y, z, scaleConfig, grad3, perm, permMod12);

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
 * Generate multiscale 4D Simplex noise
 */
export function generateMultiscaleNoise4D(
  x: number,
  y: number,
  z: number,
  w: number,
  options: MultiscaleSimplexNoiseOptions,
  config: SimplexNoiseConfig,
  grad4: number[][],
  perm: number[],
  permMod12: number[]
): MultiscaleSimplexNoiseResult {
  const { scales, combinationMode = "additive", normalize = false } = options;

  const scaleMap = new Map<string | number, number>();
  const scaleValues: Array<{ value: number; amplitude: number }> = [];

  // Generate noise for each scale
  for (let i = 0; i < scales.length; i++) {
    const scale = scales[i];
    // Create a modified config with the scale frequency
    const scaleConfig: SimplexNoiseConfig = {
      ...config,
      frequency: (config.frequency ?? 1.0) * scale.frequency,
    };
    const noiseValue = noise4D(x, y, z, w, scaleConfig, grad4, perm, permMod12);

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





