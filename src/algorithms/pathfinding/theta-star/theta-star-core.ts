/**
 * Theta* Pathfinding Core Implementation
 *
 * Main ThetaStar class that orchestrates pathfinding operations
 * using modular components for pathfinding, heuristics, smoothing, caching, and validation.
 *
 * @module algorithms/pathfinding/theta-star
 */

import {
  Point,
  CellType,
  ThetaStarConfig,
  ThetaStarStats,
  ThetaStarResult,
  ThetaStarOptions,
  LineOfSightOptions,
  GridValidationOptions,
  GridValidationResult,
  PathOptimizationOptions,
  PathOptimizationResult,
  ThetaStarSerializationOptions,
  ThetaStarSerialization,
  PathComparisonOptions,
  PathComparisonResult,
  LazyEvaluationOptions,
  LazyEvaluationResult,
} from "./theta-star-types";
import { findThetaStarPath } from "./theta-star-pathfinding";
import { calculateHeuristic } from "./theta-star-heuristic";
import { optimizePath } from "./theta-star-smoothing";
import { ThetaStarCache, generatePathCacheKey } from "./theta-star-cache";
import { validateGrid, validatePathfindingParams, validatePath } from "./theta-star-validation";
import { LineOfSight } from "./line-of-sight";

// Helper function to check if point is within bounds
function isWithinBounds(point: Point, width: number, height: number): boolean {
  return point.x >= 0 && point.x < width && point.y >= 0 && point.y < height;
}

/**
 * The ThetaStar class provides functionality for pathfinding using the Theta* algorithm.
 * Theta* is an any-angle pathfinding algorithm that produces smoother, more natural paths
 * than grid-based algorithms like A* by allowing movement in any direction, not just
 * grid-aligned directions.
 */
export class ThetaStar {
  private config: ThetaStarConfig;
  private stats: ThetaStarStats;
  private cache: ThetaStarCache;
  private lineOfSightCache: Map<string, boolean> = new Map();

  /**
   *
   * @param config
   * @example
   */
  constructor(config: Partial<ThetaStarConfig> = {}) {
    this.config = {
      allowDiagonal: true,
      diagonalOnlyWhenClear: true,
      movementType: "ALL" as any,
      useTieBreaking: true,
      useLazyEvaluation: true,
      useGoalBounding: false,
      validateInput: true,
      enableCaching: true,
      maxIterations: 10000,
      tolerance: 1e-10,
      ...config,
    };

    this.stats = {
      nodesExplored: 0,
      lineOfSightChecks: 0,
      parentUpdates: 0,
      iterations: 0,
      diagonalMoves: 0,
      cardinalMoves: 0,
      executionTime: 0,
      success: true,
    };

    this.cache = new ThetaStarCache();
  }

  /**
   * Finds a path from start to goal using Theta*.
   * @param grid
   * @param width
   * @param height
   * @param start
   * @param goal
   * @param options
   * @example
   */
  findPath(
    grid: CellType[],
    width: number,
    height: number,
    start: Point,
    goal: Point,
    options: Partial<ThetaStarOptions> = {}
  ): ThetaStarResult {
    const startTime = performance.now();
    const pathOptions: ThetaStarOptions = {
      useEuclideanDistance: true,
      useTieBreaking: true,
      useLazyEvaluation: true,
      useGoalBounding: false,
      maxIterations: this.config.maxIterations,
      ...options,
    };

    try {
      // Skip if grid is empty (check before start==goal check)
      if (grid.length === 0 || width === 0 || height === 0) {
        const executionTime = performance.now() - startTime;
        this.resetStats();
        return {
          found: false,
          path: [],
          cost: 0,
          length: 0,
          explored: [],
          stats: this.stats,
          executionTime,
          metadata: { error: "Empty grid", iterations: 0, lineOfSightChecks: 0 },
        };
      }

      // Check if start and goal are the same (early return before validation)
      const dx = Math.abs(start.x - goal.x);
      const dy = Math.abs(start.y - goal.y);
      if (dx < this.config.tolerance && dy < this.config.tolerance) {
        const executionTime = performance.now() - startTime;
        this.resetStats();
        return {
          found: true,
          path: [start],
          cost: 0,
          length: 1,
          explored: [],
          stats: this.stats,
          executionTime,
          metadata: { iterations: 0, lineOfSightChecks: 0 },
        };
      }

      // Validate input
      if (this.config.validateInput) {
        const gridValidation = validateGrid(grid, width, height);
        if (!gridValidation.isValid) {
          throw new Error(`Invalid grid: ${gridValidation.errors.join(", ")}`);
        }

        const paramValidation = validatePathfindingParams(start, goal, width, height);
        if (!paramValidation.isValid) {
          throw new Error(`Invalid parameters: ${paramValidation.errors.join(", ")}`);
        }
      }

      // Check cache
      if (this.config.enableCaching) {
        const cacheKey = generatePathCacheKey(grid, width, height, start, goal, pathOptions, this.config);
        const cached = this.cache.getPath(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Reset statistics
      this.resetStats();

      // Find path using Theta* algorithm
      const result = findThetaStarPath(
        grid,
        width,
        height,
        start,
        goal,
        this.config,
        this.stats,
        pathOptions,
        this.lineOfSightCache
      );

      // Cache result
      if (this.config.enableCaching && result.found) {
        const cacheKey = generatePathCacheKey(grid, width, height, start, goal, pathOptions, this.config);
        this.cache.setPath(cacheKey, result);
      }

      return result;
    } catch (error) {
      return {
        found: false,
        path: [],
        cost: 0,
        length: 0,
        explored: [],
        stats: this.stats,
        executionTime: performance.now() - startTime,
        metadata: { error: error instanceof Error ? error.message : "Unknown error" },
      };
    }
  }

  /**
   * Validate grid for pathfinding.
   * @param grid
   * @param width
   * @param height
   * @param options
   * @example
   */
  validateGrid(
    grid: CellType[],
    width: number,
    height: number,
    start?: Point,
    goal?: Point,
    options: Partial<GridValidationOptions> = {}
  ): GridValidationResult {
    const result = validateGrid(grid, width, height, options);
    
    // If start/goal are provided, validate them
    const errors: string[] = [];
    
    if (start !== undefined) {
      // Check if start is within bounds
      if (!isWithinBounds(start, width, height)) {
        errors.push(`Start point out of bounds: (${start.x}, ${start.y})`);
      } else {
        // Check if start is walkable
        const index = start.y * width + start.x;
        if (grid[index] === CellType.OBSTACLE) {
          errors.push("Start point is not walkable");
        }
      }
    }
    
    if (goal !== undefined) {
      // Check if goal is within bounds
      if (!isWithinBounds(goal, width, height)) {
        errors.push(`Goal point out of bounds: (${goal.x}, ${goal.y})`);
      } else {
        // Check if goal is walkable
        const index = goal.y * width + goal.x;
        if (grid[index] === CellType.OBSTACLE) {
          errors.push("Goal point is not walkable");
        }
      }
    }
    
    if (errors.length > 0) {
      return {
        ...result,
        isValid: false,
        errors: [...result.errors, ...errors],
      };
    }
    
    return result;
  }

  /**
   * Optimize path by removing redundant points and smoothing.
   * @param path
   * @param grid
   * @param width
   * @param height
   * @param options
   * @example
   */
  optimizePath(
    path: Point[],
    grid: CellType[],
    width: number,
    height: number,
    options: Partial<PathOptimizationOptions> = {}
  ): PathOptimizationResult {
    return optimizePath(path, grid, width, height, options);
  }

  /**
   * Compare two paths.
   * @param path1
   * @param path2
   * @param options
   * @example
   */
  compareResults(result1: ThetaStarResult, result2: ThetaStarResult, options: Partial<PathComparisonOptions> = {}): PathComparisonResult {
    return this.compare(result1.path, result2.path, options);
  }

  compare(path1: Point[], path2: Point[], options: Partial<PathComparisonOptions> = {}): PathComparisonResult {
    const comparisonOptions: PathComparisonOptions = {
      tolerance: 1e-10,
      compareLength: true,
      compareCost: true,
      compareExploration: options.compareExploration ?? false,
      compareTime: options.compareTime ?? false,
      compareLineOfSight: options.compareLineOfSight ?? false,
      compareSmoothness: options.compareSmoothness ?? true,
    };

    const errors: string[] = [];
    const warnings: string[] = [];

    // Compare path lengths
    if (comparisonOptions.compareLength) {
      if (path1.length !== path2.length) {
        warnings.push(`Path lengths differ: ${path1.length} vs ${path2.length}`);
      }
    }

    // Compare path costs
    if (comparisonOptions.compareCost) {
      const cost1 = calculatePathCost(path1);
      const cost2 = calculatePathCost(path2);
      const costDiff = Math.abs(cost1 - cost2);

      if (costDiff > comparisonOptions.tolerance) {
        warnings.push(`Path costs differ: ${cost1} vs ${cost2}`);
      }
    }

    // Compare path smoothness
    if (comparisonOptions.compareSmoothness) {
      const smoothness1 = calculatePathSmoothness(path1);
      const smoothness2 = calculatePathSmoothness(path2);
      const smoothnessDiff = Math.abs(smoothness1 - smoothness2);

      if (smoothnessDiff > comparisonOptions.tolerance) {
        warnings.push(`Path smoothness differs: ${smoothness1} vs ${smoothness2}`);
      }
    }

    const path1Cost = calculatePathCost(path1);
    const path2Cost = calculatePathCost(path2);
    const path1Smoothness = calculatePathSmoothness(path1);
    const path2Smoothness = calculatePathSmoothness(path2);
    return {
      areEquivalent: errors.length === 0 && warnings.length === 0,
      lengthDifference: path1.length - path2.length,
      costDifference: path1Cost - path2Cost,
      explorationDifference: 0,
      timeDifference: 0,
      lineOfSightDifference: 0,
      similarity:
        errors.length === 0 && warnings.length === 0
          ? 1.0
          : Math.max(0, 1 - (errors.length + warnings.length) / Math.max(1, path1.length + path2.length)),
    };
  }

  /**
   * Serialize pathfinding result.
   * @param result
   * @param options
   * @example
   */
  serialize(result: ThetaStarResult, options: Partial<ThetaStarSerializationOptions> = {}): ThetaStarSerialization {
    const serializationOptions: ThetaStarSerializationOptions = {
      includeStats: true,
      includeMetadata: options.includeMetadata ?? true,
      precision: options.precision ?? 3,
      includeExplored: options.includeExplored ?? false,
      includeLineOfSight: options.includeLineOfSight ?? false,
      includeGrid: options.includeGrid ?? false,
    } as ThetaStarSerializationOptions;

    return {
      version: "1.0",
      path: result.path,
      cost: result.cost,
      found: result.found ?? false,
      length: result.length,
      stats: serializationOptions.includeStats ? result.stats : undefined,
      explored: result.explored,
    };
  }

  /**
   * Update configuration.
   * @param newConfig
   * @example
   */
  updateConfig(newConfig: Partial<ThetaStarConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration.
   * @example
   */
  getConfig(): ThetaStarConfig {
    return { ...this.config };
  }

  /**
   * Get current statistics.
   * @example
   */
  getStats(): ThetaStarStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics.
   * @example
   */
  resetStats(): void {
    this.stats = {
      nodesExplored: 0,
      lineOfSightChecks: 0,
      parentUpdates: 0,
      iterations: 0,
      diagonalMoves: 0,
      cardinalMoves: 0,
      executionTime: 0,
      success: true,
    };
  }

  /**
   * Clear cache.
   * @example
   */
  clearCache(): void {
    this.cache.clear();
    this.lineOfSightCache.clear();
  }

  /**
   * Get cache statistics.
   * @example
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}

/**
 * Calculate path cost
 *
 * @param path Path array
 * @returns Total cost
 * @example
 */
function calculatePathCost(path: Point[]): number {
  let cost = 0;
  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i - 1].x;
    const dy = path[i].y - path[i - 1].y;
    cost += Math.sqrt(dx * dx + dy * dy);
  }
  return cost;
}

/**
 * Calculate path smoothness
 *
 * @param path Path array
 * @returns Smoothness value (0-1, higher is smoother)
 * @example
 */
function calculatePathSmoothness(path: Point[]): number {
  if (path.length <= 2) {
    return 1;
  }

  let totalAngleChange = 0;
  let segmentCount = 0;

  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const current = path[i];
    const next = path[i + 1];

    const angle1 = Math.atan2(current.y - prev.y, current.x - prev.x);
    const angle2 = Math.atan2(next.y - current.y, next.x - current.x);

    let angleChange = Math.abs(angle2 - angle1);
    if (angleChange > Math.PI) {
      angleChange = 2 * Math.PI - angleChange;
    }

    totalAngleChange += angleChange;
    segmentCount++;
  }

  const averageAngleChange = segmentCount > 0 ? totalAngleChange / segmentCount : 0;
  return Math.max(0, 1 - averageAngleChange / Math.PI);
}
