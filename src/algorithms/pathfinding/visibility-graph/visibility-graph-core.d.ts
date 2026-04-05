/**
 * @file visibility-graph-core.ts
 * @module algorithms/pathfinding/visibility-graph-core
 * @description Visibility Graph construction and pathfinding.
 *
 * Mathematical Theory:
 * A visibility graph connects all pairs of vertices that can "see" each other
 * (line of sight not blocked by obstacles). Used for any-angle pathfinding.
 *
 * Construction: For each pair of vertices, check if line segment intersects
 * any obstacle edge. If not, add edge to graph.
 *
 * Pathfinding: Use A* on the visibility graph.
 */
import type { Obstacle, VisibilityGraphConfig, VisibilityGraphPathfindingOptions, VisibilityGraphPathfindingResult, VisibilityGraphResult } from "./visibility-graph-types";
/**
 * Visibility Graph implementation.
 */
export declare class VisibilityGraph {
    private config;
    private vertices;
    private edges;
    /**
     * Creates a new VisibilityGraph instance.
     * @param config Configuration options.
     * @example
     */
    constructor(config?: Partial<VisibilityGraphConfig>);
    /**
     * Build visibility graph from obstacles.
     * @param obstacles Array of obstacle polygons.
     * @returns Visibility graph result.
     * @example
     */
    build(obstacles: Obstacle[]): VisibilityGraphResult;
    /**
     * Find path using visibility graph.
     * @param options Pathfinding options.
     * @param obstacles Obstacles (for line of sight checks).
     * @returns Pathfinding result.
     * @example
     */
    findPath(options: VisibilityGraphPathfindingOptions, obstacles: Obstacle[]): VisibilityGraphPathfindingResult;
    /**
     * A* pathfinding on visibility graph.
     * @param start
     * @param goal
     * @param vertices
     * @param edges
     * @example
     */
    private astarOnVisibilityGraph;
    /**
     * Calculate path cost.
     * @param path
     * @example
     */
    private calculatePathCost;
}
//# sourceMappingURL=visibility-graph-core.d.ts.map