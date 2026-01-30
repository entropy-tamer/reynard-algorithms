/**
 * @module algorithms/rendering/volumetric
 * @description Volumetric rendering algorithms for clouds, fog, and atmospheric effects.
 */

export { raymarchVolumetric, calculateAdaptiveStepSize } from "./volumetric-core";
export type {
  VolumetricConfig,
  VolumetricResult,
  Ray,
  DensityFunction,
  VolumetricLighting,
} from "./volumetric-types";
export { DEFAULT_VOLUMETRIC_CONFIG } from "./volumetric-types";
export {
  createFogDensityFunction,
  createCloudDensityFunction,
  createWorleyCloudDensityFunction,
} from "./density-functions";

