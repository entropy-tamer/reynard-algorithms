/**
 * @file algorithms/geometry/algorithms/simplex-noise/utils/analysis
 * @module algorithms/geometry/algorithms/simplex-noise/utils/analysis
 * @description Main noise analysis utilities for Simplex Noise.
 */

import type { NoiseAnalysis, NoiseAnalysisOptions } from "../simplex-noise-types.js";
import { computeStats, computeDetailedStatistics } from "./stats.js";
import { computeFrequencyDomainProperties } from "./analysis-frequency.js";
import { computeSpatialProperties } from "./analysis-spatial.js";

/**
 * Analyze noise properties
 *
 * @param values Array of noise values
 * @param options Analysis options
 * @returns Noise analysis
 * @example
 * const analysis = analyzeNoise([0.1, 0.5, 0.9], { includeDetailedStats: true });
 * console.log(analysis.basicStats); // Output: basic statistics object
 */
export function analyzeNoise(values: number[], options: Partial<NoiseAnalysisOptions> = {}): NoiseAnalysis {
  const analysisOptions: NoiseAnalysisOptions = {
    includeDetailedStats: true,
    includeFrequencyAnalysis: false,
    includeSpatialAnalysis: false,
    ...options,
  };

  const basicStats = computeStats(values, 0);
  let detailedStats: any = null;
  let frequencyProperties: any = null;
  let spatialProperties: any = null;

  if (analysisOptions.includeDetailedStats) {
    detailedStats = computeDetailedStatistics(values);
  }

  if (analysisOptions.includeFrequencyAnalysis) {
    frequencyProperties = computeFrequencyDomainProperties(values);
  }

  if (analysisOptions.includeSpatialAnalysis) {
    spatialProperties = computeSpatialProperties(values);
  }

  return {
    basicStats,
    detailedStats,
    frequencyProperties,
    spatialProperties,
    analysisOptions,
  };
}
