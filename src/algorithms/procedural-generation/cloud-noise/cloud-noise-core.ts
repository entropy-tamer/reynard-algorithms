/**
 * @module algorithms/procedural-generation/cloud-noise/cloud-noise-core
 * @description Multi-octave noise generation for cloud density using simplex noise.
 */

import type { CloudNoiseConfig, CloudNoiseResult } from "./cloud-noise-types";
import { DEFAULT_CLOUD_NOISE_CONFIG } from "./cloud-noise-types";

/**
 * 3D noise function type
 */
export type Noise3DFunction = (x: number, y: number, z: number) => number;

/**
 * Generate cloud density using multi-octave noise
 * @param x - X position
 * @param y - Y position
 * @param z - Z position
 * @param time - Current time for animation
 * @param noiseFunction - 3D noise function to use
 * @param config - Cloud noise configuration
 * @returns Cloud noise result with density and layer position
 * @example
 */
export function generateCloudNoise(
  x: number,
  y: number,
  z: number,
  time: number,
  noiseFunction: Noise3DFunction,
  config: CloudNoiseConfig = DEFAULT_CLOUD_NOISE_CONFIG
): CloudNoiseResult {
  const {
    coverage,
    density,
    octaves,
    lacunarity,
    persistence,
    windSpeedX,
    windSpeedZ,
    layerHeight,
    layerThickness,
    noiseScale,
  } = config;

  // Apply wind animation
  const windOffsetX = time * windSpeedX;
  const windOffsetZ = time * windSpeedZ;

  // Scale positions
  const sampleX = x * noiseScale + windOffsetX;
  const sampleY = y * noiseScale;
  const sampleZ = z * noiseScale + windOffsetZ;

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

  // Normalize to [0, 1]
  value = value / maxValue;
  value = (value + 1.0) * 0.5; // Convert from [-1, 1] to [0, 1]

  // Apply coverage threshold
  value = (value - (1.0 - coverage)) / coverage;
  value = Math.max(0, Math.min(1, value));

  // Apply density multiplier
  value *= density;

  // Calculate layer position (0 = bottom, 1 = top)
  const layerPosition = Math.max(
    0,
    Math.min(1, (y - (layerHeight - layerThickness / 2)) / layerThickness)
  );

  // Apply height falloff (clouds are denser in middle layers)
  const heightFactor = Math.max(0, 1.0 - Math.abs((layerPosition - 0.5) * 2));
  value *= heightFactor;

  return {
    density: Math.max(0, Math.min(1, value)),
    layerPosition,
  };
}

/**
 * Generate cloud density with Worley noise (cellular noise) for more defined shapes
 * @param x - X position
 * @param y - Y position
 * @param z - Z position
 * @param time - Current time for animation
 * @param worleyFunction - Worley/cellular noise function
 * @param detailNoiseFunction - Detail noise function (e.g., simplex)
 * @param config - Cloud noise configuration
 * @returns Cloud noise result
 * @example
 */
export function generateWorleyCloudNoise(
  x: number,
  y: number,
  z: number,
  time: number,
  worleyFunction: Noise3DFunction,
  detailNoiseFunction: Noise3DFunction,
  config: CloudNoiseConfig = DEFAULT_CLOUD_NOISE_CONFIG
): CloudNoiseResult {
  const {
    coverage,
    density,
    windSpeedX,
    windSpeedZ,
    layerHeight,
    layerThickness,
    noiseScale,
  } = config;

  const windOffsetX = time * windSpeedX;
  const windOffsetZ = time * windSpeedZ;

  const sampleX = x * noiseScale + windOffsetX;
  const sampleY = y * noiseScale;
  const sampleZ = z * noiseScale + windOffsetZ;

  // Combine Worley (shape) and detail noise
  const worleyValue = worleyFunction(sampleX, sampleY, sampleZ);
  const detailValue = detailNoiseFunction(sampleX * 2, sampleY * 2, sampleZ * 2) * 0.3;

  let value = worleyValue + detailValue;
  value = (value + 1.0) * 0.5; // Convert to [0, 1]
  value = (value - (1.0 - coverage)) / coverage;
  value = Math.max(0, Math.min(1, value));
  value *= density;

  const layerPosition = Math.max(
    0,
    Math.min(1, (y - (layerHeight - layerThickness / 2)) / layerThickness)
  );

  const heightFactor = Math.max(0, 1.0 - Math.abs((layerPosition - 0.5) * 2));
  value *= heightFactor;

  return {
    density: Math.max(0, Math.min(1, value)),
    layerPosition,
  };
}

