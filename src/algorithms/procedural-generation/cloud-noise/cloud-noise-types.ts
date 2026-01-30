/**
 * @module algorithms/procedural-generation/cloud-noise/cloud-noise-types
 * @description Type definitions for cloud noise generation.
 */

/**
 * Configuration for cloud noise generation
 */
export interface CloudNoiseConfig {
  /** Cloud coverage factor (0-1) */
  coverage: number;
  /** Base density multiplier */
  density: number;
  /** Number of noise octaves */
  octaves: number;
  /** Frequency multiplier between octaves */
  lacunarity: number;
  /** Amplitude multiplier between octaves */
  persistence: number;
  /** Wind speed in X direction */
  windSpeedX: number;
  /** Wind speed in Z direction */
  windSpeedZ: number;
  /** Cloud layer height (center Y position) */
  layerHeight: number;
  /** Cloud layer thickness */
  layerThickness: number;
  /** Noise scale factor */
  noiseScale: number;
}

/**
 * Default cloud noise configuration
 */
export const DEFAULT_CLOUD_NOISE_CONFIG: CloudNoiseConfig = {
  coverage: 0.5,
  density: 1.0,
  octaves: 4,
  lacunarity: 2.0,
  persistence: 0.5,
  windSpeedX: 0.1,
  windSpeedZ: 0.05,
  layerHeight: 50.0,
  layerThickness: 30.0,
  noiseScale: 0.01,
};

/**
 * Result of cloud noise sampling
 */
export interface CloudNoiseResult {
  /** Density value (0-1) */
  density: number;
  /** Normalized position within cloud layer (0-1) */
  layerPosition: number;
}

