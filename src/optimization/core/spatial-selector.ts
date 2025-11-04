/**
 * Spatial Algorithm Selector
 *
 * Selects optimal spatial algorithms.
 *
 * @module algorithms/optimization/spatialSelector
 */

import type { WorkloadAnalysis, AlgorithmSelection } from "./algorithm-selector-types";

/**
 * Selects optimal spatial algorithms
 */
export class SpatialSelector {
  /**
   * Select optimal spatial algorithm
   * @param analysis
   * @param t
   * @example
   */
  selectOptimalSpatialAlgorithm(analysis: WorkloadAnalysis, t?: (key: string) => string): AlgorithmSelection {
    const { complexity } = analysis;
    const { objectCount, spatialDensity } = analysis.workload;

    // For high spatial density, use optimized spatial hashing
    if (spatialDensity > 0.7) {
      return {
        algorithm: "optimized-spatial",
        confidence: 0.9,
        expectedPerformance: {
          executionTime: complexity.optimized * 0.001,
          memoryUsage: objectCount * 32 + 1024,
        },
        reasoning: [
          t
            ? t("algorithms.algorithmSelection.highSpatialDensity.benefitsFromOptimization")
            : "High spatial density benefits from optimization",
          t
            ? t("algorithms.algorithmSelection.highSpatialDensity.memoryPoolingReducesAllocationOverhead")
            : "Memory pooling reduces allocation overhead",
          t
            ? t("algorithms.algorithmSelection.highSpatialDensity.spatialHashingEffectiveForDenseScenarios")
            : "Spatial hashing effective for dense scenarios",
        ],
      };
    }

    // For low spatial density, use standard spatial hashing
    return {
      algorithm: "spatial",
      confidence: 0.8,
      expectedPerformance: {
        executionTime: complexity.spatial * 0.001,
        memoryUsage: objectCount * 32,
      },
      reasoning: [
        t
          ? t("algorithms.algorithmSelection.lowSpatialDensity.allowsStandardSpatialHashing")
          : "Low spatial density allows standard spatial hashing",
        t
          ? t("algorithms.algorithmSelection.lowSpatialDensity.memoryOverheadAcceptableForSparseScenarios")
          : "Memory overhead acceptable for sparse scenarios",
        t
          ? t("algorithms.algorithmSelection.lowSpatialDensity.goodBalanceOfPerformanceAndMemoryUsage")
          : "Good balance of performance and memory usage",
      ],
    };
  }
}
