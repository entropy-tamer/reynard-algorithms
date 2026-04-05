/**
 * @module algorithms/pathfinding/hpa-star/hpa-star-core
 * @description Main implementation of HPA* (Hierarchical Pathfinding A*) algorithm.
 */
import { Point, CellType, Cluster, Entrance, AbstractNode, AbstractEdge, HPAConfig, HPAStats, HPAResult, HPAOptions } from "./hpa-star-types";
/**
 * The HPAStar class provides hierarchical pathfinding using A* with abstract graph abstraction.
 * HPA* is particularly efficient for large maps where traditional A* would be too slow,
 * as it preprocesses the map into clusters and creates an abstract graph for high-level planning.
 *
 * @example
 * ```typescript
 * const hpaStar = new HPAStar();
 * const grid = HPAStarUtils.generateTestGrid(1000, 1000, 0.3);
 * const start = { x: 0, y: 0 };
 * const goal = { x: 999, y: 999 };
 * const result = hpaStar.findPath(grid, 1000, 1000, start, goal);
 *
 * console.log(result.path); // Hierarchical path from start to goal
 * console.log(result.stats); // Performance statistics
 * ```
 */
export declare class HPAStar {
    private config;
    private stats;
    private cache;
    private clusters;
    private entrances;
    private abstractNodes;
    private abstractEdges;
    /**
     * Creates an instance of HPAStar.
     * @param config - Optional configuration for the algorithm.
     * @example
     */
    constructor(config?: Partial<HPAConfig>);
    /**
     * Finds a path from start to goal using hierarchical pathfinding.
     * @param grid - The grid as a 1D array.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param start - Starting point.
     * @param goal - Goal point.
     * @param options - Pathfinding options.
     * @returns HPA* pathfinding result.
     * @example
     */
    findPath(grid: CellType[], width: number, height: number, start: Point, goal: Point, options?: Partial<HPAOptions>): HPAResult;
    /**
     * Generates clusters from the grid.
     * @param grid - The grid.
     * @example
     */
    private generateClusters;
    /**
     * Finds an abstract path using the hierarchical graph.
     * @param start - Starting point.
     * @param goal - Goal point.
     * @param options - Pathfinding options.
     * @returns Abstract path.
     * @example
     */
    private findAbstractPath;
    /**
     * Creates the abstract graph from clusters and entrances.
     * @example
     */
    private createAbstractGraph;
    /**
     * Finds an abstract path using A* on the abstract graph.
     * @param startCluster - Starting cluster.
     * @param goalCluster - Goal cluster.
     * @param options - Pathfinding options.
     * @returns Abstract path.
     * @example
     */
    private findAbstractPathWithAStar;
    /**
     * Refines an abstract path into a detailed path.
     * @param abstractPath - Abstract path.
     * @param grid - The grid.
     * @param options - Pathfinding options.
     * @returns Refined path.
     * @example
     */
    private refinePath;
    /**
     * Finds the cluster containing a point.
     * @param point - Point to find cluster for.
     * @returns Cluster containing the point or null.
     * @example
     */
    private findClusterContainingPoint;
    /**
     * Gets abstract neighbors of a node.
     * @param node - Abstract node.
     * @returns Array of neighbor nodes.
     * @example
     */
    private getAbstractNeighbors;
    /**
     * Gets the cost of an abstract edge.
     * @param from - From node.
     * @param to - To node.
     * @returns Edge cost.
     * @example
     */
    private getAbstractEdgeCost;
    /**
     * Calculates the heuristic distance between two abstract nodes.
     * @param from - From node.
     * @param to - To node.
     * @returns Heuristic distance.
     * @example
     */
    private heuristic;
    /**
     * Calculates the cost of a path.
     * @param path - Path to calculate cost for.
     * @returns Path cost.
     * @example
     */
    private calculatePathCost;
    /**
     * Creates a failure result.
     * @param startTime - Start time of the operation.
     * @param error - Error message.
     * @returns Failure result.
     * @example
     */
    private createFailureResult;
    /**
     * Validates input parameters.
     * @param grid - The grid.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param start - Starting point.
     * @param goal - Goal point.
     * @returns Validation result.
     * @example
     */
    private validateInput;
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
    /**
     * Updates the configuration.
     * @param newConfig - New configuration options.
     * @example
     */
    updateConfig(newConfig: Partial<HPAConfig>): void;
    /**
     * Gets the current configuration.
     * @returns The current configuration.
     * @example
     */
    getConfig(): HPAConfig;
    /**
     * Gets the current statistics.
     * @returns The current statistics.
     * @example
     */
    getStats(): HPAStats;
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
     * Gets the current clusters.
     * @returns Array of clusters.
     * @example
     */
    getClusters(): Cluster[];
    /**
     * Gets the current entrances.
     * @returns Array of entrances.
     * @example
     */
    getEntrances(): Entrance[];
    /**
     * Gets the current abstract nodes.
     * @returns Array of abstract nodes.
     * @example
     */
    getAbstractNodes(): AbstractNode[];
    /**
     * Gets the current abstract edges.
     * @returns Array of abstract edges.
     * @example
     */
    getAbstractEdges(): AbstractEdge[];
}
//# sourceMappingURL=hpa-star-core.d.ts.map