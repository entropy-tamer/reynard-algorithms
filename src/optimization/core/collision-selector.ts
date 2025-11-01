/**
 * Collision Algorithm Selector
 *
 * Selects optimal collision detection algorithms.
 *
 * @module algorithms/optimization/collisionSelector
 */

import type { WorkloadAnalysis, AlgorithmSelection } from "./algorithm-selector-types";
import { getAlgorithmConfig } from "../../config/algorithm-config";
import { memoizeMath, MathMemo } from "../../utils/memoization";

/**
 * Selects optimal collision detection algorithms
 */
export class CollisionSelector {
  // Memoized mathematical operations for performance
  private static readonly memoizedSquare = MathMemo.square;
  private static readonly memoizedLog = memoizeMath((x: number) => Math.log(x + 1));
  private static readonly memoizedSqrt = MathMemo.sqrt;
  private static readonly memoizedMultiply = MathMemo.multiply;
  private static readonly memoizedAdd = MathMemo.add;

  private getThresholds() {
    const config = getAlgorithmConfig();
    return {
      naiveVsSpatial: config.thresholds.naiveToSpatial,
      spatialVsOptimized: config.thresholds.spatialToOptimized,
    };
  }

  /**
   * Select optimal collision detection algorithm
   */
  selectOptimalCollisionAlgorithm(analysis: WorkloadAnalysis, t?: (key: string) => string): AlgorithmSelection {
    const { objectCount } = analysis.workload;
    const thresholds = this.getThresholds();

    // Use configurable thresholds instead of hardcoded values
    if (objectCount < thresholds.naiveVsSpatial) {
      return this.selectNaiveAlgorithm(analysis, t);
    }

    if (objectCount < thresholds.spatialVsOptimized) {
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

    // Provide fallback complexity if not available - use memoized square operation
    const naiveComplexity = complexity?.naive || CollisionSelector.memoizedSquare(objectCount);

    return {
      algorithm: "naive",
      confidence: 0.9,
      expectedPerformance: {
        executionTime: CollisionSelector.memoizedMultiply(naiveComplexity, 0.001), // Rough estimate
        memoryUsage: CollisionSelector.memoizedMultiply(objectCount, 16),
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

    // Provide fallback complexity if not available - use memoized log operation
    const spatialComplexity = complexity?.spatial || CollisionSelector.memoizedMultiply(objectCount, CollisionSelector.memoizedLog(objectCount));

    return {
      algorithm: "spatial",
      confidence: 0.8,
      expectedPerformance: {
        executionTime: CollisionSelector.memoizedMultiply(spatialComplexity, 0.001),
        memoryUsage: CollisionSelector.memoizedMultiply(objectCount, 32),
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

    // Provide fallback complexity if not available - use memoized log operation
    const optimizedComplexity = complexity?.optimized || CollisionSelector.memoizedMultiply(CollisionSelector.memoizedMultiply(objectCount, CollisionSelector.memoizedLog(objectCount)), 0.5);

    return {
      algorithm: "optimized",
      confidence: 0.95,
      expectedPerformance: {
        executionTime: CollisionSelector.memoizedMultiply(optimizedComplexity, 0.001),
        memoryUsage: CollisionSelector.memoizedAdd(CollisionSelector.memoizedMultiply(objectCount, 16), 1024),
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
