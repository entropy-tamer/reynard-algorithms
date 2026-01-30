/**
 * @module algorithms/rendering/fog/fog-core
 * @description Height-based fog density calculations with exponential falloff.
 *
 * Mathematical Theory:
 * Fog density follows an exponential falloff model:
 * density = maxDensity * (1 - e^(-falloff * height))
 *
 * This creates realistic fog that increases in density with height,
 * simulating atmospheric scattering and absorption.
 */

import type { FogConfig, FogResult } from "./fog-types";
import { DEFAULT_FOG_CONFIG } from "./fog-types";

/**
 * Calculate fog density at a given height
 * @param height - Y coordinate (height)
 * @param config - Fog configuration
 * @returns Fog density (0-1)
 * @example
 */
export function calculateFogDensity(height: number, config: FogConfig = DEFAULT_FOG_CONFIG): number {
  const { baseHeight, density, falloff } = config;

  if (height < baseHeight) {
    return 0;
  }

  const heightDiff = height - baseHeight;
  const fogDensity = density * (1.0 - Math.exp(-falloff * heightDiff));
  return Math.max(0, Math.min(1, fogDensity));
}

/**
 * Calculate fog density and color at a position
 * @param position - 3D position [x, y, z]
 * @param config - Fog configuration
 * @param time - Current time (for animated fog, optional)
 * @param _time
 * @returns Fog result with density and color
 * @example
 */
export function calculateFog(
  position: [number, number, number],
  config: FogConfig = DEFAULT_FOG_CONFIG,
  _time: number = 0
): FogResult {
  const height = position[1];
  const fogDensity = calculateFogDensity(height, config);

  // Apply color with intensity
  const color: [number, number, number] = [
    config.color[0] * config.colorIntensity * fogDensity,
    config.color[1] * config.colorIntensity * fogDensity,
    config.color[2] * config.colorIntensity * fogDensity,
  ];

  return {
    density: fogDensity,
    color,
  };
}

/**
 * Calculate fog density with distance-based falloff
 * @param position - 3D position
 * @param cameraPosition - Camera position
 * @param config - Fog configuration
 * @returns Fog density
 * @example
 */
export function calculateDistanceFog(
  position: [number, number, number],
  cameraPosition: [number, number, number],
  config: FogConfig = DEFAULT_FOG_CONFIG
): number {
  // Calculate distance from camera
  const dx = position[0] - cameraPosition[0];
  const dy = position[1] - cameraPosition[1];
  const dz = position[2] - cameraPosition[2];
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Combine height-based and distance-based fog
  const heightDensity = calculateFogDensity(position[1], config);
  const distanceFactor = Math.min(1, distance / config.maxDistance);
  const distanceDensity = config.density * distanceFactor;

  // Use maximum of both
  return Math.max(heightDensity, distanceDensity * 0.5);
}
