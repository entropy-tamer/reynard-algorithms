/**
 * Procedural Generation Algorithm Selector
 *
 * Selects optimal marching squares implementations based on workload characteristics.
 *
 * @module algorithms/optimization/proceduralSelector
 */

import type { WorkloadAnalysis, AlgorithmSelection } from "./algorithm-selector-types";
import { MathMemo } from "../../utils/memoization";

/**
 * Selects optimal procedural generation algorithms (marching squares)
 */
export class ProceduralSelector {
  // Memoized mathematical operations for performance
  private static readonly memoizedSquare = MathMemo.square;
  private static readonly memoizedMultiply = MathMemo.multiply;
  private static readonly memoizedAdd = MathMemo.add;

  /**
   * Select optimal marching squares algorithm based on workload
   * @param analysis
   * @param t
   * @example
   */
  selectOptimalProceduralAlgorithm(analysis: WorkloadAnalysis, t?: (key: string) => string): AlgorithmSelection {
    const { objectCount } = analysis.workload;
    const gridSize = Math.sqrt(objectCount); // Approximate grid size from object count

    // Small grids (< 50x50): Use refined LUT (fastest)
    if (gridSize < 50) {
      return this.selectRefinedLUTAlgorithm(analysis, t);
    }

    // Medium grids (50x50 - 100x100): Use refined LUT with interpolation
    if (gridSize < 100) {
      return this.selectRefinedLUTWithInterpolation(analysis, t);
    }

    // Large grids (> 100x100): Use refined LUT with optimized merging
    return this.selectRefinedLUTWithOptimization(analysis, t);
  }

  /**
   * Select refined LUT algorithm for small grids
   * @param analysis
   * @param t
   * @example
   */
  private selectRefinedLUTAlgorithm(analysis: WorkloadAnalysis, t?: (key: string) => string): AlgorithmSelection {
    const { complexity } = analysis;
    const { objectCount } = analysis.workload;

    const gridSize = Math.sqrt(objectCount);
    const refinedLUTComplexity = complexity?.optimized || ProceduralSelector.memoizedSquare(gridSize) * 0.8; // 20% faster

    return {
      algorithm: "refined-lut",
      confidence: 0.95,
      expectedPerformance: {
        executionTime: ProceduralSelector.memoizedMultiply(refinedLUTComplexity, 0.0005), // Optimized for small grids
        memoryUsage: ProceduralSelector.memoizedMultiply(objectCount, 32), // Contour segments
      },
      reasoning: [
        t
          ? t("algorithms.algorithmSelection.smallGrid.favorsRefinedLUT")
          : "Small grid size favors refined LUT approach",
        t
          ? t("algorithms.algorithmSelection.smallGrid.bestPerformanceForSmallGrids")
          : "Best performance for <50x50 grids (10-27% faster)",
        t
          ? t("algorithms.algorithmSelection.smallGrid.ambiguityResolutionOptimized")
          : "Ambiguity resolution optimized for cases 5 and 10",
        "Saddle point method provides best accuracy/performance balance",
      ],
    };
  }

  /**
   * Select refined LUT with interpolation for medium grids
   * @param analysis
   * @param t
   * @example
   */
  private selectRefinedLUTWithInterpolation(
    analysis: WorkloadAnalysis,
    t?: (key: string) => string
  ): AlgorithmSelection {
    const { complexity } = analysis;
    const { objectCount } = analysis.workload;

    const gridSize = Math.sqrt(objectCount);
    const interpolatedComplexity = complexity?.optimized || ProceduralSelector.memoizedSquare(gridSize) * 0.85; // 15% faster

    return {
      algorithm: "refined-lut-interpolated",
      confidence: 0.9,
      expectedPerformance: {
        executionTime: ProceduralSelector.memoizedMultiply(interpolatedComplexity, 0.0006),
        memoryUsage: ProceduralSelector.memoizedMultiply(objectCount, 40), // More segments with interpolation
      },
      reasoning: [
        t
          ? t("algorithms.algorithmSelection.mediumGrid.favorsInterpolatedLUT")
          : "Medium grid size benefits from interpolated refined LUT",
        t
          ? t("algorithms.algorithmSelection.mediumGrid.smootherContoursWithInterpolation")
          : "Smoother contours with interpolation (15-20% improvement)",
        t
          ? t("algorithms.algorithmSelection.mediumGrid.balancedPerformanceAccuracy")
          : "Balanced performance and accuracy for 50x50-100x100 grids",
      ],
    };
  }

  /**
   * Select refined LUT with optimization for large grids
   * @param analysis
   * @param t
   * @example
   */
  private selectRefinedLUTWithOptimization(analysis: WorkloadAnalysis, t?: (key: string) => string): AlgorithmSelection {
    const { complexity } = analysis;
    const { objectCount } = analysis.workload;

    const gridSize = Math.sqrt(objectCount);
    const optimizedComplexity = complexity?.optimized || ProceduralSelector.memoizedSquare(gridSize) * 0.9; // 10% faster

    return {
      algorithm: "refined-lut-optimized",
      confidence: 0.85,
      expectedPerformance: {
        executionTime: ProceduralSelector.memoizedMultiply(optimizedComplexity, 0.0008),
        memoryUsage: ProceduralSelector.memoizedMultiply(objectCount, 48), // More segments for large grids
      },
      reasoning: [
        t
          ? t("algorithms.algorithmSelection.largeGrid.requiresOptimization")
          : "Large grid size requires optimization",
        t
          ? t("algorithms.algorithmSelection.largeGrid.refinedLUTWithMerging")
          : "Refined LUT with optimized merging (10-17% improvement)",
        t
          ? t("algorithms.algorithmSelection.largeGrid.scalableForLargeGrids")
          : "Scalable for >100x100 grids",
        "Memory pooling recommended for very large grids",
      ],
    };
  }
}

