/**
 * @module algorithms/pathfinding/hpa-star/hpa-path-refinement
 * @description Path refinement for HPA* hierarchical pathfinding.
 */
import type { AbstractNode, Cluster, Entrance, HPAConfig, PathRefinementOptions, PathRefinementResult } from "./hpa-star-types";
import { CellType } from "./hpa-star-types";
/**
 * Path refinement utilities for HPA*.
 */
export declare class HPAPathRefinement {
    /**
     * Refines an abstract path into a detailed path.
     * @param abstractPath - Abstract path from high-level planning.
     * @param clusters - Clusters in the hierarchical map.
     * @param entrances - Entrances between clusters.
     * @param grid - The grid.
     * @param config - HPA configuration.
     * @param options - Path refinement options.
     * @returns Path refinement result.
     * @example
     */
    static refinePath(abstractPath: AbstractNode[], clusters: Cluster[], entrances: Entrance[], grid: CellType[], config: HPAConfig, options?: Partial<PathRefinementOptions>): PathRefinementResult;
    /**
     * Converts an abstract path to a sequence of points.
     * @param abstractPath - Abstract path.
     * @param clusters - Clusters in the hierarchical map.
     * @param entrances - Entrances between clusters.
     * @returns Sequence of points.
     * @example
     */
    private static convertAbstractPathToPoints;
    /**
     * Refines a path using A* algorithm.
     * @param pointSequence - Sequence of points to connect.
     * @param grid - The grid.
     * @param config - HPA configuration.
     * @param options - Refinement options.
     * @returns A* refinement result.
     * @example
     */
    private static refineWithAStar;
    /**
     * Refines a path using Jump Point Search.
     * @param pointSequence - Sequence of points to connect.
     * @param grid - The grid.
     * @param config - HPA configuration.
     * @param options - Refinement options.
     * @returns JPS refinement result.
     * @example
     */
    private static refineWithJPS;
    /**
     * Refines a path using Theta* algorithm.
     * @param pointSequence - Sequence of points to connect.
     * @param grid - The grid.
     * @param config - HPA configuration.
     * @param options - Refinement options.
     * @returns Theta* refinement result.
     * @example
     */
    private static refineWithThetaStar;
    /**
     * Finds a path using A* algorithm.
     * @param start - Starting point.
     * @param goal - Goal point.
     * @param grid - The grid.
     * @param config - HPA configuration.
     * @param options - Refinement options.
     * @returns A* pathfinding result.
     * @example
     */
    private static findAStarPath;
    /**
     * Smooths a path by removing redundant waypoints.
     * @param path - Path to smooth.
     * @param grid - The grid.
     * @param config - HPA configuration.
     * @param smoothingFactor - Smoothing factor (0-1).
     * @returns Smoothed path.
     * @example
     */
    private static smoothPath;
    /**
     * Checks if there's a line of sight between two points.
     * @param from - Starting point.
     * @param to - Ending point.
     * @param grid - The grid.
     * @param config - HPA configuration.
     * @returns True if there's a line of sight.
     * @example
     */
    private static hasLineOfSight;
    /**
     * Gets neighbors of a point.
     * @param point - Current point.
     * @param grid - The grid.
     * @param config - HPA configuration.
     * @returns Array of neighbor points.
     * @example
     */
    private static getNeighbors;
    /**
     * Gets valid directions based on configuration.
     * @param config - HPA configuration.
     * @returns Array of valid directions.
     * @example
     */
    private static getValidDirections;
    /**
     * Gets a neighbor in a specific direction.
     * @param point - Current point.
     * @param direction - Direction to move.
     * @returns Neighbor point.
     * @example
     */
    private static getNeighborInDirection;
    /**
     * Calculates the movement cost between two points.
     * @param from - Starting point.
     * @param to - Ending point.
     * @param config - HPA configuration.
     * @returns Movement cost.
     * @example
     */
    private static getMovementCost;
    /**
     * Calculates the heuristic distance between two points.
     * @param from - Starting point.
     * @param to - Ending point.
     * @param config - HPA configuration.
     * @returns Heuristic distance.
     * @example
     */
    private static heuristic;
    /**
     * Checks if a point is within grid bounds.
     * @param point - Point to check.
     * @param width - Grid width.
     * @param height - Grid height.
     * @returns True if point is within bounds.
     * @example
     */
    private static isWithinBounds;
    /**
     * Checks if a cell is walkable.
     * @param grid - The grid.
     * @param point - Point to check.
     * @param width - Grid width.
     * @param height - Grid height.
     * @returns True if cell is walkable.
     * @example
     */
    private static isWalkable;
    /**
     * Creates a key for a point (for use in maps/sets).
     * @param point - Point to create key for.
     * @returns String key.
     * @example
     */
    private static pointToKey;
}
//# sourceMappingURL=hpa-path-refinement.d.ts.map