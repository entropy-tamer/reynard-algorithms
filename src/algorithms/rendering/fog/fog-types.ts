/**
 * @module algorithms/rendering/fog/fog-types
 * @description Type definitions for fog rendering algorithms.
 */

/**
 * Configuration for fog rendering
 */
export interface FogConfig {
  /** Base height where fog starts */
  baseHeight: number;
  /** Maximum fog density (0-1) */
  density: number;
  /** Exponential falloff rate */
  falloff: number;
  /** Fog color (RGB) */
  color: [number, number, number];
  /** Fog color intensity */
  colorIntensity: number;
  /** Maximum fog distance */
  maxDistance: number;
}

/**
 * Default fog configuration
 */
export const DEFAULT_FOG_CONFIG: FogConfig = {
  baseHeight: 0.0,
  density: 0.5,
  falloff: 0.1,
  color: [0.8, 0.8, 0.9],
  colorIntensity: 1.0,
  maxDistance: 100.0,
};

/**
 * Result of fog density calculation
 */
export interface FogResult {
  /** Fog density (0-1) */
  density: number;
  /** Fog color contribution */
  color: [number, number, number];
}

