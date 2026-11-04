/**
 * Cloud Noise
 *
 * @module algorithms/procedural-generation/cloud-noise
 * @description Cloud noise generation algorithms for volumetric cloud rendering.
 */

export { generateCloudNoise, generateWorleyCloudNoise } from "./cloud-noise-core";
export type { Noise3DFunction } from "./cloud-noise-core";
export type { CloudNoiseConfig, CloudNoiseResult } from "./cloud-noise-types";
export { DEFAULT_CLOUD_NOISE_CONFIG } from "./cloud-noise-types";

