/**
 * @module algorithms/rendering/volumetric/volumetric-types
 * @description Type definitions for volumetric rendering algorithms.
 */

/**
 * Configuration for volumetric raymarching
 */
export interface VolumetricConfig {
  /** Maximum number of raymarching steps */
  maxSteps: number;
  /** Step size for raymarching (in world units) */
  stepSize: number;
  /** Minimum step size for adaptive stepping */
  minStepSize: number;
  /** Maximum step size for adaptive stepping */
  maxStepSize: number;
  /** Opacity threshold for early exit */
  opacityThreshold: number;
  /** Maximum raymarching distance */
  maxDistance: number;
  /** Enable adaptive step size */
  adaptiveStepping: boolean;
}

/**
 * Default volumetric configuration
 */
export const DEFAULT_VOLUMETRIC_CONFIG: VolumetricConfig = {
  maxSteps: 64,
  stepSize: 0.1,
  minStepSize: 0.05,
  maxStepSize: 0.5,
  opacityThreshold: 0.99,
  maxDistance: 100.0,
  adaptiveStepping: true,
};

/**
 * Density function type
 * @param position - 3D position in world space
 * @param time - Current time value
 * @returns Density value between 0 and 1
 */
export type DensityFunction = (position: [number, number, number], time: number) => number;

/**
 * Result of volumetric raymarching
 */
export interface VolumetricResult {
  /** Final color after raymarching */
  color: [number, number, number];
  /** Final opacity (alpha) */
  opacity: number;
  /** Number of steps taken */
  steps: number;
  /** Distance traveled */
  distance: number;
  /** Whether early exit occurred */
  earlyExit: boolean;
}

/**
 * Ray definition for raymarching
 */
export interface Ray {
  /** Ray origin */
  origin: [number, number, number];
  /** Ray direction (normalized) */
  direction: [number, number, number];
}

/**
 * Lighting information for volumetric scattering
 */
export interface VolumetricLighting {
  /** Light direction (normalized) */
  direction: [number, number, number];
  /** Light color */
  color: [number, number, number];
  /** Light intensity */
  intensity: number;
  /** Scattering anisotropy (Henyey-Greenstein g parameter) */
  anisotropy: number;
}

