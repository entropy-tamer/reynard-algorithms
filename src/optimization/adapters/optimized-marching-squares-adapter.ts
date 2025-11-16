/**
 * Optimized Marching Squares Adapter
 *
 * This adapter integrates the PAW optimization techniques with marching squares,
 * providing automatic algorithm selection and memory pooling for optimal performance.
 *
 * @module algorithms/optimization/optimizedMarchingSquaresAdapter
 */

import { AlgorithmSelector } from "../core/algorithm-selector";
import {
  MemoryPool,
  type MemoryPoolConfig,
  type MemoryPoolStats,
  type OptimizationRecommendation,
} from "../core/memory-pool";
import { MarchingSquares } from "../../algorithms/procedural-generation/marching-squares/marching-squares-core";
import { MarchingSquaresLegacy } from "../../algorithms/procedural-generation/marching-squares/marching-squares-legacy";
import type {
  MarchingSquaresConfig,
  MarchingSquaresResult,
  Contour,
  LineSegment,
  Point,
} from "../../algorithms/procedural-generation/marching-squares/marching-squares-types";
import { PerformanceMonitor, type CollisionPerformanceStats, type PerformanceReport } from "./performance-monitor";

export interface OptimizedMarchingSquaresConfig {
  enableMemoryPooling: boolean;
  enableAlgorithmSelection: boolean;
  enablePerformanceMonitoring: boolean;
  memoryPoolConfig?: Partial<MemoryPoolConfig>;
  algorithmSelectionStrategy: "standard" | "refined-lut" | "adaptive";
  performanceThresholds: {
    maxExecutionTime: number;
    maxMemoryUsage: number;
    minContourAccuracy: number;
  };
  marchingSquaresConfig?: Partial<MarchingSquaresConfig>;
}

// Re-export types from performance monitor
export type {
  CollisionPerformanceStats as MarchingSquaresPerformanceStats,
  PerformanceReport,
} from "./performance-monitor";

/**
 * Optimized marching squares adapter with automatic algorithm selection
 */
export class OptimizedMarchingSquaresAdapter {
  private algorithmSelector: AlgorithmSelector;
  private memoryPool: MemoryPool;
  private performanceMonitor: PerformanceMonitor;
  private config: OptimizedMarchingSquaresConfig;
  private marchingSquares: MarchingSquares;
  private marchingSquaresLegacy: MarchingSquaresLegacy;

  /**
   *
   * @param config
   * @example
   */
  constructor(config: Partial<OptimizedMarchingSquaresConfig> = {}) {
    this.config = {
      enableMemoryPooling: true,
      enableAlgorithmSelection: true,
      enablePerformanceMonitoring: true,
      algorithmSelectionStrategy: "adaptive",
      performanceThresholds: {
        maxExecutionTime: 100, // milliseconds
        maxMemoryUsage: 50 * 1024 * 1024, // 50MB
        minContourAccuracy: 0.95,
      },
      ...config,
    };
    this.algorithmSelector = new AlgorithmSelector();
    this.memoryPool = new MemoryPool(this.config.memoryPoolConfig);
    this.performanceMonitor = new PerformanceMonitor({
      maxExecutionTime: this.config.performanceThresholds.maxExecutionTime,
      maxMemoryUsage: this.config.performanceThresholds.maxMemoryUsage,
      minHitRate: this.config.performanceThresholds.minContourAccuracy * 100,
    });
    this.marchingSquares = new MarchingSquares(this.config.marchingSquaresConfig);
    this.marchingSquaresLegacy = new MarchingSquaresLegacy(this.config.marchingSquaresConfig);
  }

  /**
   * Compute contours from a 2D scalar field with automatic algorithm selection
   * @param grid - 2D array representing the scalar field values
   * @param threshold - Optional threshold override
   * @example
   */
  compute(grid: number[][], threshold?: number): MarchingSquaresResult {
    const startTime = performance.now();
    const startMemory = this.getCurrentMemoryUsage();

    let result: MarchingSquaresResult;
    let algorithm: string;

    // Determine grid size for algorithm selection
    const gridSize = grid.length > 0 ? Math.sqrt(grid.length * grid[0].length) : 0;

    // Ultra-fast path: use the fastest algorithm for each size based on benchmarks
    if (this.config.algorithmSelectionStrategy === "adaptive") {
      if (gridSize < 50) {
        // Refined LUT is fastest for small grids
        result = this.executeRefinedLUT(grid, threshold);
        algorithm = "refined-lut";
      } else if (gridSize < 100) {
        // Refined LUT with interpolation for medium grids
        result = this.executeRefinedLUTWithInterpolation(grid, threshold);
        algorithm = "refined-lut-interpolated";
      } else {
        // Refined LUT optimized for large grids
        result = this.executeRefinedLUTOptimized(grid, threshold);
        algorithm = "refined-lut-optimized";
      }
    } else if (this.config.algorithmSelectionStrategy === "refined-lut") {
      result = this.executeRefinedLUT(grid, threshold);
      algorithm = "refined-lut";
    } else {
      result = this.executeLegacy(grid, threshold);
      algorithm = "standard";
    }

    const endTime = performance.now();
    const endMemory = this.getCurrentMemoryUsage();
    const executionTime = endTime - startTime;
    const memoryUsage = endMemory - startMemory;

    // Record performance metrics
    this.performanceMonitor.recordPerformance(
      algorithm,
      grid.length * (grid[0]?.length || 0),
      executionTime,
      memoryUsage,
      this.memoryPool.getStatistics().hitRate
    );

    // Update memory pool stats
    this.performanceMonitor.updateMemoryPoolStats(this.memoryPool.getStatistics());

    return result;
  }

  /**
   * Execute refined LUT algorithm (default, fastest)
   * @param grid
   * @param threshold
   * @example
   */
  private executeRefinedLUT(grid: number[][], threshold?: number): MarchingSquaresResult {
    return this.marchingSquares.compute(grid, threshold);
  }

  /**
   * Execute refined LUT with interpolation for medium grids
   * @param grid
   * @param threshold
   * @example
   */
  private executeRefinedLUTWithInterpolation(grid: number[][], threshold?: number): MarchingSquaresResult {
    const config: Partial<MarchingSquaresConfig> = {
      ...this.config.marchingSquaresConfig,
      interpolate: true,
      ambiguityResolution: "saddle",
    };
    const ms = new MarchingSquares(config);
    return ms.compute(grid, threshold);
  }

  /**
   * Execute refined LUT optimized for large grids
   * @param grid
   * @param threshold
   * @example
   */
  private executeRefinedLUTOptimized(grid: number[][], threshold?: number): MarchingSquaresResult {
    const config: Partial<MarchingSquaresConfig> = {
      ...this.config.marchingSquaresConfig,
      interpolate: true,
      ambiguityResolution: "saddle",
      tolerance: 1e-8, // Slightly relaxed tolerance for large grids
    };
    const ms = new MarchingSquares(config);
    return ms.compute(grid, threshold);
  }

  /**
   * Execute legacy algorithm
   * @param grid
   * @param threshold
   * @example
   */
  private executeLegacy(grid: number[][], threshold?: number): MarchingSquaresResult {
    return this.marchingSquaresLegacy.compute(grid, threshold);
  }

  /**
   *
   * @example
   */
  getPerformanceStats(): CollisionPerformanceStats {
    return this.performanceMonitor.getPerformanceStats();
  }

  /**
   * Get current memory usage
   * @example
   */
  private getCurrentMemoryUsage(): number {
    return this.performanceMonitor.getCurrentMemoryUsage();
  }

  /**
   *
   * @example
   */
  getMemoryPoolStats(): MemoryPoolStats {
    return this.memoryPool.getStatistics();
  }

  /**
   *
   * @example
   */
  getOptimizationRecommendations(): OptimizationRecommendation[] {
    return this.memoryPool.getOptimizationRecommendations();
  }

  /**
   *
   * @example
   */
  isPerformanceDegraded(): boolean {
    return this.performanceMonitor.isPerformanceDegraded();
  }

  /**
   *
   * @example
   */
  getPerformanceReport(): PerformanceReport {
    return this.performanceMonitor.getPerformanceReport(this.getOptimizationRecommendations());
  }

  /**
   *
   * @example
   */
  resetStatistics(): void {
    this.performanceMonitor.resetStatistics();
    this.algorithmSelector.clearPerformanceHistory();
  }

  /**
   *
   * @example
   */
  destroy(): void {
    this.memoryPool.destroy();
  }
}
