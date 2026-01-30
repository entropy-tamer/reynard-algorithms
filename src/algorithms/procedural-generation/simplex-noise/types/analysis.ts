/**
 * @file algorithms/geometry/algorithms/simplex-noise/types/analysis
 * @module algorithms/geometry/algorithms/simplex-noise/types/analysis
 * @description Analysis type definitions for Simplex Noise.
 */

import type { NoiseStats } from "./stats.js";

/**
 * Options for noise analysis.
 */
export interface NoiseAnalysisOptions {
  /**
   * Whether to compute statistical properties.
   * @default true
   */
  computeStatistics?: boolean;
  /**
   * Whether to compute frequency domain properties.
   * @default false
   */
  computeFrequencyDomain?: boolean;
  /**
   * Whether to compute spatial properties.
   * @default false
   */
  computeSpatialProperties?: boolean;
  /** Optional aliases used by some analysis helpers */
  includeDetailedStats?: boolean;
  includeFrequencyAnalysis?: boolean;
  includeSpatialAnalysis?: boolean;
}

/**
 * Analysis results for noise.
 */
export interface NoiseAnalysis {
  /**
   * Statistical properties of the noise.
   */
  statistics?: {
    min: number;
    max: number;
    mean: number;
    median: number;
    standardDeviation: number;
    variance: number;
    skewness: number;
    kurtosis: number;
  };
  /** Optional summarized stats */
  basicStats?:
    | {
        min: number;
        max: number;
        mean: number;
      }
    | NoiseStats;
  /** Detailed statistics (if computed) */
  detailedStats?: any;
  /** Frequency domain properties (if computed) */
  frequencyProperties?: any;
  /** Spatial properties (if computed) */
  spatialProperties?:
    | any
    | {
        correlationLength: number;
        anisotropy: number;
        roughness: number;
      };
  /** Effective analysis options used */
  analysisOptions?: NoiseAnalysisOptions;
  /**
   * Frequency domain properties (if computed).
   */
  frequencyDomain?: {
    dominantFrequencies: number[];
    spectralCentroid: number;
    spectralRolloff: number;
  };
}
