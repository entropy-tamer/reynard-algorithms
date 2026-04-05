/**
 * A* Pathfinding Algorithm Core Implementation
 *
 * Implementation of the A* (A-star) pathfinding algorithm with comprehensive
 * features including multiple heuristics, caching, statistics, and optimization.
 *
 * Mathematical Theory:
 * A* is an informed search algorithm that finds the shortest path between
 * two points by using a heuristic function to estimate the cost from any
 * node to the goal. The algorithm maintains two sets of nodes:
 * - Open set: Nodes to be evaluated
 * - Closed set: Nodes already evaluated
 *
 * The algorithm uses the evaluation function: f(n) = g(n) + h(n)
 * where:
 * - g(n) is the cost from start to node n
 * - h(n) is the heuristic estimate from node n to goal
 * - f(n) is the total estimated cost of the path through n
 *
 * @module algorithms/pathfinding/astar
 */
import type { Point, AStarConfig, AStarResult, AStarGrid, AStarStats, AStarEventHandler, AStarOptions, AStarPerformanceMetrics, AStarHeuristic } from "./astar-types";
/**
 * A* Pathfinding Algorithm Implementation
 *
 * Provides comprehensive pathfinding capabilities with multiple optimization
 * features including caching, statistics collection, and event handling.
 */
export declare class AStar {
    private config;
    private heuristic;
    private eventHandlers;
    private cache;
    private stats;
    private enableCaching;
    private enableStats;
    private enableDebug;
    private cacheSize;
    /**
     *
     * @param options
     * @example
     */
    constructor(options?: Partial<AStarOptions>);
    /**
     * Find path between two points using A* algorithm
     *
     * @param start Starting point
     * @param goal Goal point
     * @param grid Optional grid for obstacle checking
     * @returns Pathfinding result
     * @example
     */
    findPath(start: Point, goal: Point, grid?: AStarGrid): AStarResult;
    /**
     * Perform the core A* search algorithm
     *
     * @param start Starting point
     * @param goal Goal point
     * @param grid Optional grid for obstacle checking
     * @returns Pathfinding result
     * @example
     */
    private performAStarSearch;
    /**
     * Create a new A* node
     * @param position
     * @param gScore
     * @param hScore
     * @param parent
     * @param walkable
     * @param data
     * @example
     */
    private createNode;
    /**
     * Generate unique node ID from position
     * @param position
     * @example
     */
    private getNodeId;
    /**
     * Get node with lowest f-score from open set
     * @param openSet
     * @example
     */
    private getLowestFScoreNode;
    /**
     * Check if goal is reached
     * @param node
     * @param goal
     * @example
     */
    private isGoalReached;
    /**
     * Get neighboring nodes
     * @param node
     * @param grid
     * @example
     */
    private getNeighbors;
    /**
     * Check if position is valid (within bounds and not blocked)
     * @param x
     * @param y
     * @param grid
     * @example
     */
    private isValidPosition;
    /**
     * Calculate distance between two nodes
     * @param node1
     * @param node2
     * @example
     */
    private getDistance;
    /**
     * Reconstruct path from goal to start
     * @param goalNode
     * @example
     */
    private reconstructPath;
    /**
     * Reconstruct detailed path with node information
     * @param goalNode
     * @example
     */
    private reconstructDetailedPath;
    /**
     * Generate cache key for start and goal points
     * @param start
     * @param goal
     * @example
     */
    private getCacheKey;
    /**
     * Cache pathfinding result
     * @param cacheKey
     * @param start
     * @param goal
     * @param result
     * @example
     */
    private cacheResult;
    /**
     * Update statistics
     * @param result
     * @param executionTime
     * @example
     */
    private updateStats;
    /**
     * Emit event to registered handlers
     * @param type
     * @param data
     * @example
     */
    private emitEvent;
    /**
     * Add event handler
     * @param handler
     * @example
     */
    addEventHandler(handler: AStarEventHandler): void;
    /**
     * Remove event handler
     * @param handler
     * @example
     */
    removeEventHandler(handler: AStarEventHandler): void;
    /**
     * Get current statistics
     * @example
     */
    getStats(): AStarStats;
    /**
     * Get performance metrics
     * @example
     */
    getPerformanceMetrics(): AStarPerformanceMetrics;
    /**
     * Clear cache
     * @example
     */
    clearCache(): void;
    /**
     * Reset statistics
     * @example
     */
    resetStats(): void;
    /**
     * Update configuration
     * @param newConfig
     * @example
     */
    updateConfig(newConfig: Partial<AStarConfig>): void;
    /**
     * Set heuristic function
     * @param heuristic
     * @example
     */
    setHeuristic(heuristic: AStarHeuristic): void;
}
//# sourceMappingURL=astar-core.d.ts.map