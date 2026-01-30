/**
 * Complexity Analysis Module
 *
 * Analyzes workload complexity for algorithm selection.
 *
 * @module algorithms/optimization/complexityAnalyzer
 */

import type { WorkloadCharacteristics, ComplexityAnalysis } from "./algorithm-selector-types";

/**
 * Analyzes workload complexity based on PAW findings
 */
export class ComplexityAnalyzer {
  /**
   * Calculate workload complexity based on PAW findings
   * @param workload
   * @example
   */
  calculateComplexity(workload: WorkloadCharacteristics): ComplexityAnalysis {
    const { objectCount, spatialDensity, overlapRatio } = workload;

    // Based on PAW empirical findings
    const naiveComplexity = objectCount * objectCount;
    const spatialComplexity = objectCount * Math.log(objectCount) + spatialDensity * objectCount;
    const optimizedComplexity = objectCount * Math.log(objectCount) + overlapRatio * objectCount;

    return {
      naive: naiveComplexity,
      spatial: spatialComplexity,
      optimized: optimizedComplexity,
      crossoverPoint: this.findCrossoverPoint(naiveComplexity, spatialComplexity),
      recommendation: this.getComplexityRecommendation(naiveComplexity, spatialComplexity, optimizedComplexity),
    };
  }

  /**
   * Find crossover point between algorithms
   * @param naiveComplexity
   * @param spatialComplexity
   * @example
   */
  private findCrossoverPoint(naiveComplexity: number, spatialComplexity: number): number {
    // Based on PAW findings, crossover occurs around 50-100 objects
    return Math.sqrt(naiveComplexity / spatialComplexity);
  }

  /**
   * Get complexity-based recommendation
   * @param naive
   * @param spatial
   * @param optimized
   * @example
   */
  private getComplexityRecommendation(naive: number, spatial: number, optimized: number): string {
    if (naive < spatial && naive < optimized) return "naive";
    if (spatial < optimized) return "spatial";
    return "optimized";
  }
}
