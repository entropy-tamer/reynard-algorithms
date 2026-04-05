/**
 * Theta* Pathfinding Core Implementation
 *
 * Main ThetaStar class that orchestrates pathfinding operations
 * using modular components for pathfinding, heuristics, smoothing, caching, and validation.
 *
 * @module algorithms/pathfinding/theta-star
 */
import { CellType, GridValidationOptions, GridValidationResult, PathComparisonOptions, PathComparisonResult, PathOptimizationOptions, PathOptimizationResult, Point, ThetaStarConfig, ThetaStarOptions, ThetaStarResult, ThetaStarSerialization, ThetaStarSerializationOptions, ThetaStarStats } from "./theta-star-types";
/**
 * The ThetaStar class provides functionality for pathfinding using the Theta* algorithm.
 * Theta* is an any-angle pathfinding algorithm that produces smoother, more natural paths
 * than grid-based algorithms like A* by allowing movement in any direction, not just
 * grid-aligned directions.
 */
export declare class ThetaStar {
    private config;
    private stats;
    private cache;
    private lineOfSightCache;
    /**
     *
     * @param config
     * @example
     */
    constructor(config?: Partial<ThetaStarConfig>);
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
    findPath(grid: CellType[], width: number, height: number, start: Point, goal: Point, options?: Partial<ThetaStarOptions>): ThetaStarResult;
    /**
     * Validate grid for pathfinding.
     * @param grid
     * @param width
     * @param height
     * @param start
     * @param goal
     * @param options
     * @example
     */
    validateGrid(grid: CellType[], width: number, height: number, start?: Point, goal?: Point, options?: Partial<GridValidationOptions>): GridValidationResult;
    /**
     * Optimize path by removing redundant points and smoothing.
     * @param path
     * @param grid
     * @param width
     * @param height
     * @param options
     * @example
     */
    optimizePath(path: Point[], grid: CellType[], width: number, height: number, options?: Partial<PathOptimizationOptions>): PathOptimizationResult;
    /**
     * Compare two paths.
     * @param path1
     * @param path2
     * @param result1
     * @param result2
     * @param options
     * @example
     */
    compareResults(result1: ThetaStarResult, result2: ThetaStarResult, options?: Partial<PathComparisonOptions>): PathComparisonResult;
    /**
     *
     * @param path1
     * @param path2
     * @param options
     * @example
     */
    compare(path1: Point[], path2: Point[], options?: Partial<PathComparisonOptions>): PathComparisonResult;
    /**
     * Serialize pathfinding result.
     * @param result
     * @param options
     * @example
     */
    serialize(result: ThetaStarResult, options?: Partial<ThetaStarSerializationOptions>): ThetaStarSerialization;
    /**
     * Update configuration.
     * @param newConfig
     * @example
     */
    updateConfig(newConfig: Partial<ThetaStarConfig>): void;
    /**
     * Get current configuration.
     * @example
     */
    getConfig(): ThetaStarConfig;
    /**
     * Get current statistics.
     * @example
     */
    getStats(): ThetaStarStats;
    /**
     * Reset statistics.
     * @example
     */
    resetStats(): void;
    /**
     * Clear cache.
     * @example
     */
    clearCache(): void;
    /**
     * Get cache statistics.
     * @example
     */
    getCacheStats(): {
        pathCacheSize: number;
        lineOfSightCacheSize: number;
        hitCount: number;
        missCount: number;
        hitRate: number;
    };
}
//# sourceMappingURL=theta-star-core.d.ts.map