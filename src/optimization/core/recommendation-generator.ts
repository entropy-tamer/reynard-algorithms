/**
 * Recommendation Generator Module
 *
 * Generates optimization recommendations based on workload analysis.
 *
 * @module algorithms/optimization/recommendationGenerator
 */

import type { WorkloadCharacteristics, ComplexityAnalysis, MemoryPressureAnalysis } from "./algorithm-selector-types";

/**
 * Generates optimization recommendations
 */
export class RecommendationGenerator {
  /**
   * Generate optimization recommendations
   * @param workload
   * @param _complexity
   * @param memoryPressure
   * @example
   */
  generateRecommendations(
    workload: WorkloadCharacteristics,
    _complexity: ComplexityAnalysis,
    memoryPressure: MemoryPressureAnalysis
  ): string[] {
    const recommendations: string[] = [];

    if (workload.objectCount > 100) {
      recommendations.push("Consider using optimized algorithms for large datasets");
    }

    if (memoryPressure.pressure > 0.8) {
      recommendations.push("High memory pressure detected - use memory pooling");
    }

    if (workload.overlapRatio > 0.7) {
      recommendations.push("High overlap ratio - spatial optimization recommended");
    }

    if (workload.updateFrequency > 10) {
      recommendations.push("High update frequency - consider incremental updates");
    }

    return recommendations;
  }
}
