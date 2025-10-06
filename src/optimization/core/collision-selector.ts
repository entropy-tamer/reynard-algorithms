/**
 * Collision Algorithm Selector
 *
 * Selects optimal collision detection algorithms.
 *
 * @module algorithms/optimization/collisionSelector
 */

import type { WorkloadAnalysis, AlgorithmSelection } from "./algorithm-selector-types";

/**
 * Selects optimal collision detection algorithms
 */
export class CollisionSelector {
  private thresholds = {
    naiveVsSpatial: 100, // Based on PAW findings - naive good for <100 objects
    spatialVsOptimized: 500, // Based on PAW findings - spatial good for 100-500 objects
  };

  /**
   * Select optimal collision detection algorithm
   */
  selectOptimalCollisionAlgorithm(analysis: WorkloadAnalysis, t?: (key: string) => string): AlgorithmSelection {
    const { objectCount } = analysis.workload;

    // Based on PAW findings: crossover points at 100 and 500 objects
    if (objectCount < this.thresholds.naiveVsSpatial) {
      return this.selectNaiveAlgorithm(analysis, t);
    }

    if (objectCount < this.thresholds.spatialVsOptimized) {
      return this.selectSpatialAlgorithm(analysis, t);
    }

    return this.selectOptimizedAlgorithm(analysis, t);
  }

  /**
   * Select naive collision algorithm for small datasets
   */
  private selectNaiveAlgorithm(analysis: WorkloadAnalysis, t?: (key: string) => string): AlgorithmSelection {
    const { complexity } = analysis;
    const { objectCount } = analysis.workload;

    return {
      algorithm: "naive",
      confidence: 0.9,
      expectedPerformance: {
        executionTime: complexity.naive * 0.001, // Rough estimate
        memoryUsage: objectCount * 16,
      },
      reasoning: [
        t
          ? t("algorithms.algorithmSelection.smallObjectCount.favorsNaiveApproach")
          : "Small object count favors naive approach",
        t
          ? t("algorithms.algorithmSelection.smallObjectCount.pawFindingsShowNaiveOptimal")
          : "PAW findings show naive is optimal for <100 objects",
        t
          ? t("algorithms.algorithmSelection.smallObjectCount.minimalAllocationOverhead")
          : "Minimal allocation overhead for small datasets",
      ],
    };
  }

  /**
   * Select spatial collision algorithm for medium datasets
   */
  private selectSpatialAlgorithm(analysis: WorkloadAnalysis, t?: (key: string) => string): AlgorithmSelection {
    const { complexity } = analysis;
    const { objectCount } = analysis.workload;

    return {
      algorithm: "spatial",
      confidence: 0.8,
      expectedPerformance: {
        executionTime: complexity.spatial * 0.001,
        memoryUsage: objectCount * 32,
      },
      reasoning: [
        t
          ? t("algorithms.algorithmSelection.mediumObjectCount.benefitsFromSpatialOptimization")
          : "Medium object count benefits from spatial optimization",
        t
          ? t("algorithms.algorithmSelection.mediumObjectCount.spatialHashingReducesCollisionChecks")
          : "Spatial hashing reduces collision checks",
        t
          ? t("algorithms.algorithmSelection.mediumObjectCount.memoryOverheadAcceptable")
          : "Memory overhead acceptable for this size",
      ],
    };
  }

  /**
   * Select optimized collision algorithm for large datasets
   */
  private selectOptimizedAlgorithm(analysis: WorkloadAnalysis, t?: (key: string) => string): AlgorithmSelection {
    const { complexity } = analysis;
    const { objectCount } = analysis.workload;

    return {
      algorithm: "optimized",
      confidence: 0.95,
      expectedPerformance: {
        executionTime: complexity.optimized * 0.001,
        memoryUsage: objectCount * 16 + 1024,
      },
      reasoning: [
        t
          ? t("algorithms.algorithmSelection.largeObjectCount.requiresOptimization")
          : "Large object count requires optimization",
        t
          ? t("algorithms.algorithmSelection.largeObjectCount.memoryPoolingEliminatesAllocationOverhead")
          : "Memory pooling eliminates allocation overhead",
        "PAW findings show 99.91% allocation reduction", // Keep this as it's a specific metric
        t
          ? t("algorithms.algorithmSelection.largeObjectCount.bestPerformanceForOver100Objects")
          : "Best performance for >100 objects",
      ],
    };
  }
}
