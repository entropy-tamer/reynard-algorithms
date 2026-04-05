/**
 * @module algorithms/pathfinding/jps/jps-core
 * @description Main implementation of Jump Point Search (JPS) pathfinding algorithm.
 */
import { Point, CellType, JPSConfig, JPSStats, JPSResult, JPSOptions, GridValidationOptions, GridValidationResult, PathOptimizationOptions, PathOptimizationResult, JPSSerializationOptions, JPSSerialization, PathComparisonOptions, PathComparisonResult } from "./jps-types";
import { JPSUtils } from "./jps-utils";
export { JPSUtils };
/**
 * The JPS class provides functionality for pathfinding using the Jump Point Search algorithm.
 * JPS is an optimization of A* that eliminates symmetric paths by jumping over uniform areas,
 * resulting in 10-40x performance improvements on uniform grids.
 *
 * @example
 * ```typescript
 * const jps = new JPS();
 * const grid = JPSUtils.generateTestGrid(100, 100, 0.3);
 * const start = { x: 0, y: 0 };
 * const goal = { x: 99, y: 99 };
 * const result = jps.findPath(grid, 100, 100, start, goal);
 * console.log(result.path); // Found path
 * ```
 */
export declare class JPS {
    private config;
    private stats;
    private cache;
    private jpsPlusCache;
    /**
     * Creates an instance of JPS.
     * @param config - Optional configuration for the algorithm.
     * @example
     */
    constructor(config?: Partial<JPSConfig>);
    /**
     * Finds a path from start to goal using JPS.
     * @param grid - The grid as a 1D array.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param start - Starting point.
     * @param goal - Goal point.
     * @param options - Pathfinding options.
     * @returns Pathfinding result.
     * @example
     */
    findPath(grid: CellType[], width: number, height: number, start: Point, goal: Point, options?: Partial<JPSOptions>): JPSResult;
    /**
     * Validates a grid for pathfinding.
     * @param grid - The grid.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param start - Starting point.
     * @param goal - Goal point.
     * @param options - Validation options.
     * @returns Validation result.
     * @example
     */
    validateGrid(grid: CellType[], width: number, height: number, start: Point, goal: Point, options?: Partial<GridValidationOptions>): GridValidationResult;
    /**
     * Optimizes a path by removing redundant points.
     * @param path - Path to optimize.
     * @param grid - The grid.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param options - Optimization options.
     * @returns Optimization result.
     * @example
     */
    optimizePath(path: Point[], grid: CellType[], width: number, height: number, options?: Partial<PathOptimizationOptions>): PathOptimizationResult;
    /**
     * Compares two pathfinding results.
     * @param result1 - First result.
     * @param result2 - Second result.
     * @param options - Comparison options.
     * @returns Comparison result.
     * @example
     */
    compare(result1: JPSResult, result2: JPSResult, options?: Partial<PathComparisonOptions>): PathComparisonResult;
    /**
     * Serializes a JPS result to JSON.
     * @param result - Result to serialize.
     * @param options - Serialization options.
     * @returns Serialized result.
     * @example
     */
    serialize(result: JPSResult, options?: Partial<JPSSerializationOptions>): JPSSerialization;
    /**
     * Updates the configuration.
     * @param newConfig - New configuration options.
     * @example
     */
    updateConfig(newConfig: Partial<JPSConfig>): void;
    /**
     * Gets the current configuration.
     * @returns The current configuration.
     * @example
     */
    getConfig(): JPSConfig;
    /**
     * Gets the current statistics.
     * @returns The current statistics.
     * @example
     */
    getStats(): JPSStats;
    /**
     * Resets the statistics.
     * @example
     */
    resetStats(): void;
    /**
     * Clears the cache.
     * @example
     */
    clearCache(): void;
    /**
     * Calculates the heuristic cost between two points.
     * @param from - Starting point.
     * @param to - Goal point.
     * @param options - Pathfinding options.
     * @returns Heuristic cost.
     * @example
     */
    private calculateHeuristic;
    /**
     * Gets the node with the lowest f-cost from the open set.
     * @param openSet - Open set array.
     * @param openSetMap - Open set map.
     * @param _openSetMap
     * @returns Node with lowest f-cost.
     * @example
     */
    private getLowestFCostNode;
    /**
     * Removes a node from the open set.
     * @param openSet - Open set array.
     * @param openSetMap - Open set map.
     * @param node - Node to remove.
     * @example
     */
    private removeFromOpenSet;
    /**
     * Reconstructs the path from the goal node.
     * @param goalNode - Goal node.
     * @returns Reconstructed path.
     * @example
     */
    private reconstructPath;
    /**
     * Smooths a path using simple interpolation.
     * @param path - Path to smooth.
     * @param grid - The grid.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param factor - Smoothing factor.
     * @returns Smoothed path.
     * @example
     */
    private smoothPath;
    /**
     * Generates a cache key for the given parameters.
     * @param grid - The grid.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param start - Starting point.
     * @param goal - Goal point.
     * @param options - Pathfinding options.
     * @returns Cache key.
     * @example
     */
    private getCacheKey;
}
//# sourceMappingURL=jps-core.d.ts.map