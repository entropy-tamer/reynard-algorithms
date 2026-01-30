/**
 * @module algorithms/rendering/volumetric/volumetric-core
 * @description Core raymarching algorithm for volumetric rendering.
 *
 * Mathematical Theory:
 * Volumetric raymarching samples density along a ray to compute light scattering.
 * The algorithm steps through space, sampling density at each point and accumulating
 * color and opacity using the Beer-Lambert law for light absorption.
 *
 * Beer-Lambert Law: I = I₀ * e^(-τ)
 * where τ (tau) is the optical depth = ∫ density(s) * stepSize ds
 *
 * For each step:
 * - Sample density at current position
 * - Calculate light scattering (Henyey-Greenstein phase function)
 * - Accumulate color and opacity
 * - Early exit if opacity threshold reached
 */

import type {
  VolumetricConfig,
  VolumetricResult,
  Ray,
  DensityFunction,
  VolumetricLighting,
} from "./volumetric-types";
import { DEFAULT_VOLUMETRIC_CONFIG } from "./volumetric-types";

/**
 * Henyey-Greenstein phase function for light scattering
 * @param cosTheta - Cosine of angle between view and light direction
 * @param g - Anisotropy parameter (-1 to 1, 0 = isotropic)
 * @returns Scattering phase value
 * @example
 */
function henyeyGreenstein(cosTheta: number, g: number): number {
  const g2 = g * g;
  const denom = 1.0 + g2 - 2.0 * g * cosTheta;
  return (1.0 - g2) / (4.0 * Math.PI * Math.pow(denom, 1.5));
}

/**
 * Calculate dot product of two 3D vectors
 * @param a
 * @param b
 * @example
 */
function dot(a: [number, number, number], b: [number, number, number]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Normalize a 3D vector
 * @param v
 * @example
 */
function normalize(v: [number, number, number]): [number, number, number] {
  const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  if (length < 0.0001) return [0, 0, 0];
  return [v[0] / length, v[1] / length, v[2] / length];
}

/**
 * Scale vector by scalar
 * @param v
 * @param s
 * @example
 */
function scale(v: [number, number, number], s: number): [number, number, number] {
  return [v[0] * s, v[1] * s, v[2] * s];
}

/**
 * Add two vectors
 * @param a
 * @param b
 * @example
 */
function add(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

/**
 * Perform volumetric raymarching
 * @param ray - Ray to march along
 * @param densityFunction - Function to sample density at positions
 * @param lighting - Lighting information for scattering
 * @param config - Volumetric configuration
 * @param time - Current time value
 * @returns Volumetric rendering result
 * @example
 */
export function raymarchVolumetric(
  ray: Ray,
  densityFunction: DensityFunction,
  lighting: VolumetricLighting,
  config: VolumetricConfig = DEFAULT_VOLUMETRIC_CONFIG,
  time: number = 0
): VolumetricResult {
  const {
    maxSteps,
    stepSize,
    minStepSize,
    maxStepSize,
    opacityThreshold,
    maxDistance,
    adaptiveStepping,
  } = config;

  let currentPos: [number, number, number] = [...ray.origin];
  let totalDistance = 0;
  let opacity = 0;
  const color: [number, number, number] = [0, 0, 0];
  let steps = 0;
  let earlyExit = false;

  const normalizedDir = normalize(ray.direction);

  for (let i = 0; i < maxSteps && totalDistance < maxDistance; i++) {
    // Sample density at current position
    const density = densityFunction(currentPos, time);

    if (density > 0.001) {
      // Calculate light scattering
      const viewDir = scale(normalizedDir, -1);
      const cosTheta = dot(viewDir, lighting.direction);
      const phase = henyeyGreenstein(cosTheta, lighting.anisotropy);

      // Calculate absorption and scattering
      const absorption = density * stepSize;
      const scattering = density * stepSize * phase;

      // Accumulate color (light scattering)
      const lightColor = lighting.color;
      const lightContribution: [number, number, number] = [
        lightColor[0] * scattering * lighting.intensity,
        lightColor[1] * scattering * lighting.intensity,
        lightColor[2] * scattering * lighting.intensity,
      ];

      // Apply Beer-Lambert law for transmission
      const transmission = Math.exp(-absorption);
      color[0] = color[0] * transmission + lightContribution[0];
      color[1] = color[1] * transmission + lightContribution[1];
      color[2] = color[2] * transmission + lightContribution[2];

      // Accumulate opacity
      opacity = 1.0 - (1.0 - opacity) * transmission;

      // Early exit if opacity threshold reached
      if (opacity >= opacityThreshold) {
        earlyExit = true;
        steps = i + 1;
        break;
      }
    }

    // Adaptive step size based on density
    let currentStepSize = stepSize;
    if (adaptiveStepping && density > 0.01) {
      // Smaller steps in dense regions
      currentStepSize = Math.max(
        minStepSize,
        Math.min(maxStepSize, stepSize / (1.0 + density * 10))
      );
    }

    // Advance along ray
    const step = scale(normalizedDir, currentStepSize);
    currentPos = add(currentPos, step);
    totalDistance += currentStepSize;
    steps++;
  }

  return {
    color: [
      Math.max(0, Math.min(1, color[0])),
      Math.max(0, Math.min(1, color[1])),
      Math.max(0, Math.min(1, color[2])),
    ],
    opacity: Math.max(0, Math.min(1, opacity)),
    steps,
    distance: totalDistance,
    earlyExit,
  };
}

/**
 * Calculate adaptive step size based on density gradient
 * @param position - Current position
 * @param densityFunction - Density function
 * @param time - Current time
 * @param baseStepSize - Base step size
 * @returns Adaptive step size
 * @example
 */
export function calculateAdaptiveStepSize(
  position: [number, number, number],
  densityFunction: DensityFunction,
  time: number,
  baseStepSize: number
): number {
  const epsilon = 0.01;
  const density = densityFunction(position, time);

  // Sample nearby positions to estimate gradient
  const dx = densityFunction([position[0] + epsilon, position[1], position[2]], time);
  const dy = densityFunction([position[0], position[1] + epsilon, position[2]], time);
  const dz = densityFunction([position[0], position[1], position[2] + epsilon], time);

  const gradient = Math.sqrt(
    Math.pow(dx - density, 2) + Math.pow(dy - density, 2) + Math.pow(dz - density, 2)
  );

  // Larger steps in low-gradient regions
  const adaptiveFactor = 1.0 / (1.0 + gradient * 10);
  return baseStepSize * Math.max(0.1, Math.min(2.0, adaptiveFactor));
}

