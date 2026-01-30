/**
 * @module algorithms/rendering/volumetric/density-functions
 * @description Density calculation functions for volumetric effects.
 */

import type { DensityFunction } from "./volumetric-types";

/**
 * Height-based exponential fog density
 * @param baseHeight - Base height where fog starts
 * @param density - Maximum density value
 * @param falloff - Exponential falloff rate
 * @returns Density function
 * @example
 */
export function createFogDensityFunction(
  baseHeight: number,
  density: number,
  falloff: number
): DensityFunction {
  return (position: [number, number, number], _time: number): number => {
    const height = position[1]; // Y coordinate
    if (height < baseHeight) {
      return 0;
    }
    const heightDiff = height - baseHeight;
    const fogDensity = density * (1.0 - Math.exp(-falloff * heightDiff));
    return Math.max(0, Math.min(1, fogDensity));
  };
}

/**
 * Cloud density using multi-octave noise
 * @param noiseFunction - 3D noise function (x, y, z) => number
 * @param coverage - Cloud coverage factor (0-1)
 * @param density - Base density multiplier
 * @param octaves - Number of noise octaves
 * @param lacunarity - Frequency multiplier between octaves
 * @param persistence - Amplitude multiplier between octaves
 * @returns Density function
 * @example
 */
export function createCloudDensityFunction(
  noiseFunction: (x: number, y: number, z: number) => number,
  coverage: number = 0.5,
  density: number = 1.0,
  octaves: number = 4,
  lacunarity: number = 2.0,
  persistence: number = 0.5
): DensityFunction {
  return (position: [number, number, number], time: number): number => {
    const [x, y, z] = position;
    
    // Animate with time (wind effect)
    const windOffset = time * 0.1;
    const sampleX = x * 0.01 + windOffset;
    const sampleY = y * 0.01;
    const sampleZ = z * 0.01 + windOffset * 0.5;
    
    // Multi-octave noise
    let value = 0;
    let amplitude = 1.0;
    let frequency = 1.0;
    let maxValue = 0;
    
    for (let i = 0; i < octaves; i++) {
      const noiseValue = noiseFunction(
        sampleX * frequency,
        sampleY * frequency,
        sampleZ * frequency
      );
      value += noiseValue * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }
    
    // Normalize
    value = value / maxValue;
    
    // Apply coverage threshold
    value = (value - (1.0 - coverage)) / coverage;
    value = Math.max(0, Math.min(1, value));
    
    // Apply density
    value *= density;
    
    // Shape with height falloff (clouds are denser in middle layers)
    const heightFactor = Math.max(0, 1.0 - Math.abs((y - 50) / 30));
    value *= heightFactor;
    
    return Math.max(0, Math.min(1, value));
  };
}

/**
 * Worley noise-based cloud density (cellular noise)
 * Creates more defined cloud shapes
 * @param noiseFunction - 3D noise function for variation
 * @param worleyFunction - Worley/cellular noise function
 * @param coverage - Cloud coverage factor
 * @param density - Base density multiplier
 * @returns Density function
 * @example
 */
export function createWorleyCloudDensityFunction(
  noiseFunction: (x: number, y: number, z: number) => number,
  worleyFunction: (x: number, y: number, z: number) => number,
  coverage: number = 0.5,
  density: number = 1.0
): DensityFunction {
  return (position: [number, number, number], time: number): number => {
    const [x, y, z] = position;
    
    const windOffset = time * 0.1;
    const sampleX = x * 0.01 + windOffset;
    const sampleY = y * 0.01;
    const sampleZ = z * 0.01 + windOffset * 0.5;
    
    // Combine Worley (shape) and Perlin (detail)
    const worleyValue = worleyFunction(sampleX, sampleY, sampleZ);
    const detailValue = noiseFunction(sampleX * 2, sampleY * 2, sampleZ * 2) * 0.3;
    
    let value = worleyValue + detailValue;
    value = (value - (1.0 - coverage)) / coverage;
    value = Math.max(0, Math.min(1, value));
    value *= density;
    
    // Height falloff
    const heightFactor = Math.max(0, 1.0 - Math.abs((y - 50) / 30));
    value *= heightFactor;
    
    return Math.max(0, Math.min(1, value));
  };
}

