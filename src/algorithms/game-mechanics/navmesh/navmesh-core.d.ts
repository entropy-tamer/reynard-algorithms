/**
 * @file navmesh-core.ts
 * @module algorithms/game-mechanics/navmesh-core
 * @description Navmesh generation and pathfinding implementation.
 *
 * Mathematical Theory:
 * A navmesh is a graph of walkable polygons used for pathfinding.
 * Generation involves:
 * 1. Decomposing geometry into convex polygons
 * 2. Triangulating walkable areas
 * 3. Building connectivity graph
 *
 * Pathfinding uses A* on the navmesh graph.
 */
import type { Polygon } from "../../../core/types";
import type { NavmeshConfig, NavmeshResult, NavmeshPathfindingOptions, NavmeshPathfindingResult } from "./navmesh-types";
/**
 * Navmesh implementation.
 */
export declare class Navmesh {
    private config;
    private polygons;
    /**
     * Creates a new Navmesh instance.
     * @param config Configuration options.
     * @example
     */
    constructor(config?: Partial<NavmeshConfig>);
    /**
     * Generate navmesh from geometry.
     * @param walkableAreas Array of walkable polygons.
     * @returns Navmesh generation result.
     * @example
     */
    generate(walkableAreas: Polygon[]): NavmeshResult;
    /**
     * Find path on navmesh using A*.
     * @param options Pathfinding options.
     * @returns Pathfinding result.
     * @example
     */
    findPath(options: NavmeshPathfindingOptions): NavmeshPathfindingResult;
    /**
     * Find polygon containing a point.
     * @param point
     * @example
     */
    private findContainingPolygon;
    /**
     * Check if point is in polygon (2D projection).
     * @param point
     * @param vertices
     * @example
     */
    private pointInPolygon;
    /**
     * A* pathfinding on navmesh graph.
     * @param start
     * @param goal
     * @param startPos
     * @param goalPos
     * @param heuristic
     * @example
     */
    private astarOnNavmesh;
    /**
     * Calculate 3D distance.
     * @param a
     * @param b
     * @example
     */
    private distance3D;
    /**
     * Calculate path cost.
     * @param path
     * @example
     */
    private calculatePathCost;
}
//# sourceMappingURL=navmesh-core.d.ts.map