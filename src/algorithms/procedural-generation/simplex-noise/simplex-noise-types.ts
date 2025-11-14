/**
 * @file algorithms/geometry/algorithms/simplex-noise/simplex-noise-types
 * @module algorithms/geometry/algorithms/simplex-noise/types
 * @description Main type definitions for the Simplex Noise algorithm.
 * Re-exports all types from modular type files for backward compatibility.
 */

// Point types
export type { Point2D, Point3D, Point4D } from "./types/points";

// Configuration types
export type { SimplexNoiseConfig } from "./types/config";

// Statistics and result types
export type { NoiseStats, NoiseResult } from "./types/stats";

// Dimension-specific option types
export type { Noise2DOptions, Noise3DOptions, Noise4DOptions } from "./types/dimensions";

// Fractal types
export type { FractalNoiseOptions } from "./types/fractal";

// Analysis types
export type { NoiseAnalysisOptions, NoiseAnalysis } from "./types/analysis";

// Filter types
export type { NoiseFilterOptions, NoiseFilterResult } from "./types/filter";

// Multiscale types
export type {
  ScaleDefinition,
  MultiscaleCombinationMode,
  ScaleStats,
  MultiscaleSimplexNoiseOptions,
  MultiscaleSimplexNoiseResult,
} from "./types/multiscale";
